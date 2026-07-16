import yaml from 'js-yaml';
import openProblemDatasetSource from '../data/open-problems.yml?raw';
import paperDatasetSource from '../data/papers.yml?raw';
import {
  assertOpenProblemPaperReferences,
  parseOpenProblemDataset,
  relatedPaperIds,
} from '../data/open-problem-schema.mjs';
import { parsePaperDataset } from '../data/paper-schema.mjs';

let openProblemDataset;

export async function getOpenProblemDataset() {
  if (!openProblemDataset) {
    const papers = parsePaperDataset(
      yaml.load(paperDatasetSource, {
        filename: 'src/data/papers.yml',
        schema: yaml.JSON_SCHEMA,
      }),
    );
    const problems = parseOpenProblemDataset(
      yaml.load(openProblemDatasetSource, {
        filename: 'src/data/open-problems.yml',
        schema: yaml.JSON_SCHEMA,
      }),
    );
    openProblemDataset = assertOpenProblemPaperReferences(problems, papers);
  }
  return openProblemDataset;
}

export function sortOpenProblems(problems) {
  const statusOrder = new Map([
    ['open', 0],
    ['partially-resolved', 1],
    ['resolved', 2],
  ]);
  return [...problems].sort(
    (left, right) =>
      statusOrder.get(left.status) - statusOrder.get(right.status) ||
      left.title.localeCompare(right.title, 'en-US'),
  );
}

export function openProblemDetailRoute(problemId) {
  return 'open-problems/generated/' + problemId + '/';
}

export { relatedPaperIds };
