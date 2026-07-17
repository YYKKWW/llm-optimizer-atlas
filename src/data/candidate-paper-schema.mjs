import { z } from 'zod';
import { RESEARCH_TRACKS } from './paper-schema.mjs';

export const CANDIDATE_VENUES = [
  'mathematical-programming',
  'siam-journal-on-optimization',
  'iclr',
  'icml',
  'neurips',
];
export const CANDIDATE_RECOMMENDATIONS = ['include', 'watch', 'exclude'];
export const CANDIDATE_DECISIONS = ['include', 'watch', 'exclude'];
export const CANDIDATE_PUBLICATION_STATUSES = [
  'preprint',
  'accepted',
  'published',
  'unverified',
];
export const CANDIDATE_READING_PRIORITIES = [
  'full-read',
  'screen',
  'archive',
];
export const CANDIDATE_REVIEW_LEVELS = [
  'metadata',
  'abstract',
  'full-paper',
];
export const CANDIDATE_DISCOVERY_METHODS = [
  'automatic',
  'manual-recall',
];

const currentYear = new Date().getUTCFullYear();
const candidateIdSchema = z.string().regex(/^candidate-[a-f0-9]{16}$/);
const nonemptyText = z.string().trim().min(1);
const kebabText = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'must use lowercase kebab-case');

function isRealIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(value + 'T00:00:00.000Z');
  return (
    !Number.isNaN(parsed.valueOf()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

const isoDate = z.string().superRefine((value, context) => {
  if (!isRealIsoDate(value)) {
    context.addIssue({
      code: 'custom',
      message: 'must be a real calendar date in YYYY-MM-DD format',
    });
  }
});

const nullableIsoDate = z.union([z.null(), isoDate]);
const httpsUrl = z.url().superRefine((value, context) => {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    return;
  }
  if (
    parsed.protocol !== 'https:' ||
    parsed.username !== '' ||
    parsed.password !== ''
  ) {
    context.addIssue({
      code: 'custom',
      message: 'must be an HTTPS URL without credentials',
    });
  }
});
const optionalHttpsUrl = z.union([z.literal(''), httpsUrl]);
const optionalArxivUrl = optionalHttpsUrl.superRefine((value, context) => {
  if (value === '') return;
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    return;
  }
  if (
    parsed.hostname !== 'arxiv.org' ||
    !/^\/abs\/(?:\d{4}\.\d{4,5}|[a-z-]+(?:\.[a-z-]+)?\/\d{7})(?:v[1-9]\d*)?$/i.test(
      parsed.pathname,
    ) ||
    parsed.search !== '' ||
    parsed.hash !== ''
  ) {
    context.addIssue({
      code: 'custom',
      message: 'must be empty or a canonical https://arxiv.org/abs/... URL',
    });
  }
});
const nullableDoi = z.union([
  z.null(),
  z.string().regex(/^10\.\d{4,9}\/\S+$/i, 'must be a normalized DOI'),
]);

function uniqueArray(itemSchema, label, { allowEmpty = false } = {}) {
  let schema = z.array(itemSchema);
  if (!allowEmpty) schema = schema.min(1);
  return schema.superRefine((values, context) => {
    const seen = new Set();
    values.forEach((value, index) => {
      const key = typeof value === 'string' ? value : JSON.stringify(value);
      if (seen.has(key)) {
        context.addIssue({
          code: 'custom',
          path: [index],
          message: label + ' must not contain duplicates',
        });
      }
      seen.add(key);
    });
  });
}

export const candidatePaperSchema = z
  .object({
    candidate_id: candidateIdSchema,
    title: nonemptyText,
    authors: uniqueArray(nonemptyText, 'authors'),
    venue: z.enum(CANDIDATE_VENUES),
    year: z.number().int().min(2025).max(currentYear + 1),
    published_date: nullableIsoDate,
    publication_status: z.enum(CANDIDATE_PUBLICATION_STATUSES),
    doi: nullableDoi,
    official_url: httpsUrl,
    arxiv_url: optionalArxivUrl,
    source_version: nonemptyText,
    research_tracks: uniqueArray(
      z.enum(RESEARCH_TRACKS),
      'research_tracks',
    ),
    tags: uniqueArray(kebabText, 'tags'),
    recommendation: z.enum(CANDIDATE_RECOMMENDATIONS),
    reading_priority: z.enum(CANDIDATE_READING_PRIORITIES),
    review_level: z.enum(CANDIDATE_REVIEW_LEVELS),
    review_summary: nonemptyText,
    unresolved_metadata: uniqueArray(nonemptyText, 'unresolved_metadata', {
      allowEmpty: true,
    }),
    possible_conflicts: uniqueArray(nonemptyText, 'possible_conflicts', {
      allowEmpty: true,
    }),
    canonical_duplicate_of: z.union([z.null(), kebabText]),
    discovery_method: z.enum(CANDIDATE_DISCOVERY_METHODS),
    last_reviewed: isoDate,
  })
  .strict()
  .superRefine((candidate, context) => {
    if (
      candidate.published_date &&
      Number(candidate.published_date.slice(0, 4)) !== candidate.year
    ) {
      context.addIssue({
        code: 'custom',
        path: ['published_date'],
        message: 'published_date year must match year',
      });
    }
    if (
      candidate.recommendation === 'include' &&
      candidate.reading_priority !== 'full-read'
    ) {
      context.addIssue({
        code: 'custom',
        path: ['reading_priority'],
        message: 'include recommendations must be full-read',
      });
    }
    if (
      candidate.recommendation === 'exclude' &&
      candidate.reading_priority !== 'archive'
    ) {
      context.addIssue({
        code: 'custom',
        path: ['reading_priority'],
        message: 'exclude recommendations must be archive',
      });
    }
  });

export const candidatePaperDatasetSchema = z
  .object({
    schema_version: z.literal(1),
    search_window: z
      .object({
        start: isoDate,
        end: isoDate,
        reviewed_on: isoDate,
      })
      .strict(),
    candidates: z.array(candidatePaperSchema),
  })
  .strict()
  .superRefine((dataset, context) => {
    if (dataset.search_window.start > dataset.search_window.end) {
      context.addIssue({
        code: 'custom',
        path: ['search_window', 'start'],
        message: 'search window start must not be after end',
      });
    }
    const seen = new Map();
    dataset.candidates.forEach((candidate, index) => {
      if (seen.has(candidate.candidate_id)) {
        context.addIssue({
          code: 'custom',
          path: ['candidates', index, 'candidate_id'],
          message:
            'duplicate candidate ID; first used at index ' +
            seen.get(candidate.candidate_id),
        });
      }
      seen.set(candidate.candidate_id, index);
    });
  });

export const candidateReviewDecisionSchema = z
  .object({
    candidate_id: candidateIdSchema,
    decision: z.enum(CANDIDATE_DECISIONS),
    decided_on: isoDate,
    reviewer: nonemptyText,
    review_level: z.enum(CANDIDATE_REVIEW_LEVELS),
    rationale: nonemptyText,
    canonical_promotion: z.literal(false),
  })
  .strict();

export const candidateReviewDecisionDatasetSchema = z
  .object({
    schema_version: z.literal(1),
    decision_scope: z.literal(
      'Screening decisions only; include means approved for full reading and canonical-ingestion review, not promoted as verified evidence.',
    ),
    decisions: z.array(candidateReviewDecisionSchema),
  })
  .strict()
  .superRefine((dataset, context) => {
    const seen = new Map();
    dataset.decisions.forEach((decision, index) => {
      if (seen.has(decision.candidate_id)) {
        context.addIssue({
          code: 'custom',
          path: ['decisions', index, 'candidate_id'],
          message:
            'duplicate candidate decision; first used at index ' +
            seen.get(decision.candidate_id),
        });
      }
      seen.set(decision.candidate_id, index);
    });
  });

export function parseCandidatePaperDataset(value) {
  return candidatePaperDatasetSchema.parse(value);
}

export function parseCandidateReviewDecisions(value) {
  return candidateReviewDecisionDatasetSchema.parse(value);
}

export function joinCandidateReviewDecisions(
  candidateDataset,
  decisionDataset,
  canonicalPaperIds = [],
) {
  const candidates = parseCandidatePaperDataset(candidateDataset);
  const decisions = parseCandidateReviewDecisions(decisionDataset);
  const candidateIds = new Set(
    candidates.candidates.map((candidate) => candidate.candidate_id),
  );
  const canonicalIds = new Set(canonicalPaperIds);

  for (const decision of decisions.decisions) {
    if (!candidateIds.has(decision.candidate_id)) {
      throw new Error(
        'Review decision references unknown candidate "' +
          decision.candidate_id +
          '".',
      );
    }
  }
  for (const candidate of candidates.candidates) {
    if (
      candidate.canonical_duplicate_of &&
      !canonicalIds.has(candidate.canonical_duplicate_of)
    ) {
      throw new Error(
        'Candidate "' +
          candidate.candidate_id +
          '" references unknown canonical paper "' +
          candidate.canonical_duplicate_of +
          '".',
      );
    }
  }

  const decisionById = new Map(
    decisions.decisions.map((decision) => [decision.candidate_id, decision]),
  );
  return {
    ...candidates,
    candidates: candidates.candidates.map((candidate) => {
      const decision = decisionById.get(candidate.candidate_id);
      return {
        ...candidate,
        decision: decision?.decision ?? 'pending',
        decision_rationale: decision?.rationale ?? '',
        decided_on: decision?.decided_on ?? null,
        reviewer: decision?.reviewer ?? '',
      };
    }),
  };
}
