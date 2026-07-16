import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  OPEN_PROBLEM_GENERATED_PAGE_MARKER,
  createGeneratedOpenProblemPages,
  synchronizeGeneratedOpenProblemPages,
} from '../scripts/lib/open-problem-page-generation.mjs';
import { loadOpenProblemDataset } from '../scripts/lib/open-problem-data.mjs';
import { relatedPaperIds } from '../src/data/open-problem-schema.mjs';

const projectRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const problemPath = path.join(projectRoot, 'src', 'data', 'open-problems.yml');
const paperPath = path.join(projectRoot, 'src', 'data', 'papers.yml');
const problems = await loadOpenProblemDataset(problemPath, paperPath);

test('one deterministic generated detail route exists per verified problem', () => {
  const pages = createGeneratedOpenProblemPages(problems);
  assert.equal(pages.size, problems.length);
  for (const problem of problems) {
    const route = path.join(problem.id, 'index.mdx');
    assert.equal(pages.has(route), true, 'missing route: ' + route);
    assert.match(pages.get(route), new RegExp(`problemId="${problem.id}"`));
    assert.ok(pages.get(route).includes(OPEN_PROBLEM_GENERATED_PAGE_MARKER));
    assert.match(pages.get(route), /tableOfContents: false/);
    assert.match(
      pages.get(route),
      /description: "Evidence-reviewed open-problem record:/,
    );
  }
});

test('related papers are derived from source refs without duplicates', () => {
  for (const problem of problems) {
    const expected = [...new Set(problem.source_refs.map((ref) => ref.paper_id))];
    assert.deepEqual(relatedPaperIds(problem), expected);
    assert.ok(expected.length >= 1);
  }
});

test('detail component renders required provenance and research metadata', async () => {
  const source = await readFile(
    path.join(projectRoot, 'src', 'components', 'OpenProblemDetail.astro'),
    'utf8',
  );
  for (const expression of [
    'problem.status',
    'problem.problem_type',
    'problem.origin',
    'problem.research_tracks',
    'problem.last_verified',
    'sourceRef.paper_source_version',
    'sourceRef.locator',
  ]) {
    assert.ok(source.includes(expression), 'missing rendered field: ' + expression);
  }
});

test('problem explorer is progressively enhanced and accessibly labelled', async () => {
  const collection = await readFile(
    path.join(projectRoot, 'src', 'components', 'OpenProblemCollection.astro'),
    'utf8',
  );
  const card = await readFile(
    path.join(projectRoot, 'src', 'components', 'OpenProblemCard.astro'),
    'utf8',
  );
  for (const required of [
    'type="search"',
    'role="search"',
    'data-problem-track',
    'data-problem-type',
    'data-problem-sort',
    'aria-live="polite"',
    '<noscript>',
    'data-problem-empty',
    'paperSearchTextByProblem',
  ]) {
    assert.ok(collection.includes(required), 'missing explorer contract: ' + required);
  }
  for (const required of [
    'aria-labelledby={titleId}',
    '<time datetime={problem.last_verified}>',
    'aria-label={`Status:',
    '<h3 id={titleId}>',
    'paperSearchText',
  ]) {
    assert.ok(card.includes(required), 'missing card accessibility contract: ' + required);
  }
});

test('detail page prioritizes decision context and links to evidence anchors', async () => {
  const source = await readFile(
    path.join(projectRoot, 'src', 'components', 'OpenProblemDetail.astro'),
    'utf8',
  );
  const orderedSections = [
    'id="precise-question"',
    'id="known-results"',
    'id="unknown-boundary"',
    'id="resolution-criteria"',
    'id="scope-assumptions"',
    'id="source-boundary"',
    'id="candidate-approaches"',
  ];
  let previousIndex = -1;
  for (const section of orderedSections) {
    const index = source.indexOf(section);
    assert.ok(index > previousIndex, 'detail section is missing or out of order: ' + section);
    previousIndex = index;
  }
  assert.match(source, /href={`#evidence-\$\{sourceRefId\}`}/);
  assert.match(source, /aria-label="Adjacent open problems"/);
  assert.match(source, /Read.*arXiv|paperSourceLinks/);
});

test('generated synchronization detects drift and protects unowned files', async () => {
  const temporaryDirectory = await mkdtemp(
    path.join(os.tmpdir(), 'llm-optimizer-problem-pages-'),
  );
  const pages = createGeneratedOpenProblemPages(problems.slice(0, 2));
  try {
    const initial = await synchronizeGeneratedOpenProblemPages(
      temporaryDirectory,
      pages,
    );
    assert.equal(initial.ok, true);
    assert.equal(initial.written, 2);

    const clean = await synchronizeGeneratedOpenProblemPages(
      temporaryDirectory,
      pages,
      { check: true },
    );
    assert.equal(clean.ok, true);

    const firstRoute = [...pages.keys()][0];
    const firstFile = path.join(temporaryDirectory, firstRoute);
    await writeFile(firstFile, (await readFile(firstFile, 'utf8')) + '\n', 'utf8');
    const drifted = await synchronizeGeneratedOpenProblemPages(
      temporaryDirectory,
      pages,
      { check: true },
    );
    assert.equal(drifted.ok, false);
    assert.match(drifted.issues.join('\n'), /out of date/);

    const repaired = await synchronizeGeneratedOpenProblemPages(
      temporaryDirectory,
      pages,
    );
    assert.equal(repaired.ok, true);
    assert.equal(repaired.written, 1);

    const manualFile = path.join(temporaryDirectory, 'manual.md');
    await writeFile(manualFile, 'human content', 'utf8');
    const protectedResult = await synchronizeGeneratedOpenProblemPages(
      temporaryDirectory,
      pages,
    );
    assert.equal(protectedResult.ok, false);
    assert.match(protectedResult.issues.join('\n'), /unowned file/);
    assert.equal(await readFile(manualFile, 'utf8'), 'human content');
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
});

test('generated paths cannot escape the owned directory', async () => {
  const temporaryDirectory = await mkdtemp(
    path.join(os.tmpdir(), 'llm-optimizer-problem-contained-'),
  );
  try {
    await assert.rejects(
      synchronizeGeneratedOpenProblemPages(
        temporaryDirectory,
        new Map([['../escape.mdx', 'unsafe']]),
      ),
      /escapes the output directory/,
    );
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
});
