import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPaperDataset } from './lib/paper-data.mjs';

const projectRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const defaultDataset = path.join(projectRoot, 'src', 'data', 'papers.yml');

if (process.argv.length > 3) {
  console.error('Usage: node scripts/validate-papers.mjs [path-to-papers.yml]');
  process.exitCode = 1;
} else {
  const target = process.argv[2]
    ? path.resolve(process.cwd(), process.argv[2])
    : defaultDataset;

  try {
    const papers = await loadPaperDataset(target);
    console.log(
      'Paper dataset validation passed: ' +
        papers.length +
        ' record(s), all IDs unique.',
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
