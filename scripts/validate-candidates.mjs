import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCandidatePaperDataset } from './lib/candidate-paper-data.mjs';

const projectRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));

try {
  const dataset = await loadCandidatePaperDataset(
    path.join(projectRoot, 'research', 'candidate-papers.yml'),
    path.join(projectRoot, 'research', 'review-decisions.yml'),
    path.join(projectRoot, 'src', 'data', 'papers.yml'),
  );
  const counts = dataset.candidates.reduce((result, candidate) => {
    result[candidate.decision] = (result[candidate.decision] ?? 0) + 1;
    return result;
  }, {});
  console.log(
    'Candidate dataset validation passed: ' +
      dataset.candidates.length +
      ' candidate(s); decisions ' +
      JSON.stringify(counts) +
      '.',
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
