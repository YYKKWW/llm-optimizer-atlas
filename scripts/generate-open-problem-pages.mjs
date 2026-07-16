import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadOpenProblemDataset } from './lib/open-problem-data.mjs';
import {
  createGeneratedOpenProblemPages,
  synchronizeGeneratedOpenProblemPages,
} from './lib/open-problem-page-generation.mjs';

const projectRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const problemPath = path.join(projectRoot, 'src', 'data', 'open-problems.yml');
const paperPath = path.join(projectRoot, 'src', 'data', 'papers.yml');
const outputDirectory = path.join(
  projectRoot,
  'src',
  'content',
  'docs',
  'open-problems',
  'generated',
);

const args = process.argv.slice(2);
if (args.some((arg) => arg !== '--check') || args.length > 1) {
  console.error('Usage: node scripts/generate-open-problem-pages.mjs [--check]');
  process.exitCode = 1;
} else {
  try {
    const check = args[0] === '--check';
    const problems = await loadOpenProblemDataset(problemPath, paperPath);
    const pages = createGeneratedOpenProblemPages(problems);
    const result = await synchronizeGeneratedOpenProblemPages(
      outputDirectory,
      pages,
      { check },
    );

    if (!result.ok) {
      console.error(
        'Generated open-problem page ' +
          (check ? 'check' : 'update') +
          ' failed with ' +
          result.issues.length +
          ' issue(s):',
      );
      for (const issue of result.issues) {
        console.error('- ' + issue);
      }
      process.exitCode = 1;
    } else if (check) {
      console.log(
        'Generated open-problem page check passed: ' +
          pages.size +
          ' page(s) match ' +
          problems.length +
          ' verified record(s).',
      );
    } else {
      console.log(
        'Open-problem page generation complete: ' +
          pages.size +
          ' page(s), ' +
          result.written +
          ' written, ' +
          result.removed +
          ' stale page(s) removed.',
      );
      console.log('No hand-written page or human_notes field was changed.');
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
