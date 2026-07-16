import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import {
  parseCrossrefResponse,
  dateFromParts,
  discoverSource,
  parseIclrProceedings,
  parseNeuripsProceedings,
  parsePmlrVolume,
  parsePmlrVolumeIndex,
} from '../scripts/discovery/adapters.mjs';
import {
  literatureCandidateSchema,
  TARGET_SOURCE_IDS,
} from '../scripts/discovery/candidate-schema.mjs';
import { loadDiscoveryConfig } from '../scripts/discovery/config.mjs';
import {
  dedupeRawCandidates,
  finalizeCandidates,
  toArtifactCandidate,
} from '../scripts/discovery/dedupe.mjs';
import { fetchText } from '../scripts/discovery/http.mjs';
import {
  canonicalArxivUrl,
  normalizeDoi,
  titleFingerprint,
} from '../scripts/discovery/normalize.mjs';
import { matchRelevance } from '../scripts/discovery/relevance.mjs';
import { assertSafeOutputDirectory } from '../scripts/discovery/writer.mjs';
import { loadOpenProblemDataset } from '../scripts/lib/open-problem-data.mjs';
import { loadPaperDataset } from '../scripts/lib/paper-data.mjs';

const projectRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const fixture = (name) =>
  path.join(projectRoot, 'test', 'fixtures', 'discovery', name);
const retrievedAt = '2026-07-17T00:00:00.000Z';
const { sources, profiles } = await loadDiscoveryConfig(
  path.join(projectRoot, 'config', 'discovery-sources.yml'),
  path.join(projectRoot, 'config', 'discovery-topics.yml'),
);

test('config contains each requested source exactly once', () => {
  assert.deepEqual(
    sources.map((source) => source.id).sort(),
    [...TARGET_SOURCE_IDS].sort(),
  );
  assert.ok(profiles.length >= 8);
});

test('Crossref journal fixture parses and matches a deterministic profile', async () => {
  const payload = JSON.parse(await readFile(fixture('crossref.json'), 'utf8'));
  const source = sources.find(
    (entry) => entry.id === 'siam-journal-on-optimization',
  );
  const records = parseCrossrefResponse(payload, source, retrievedAt);
  assert.equal(records.length, 1);
  assert.equal(records[0].doi, '10.1137/24m000001');
  const relevance = matchRelevance(records[0], profiles);
  assert.ok(
    relevance.profiles.includes('low-precision-distributed-matrix-optimization'),
  );
  assert.ok(relevance.matchedFields.includes('title'));
  assert.equal('abstract' in records[0], false);
});

test('PMLR, NeurIPS, and ICLR fixtures parse official source records', async () => {
  const pmlrSource = sources.find((entry) => entry.id === 'icml');
  const volumes = parsePmlrVolumeIndex(
    await readFile(fixture('pmlr-index.html'), 'utf8'),
  );
  assert.deepEqual(volumes.map((volume) => volume.volume), [267]);
  const pmlr = parsePmlrVolume(
    await readFile(fixture('pmlr-volume.html'), 'utf8'),
    pmlrSource,
    retrievedAt,
    267,
  );
  assert.equal(pmlr.length, 1, 'duplicate page anchors must collapse');
  assert.equal(pmlr[0].sourceKeys[0], 'pmlr:v267/bernstein25a');
  assert.equal(pmlr[0].title, 'Modular Duality in Deep Learning');
  assert.deepEqual(pmlr[0].authors, ['Jeremy Bernstein', 'Laker Newhouse']);

  const neurips = parseNeuripsProceedings(
    await readFile(fixture('neurips.html'), 'utf8'),
    sources.find((entry) => entry.id === 'neurips'),
    retrievedAt,
    2025,
  );
  assert.equal(neurips.length, 2);
  assert.equal(neurips[0].publishedDate, null, 'unknown exact dates are not invented');
  assert.deepEqual(neurips[0].authors, ['Ada Example', 'Grace Example']);
  assert.equal(
    neurips[1].sourceKeys[0],
    'neurips:2025/dataset-example',
  );

  const iclr = parseIclrProceedings(
    await readFile(fixture('iclr.html'), 'utf8'),
    sources.find((entry) => entry.id === 'iclr'),
    retrievedAt,
    2025,
  );
  assert.equal(iclr.length, 1);
  assert.equal(iclr[0].publishedDate, null, 'unknown exact dates are not invented');
  assert.deepEqual(iclr[0].authors, ['Grace Example']);
  assert.match(iclr[0].officialUrl, /^https:\/\/proceedings\.iclr\.cc\//);
});

test('normalization handles DOI, arXiv versions, Unicode, and punctuation', () => {
  assert.equal(normalizeDoi('https://doi.org/10.1000/ABC'), '10.1000/abc');
  assert.equal(
    canonicalArxivUrl('https://arxiv.org/pdf/2601.12345v3'),
    'https://arxiv.org/abs/2601.12345',
  );
  assert.equal(
    titleFingerprint('Matrix–Sign:  Methods'),
    titleFingerprint('matrix sign methods'),
  );
});

test('partial or invalid Crossref dates never become invented exact dates', () => {
  assert.equal(dateFromParts([2026]), null);
  assert.equal(dateFromParts([2026, 5]), null);
  assert.equal(dateFromParts([2026, 2, 29]), null);
  assert.equal(dateFromParts([2024, 2, 29]), '2024-02-29');
  assert.equal(dateFromParts([2026, 13, 1]), null);
});

test('Crossref cursor pagination collects every configured page', async () => {
  const first = JSON.parse(await readFile(fixture('crossref.json'), 'utf8'));
  first.message['next-cursor'] = 'cursor-two';
  const second = structuredClone(first);
  second.message.items[0].DOI = '10.1137/24M000002';
  second.message.items[0].title = ['A Second Distributed Matrix Optimizer'];
  delete second.message['next-cursor'];
  let calls = 0;
  const records = await discoverSource(
    sources.find((entry) => entry.id === 'siam-journal-on-optimization'),
    {
      windowStart: '2026-01-01',
      currentYear: 2026,
      retrievedAt,
      crossrefRows: 1,
      maxCrossrefPages: 3,
      fetchJsonImpl: async (url) => {
        calls += 1;
        if (calls === 2) assert.match(url, /cursor=cursor-two/);
        return calls === 1 ? first : second;
      },
    },
  );
  assert.equal(calls, 2);
  assert.equal(records.length, 2);
});

test('ICLR discovery tolerates a missing current-year index and reads the prior year', async () => {
  const priorYearHtml = await readFile(fixture('iclr.html'), 'utf8');
  const records = await discoverSource(
    sources.find((entry) => entry.id === 'iclr'),
    {
      windowStart: '2026-01-01',
      currentYear: 2026,
      retrievedAt,
      fetchTextImpl: async (url) => {
        if (url.endsWith('/2026')) {
          const error = new Error('HTTP 404');
          error.status = 404;
          throw error;
        }
        return priorYearHtml;
      },
    },
  );
  assert.equal(records.length, 1);
});

test('conference parser canary rejects a nonempty declaration with no parsed papers', () => {
  assert.throws(
    () =>
      parseNeuripsProceedings(
        '<span class="paper-count">1 papers</span>',
        sources.find((entry) => entry.id === 'neurips'),
        retrievedAt,
        2025,
      ),
    /parser canary failed/,
  );
});

function relevantRecord(overrides = {}) {
  return {
    title: 'Distributed Matrix Optimizer for Language Models',
    authors: ['Ada Example'],
    publishedDate: '2026-05-10',
    targetSource: 'icml',
    targetSources: ['icml'],
    doi: '10.1000/example',
    arxivUrl: null,
    officialUrl: 'https://example.invalid/paper',
    sourceKeys: ['pmlr:v999/example'],
    provenance: [
      {
        adapter: 'fixture',
        target_source: 'icml',
        record_id: 'example',
        retrieved_at: retrievedAt,
      },
    ],
    relevance: {
      profiles: ['optimizer-gains-at-scale'],
      matchedTerms: ['optimizer'],
      matchedFields: ['title'],
    },
    ...overrides,
  };
}

test('dedupe merges exact identifiers but not conflicting DOIs', () => {
  const sameDoi = relevantRecord({
    targetSource: 'neurips',
    targetSources: ['neurips'],
    sourceKeys: ['neurips:2026/example'],
    provenance: [
      {
        adapter: 'fixture',
        target_source: 'neurips',
        record_id: 'example',
        retrieved_at: retrievedAt,
      },
    ],
  });
  const merged = dedupeRawCandidates([relevantRecord(), sameDoi]);
  assert.equal(merged.length, 1);
  assert.deepEqual(merged[0].targetSources.sort(), ['icml', 'neurips']);

  const conflict = relevantRecord({
    doi: '10.1000/different',
    sourceKeys: ['pmlr:v999/different'],
  });
  assert.equal(dedupeRawCandidates([relevantRecord(), conflict]).length, 2);
});

test('final candidates match canonical papers and formal problem references read-only', async () => {
  const paperPath = path.join(projectRoot, 'src', 'data', 'papers.yml');
  const problemPath = path.join(projectRoot, 'src', 'data', 'open-problems.yml');
  const papers = await loadPaperDataset(paperPath);
  const problems = await loadOpenProblemDataset(problemPath, paperPath);
  const record = relevantRecord({
    title: 'Muon is Scalable for LLM Training',
    authors: ['Kimi Team'],
    doi: null,
    arxivUrl: 'https://arxiv.org/abs/2502.16982v1',
    sourceKeys: ['openreview:fixture-muon'],
  });
  const [finalized] = finalizeCandidates([record], papers, problems);
  assert.equal(finalized.existingPaperId, 'muon-is-scalable-for-llm-training');
  assert.ok(finalized.referencedByOpenProblemIds.length >= 1);

  const candidate = toArtifactCandidate(finalized);
  assert.equal(literatureCandidateSchema.safeParse(candidate).success, true);
  assert.equal('source_evidence' in candidate, false);
  assert.equal('human_notes' in candidate, false);

  for (const [field, value] of [
    ['verification_status', 'verified'],
    ['source_refs', []],
    ['human_notes', ''],
    ['status', 'open'],
  ]) {
  const forbidden = { ...candidate, [field]: value };
    assert.equal(
      literatureCandidateSchema.safeParse(forbidden).success,
      false,
      'formal field must be rejected: ' + field,
    );
  }

  const invalidDate = { ...candidate, published_date: '2026-13-99' };
  assert.equal(literatureCandidateSchema.safeParse(invalidDate).success, false);
});

test('a realistic PMLR adapter record matches the canonical official paper URL', async () => {
  const paperPath = path.join(projectRoot, 'src', 'data', 'papers.yml');
  const problemPath = path.join(projectRoot, 'src', 'data', 'open-problems.yml');
  const papers = await loadPaperDataset(paperPath);
  const problems = await loadOpenProblemDataset(problemPath, paperPath);
  const [record] = parsePmlrVolume(
    await readFile(fixture('pmlr-volume.html'), 'utf8'),
    sources.find((entry) => entry.id === 'icml'),
    retrievedAt,
    267,
  );
  record.relevance = {
    profiles: ['optimizer-gains-at-scale'],
    matchedTerms: ['optimization'],
    matchedFields: ['title'],
  };
  const [finalized] = finalizeCandidates([record], papers, problems);
  assert.equal(finalized.existingPaperId, 'modular-duality-in-deep-learning');
  assert.deepEqual(finalized.referencedByOpenProblemIds, []);
});

test('output paths cannot target formal repository content', async () => {
  await assert.rejects(
    assertSafeOutputDirectory(
      projectRoot,
      path.join(projectRoot, 'src', 'data', 'candidate-output'),
    ),
    /allowed only under \.artifacts\/discovery/,
  );
  const temporaryDirectory = await mkdtemp(
    path.join(os.tmpdir(), 'llm-optimizer-discovery-'),
  );
  try {
    assert.equal(
      await assertSafeOutputDirectory(projectRoot, temporaryDirectory),
      await (await import('node:fs/promises')).realpath(temporaryDirectory),
    );
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
});

test('HTTP layer rejects hosts outside the explicit allowlist before fetching', async () => {
  await assert.rejects(
    fetchText('https://example.com/not-allowed'),
    /not on the HTTPS allowlist/,
  );
});

test('HTTP layer validates every redirect before following it', async () => {
  let requests = 0;
  await assert.rejects(
    fetchText('https://api.crossref.org/works', {
      fetchImpl: async () => {
        requests += 1;
        return new Response('', {
          status: 302,
          headers: { location: 'https://example.com/redirect-target' },
        });
      },
    }),
    /not on the HTTPS allowlist/,
  );
  assert.equal(requests, 1, 'the disallowed redirect target must not be fetched');
});

test('HTTP layer retries transient server and network failures deterministically', async () => {
  let attempts = 0;
  const recovered = await fetchText('https://api.crossref.org/works', {
    retries: 3,
    sleep: async () => {},
    fetchImpl: async () => {
      attempts += 1;
      return attempts === 1
        ? new Response('temporary', { status: 500 })
        : new Response('recovered', { status: 200 });
    },
  });
  assert.equal(recovered, 'recovered');
  assert.equal(attempts, 2);

  attempts = 0;
  const networkRecovered = await fetchText('https://api.crossref.org/works', {
    retries: 2,
    sleep: async () => {},
    fetchImpl: async () => {
      attempts += 1;
      if (attempts === 1) throw new TypeError('fetch failed');
      return new Response('ok', { status: 200 });
    },
  });
  assert.equal(networkRecovered, 'ok');
  assert.equal(attempts, 2);
});

test('scheduled workflow is artifact-only and has no write authority', async () => {
  const workflow = await readFile(
    path.join(projectRoot, '.github', 'workflows', 'discover-candidates.yml'),
    'utf8',
  );
  const parsed = yaml.load(workflow, { schema: yaml.JSON_SCHEMA });
  assert.ok(parsed.on.schedule);
  assert.deepEqual(parsed.permissions, { contents: 'read' });
  for (const job of Object.values(parsed.jobs)) {
    assert.equal('permissions' in job, false, 'job-level permissions are forbidden');
  }
  assert.match(workflow, /persist-credentials:\s*false/);
  assert.match(workflow, /actions\/upload-artifact@v7/);
  assert.match(
    workflow,
    /git status --porcelain --untracked-files=all -- src\/data src\/content/,
  );
  assert.doesNotMatch(workflow, /contents:\s*write/);
  assert.doesNotMatch(workflow, /issues:\s*write/);
  assert.doesNotMatch(workflow, /pull-requests:\s*write/);
  assert.doesNotMatch(workflow, /git push|gh pr|gh issue/i);
});
