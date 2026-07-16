import { readFile, rename, rm, writeFile } from 'node:fs/promises';
import yaml from 'js-yaml';
import { ZodError } from 'zod';
import {
  assertHumanNotesPreserved,
  parsePaperDataset,
} from '../../src/data/paper-schema.mjs';

export async function loadPaperDataset(filePath) {
  let source;
  try {
    source = await readFile(filePath, 'utf8');
  } catch (error) {
    throw new Error('Unable to read paper dataset at ' + filePath, {
      cause: error,
    });
  }

  let value;
  try {
    value = yaml.load(source, {
      filename: filePath,
      schema: yaml.JSON_SCHEMA,
    });
  } catch (error) {
    throw new Error('Invalid YAML in paper dataset: ' + error.message, {
      cause: error,
    });
  }

  try {
    return parsePaperDataset(value);
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.issues
        .map((issue) => {
          const location =
            issue.path.length > 0 ? issue.path.join('.') : '<dataset>';
          return location + ': ' + issue.message;
        })
        .join('\n');
      throw new Error('Paper dataset schema validation failed:\n' + details, {
        cause: error,
      });
    }

    throw error;
  }
}

export async function writePaperDatasetSafely(filePath, proposedValue) {
  const previous = await loadPaperDataset(filePath);
  const proposed = assertHumanNotesPreserved(previous, proposedValue);
  const serialized = yaml.dump(proposed, {
    schema: yaml.JSON_SCHEMA,
    noRefs: true,
    lineWidth: 100,
  });
  const temporaryPath =
    filePath + '.' + process.pid + '.' + Date.now() + '.tmp';

  try {
    await writeFile(temporaryPath, serialized, 'utf8');
    await rename(temporaryPath, filePath);
  } catch (error) {
    await rm(temporaryPath, { force: true });
    throw new Error('Unable to write protected paper dataset at ' + filePath, {
      cause: error,
    });
  }

  return proposed;
}
