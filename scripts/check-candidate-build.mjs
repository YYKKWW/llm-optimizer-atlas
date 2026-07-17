import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const projectRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const candidatePath = path.join(projectRoot, 'research', 'candidate-papers.yml');
const outputPath = path.join(
  projectRoot,
  'dist',
  'candidate-papers',
  'index.html',
);
const homeOutputPath = path.join(projectRoot, 'dist', 'index.html');

const [candidateSource, html, homeHtml] = await Promise.all([
  fs.readFile(candidatePath, 'utf8'),
  fs.readFile(outputPath, 'utf8'),
  fs.readFile(homeOutputPath, 'utf8'),
]);
const dataset = yaml.load(candidateSource, {
  filename: candidatePath,
  schema: yaml.JSON_SCHEMA,
});
const errors = [];
const cardCount =
  (html.match(/<li\b[^>]*\sdata-candidate-card(?:\s|>)/g) ?? []).length;
const approvedCount = dataset.candidates.filter(
  (candidate) => candidate.recommendation === 'include',
).length;
const hasStat = (value, label) =>
  new RegExp('<strong\\b[^>]*>' + value + '</strong>').test(homeHtml) &&
  homeHtml.includes(label);

if (cardCount !== dataset.candidates.length) {
  errors.push(
    'built candidate card count ' +
      cardCount +
      ' does not match dataset count ' +
      dataset.candidates.length,
  );
}
if (
  !html.includes(
    'Search window ' +
      dataset.search_window.start +
      ' to ' +
      dataset.search_window.end,
  )
) {
  errors.push('built candidate page does not show the reviewed search window');
}
if (!html.includes('Candidates are not canonical evidence.')) {
  errors.push('built candidate page is missing the evidence-boundary warning');
}
for (const decision of ['include', 'watch', 'exclude']) {
  if (!html.includes('decision-badge-' + decision)) {
    errors.push('built candidate page does not contain decision ' + decision);
  }
}
if (html.includes('\uFFFD')) {
  errors.push('built candidate page contains a Unicode replacement character');
}
if (
  !html.includes(
    'href="/llm-optimizer-atlas/paper-notes/generated/papers/' +
      'hyperparameter-transfer-matrix-preconditioners/"',
  )
) {
  errors.push('canonical duplicate link is missing the configured base path');
}
if (!hasStat(dataset.candidates.length, 'screened candidate papers')) {
  errors.push('home page does not expose the screened candidate count');
}
if (!hasStat(approvedCount, 'approved for full reading')) {
  errors.push('home page does not expose the approved full-reading count');
}
if (
  !homeHtml.includes('href="/llm-optimizer-atlas/candidate-papers/"')
) {
  errors.push('home page candidate link is missing the configured base path');
}

if (errors.length > 0) {
  console.error(
    'Candidate build inspection failed with ' + errors.length + ' issue(s):',
  );
  for (const error of errors) console.error('- ' + error);
  process.exit(1);
}

console.log(
  'Candidate build inspection passed: ' +
    cardCount +
    ' reviewed cards, home counts present, evidence boundary present, and candidate links base-safe.',
);
