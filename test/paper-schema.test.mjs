import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  HumanNotesProtectionError,
  PAPER_STATUSES,
  TODO_UNVERIFIED,
  assertHumanNotesPreserved,
  paperDatasetSchema,
} from '../src/data/paper-schema.mjs';
import {
  loadPaperDataset,
  writePaperDatasetSafely,
} from '../scripts/lib/paper-data.mjs';

const projectRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const fixturePath = (name) =>
  path.join(projectRoot, 'test', 'fixtures', name);

const validFixture = await loadPaperDataset(fixturePath('papers.valid.yml'));
const validPaper = validFixture[0];

test('an empty dataset is valid and the canonical dataset loads', async () => {
  assert.equal(paperDatasetSchema.safeParse([]).success, true);

  const papers = await loadPaperDataset(
    path.join(projectRoot, 'src', 'data', 'papers.yml'),
  );
  assert.equal(Array.isArray(papers), true);
});

test('the valid fixture and documented example satisfy the schema', async () => {
  assert.equal(validFixture.length, 1);
  assert.equal(
    validPaper.human_notes,
    'Preserve this exact line.\n保留这些人工笔记。\n',
  );

  const example = await loadPaperDataset(
    path.join(projectRoot, 'papers.example.yml'),
  );
  assert.equal(example.length, 1);
});

test('invalid fixture reports status, URL, evidence, date, and type errors', async () => {
  await assert.rejects(
    loadPaperDataset(fixturePath('papers.invalid.yml')),
    (error) => {
      assert.match(error.message, /0\.status/);
      assert.match(error.message, /0\.paper_url/);
      assert.match(error.message, /0\.arxiv_url/);
      assert.match(error.message, /0\.code_url/);
      assert.match(error.message, /0\.evidence\.compute_budget/);
      assert.match(error.message, /0\.evidence\.wall_clock_reported/);
      assert.match(error.message, /0\.reading_status/);
      assert.match(error.message, /0\.last_verified/);
      assert.match(error.message, /0\.human_notes/);
      return true;
    },
  );
});

test('duplicate YAML mapping keys fail before schema validation', async () => {
  await assert.rejects(
    loadPaperDataset(fixturePath('papers.duplicate-key.yml')),
    /duplicated mapping key/i,
  );
});

test('all required paper and evidence fields are enforced', () => {
  const requiredPaperFields = [
    'id',
    'title',
    'authors',
    'year',
    'publication_date',
    'status',
    'venue',
    'paper_url',
    'arxiv_url',
    'code_url',
    'source_version',
    'tags',
    'research_tracks',
    'frontier_watch',
    'core_claim',
    'exact_update',
    'traditional_optimization_link',
    'evidence',
    'limitations',
    'reading_status',
    'last_verified',
    'human_notes',
  ];
  const requiredEvidenceFields = [
    'model_scales',
    'datasets',
    'token_budget',
    'compute_budget',
    'baseline_tuning',
    'evaluation_metric',
    'wall_clock_reported',
    'optimizer_state_reported',
  ];

  for (const field of requiredPaperFields) {
    const candidate = structuredClone(validPaper);
    delete candidate[field];
    assert.equal(
      paperDatasetSchema.safeParse([candidate]).success,
      false,
      'missing paper field should fail: ' + field,
    );
  }

  for (const field of requiredEvidenceFields) {
    const candidate = structuredClone(validPaper);
    delete candidate.evidence[field];
    assert.equal(
      paperDatasetSchema.safeParse([candidate]).success,
      false,
      'missing evidence field should fail: ' + field,
    );
  }
});

test('publication status accepts only the three allowed values', () => {
  for (const status of PAPER_STATUSES) {
    const candidate = structuredClone(validPaper);
    candidate.status = status;
    assert.equal(paperDatasetSchema.safeParse([candidate]).success, true);
  }

  const candidate = structuredClone(validPaper);
  candidate.status = TODO_UNVERIFIED;
  assert.equal(paperDatasetSchema.safeParse([candidate]).success, false);
});

test('duplicate paper IDs fail dataset validation', () => {
  const duplicate = structuredClone(validPaper);
  duplicate.title = 'Second Fixture';
  const result = paperDatasetSchema.safeParse([validPaper, duplicate]);

  assert.equal(result.success, false);
  assert.match(
    result.error.issues.map((issue) => issue.message).join('\n'),
    /duplicate paper id "schema-fixture"/,
  );
});

test('URLs allow empty and TODO values but reject unsafe nonempty values', () => {
  for (const value of [
    '',
    TODO_UNVERIFIED,
    'http://example.invalid/paper',
    'https://example.invalid/paper',
  ]) {
    const candidate = structuredClone(validPaper);
    candidate.paper_url = value;
    assert.equal(
      paperDatasetSchema.safeParse([candidate]).success,
      true,
      'expected valid URL value: ' + value,
    );
  }

  for (const value of [
    'relative/paper',
    'http:example.invalid/paper',
    'http:/example.invalid/paper',
    'ftp://example.invalid/paper',
    'https://user:password@example.invalid/paper',
    'https://example.invalid/a b',
    'https://example.invalid/%zz',
    ' https://example.invalid/paper',
  ]) {
    const candidate = structuredClone(validPaper);
    candidate.paper_url = value;
    assert.equal(
      paperDatasetSchema.safeParse([candidate]).success,
      false,
      'expected invalid URL value: ' + value,
    );
  }
});

test('arXiv URLs use canonical abstract paths and match source_version', () => {
  for (const value of [
    '',
    TODO_UNVERIFIED,
    'https://arxiv.org/abs/2401.00001',
    'https://arxiv.org/abs/2401.00001v2',
    'https://arxiv.org/abs/math/0301234',
  ]) {
    const candidate = structuredClone(validPaper);
    candidate.arxiv_url = value;
    if (value.includes('2401.00001')) {
      candidate.source_version = 'arXiv:2401.00001v2';
    } else if (value.includes('math/0301234')) {
      candidate.source_version = 'arXiv:math/0301234v1';
    }
    assert.equal(
      paperDatasetSchema.safeParse([candidate]).success,
      true,
      'expected valid arXiv URL value: ' + value,
    );
  }

  for (const value of [
    'http://arxiv.org/abs/2401.00001',
    'https://export.arxiv.org/abs/2401.00001',
    'https://arxiv.org/pdf/2401.00001',
    'https://arxiv.org/html/2401.00001',
    'https://arxiv.org/abs/not-an-id',
    'https://arxiv.org/abs/2401.00001/',
    'https://arxiv.org/abs/2401.00001?download=1',
    'https://arxiv.org/abs/2401.00001#page',
  ]) {
    const candidate = structuredClone(validPaper);
    candidate.arxiv_url = value;
    assert.equal(
      paperDatasetSchema.safeParse([candidate]).success,
      false,
      'expected invalid arXiv URL value: ' + value,
    );
  }

  const mismatched = structuredClone(validPaper);
  mismatched.arxiv_url = 'https://arxiv.org/abs/2401.99999';
  mismatched.source_version = 'arXiv:2401.00001v1';
  assert.equal(paperDatasetSchema.safeParse([mismatched]).success, false);
});

test('TODO_UNVERIFIED is a valid evidence reporting state', () => {
  for (const value of [true, false, TODO_UNVERIFIED]) {
    const candidate = structuredClone(validPaper);
    candidate.evidence.wall_clock_reported = value;
    assert.equal(paperDatasetSchema.safeParse([candidate]).success, true);
  }

  const candidate = structuredClone(validPaper);
  candidate.evidence.wall_clock_reported = 'false';
  assert.equal(paperDatasetSchema.safeParse([candidate]).success, false);
});

test('last_verified accepts null and real nonfuture ISO dates', () => {
  for (const value of [null, '2024-02-29']) {
    const candidate = structuredClone(validPaper);
    candidate.last_verified = value;
    assert.equal(paperDatasetSchema.safeParse([candidate]).success, true);
  }

  for (const value of ['2024-02-30', '07/16/2026', '2999-01-01']) {
    const candidate = structuredClone(validPaper);
    candidate.last_verified = value;
    assert.equal(paperDatasetSchema.safeParse([candidate]).success, false);
  }
});

test('publication_date and research workflow fields are controlled', () => {
  const candidate = structuredClone(validPaper);
  candidate.publication_date = '2024-02-29';
  candidate.research_tracks = ['benchmarking', 'systems'];
  candidate.frontier_watch = true;
  assert.equal(paperDatasetSchema.safeParse([candidate]).success, true);

  candidate.publication_date = '2024-02-30';
  candidate.research_tracks = ['unknown-track'];
  candidate.frontier_watch = TODO_UNVERIFIED;
  assert.equal(paperDatasetSchema.safeParse([candidate]).success, false);
});

test('publication year and frontier status remain internally consistent', () => {
  const inconsistentYear = structuredClone(validPaper);
  inconsistentYear.year = 2025;
  inconsistentYear.publication_date = '2024-12-31';
  assert.equal(
    paperDatasetSchema.safeParse([inconsistentYear]).success,
    false,
  );

  const publishedFrontier = structuredClone(validPaper);
  publishedFrontier.status = 'published';
  publishedFrontier.frontier_watch = true;
  assert.equal(
    paperDatasetSchema.safeParse([publishedFrontier]).success,
    false,
  );
});

test('long factual text supports YAML block newlines and exact TODO markers', () => {
  const blockText = structuredClone(validPaper);
  blockText.core_claim = 'A fixture claim.\n';
  blockText.exact_update = 'W next equals W minus the update.\n';
  assert.equal(paperDatasetSchema.safeParse([blockText]).success, true);

  for (const value of [
    'TODO_UNVERIFIED: needs review',
    'Not checked (TODO_UNVERIFIED)',
  ]) {
    const candidate = structuredClone(validPaper);
    candidate.core_claim = value;
    assert.equal(paperDatasetSchema.safeParse([candidate]).success, false);
  }
});

test('strict objects reject unknown paper and evidence fields', () => {
  const extraPaperField = structuredClone(validPaper);
  extraPaperField.unreviewed_field = 'value';
  assert.equal(
    paperDatasetSchema.safeParse([extraPaperField]).success,
    false,
  );

  const extraEvidenceField = structuredClone(validPaper);
  extraEvidenceField.evidence.unreviewed_field = 'value';
  assert.equal(
    paperDatasetSchema.safeParse([extraEvidenceField]).success,
    false,
  );
});

test('automated updates may change metadata but preserve human_notes', () => {
  const updated = structuredClone(validPaper);
  updated.core_claim = 'Updated fixture metadata';

  const result = assertHumanNotesPreserved([validPaper], [updated]);
  assert.equal(result[0].core_claim, 'Updated fixture metadata');
  assert.equal(result[0].human_notes, validPaper.human_notes);
});

test('human_notes protection rejects edits and record deletion', () => {
  const changedNotes = structuredClone(validPaper);
  changedNotes.human_notes = 'Automated replacement';

  assert.throws(
    () => assertHumanNotesPreserved([validPaper], [changedNotes]),
    HumanNotesProtectionError,
  );
  assert.throws(
    () => assertHumanNotesPreserved([validPaper], []),
    HumanNotesProtectionError,
  );
});

test('automated additions must initialize human_notes as empty', () => {
  assert.throws(
    () => assertHumanNotesPreserved([], [validPaper]),
    HumanNotesProtectionError,
  );

  const newPaper = structuredClone(validPaper);
  newPaper.human_notes = '';
  assert.deepEqual(assertHumanNotesPreserved([], [newPaper]), [newPaper]);
});

test('the protected writer preserves notes and writes validated metadata', async () => {
  const temporaryDirectory = await mkdtemp(
    path.join(os.tmpdir(), 'llm-optimizer-atlas-'),
  );
  const datasetPath = path.join(temporaryDirectory, 'papers.yml');
  const source = await readFile(fixturePath('papers.valid.yml'), 'utf8');
  await writeFile(datasetPath, source, 'utf8');

  try {
    const updated = structuredClone(validPaper);
    updated.core_claim = 'Protected writer fixture claim';
    await writePaperDatasetSafely(datasetPath, [updated]);

    const written = await loadPaperDataset(datasetPath);
    assert.equal(written[0].core_claim, 'Protected writer fixture claim');
    assert.equal(written[0].human_notes, validPaper.human_notes);

    updated.human_notes = 'Forbidden automated note';
    await assert.rejects(
      writePaperDatasetSafely(datasetPath, [updated]),
      HumanNotesProtectionError,
    );
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
});
