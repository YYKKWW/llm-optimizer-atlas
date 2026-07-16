import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPaperDataset } from './lib/paper-data.mjs';

const projectRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const dataset = path.join(projectRoot, 'src', 'data', 'papers.yml');
const papers = await loadPaperDataset(dataset);

if (papers.length === 0) {
  console.log(
    'Paper page generation skipped: the validated dataset contains no paper records.',
  );
  console.log('No hand-written notes were changed.');
} else {
  console.error(
    'Paper data was found, but page generation remains disabled until stage 4.',
  );
  console.error(
    'The future generator may write only to src/content/docs/paper-notes/generated.',
  );
  process.exitCode = 1;
}
