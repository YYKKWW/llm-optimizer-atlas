import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  OPEN_PROBLEM_STATUSES,
  OpenProblemHumanNotesProtectionError,
  OpenProblemReferenceError,
  assertOpenProblemHumanNotesPreserved,
  assertOpenProblemPaperReferences,
  openProblemDatasetSchema,
} from '../src/data/open-problem-schema.mjs';
import {
  OpenProblemConcurrentWriteError,
  loadOpenProblemDataset,
  writeOpenProblemDatasetSafely,
} from '../scripts/lib/open-problem-data.mjs';
import { loadPaperDataset } from '../scripts/lib/paper-data.mjs';

const projectRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const fixture = (name) => path.join(projectRoot, 'test', 'fixtures', name);
const paperFixturePath = fixture('papers.valid.yml');
const papers = await loadPaperDataset(paperFixturePath);
const validProblems = await loadOpenProblemDataset(
  fixture('open-problems.valid.yml'),
  paperFixturePath,
);
const validProblem = validProblems[0];

test('empty and canonical open-problem datasets load', async () => {
  assert.equal(openProblemDatasetSchema.safeParse([]).success, true);
  const problems = await loadOpenProblemDataset(
    path.join(projectRoot, 'src', 'data', 'open-problems.yml'),
    path.join(projectRoot, 'src', 'data', 'papers.yml'),
  );
  assert.equal(Array.isArray(problems), true);
});

test('valid fixture satisfies schema and resolves paper references', () => {
  assert.equal(validProblems.length, 1);
  assert.equal(
    validProblem.human_notes,
    'Preserve this problem note exactly.\n',
  );
  assert.deepEqual(
    assertOpenProblemPaperReferences(validProblems, papers),
    validProblems,
  );
});

test('invalid fixture reports controlled field failures', async () => {
  await assert.rejects(
    loadOpenProblemDataset(
      fixture('open-problems.invalid.yml'),
      paperFixturePath,
    ),
    (error) => {
      assert.match(error.message, /0\.id/);
      assert.match(error.message, /0\.status/);
      assert.match(error.message, /0\.verification_status/);
      assert.match(error.message, /0\.problem_type/);
      assert.match(error.message, /0\.question/);
      assert.match(error.message, /0\.last_verified/);
      assert.match(error.message, /0\.human_notes/);
      return true;
    },
  );
});

test('duplicate YAML keys fail before schema validation', async () => {
  await assert.rejects(
    loadOpenProblemDataset(
      fixture('open-problems.duplicate-key.yml'),
      paperFixturePath,
    ),
    /duplicated mapping key/i,
  );
});

test('every open-problem field is required', () => {
  const requiredFields = [
    'id',
    'title',
    'status',
    'verification_status',
    'problem_type',
    'research_tracks',
    'tags',
    'origin',
    'question',
    'scope',
    'assumptions',
    'source_refs',
    'known_results',
    'unknown',
    'why_open',
    'candidate_approaches',
    'resolution_criteria',
    'falsification_criteria',
    'last_verified',
    'human_notes',
  ];
  for (const field of requiredFields) {
    const candidate = structuredClone(validProblem);
    delete candidate[field];
    assert.equal(
      openProblemDatasetSchema.safeParse([candidate]).success,
      false,
      'missing field should fail: ' + field,
    );
  }
});

test('open and verified-only boundaries are enforced', () => {
  assert.deepEqual(OPEN_PROBLEM_STATUSES, ['open']);
  for (const [field, value] of [
    ['status', 'resolved'],
    ['verification_status', 'candidate'],
    ['problem_type', 'unknown'],
    ['origin', 'invented'],
  ]) {
    const candidate = structuredClone(validProblem);
    candidate[field] = value;
    assert.equal(openProblemDatasetSchema.safeParse([candidate]).success, false);
  }
});

test('TODO markers and unresolved source-ref IDs are rejected', () => {
  const todo = structuredClone(validProblem);
  todo.why_open = 'TODO_UNVERIFIED';
  assert.equal(openProblemDatasetSchema.safeParse([todo]).success, false);

  const missingRef = structuredClone(validProblem);
  missingRef.known_results[0].source_ref_ids = ['missing-source'];
  assert.equal(openProblemDatasetSchema.safeParse([missingRef]).success, false);

  const duplicateRef = structuredClone(validProblem);
  duplicateRef.source_refs.push(structuredClone(duplicateRef.source_refs[0]));
  assert.equal(openProblemDatasetSchema.safeParse([duplicateRef]).success, false);
});

test('source-stated origin requires a problem-statement locator', () => {
  const candidate = structuredClone(validProblem);
  candidate.origin = 'source-stated';
  assert.equal(openProblemDatasetSchema.safeParse([candidate]).success, false);
  candidate.source_refs[0].role = 'problem-statement';
  assert.equal(openProblemDatasetSchema.safeParse([candidate]).success, true);
});

test('unknown papers and source-version drift fail cross-dataset validation', () => {
  const missingPaper = structuredClone(validProblem);
  missingPaper.source_refs[0].paper_id = 'missing-paper';
  assert.throws(
    () => assertOpenProblemPaperReferences([missingPaper], papers),
    OpenProblemReferenceError,
  );

  const driftedVersion = structuredClone(validProblem);
  driftedVersion.source_refs[0].paper_source_version = 'arXiv:2401.00001v2';
  assert.throws(
    () => assertOpenProblemPaperReferences([driftedVersion], papers),
    /expected exact canonical value/,
  );
});

test('unverified paper sources cannot ground verified problems', () => {
  const unverifiedPapers = structuredClone(papers);
  unverifiedPapers[0].source_version = 'TODO_UNVERIFIED';
  unverifiedPapers[0].last_verified = null;
  assert.throws(
    () => assertOpenProblemPaperReferences(validProblems, unverifiedPapers),
    OpenProblemReferenceError,
  );
});

test('duplicate problem IDs fail dataset validation', () => {
  const duplicate = structuredClone(validProblem);
  duplicate.title = 'A second fixture title';
  assert.equal(
    openProblemDatasetSchema.safeParse([validProblem, duplicate]).success,
    false,
  );
});

test('automated updates preserve human notes and records', () => {
  const updated = structuredClone(validProblem);
  updated.why_open = 'The updated fixture remains open under its stated scope.';
  assert.equal(
    assertOpenProblemHumanNotesPreserved([validProblem], [updated])[0].why_open,
    updated.why_open,
  );

  const changedNotes = structuredClone(validProblem);
  changedNotes.human_notes = 'Forbidden automated edit';
  assert.throws(
    () => assertOpenProblemHumanNotesPreserved([validProblem], [changedNotes]),
    OpenProblemHumanNotesProtectionError,
  );
  assert.throws(
    () => assertOpenProblemHumanNotesPreserved([validProblem], []),
    OpenProblemHumanNotesProtectionError,
  );
});

test('automated writers cannot promote new verified records', () => {
  const newProblem = structuredClone(validProblem);
  newProblem.human_notes = '';
  assert.throws(
    () => assertOpenProblemHumanNotesPreserved([], [newProblem]),
    OpenProblemHumanNotesProtectionError,
  );
  assert.deepEqual(
    assertOpenProblemHumanNotesPreserved([], [newProblem], {
      allowAdditions: true,
    }),
    [newProblem],
  );
});

test('protected writer validates references and preserves notes', async () => {
  const temporaryDirectory = await mkdtemp(
    path.join(os.tmpdir(), 'llm-optimizer-open-problems-'),
  );
  const datasetPath = path.join(temporaryDirectory, 'open-problems.yml');
  await writeFile(
    datasetPath,
    await readFile(fixture('open-problems.valid.yml'), 'utf8'),
    'utf8',
  );

  try {
    const updated = structuredClone(validProblem);
    updated.why_open = 'The protected writer keeps this verified boundary open.';
    await writeOpenProblemDatasetSafely(
      datasetPath,
      paperFixturePath,
      [updated],
    );
    const written = await loadOpenProblemDataset(datasetPath, paperFixturePath);
    assert.equal(written[0].why_open, updated.why_open);
    assert.equal(written[0].human_notes, validProblem.human_notes);

    updated.source_refs[0].paper_id = 'missing-paper';
    await assert.rejects(
      writeOpenProblemDatasetSafely(datasetPath, paperFixturePath, [updated]),
      OpenProblemReferenceError,
    );
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
});

test('protected writer refuses to overwrite a concurrent human edit', async () => {
  const temporaryDirectory = await mkdtemp(
    path.join(os.tmpdir(), 'llm-optimizer-open-problems-race-'),
  );
  const datasetPath = path.join(temporaryDirectory, 'open-problems.yml');
  const original = await readFile(fixture('open-problems.valid.yml'), 'utf8');
  await writeFile(datasetPath, original, 'utf8');

  try {
    const updated = structuredClone(validProblem);
    updated.why_open = 'This automated edit must lose the race.';
    const humanEdit = original.replace(
      'Preserve this problem note exactly.',
      'Concurrent human edit must survive.',
    );
    assert.notEqual(humanEdit, original);
    await assert.rejects(
      writeOpenProblemDatasetSafely(datasetPath, paperFixturePath, [updated], {
        beforeReplace: () => writeFile(datasetPath, humanEdit, 'utf8'),
      }),
      OpenProblemConcurrentWriteError,
    );
    assert.equal(await readFile(datasetPath, 'utf8'), humanEdit);
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
});
