import assert from 'node:assert/strict';
import test from 'node:test';
import {
  joinCandidateReviewDecisions,
  parseCandidatePaperDataset,
  parseCandidateReviewDecisions,
} from '../src/data/candidate-paper-schema.mjs';

const candidate = {
  candidate_id: 'candidate-0123456789abcdef',
  title: 'A candidate paper',
  authors: ['Ada Lovelace'],
  venue: 'icml',
  year: 2025,
  published_date: null,
  publication_status: 'published',
  doi: null,
  official_url: 'https://proceedings.mlr.press/v267/example.html',
  arxiv_url: '',
  source_version: 'ICML 2025 proceedings version',
  research_tracks: ['manifold-constraints'],
  tags: ['low-rank'],
  recommendation: 'include',
  reading_priority: 'full-read',
  review_level: 'abstract',
  review_summary: 'Directly relevant and requires a full-paper evidence review.',
  unresolved_metadata: ['Exact publication day'],
  possible_conflicts: [],
  canonical_duplicate_of: null,
  discovery_method: 'manual-recall',
  last_reviewed: '2026-07-17',
};

const candidateDataset = {
  schema_version: 1,
  search_window: {
    start: '2025-01-01',
    end: '2026-07-17',
    reviewed_on: '2026-07-17',
  },
  candidates: [candidate],
};

const decisionDataset = {
  schema_version: 1,
  decision_scope:
    'Screening decisions only; include means approved for full reading and canonical-ingestion review, not promoted as verified evidence.',
  decisions: [
    {
      candidate_id: candidate.candidate_id,
      decision: 'include',
      decided_on: '2026-07-17',
      reviewer: 'project-owner-delegated review',
      review_level: 'abstract',
      rationale: 'Approved for full reading; canonical promotion remains separate.',
      canonical_promotion: false,
    },
  ],
};

test('parses a reviewed candidate dataset and joins explicit decisions', () => {
  assert.equal(parseCandidatePaperDataset(candidateDataset).candidates.length, 1);
  assert.equal(parseCandidateReviewDecisions(decisionDataset).decisions.length, 1);
  const joined = joinCandidateReviewDecisions(
    candidateDataset,
    decisionDataset,
    [],
  );
  assert.equal(joined.candidates[0].decision, 'include');
  assert.match(joined.candidates[0].decision_rationale, /full reading/i);
});

test('derives pending without inventing a human decision', () => {
  const joined = joinCandidateReviewDecisions(
    candidateDataset,
    { ...decisionDataset, decisions: [] },
    [],
  );
  assert.equal(joined.candidates[0].decision, 'pending');
  assert.equal(joined.candidates[0].decision_rationale, '');
});

test('rejects unsafe URLs, duplicate IDs, and inconsistent priority', () => {
  assert.throws(() =>
    parseCandidatePaperDataset({
      ...candidateDataset,
      candidates: [
        {
          ...candidate,
          official_url: 'http://example.com/paper',
          reading_priority: 'screen',
        },
        candidate,
      ],
    }),
  );
  assert.throws(() =>
    parseCandidatePaperDataset({
      ...candidateDataset,
      candidates: [
        {
          ...candidate,
          arxiv_url: 'https://example.com/not-arxiv',
        },
      ],
    }),
  );
});

test('rejects dangling decisions and unknown canonical duplicates', () => {
  assert.throws(
    () =>
      joinCandidateReviewDecisions(
        candidateDataset,
        {
          ...decisionDataset,
          decisions: [
            {
              ...decisionDataset.decisions[0],
              candidate_id: 'candidate-fedcba9876543210',
            },
          ],
        },
        [],
      ),
    /unknown candidate/i,
  );

  assert.throws(
    () =>
      joinCandidateReviewDecisions(
        {
          ...candidateDataset,
          candidates: [
            { ...candidate, canonical_duplicate_of: 'missing-paper' },
          ],
        },
        { ...decisionDataset, decisions: [] },
        [],
      ),
    /unknown canonical paper/i,
  );
});

test('accepts a canonical duplicate only when its foreign key resolves', () => {
  const joined = joinCandidateReviewDecisions(
    {
      ...candidateDataset,
      candidates: [{ ...candidate, canonical_duplicate_of: 'known-paper' }],
    },
    decisionDataset,
    ['known-paper'],
  );
  assert.equal(joined.candidates[0].canonical_duplicate_of, 'known-paper');
});
