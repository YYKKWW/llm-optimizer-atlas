import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadOpenProblemDataset } from './lib/open-problem-data.mjs';

const projectRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const problemPath = path.join(projectRoot, 'src', 'data', 'open-problems.yml');
const paperPath = path.join(projectRoot, 'src', 'data', 'papers.yml');

try {
  const problems = await loadOpenProblemDataset(problemPath, paperPath);
  console.log(
    'Open-problem dataset validation passed: ' +
      problems.length +
      ' verified record(s), with all paper references resolved.',
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
