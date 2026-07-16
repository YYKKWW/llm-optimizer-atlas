import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const docsRoot = path.join(projectRoot, 'src', 'content', 'docs');

const requiredPages = new Map([
  ['index.mdx', 'LLM Optimizer Atlas'],
  ['literature-map/index.md', 'Literature Map'],
  ['literature-map/norm-duality.md', 'Norms, Duality, and Steepest Descent'],
  ['literature-map/preconditioning.md', 'Structured Preconditioning'],
  [
    'literature-map/manifold-constraints.md',
    'Constraints, Manifolds, and Spectra',
  ],
  ['literature-map/benchmarking.md', 'Benchmarking and Scaling'],
  ['literature-map/systems.md', 'Systems and Efficient Optimization'],
  ['paper-notes/index.md', 'Paper Library'],
  ['claim-evidence-matrix/index.mdx', 'Claim–Evidence Matrix'],
  ['open-problems/index.mdx', 'Open Problems'],
  ['reading-queue/index.mdx', 'Reading Queue'],
  ['experiment-notes/index.md', 'Experiment Ledger'],
  ['where-papers-disagree/index.mdx', 'Where Papers Disagree'],
  ['benchmark-comparisons/index.md', 'Benchmark Comparisons'],
  ['watchlist/index.mdx', 'Watchlist'],
  ['paper-notes/generated/all/index.mdx', 'All Papers'],
  [
    'paper-notes/generated/by-research-track/index.mdx',
    'Papers by Research Track',
  ],
  [
    'paper-notes/generated/by-publication-status/index.mdx',
    'Papers by Publication Status',
  ],
  ['paper-notes/generated/by-year/index.mdx', 'Papers by Year'],
]);

const requiredDirectories = [
  'literature-map',
  'paper-notes',
  'paper-notes/generated',
  'open-problems',
  'benchmark-comparisons',
  'experiment-notes',
  'watchlist',
];

const errors = [];

async function existsAsDirectory(target) {
  try {
    return (await stat(target)).isDirectory();
  } catch {
    return false;
  }
}

async function collectMarkdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectMarkdownFiles(target)));
    } else if (/\.(md|mdx)$/i.test(entry.name)) {
      files.push(target);
    }
  }

  return files;
}

function parseFrontmatter(source, relativePath) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) {
    errors.push(relativePath + ': missing YAML frontmatter');
    return {};
  }

  const frontmatter = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^([A-Za-z][\w-]*):\s*(.+?)\s*$/);
    if (!field) {
      continue;
    }

    frontmatter[field[1]] = field[2].replace(/^(['"])(.*)\1$/, '$2');
  }

  return frontmatter;
}

function routeFor(relativePath) {
  const normalized = relativePath.replaceAll(path.sep, '/').toLowerCase();
  if (/^index\.(md|mdx)$/.test(normalized)) {
    return '/';
  }
  if (/\/index\.(md|mdx)$/.test(normalized)) {
    return '/' + normalized.replace(/\/index\.(md|mdx)$/, '/');
  }
  return '/' + normalized.replace(/\.(md|mdx)$/, '/');
}

if (!(await existsAsDirectory(docsRoot))) {
  console.error('Content validation failed: docs directory is missing.');
  process.exit(1);
}

for (const directory of requiredDirectories) {
  const target = path.join(docsRoot, directory);
  if (!(await existsAsDirectory(target))) {
    errors.push(directory + ': required content directory is missing');
  }
}

const markdownFiles = await collectMarkdownFiles(docsRoot);
const routes = new Map();

for (const file of markdownFiles) {
  const relativePath = path.relative(docsRoot, file).replaceAll(path.sep, '/');
  const source = await readFile(file, 'utf8');
  const frontmatter = parseFrontmatter(source, relativePath);

  if (!frontmatter.title) {
    errors.push(relativePath + ': frontmatter title is required');
  }
  if (!frontmatter.description) {
    errors.push(relativePath + ': frontmatter description is required');
  }

  const route = routeFor(relativePath);
  if (routes.has(route)) {
    errors.push(
      relativePath + ': duplicate route with ' + routes.get(route) + ' at ' + route,
    );
  } else {
    routes.set(route, relativePath);
  }
}

for (const [relativePath, expectedTitle] of requiredPages) {
  const target = path.join(docsRoot, relativePath);
  try {
    const source = await readFile(target, 'utf8');
    const frontmatter = parseFrontmatter(source, relativePath);
    if (frontmatter.title !== expectedTitle) {
      errors.push(
        relativePath +
          ': expected title "' +
          expectedTitle +
          '", found "' +
          (frontmatter.title ?? '') +
          '"',
      );
    }
  } catch {
    errors.push(relativePath + ': required page is missing');
  }
}

try {
  await stat(path.join(projectRoot, 'AGENTS.md'));
} catch {
  errors.push('AGENTS.md: required project instructions are missing');
}

if (errors.length > 0) {
  console.error('Content validation failed with ' + errors.length + ' issue(s):');
  for (const error of errors) {
    console.error('- ' + error);
  }
  process.exit(1);
}

console.log(
  'Content validation passed: ' +
    markdownFiles.length +
    ' Markdown/MDX pages and ' +
    routes.size +
    ' unique routes checked.',
);
