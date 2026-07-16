import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const distRoot = path.join(projectRoot, 'dist');
const astroConfigSource = await readFile(
  path.join(projectRoot, 'astro.config.mjs'),
  'utf8',
);

function configuredValue(field) {
  const match = astroConfigSource.match(
    new RegExp('\\b' + field + "\\s*:\\s*(['\"])(.*?)\\1"),
  );
  return match?.[2] ?? '';
}

const site = configuredValue('site').replace(/\/+$/, '');
const rawBase = configuredValue('base');
const base =
  rawBase === '/' || rawBase === ''
    ? ''
    : '/' + rawBase.replace(/^\/+|\/+$/g, '');

const errors = [];
let htmlFilesChecked = 0;
let cssFilesChecked = 0;
let localReferencesChecked = 0;
let sitemapLocationsChecked = 0;

async function collectFiles(directory, predicate) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(target, predicate)));
    } else if (predicate(entry.name)) {
      files.push(target);
    }
  }

  return files;
}

async function targetExists(target) {
  const candidates = [target, target + '.html', path.join(target, 'index.html')];

  for (const candidate of candidates) {
    try {
      if ((await stat(candidate)).isFile()) {
        return true;
      }
    } catch {
      // Try the next static output shape.
    }
  }

  return false;
}

function isExternalOrFragment(value) {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(value);
}

async function checkReference(sourceFile, value) {
  if (
    value === '' ||
    isExternalOrFragment(value) ||
    value.startsWith('{') ||
    value.startsWith('<')
  ) {
    return;
  }

  const pathPart = value.split(/[?#]/, 1)[0];
  if (pathPart === '') {
    return;
  }

  let decodedPath;
  try {
    decodedPath = decodeURIComponent(pathPart);
  } catch {
    errors.push(
      path.relative(distRoot, sourceFile) +
        ': invalid URL encoding in "' +
        value +
        '"',
    );
    return;
  }

  let target;
  if (decodedPath.startsWith('/')) {
    if (
      base &&
      decodedPath !== base &&
      !decodedPath.startsWith(base + '/')
    ) {
      errors.push(
        path.relative(distRoot, sourceFile) +
          ': root-relative path is missing configured base "' +
          value +
          '"',
      );
      return;
    }

    const outputPath = base ? decodedPath.slice(base.length) : decodedPath;
    target = path.join(distRoot, outputPath.replace(/^\/+/, ''));
  } else {
    target = path.resolve(path.dirname(sourceFile), decodedPath);
  }

  localReferencesChecked += 1;
  if (!(await targetExists(target))) {
    errors.push(
      path.relative(distRoot, sourceFile) +
        ': generated target does not exist for "' +
        value +
        '"',
    );
  }
}

const htmlFiles = await collectFiles(distRoot, (name) => name.endsWith('.html'));
for (const file of htmlFiles) {
  htmlFilesChecked += 1;
  const source = await readFile(file, 'utf8');

  for (const match of source.matchAll(
    /\b(?:href|src|action)=["']([^"']+)["']/g,
  )) {
    await checkReference(file, match[1]);
  }

  for (const match of source.matchAll(/\bsrcset=["']([^"']+)["']/g)) {
    for (const candidate of match[1].split(',')) {
      await checkReference(file, candidate.trim().split(/\s+/, 1)[0]);
    }
  }
}

const cssFiles = await collectFiles(distRoot, (name) => name.endsWith('.css'));
for (const file of cssFiles) {
  cssFilesChecked += 1;
  const source = await readFile(file, 'utf8');
  for (const match of source.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/g)) {
    await checkReference(file, match[2]);
  }
}

const sitemapFiles = await collectFiles(
  distRoot,
  (name) => name.startsWith('sitemap') && name.endsWith('.xml'),
);
const normalizedSite = site ? new URL(site).origin : '';
const expectedSitePrefix = normalizedSite + base + '/';
for (const file of sitemapFiles) {
  const source = await readFile(file, 'utf8');
  for (const match of source.matchAll(/<loc>(.*?)<\/loc>/g)) {
    sitemapLocationsChecked += 1;
    if (!match[1].startsWith(expectedSitePrefix)) {
      errors.push(
        path.relative(distRoot, file) +
          ': sitemap location is missing site/base prefix "' +
          match[1] +
          '"',
      );
    }
  }
}

if (sitemapLocationsChecked === 0) {
  errors.push('No sitemap locations were generated.');
}

if (errors.length > 0) {
  console.error(
    'Built path check failed with ' + errors.length + ' issue(s):',
  );
  for (const error of errors) {
    console.error('- ' + error);
  }
  process.exit(1);
}

console.log(
  'Built path check passed: ' +
    htmlFilesChecked +
    ' HTML file(s), ' +
    cssFilesChecked +
    ' CSS file(s), ' +
    localReferencesChecked +
    ' local reference(s), and ' +
    sitemapLocationsChecked +
    ' sitemap location(s) checked for base "' +
    (base || '/') +
    '".',
);
