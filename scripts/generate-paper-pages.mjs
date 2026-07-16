import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createGeneratedPaperPages,
  synchronizeGeneratedPaperPages,
} from './lib/paper-page-generation.mjs';
import { loadPaperDataset } from './lib/paper-data.mjs';

const projectRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const dataset = path.join(projectRoot, 'src', 'data', 'papers.yml');
const outputDirectory = path.join(
  projectRoot,
  'src',
  'content',
  'docs',
  'paper-notes',
  'generated',
);

const args = process.argv.slice(2);
if (args.some((arg) => arg !== '--check') || args.length > 1) {
  console.error('Usage: node scripts/generate-paper-pages.mjs [--check]');
  process.exitCode = 1;
} else {
  try {
    const check = args[0] === '--check';
    const papers = await loadPaperDataset(dataset);
    const pages = createGeneratedPaperPages(papers);
    const result = await synchronizeGeneratedPaperPages(
      outputDirectory,
      pages,
      { check },
    );

    if (!result.ok) {
      console.error(
        'Generated paper page ' +
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
        'Generated paper page check passed: ' +
          pages.size +
          ' page(s) match ' +
          papers.length +
          ' validated record(s).',
      );
    } else {
      console.log(
        'Paper page generation complete: ' +
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
