import {
  authorFingerprint,
  extractArxivId,
  publicationYear,
  stableCandidateId,
  titleFingerprint,
} from './normalize.mjs';

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'en-US'),
  );
}

function strongKeys(record) {
  return new Set([
    ...(record.doi ? ['doi:' + record.doi] : []),
    ...(record.arxivUrl
      ? ['arxiv:' + extractArxivId(record.arxivUrl)]
      : []),
    ...record.sourceKeys,
  ]);
}

function identifiersConflict(left, right) {
  return (
    (left.doi && right.doi && left.doi !== right.doi) ||
    (left.arxivUrl &&
      right.arxivUrl &&
      extractArxivId(left.arxivUrl) !== extractArxivId(right.arxivUrl))
  );
}

function shareAuthor(left, right) {
  const leftAuthors = new Set(left.authors.map(authorFingerprint));
  return right.authors.some((author) => leftAuthors.has(authorFingerprint(author)));
}

function titleAuthorYearMatch(left, right) {
  if (
    titleFingerprint(left.title) !== titleFingerprint(right.title) ||
    identifiersConflict(left, right) ||
    left.authors.length === 0 ||
    right.authors.length === 0 ||
    !shareAuthor(left, right)
  ) {
    return false;
  }
  const leftYear = publicationYear(left.publishedDate);
  const rightYear = publicationYear(right.publishedDate);
  return leftYear === null || rightYear === null || Math.abs(leftYear - rightYear) <= 1;
}

function mergeRecords(left, right) {
  return {
    ...left,
    authors: uniqueSorted([...left.authors, ...right.authors]),
    targetSources: uniqueSorted([
      ...left.targetSources,
      ...right.targetSources,
    ]),
    sourceKeys: uniqueSorted([...left.sourceKeys, ...right.sourceKeys]),
    provenance: [...left.provenance, ...right.provenance].sort((a, b) =>
      (a.target_source + a.record_id).localeCompare(
        b.target_source + b.record_id,
        'en-US',
      ),
    ),
    relevance: {
      profiles: uniqueSorted([
        ...left.relevance.profiles,
        ...right.relevance.profiles,
      ]),
      matchedTerms: uniqueSorted([
        ...left.relevance.matchedTerms,
        ...right.relevance.matchedTerms,
      ]),
      matchedFields: uniqueSorted([
        ...left.relevance.matchedFields,
        ...right.relevance.matchedFields,
      ]),
    },
    doi: left.doi ?? right.doi,
    arxivUrl: left.arxivUrl ?? right.arxivUrl,
    officialUrl: left.officialUrl ?? right.officialUrl,
    publishedDate: left.publishedDate ?? right.publishedDate,
  };
}

export function dedupeRawCandidates(records) {
  const merged = [];
  for (const record of records) {
    const recordKeys = strongKeys(record);
    const matchIndex = merged.findIndex((candidate) => {
      if (identifiersConflict(candidate, record)) {
        return false;
      }
      const candidateKeys = strongKeys(candidate);
      const strongMatch = [...recordKeys].some((key) => candidateKeys.has(key));
      return strongMatch || titleAuthorYearMatch(candidate, record);
    });
    if (matchIndex === -1) {
      merged.push(structuredClone(record));
    } else {
      merged[matchIndex] = mergeRecords(merged[matchIndex], record);
    }
  }
  return merged;
}

function existingPaperMatch(record, papers) {
  if (record.officialUrl) {
    const officialMatch = papers.find(
      (paper) => paper.paper_url === record.officialUrl,
    );
    if (officialMatch) return officialMatch.id;
  }
  const arxivId = extractArxivId(record.arxivUrl);
  if (arxivId) {
    const match = papers.find(
      (paper) => extractArxivId(paper.arxiv_url) === arxivId,
    );
    if (match) return match.id;
  }
  const candidateTitle = titleFingerprint(record.title);
  const candidateAuthors = new Set(record.authors.map(authorFingerprint));
  if (candidateAuthors.size === 0) {
    return null;
  }
  const match = papers.find(
    (paper) =>
      titleFingerprint(paper.title) === candidateTitle &&
      paper.authors.some((author) => candidateAuthors.has(authorFingerprint(author))),
  );
  return match?.id ?? null;
}

export function finalizeCandidates(records, papers, openProblems) {
  const deduped = dedupeRawCandidates(records).map((record) => ({
    ...record,
    candidateId: stableCandidateId(record),
  }));
  const problemsByPaperId = new Map();
  for (const problem of openProblems) {
    for (const paperId of new Set(problem.source_refs.map((ref) => ref.paper_id))) {
      const problemIds = problemsByPaperId.get(paperId) ?? [];
      problemIds.push(problem.id);
      problemsByPaperId.set(paperId, problemIds);
    }
  }

  for (const candidate of deduped) {
    candidate.existingPaperId = existingPaperMatch(candidate, papers);
    candidate.referencedByOpenProblemIds = candidate.existingPaperId
      ? uniqueSorted(problemsByPaperId.get(candidate.existingPaperId) ?? [])
      : [];
    candidate.possibleDuplicateIds = [];
  }

  for (let leftIndex = 0; leftIndex < deduped.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < deduped.length; rightIndex += 1) {
      const left = deduped[leftIndex];
      const right = deduped[rightIndex];
      if (
        titleFingerprint(left.title) === titleFingerprint(right.title) &&
        !titleAuthorYearMatch(left, right)
      ) {
        left.possibleDuplicateIds.push(right.candidateId);
        right.possibleDuplicateIds.push(left.candidateId);
      }
    }
  }

  return deduped.sort((left, right) =>
    left.candidateId.localeCompare(right.candidateId, 'en-US'),
  );
}

export function toArtifactCandidate(record) {
  return {
    candidate_id: record.candidateId,
    candidate_kind: 'literature-source',
    review_state: 'unreviewed',
    title: record.title,
    authors: uniqueSorted(record.authors),
    published_date: record.publishedDate,
    target_sources: uniqueSorted(record.targetSources),
    doi: record.doi,
    arxiv_url: record.arxivUrl,
    official_url: record.officialUrl,
    source_keys: uniqueSorted(record.sourceKeys),
    relevance: {
      profiles: uniqueSorted(record.relevance.profiles),
      matched_terms: uniqueSorted(record.relevance.matchedTerms),
      matched_fields: uniqueSorted(record.relevance.matchedFields),
    },
    dedupe: {
      existing_paper_id: record.existingPaperId,
      referenced_by_open_problem_ids: uniqueSorted(
        record.referencedByOpenProblemIds,
      ),
      possible_duplicate_ids: uniqueSorted(record.possibleDuplicateIds),
    },
    provenance: record.provenance,
  };
}
