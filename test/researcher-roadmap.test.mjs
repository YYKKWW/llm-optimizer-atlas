import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { loadCandidatePaperDataset } from '../scripts/lib/candidate-paper-data.mjs';
import { loadOpenProblemDataset } from '../scripts/lib/open-problem-data.mjs';
import { loadPaperDataset } from '../scripts/lib/paper-data.mjs';
import {
  ROADMAP_COMPETENCIES,
  ROADMAP_FRONTIER_HEAT_THRESHOLDS,
  ROADMAP_FRONTIER_REVIEWED_ON,
  ROADMAP_RESOURCES,
  resolveResearcherRoadmap,
} from '../src/lib/researcher-roadmap.mjs';

const projectRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const paperPath = path.join(projectRoot, 'src', 'data', 'papers.yml');
const problemPath = path.join(projectRoot, 'src', 'data', 'open-problems.yml');
const candidatePath = path.join(projectRoot, 'research', 'candidate-papers.yml');
const decisionPath = path.join(projectRoot, 'research', 'review-decisions.yml');
const readProjectFile = (relativePath) =>
  readFile(path.join(projectRoot, relativePath), 'utf8');

const [papers, problems, candidateDataset] = await Promise.all([
  loadPaperDataset(paperPath),
  loadOpenProblemDataset(problemPath, paperPath),
  loadCandidatePaperDataset(candidatePath, decisionPath, paperPath),
]);
const roadmap = resolveResearcherRoadmap(
  papers,
  problems,
  candidateDataset.candidates,
);

test('researcher roadmap resolves every reference against canonical datasets', () => {
  assert.equal(ROADMAP_COMPETENCIES.length, 8);
  assert.equal(roadmap.phases.length, 5);
  assert.equal(roadmap.checkpointCount, 20);
  assert.equal(roadmap.paperCoverage, papers.length);
  assert.equal(roadmap.ladders.length, 4);
  assert.equal(roadmap.frontiers.length, 6);

  const roadmapPaperIds = roadmap.phases.flatMap((phase) =>
    phase.papers.map((paper) => paper.id),
  );
  assert.equal(new Set(roadmapPaperIds).size, roadmapPaperIds.length);
  assert.deepEqual(
    [...roadmapPaperIds].sort(),
    papers.map((paper) => paper.id).sort(),
  );

  for (const frontier of roadmap.frontiers) {
    assert.equal(frontier.candidates.length, 5);
    assert.ok(frontier.candidates.every((candidate) => candidate.decision === 'include'));
    assert.ok(frontier.problem.id);
    assert.ok(frontier.signalCount >= frontier.candidates.length);
    const expectedHeat =
      frontier.signalCount >= ROADMAP_FRONTIER_HEAT_THRESHOLDS.veryHigh
        ? 'Very high'
        : frontier.signalCount >= ROADMAP_FRONTIER_HEAT_THRESHOLDS.high
          ? 'High'
          : 'Emerging';
    assert.equal(frontier.heat, expectedHeat);
  }
  assert.match(ROADMAP_FRONTIER_REVIEWED_ON, /^\d{4}-\d{2}-\d{2}$/);
});

test('external prerequisite resources use reviewed official HTTPS hosts', () => {
  const officialHosts = new Set([
    'web.stanford.edu',
    'cs336.stanford.edu',
    'www.nicolasboumal.net',
    'pymanopt.org',
    'docs.pytorch.org',
    'github.com',
    'neurips.cc',
  ]);
  for (const resource of ROADMAP_RESOURCES) {
    const url = new URL(resource.href);
    assert.equal(url.protocol, 'https:');
    assert.equal(
      officialHosts.has(url.hostname),
      true,
      'unreviewed roadmap resource host: ' + url.hostname,
    );
  }
});

test('roadmap page is discoverable and keeps all links base-safe', async () => {
  const [page, component, config, home, overview] = await Promise.all([
    readProjectFile('src/content/docs/researcher-roadmap/index.mdx'),
    readProjectFile('src/components/ResearcherRoadmap.astro'),
    readProjectFile('astro.config.mjs'),
    readProjectFile('src/content/docs/index.mdx'),
    readProjectFile('src/components/AtlasOverview.astro'),
  ]);

  assert.match(page, /ResearcherRoadmap/);
  assert.match(config, /Researcher Roadmap.*researcher-roadmap/s);
  assert.match(home, /Start the researcher roadmap/);
  assert.match(overview, /Personal researcher pathway/);
  assert.match(component, /withBase/);
  assert.match(component, /paperDetailRoute/);
  assert.match(component, /openProblemDetailRoute/);
  assert.match(component, /decision=include&track=/);
  assert.match(component, /not citation metrics/);
  assert.doesNotMatch(component, /\/llm-optimizer-atlas\//);
});

test('roadmap progress is accessible, local-only, and progressively enhanced', async () => {
  const component = await readProjectFile(
    'src/components/ResearcherRoadmap.astro',
  );
  for (const required of [
    '<progress',
    'data-roadmap-checkpoint',
    'data-roadmap-progress-text aria-live="polite"',
    'data-roadmap-reset',
    'window.localStorage',
    'stored only in this browser',
    'not a credential',
  ]) {
    assert.ok(component.includes(required), 'missing roadmap UX contract: ' + required);
  }
  assert.doesNotMatch(component, /fetch\(|XMLHttpRequest|navigator\.sendBeacon/);
});
