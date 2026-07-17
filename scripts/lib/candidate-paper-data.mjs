import fs from 'node:fs/promises';
import yaml from 'js-yaml';
import { joinCandidateReviewDecisions } from '../../src/data/candidate-paper-schema.mjs';
import { loadPaperDataset } from './paper-data.mjs';

async function loadYaml(filePath) {
  return yaml.load(await fs.readFile(filePath, 'utf8'), {
    filename: filePath,
    schema: yaml.JSON_SCHEMA,
  });
}

export async function loadCandidatePaperDataset(
  candidatePath,
  decisionPath,
  paperPath,
) {
  const [candidateValue, decisionValue, papers] = await Promise.all([
    loadYaml(candidatePath),
    loadYaml(decisionPath),
    loadPaperDataset(paperPath),
  ]);
  return joinCandidateReviewDecisions(
    candidateValue,
    decisionValue,
    papers.map((paper) => paper.id),
  );
}
