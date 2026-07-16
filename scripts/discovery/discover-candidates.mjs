import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadOpenProblemDataset } from '../lib/open-problem-data.mjs';
import { loadPaperDataset } from '../lib/paper-data.mjs';
import { discoverSource } from './adapters.mjs';
import { parseDiscoveryArtifact } from './candidate-schema.mjs';
import { loadDiscoveryConfig } from './config.mjs';
import { finalizeCandidates, toArtifactCandidate } from './dedupe.mjs';
import { matchRelevance } from './relevance.mjs';
import { writeDiscoveryBundle } from './writer.mjs';

const projectRoot = path.resolve(
  fileURLToPath(new URL('../..', import.meta.url)),
);

function parseArgs(args) {
  const options = {
    outputDirectory: path.join(projectRoot, '.artifacts', 'discovery'),
    days: 180,
  };
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--output-dir' && args[index + 1]) {
      options.outputDirectory = path.resolve(args[++index]);
    } else if (args[index] === '--days' && /^\d+$/.test(args[index + 1] ?? '')) {
      options.days = Number(args[++index]);
    } else {
      throw new Error(
        'Usage: node scripts/discovery/discover-candidates.mjs [--output-dir PATH] [--days N]',
      );
    }
  }
  if (options.days < 1 || options.days > 730) {
    throw new Error('--days must be between 1 and 730');
  }
  return options;
}

function sha256(source) {
  return createHash('sha256').update(source).digest('hex');
}

async function formalTreeHash(directories) {
  const hash = createHash('sha256');
  async function visit(directory, prefix) {
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name, 'en-US'));
    for (const entry of entries) {
      const target = path.join(directory, entry.name);
      const relative = prefix + '/' + entry.name;
      if (entry.isSymbolicLink()) {
        throw new Error('Formal content tree may not contain symlinks: ' + relative);
      }
      if (entry.isDirectory()) {
        await visit(target, relative);
      } else if (entry.isFile()) {
        hash.update(relative + '\0');
        hash.update(await readFile(target));
        hash.update('\0');
      }
    }
  }
  for (const directory of directories) {
    await visit(directory.path, directory.label);
  }
  return hash.digest('hex');
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

const options = parseArgs(process.argv.slice(2));
const generatedAt = new Date().toISOString();
const windowEndDate = new Date(generatedAt);
const windowStartDate = new Date(windowEndDate);
windowStartDate.setUTCDate(windowStartDate.getUTCDate() - options.days);
const windowStart = isoDate(windowStartDate);
const windowEnd = isoDate(windowEndDate);
const currentYear = windowEndDate.getUTCFullYear();

const paperPath = path.join(projectRoot, 'src', 'data', 'papers.yml');
const problemPath = path.join(projectRoot, 'src', 'data', 'open-problems.yml');
const formalDirectories = [
  { path: path.join(projectRoot, 'src', 'data'), label: 'src/data' },
  { path: path.join(projectRoot, 'src', 'content'), label: 'src/content' },
];
const formalBefore = {
  papers: sha256(await readFile(paperPath, 'utf8')),
  open_problems: sha256(await readFile(problemPath, 'utf8')),
  tree: await formalTreeHash(formalDirectories),
};
const papers = await loadPaperDataset(paperPath);
const openProblems = await loadOpenProblemDataset(problemPath, paperPath);
const { sources, profiles } = await loadDiscoveryConfig(
  path.join(projectRoot, 'config', 'discovery-sources.yml'),
  path.join(projectRoot, 'config', 'discovery-topics.yml'),
);

const diagnostics = {
  generated_at: generatedAt,
  states: [],
};
const relevantRecords = [];
let failed = false;

for (const source of sources) {
  const started = Date.now();
  try {
    const records = await discoverSource(source, {
      windowStart,
      currentYear,
      retrievedAt: generatedAt,
    });
    let relevant = 0;
    for (const record of records) {
      const relevance = matchRelevance(record, profiles);
      if (relevance.profiles.length === 0) continue;
      relevant += 1;
      relevantRecords.push({
        ...record,
        relevance: {
          profiles: relevance.profiles,
          matchedTerms: relevance.matchedTerms,
          matchedFields: relevance.matchedFields,
        },
      });
    }
    diagnostics.states.push({
      source: source.id,
      state: records.length === 0 ? 'empty' : 'ok',
      fetched: records.length,
      relevant,
      elapsed_ms: Date.now() - started,
    });
  } catch (error) {
    failed = true;
    diagnostics.states.push({
      source: source.id,
      state: 'failed',
      fetched: 0,
      relevant: 0,
      elapsed_ms: Date.now() - started,
      error: error.message,
    });
  }
}

const candidates = finalizeCandidates(
  relevantRecords,
  papers,
  openProblems,
).map(toArtifactCandidate);
const artifact = parseDiscoveryArtifact({
  schema_version: 1,
  generated_at: generatedAt,
  window_start: windowStart,
  window_end: windowEnd,
  window_note:
    'The date window applies to Crossref journals; conference adapters scan current and previous proceedings editions.',
  review_warning: 'UNVERIFIED CANDIDATES ONLY — DO NOT PUBLISH AS VERIFIED',
  candidates,
});

const formalAfter = {
  papers: sha256(await readFile(paperPath, 'utf8')),
  open_problems: sha256(await readFile(problemPath, 'utf8')),
  tree: await formalTreeHash(formalDirectories),
};
if (
  formalBefore.papers !== formalAfter.papers ||
  formalBefore.open_problems !== formalAfter.open_problems ||
  formalBefore.tree !== formalAfter.tree
) {
  throw new Error('Discovery safety failure: a formal dataset changed during the run');
}

const manifest = {
  generated_at: generatedAt,
  artifact: 'candidate-literature.json',
  diagnostics: 'diagnostics.json',
  review_queue: 'review-queue.md',
  candidate_count: candidates.length,
  formal_dataset_hashes: formalAfter,
  promotion_allowed: false,
};
const output = await writeDiscoveryBundle(projectRoot, options.outputDirectory, {
  artifact,
  diagnostics,
  manifest,
});
console.log(
  'Candidate discovery wrote ' +
    candidates.length +
    ' unverified candidate(s) to ' +
    output,
);
console.log('No verified dataset or site content was modified.');
if (failed) {
  console.error('One or more discovery sources failed; partial artifacts were preserved.');
  process.exitCode = 1;
}
