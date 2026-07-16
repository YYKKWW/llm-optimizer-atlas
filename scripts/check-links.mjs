import { access, readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const docsRoot = path.join(projectRoot, 'src', 'content', 'docs');
const astroConfigPath = path.join(projectRoot, 'astro.config.mjs');
const errors = [];
let checkedLinks = 0;
let skippedExternalLinks = 0;

function configuredBaseFromAstroConfig(source) {
  const match = source.match(/\bbase\s*:\s*(['"])(.*?)\1/);
  if (!match || match[2] === '/') {
    return '';
  }

  return '/' + match[2].replace(/^\/+|\/+$/g, '');
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

function removeFencedCode(source) {
  return source.replace(/^( {0,3})(\x60{3,}|~{3,})[^\n]*\n[\s\S]*?^\1\2\s*$/gm, '');
}

function slugifyHeading(value) {
  return value
    .replace(/\{#[^}]+\}\s*$/, '')
    .replace(/[*_~]/g, '')
    .trim()
    .toLocaleLowerCase('en-US')
    .normalize('NFKD')
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function resolveMarkdownTarget(basePath) {
  const candidates = [];
  const extension = path.extname(basePath).toLowerCase();

  if (extension === '.md' || extension === '.mdx') {
    candidates.push(basePath);
  } else {
    candidates.push(
      basePath + '.md',
      basePath + '.mdx',
      path.join(basePath, 'index.md'),
      path.join(basePath, 'index.mdx'),
    );
  }

  for (const candidate of candidates) {
    try {
      const info = await stat(candidate);
      if (info.isFile()) {
        return candidate;
      }
    } catch {
      // Try the next supported route shape.
    }
  }

  return null;
}

async function hasAnchor(file, anchor) {
  const source = await readFile(file, 'utf8');
  const decoded = decodeURIComponent(anchor).toLocaleLowerCase('en-US');
  const headings = [...source.matchAll(/^#{1,6}\s+(.+?)\s*#*\s*$/gm)].map(
    (match) => slugifyHeading(match[1]),
  );
  return headings.includes(decoded);
}

await access(docsRoot);
const configuredBase = configuredBaseFromAstroConfig(
  await readFile(astroConfigPath, 'utf8'),
);
const markdownFiles = await collectMarkdownFiles(docsRoot);
const linkPattern = /(?<!!)\[[^\]]+\]\(([^)]+)\)/g;

for (const sourceFile of markdownFiles) {
  const relativeSource = path
    .relative(docsRoot, sourceFile)
    .replaceAll(path.sep, '/');
  const source = removeFencedCode(await readFile(sourceFile, 'utf8'));

  for (const match of source.matchAll(linkPattern)) {
    let rawTarget = match[1].trim();
    if (rawTarget.startsWith('<') && rawTarget.endsWith('>')) {
      rawTarget = rawTarget.slice(1, -1);
    }

    if (/^(https?:|mailto:|tel:)/i.test(rawTarget)) {
      skippedExternalLinks += 1;
      continue;
    }

    checkedLinks += 1;
    const hashIndex = rawTarget.indexOf('#');
    const rawPath = hashIndex >= 0 ? rawTarget.slice(0, hashIndex) : rawTarget;
    const anchor = hashIndex >= 0 ? rawTarget.slice(hashIndex + 1) : '';
    const withoutQuery = rawPath.split('?')[0];

    let decodedPath;
    try {
      decodedPath = decodeURIComponent(withoutQuery);
    } catch {
      errors.push(relativeSource + ': invalid URL encoding in ' + rawTarget);
      continue;
    }

    let internalPath = decodedPath;
    if (internalPath.startsWith('/') && configuredBase) {
      if (
        internalPath !== configuredBase &&
        !internalPath.startsWith(configuredBase + '/')
      ) {
        errors.push(
          relativeSource +
            ': root-relative internal link must include configured base ' +
            configuredBase +
            ': ' +
            rawTarget,
        );
        continue;
      }

      internalPath = internalPath.slice(configuredBase.length) || '/';
    }

    const basePath =
      internalPath === ''
        ? sourceFile
        : internalPath.startsWith('/')
          ? path.join(docsRoot, internalPath.replace(/^\/+/, ''))
          : path.resolve(path.dirname(sourceFile), internalPath);

    const targetFile =
      internalPath === '' ? sourceFile : await resolveMarkdownTarget(basePath);

    if (!targetFile) {
      errors.push(relativeSource + ': unresolved internal link ' + rawTarget);
      continue;
    }

    if (anchor) {
      try {
        if (!(await hasAnchor(targetFile, anchor))) {
          errors.push(relativeSource + ': missing anchor in ' + rawTarget);
        }
      } catch {
        errors.push(relativeSource + ': invalid anchor encoding in ' + rawTarget);
      }
    }
  }
}

if (errors.length > 0) {
  console.error('Internal link check failed with ' + errors.length + ' issue(s):');
  for (const error of errors) {
    console.error('- ' + error);
  }
  process.exit(1);
}

console.log(
  'Internal link check passed: ' +
    checkedLinks +
    ' local link(s) checked across ' +
    markdownFiles.length +
    ' pages; ' +
    skippedExternalLinks +
    ' external link(s) skipped.',
);
