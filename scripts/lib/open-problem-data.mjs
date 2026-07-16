import { readFile, rename, rm, writeFile } from 'node:fs/promises';
import yaml from 'js-yaml';
import { ZodError } from 'zod';
import {
  assertOpenProblemHumanNotesPreserved,
  assertOpenProblemPaperReferences,
  parseOpenProblemDataset,
} from '../../src/data/open-problem-schema.mjs';
import { loadPaperDataset } from './paper-data.mjs';

async function loadYaml(filePath) {
  let source;
  try {
    source = await readFile(filePath, 'utf8');
  } catch (error) {
    throw new Error('Unable to read open-problem dataset at ' + filePath, {
      cause: error,
    });
  }

  return parseYaml(source, filePath);
}

function parseYaml(source, filePath) {
  try {
    return yaml.load(source, {
      filename: filePath,
      schema: yaml.JSON_SCHEMA,
    });
  } catch (error) {
    throw new Error('Invalid YAML in open-problem dataset: ' + error.message, {
      cause: error,
    });
  }
}

function parseDataset(value) {
  try {
    return parseOpenProblemDataset(value);
  } catch (error) {
    if (error instanceof ZodError) {
      throw formatSchemaError(error);
    }
    throw error;
  }
}

function formatSchemaError(error) {
  const details = error.issues
    .map((issue) => {
      const location = issue.path.length > 0 ? issue.path.join('.') : '<dataset>';
      return location + ': ' + issue.message;
    })
    .join('\n');
  return new Error('Open-problem dataset schema validation failed:\n' + details, {
    cause: error,
  });
}

export async function loadOpenProblemDataset(filePath, paperFilePath) {
  const value = await loadYaml(filePath);
  const problems = parseDataset(value);
  const papers = await loadPaperDataset(paperFilePath);
  return assertOpenProblemPaperReferences(problems, papers);
}

export class OpenProblemConcurrentWriteError extends Error {
  constructor(filePath) {
    super(
      'Open-problem dataset changed during protected write; refusing to overwrite ' +
        filePath,
    );
    this.name = 'OpenProblemConcurrentWriteError';
  }
}

export async function writeOpenProblemDatasetSafely(
  filePath,
  paperFilePath,
  proposedValue,
  { beforeReplace } = {},
) {
  const originalSource = await readFile(filePath, 'utf8');
  const previous = parseDataset(parseYaml(originalSource, filePath));
  const papers = await loadPaperDataset(paperFilePath);
  assertOpenProblemPaperReferences(previous, papers);
  const proposed = assertOpenProblemHumanNotesPreserved(
    previous,
    proposedValue,
  );
  assertOpenProblemPaperReferences(proposed, papers);

  const serialized = yaml.dump(proposed, {
    schema: yaml.JSON_SCHEMA,
    noRefs: true,
    lineWidth: 100,
  });
  const temporaryPath =
    filePath + '.' + process.pid + '.' + Date.now() + '.tmp';

  try {
    await writeFile(temporaryPath, serialized, 'utf8');
    if (beforeReplace) await beforeReplace();
    const currentSource = await readFile(filePath, 'utf8');
    if (currentSource !== originalSource) {
      throw new OpenProblemConcurrentWriteError(filePath);
    }
    await rename(temporaryPath, filePath);
  } catch (error) {
    await rm(temporaryPath, { force: true });
    if (error instanceof OpenProblemConcurrentWriteError) throw error;
    throw new Error(
      'Unable to write protected open-problem dataset at ' + filePath,
      { cause: error },
    );
  }
  return proposed;
}
