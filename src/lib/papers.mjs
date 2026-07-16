import yaml from 'js-yaml';
import paperDatasetSource from '../data/papers.yml?raw';
import { parsePaperDataset } from '../data/paper-schema.mjs';

export * from './paper-views.mjs';

let paperDataset;

export async function getPaperDataset() {
  paperDataset ??= parsePaperDataset(
    yaml.load(paperDatasetSource, {
      filename: 'src/data/papers.yml',
      schema: yaml.JSON_SCHEMA,
    }),
  );
  return paperDataset;
}
