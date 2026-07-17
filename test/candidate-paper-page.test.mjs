import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const readProjectFile = (relativePath) =>
  readFile(path.join(projectRoot, relativePath), 'utf8');

test('candidate page is separate from the canonical paper library and discoverable', async () => {
  const [page, collection, card, config] = await Promise.all([
    readProjectFile('src/content/docs/candidate-papers/index.mdx'),
    readProjectFile('src/components/CandidatePaperCollection.astro'),
    readProjectFile('src/components/CandidatePaperCard.astro'),
    readProjectFile('astro.config.mjs'),
  ]);

  assert.match(page, /CandidatePaperCollection/);
  assert.match(page, /does not publish raw discovery artifacts/);
  assert.match(collection, /Candidates are not canonical evidence/);
  assert.match(collection, /data-candidate-decision/);
  assert.match(collection, /data-candidate-venue/);
  assert.match(collection, /data-candidate-track/);
  assert.match(collection, /aria-live="polite"/);
  assert.match(card, /Analyst recommendation/);
  assert.match(card, /Read on arXiv/);
  assert.match(card, /Official source/);
  assert.match(card, /withBase/);
  assert.match(config, /Candidate Papers.*candidate-papers/s);
});

test('candidate UI never imports raw discovery artifacts or canonical mutation helpers', async () => {
  const sources = await Promise.all([
    readProjectFile('src/content/docs/candidate-papers/index.mdx'),
    readProjectFile('src/components/CandidatePaperCollection.astro'),
    readProjectFile('src/components/CandidatePaperCard.astro'),
  ]);
  const combined = sources.join('\n');

  assert.doesNotMatch(combined, /\.artifacts[\\/]discovery/);
  assert.doesNotMatch(combined, /writePaperDatasetSafely/);
  assert.doesNotMatch(combined, /papers\.yml\?raw/);
});
