import yaml from 'js-yaml';
import candidateSource from '../../research/candidate-papers.yml?raw';
import decisionSource from '../../research/review-decisions.yml?raw';
import { joinCandidateReviewDecisions } from '../data/candidate-paper-schema.mjs';
import { getPaperDataset } from './papers.mjs';

let candidateDataset;

export async function getCandidatePaperDataset() {
  if (!candidateDataset) {
    const papers = await getPaperDataset();
    candidateDataset = joinCandidateReviewDecisions(
      yaml.load(candidateSource, {
        filename: 'research/candidate-papers.yml',
        schema: yaml.JSON_SCHEMA,
      }),
      yaml.load(decisionSource, {
        filename: 'research/review-decisions.yml',
        schema: yaml.JSON_SCHEMA,
      }),
      papers.map((paper) => paper.id),
    );
  }
  return candidateDataset.candidates;
}

export async function getCandidateSearchWindow() {
  await getCandidatePaperDataset();
  return candidateDataset.search_window;
}
