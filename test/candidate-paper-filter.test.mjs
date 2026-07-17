import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DEFAULT_CANDIDATE_PAPER_FILTER_STATE,
  matchesCandidatePaperFilter,
  normalizeCandidateSearchText,
  parseCandidatePaperFilterState,
  serializeCandidatePaperFilterState,
  sortCandidatePaperFilterRecords,
} from '../src/lib/candidate-paper-filter.mjs';

const records = [
  {
    title: 'Low-rank Riemannian Pretraining',
    searchText: 'Low-rank Riemannian pretraining \u8303\u6570 geometry ICLR',
    venue: 'iclr',
    tracks: ['manifold-constraints', 'systems'],
    decision: 'include',
    readingPriority: 'full-read',
    lastReviewed: '2026-07-17',
    originalOrder: 1,
  },
  {
    title: 'Communication-Efficient Optimization',
    searchText: 'Distributed communication optimization ICML',
    venue: 'icml',
    tracks: ['systems'],
    decision: 'watch',
    readingPriority: 'screen',
    lastReviewed: '2026-07-16',
    originalOrder: 0,
  },
  {
    title: 'Unrelated Prompt Tuning',
    searchText: 'Prompt tuning vision language',
    venue: 'iclr',
    tracks: ['benchmarking'],
    decision: 'exclude',
    readingPriority: 'archive',
    lastReviewed: '2026-07-17',
    originalOrder: 2,
  },
];

test('candidate search normalization preserves Unicode and handles punctuation', () => {
  assert.equal(
    normalizeCandidateSearchText('  R\u00cdEMANNIAN / \u8303\u6570 + Geometry  '),
    'riemannian \u8303\u6570 + geometry',
  );
  assert.equal(
    matchesCandidatePaperFilter(records[0], {
      ...DEFAULT_CANDIDATE_PAPER_FILTER_STATE,
      query: '\u8303\u6570 geometry',
    }),
    true,
  );
});

test('active candidates omit exclusions and filters use AND semantics', () => {
  assert.equal(
    matchesCandidatePaperFilter(records[2], DEFAULT_CANDIDATE_PAPER_FILTER_STATE),
    false,
  );
  assert.equal(
    matchesCandidatePaperFilter(records[0], {
      query: 'low rank',
      decision: 'include',
      venue: 'iclr',
      track: 'manifold-constraints',
      sort: 'priority',
    }),
    true,
  );
  assert.equal(
    matchesCandidatePaperFilter(records[0], {
      query: 'low rank',
      decision: 'include',
      venue: 'icml',
      track: 'manifold-constraints',
      sort: 'priority',
    }),
    false,
  );
  assert.equal(
    matchesCandidatePaperFilter(records[2], {
      ...DEFAULT_CANDIDATE_PAPER_FILTER_STATE,
      decision: 'all',
    }),
    true,
  );
});

test('candidate filter URL state round-trips and rejects unknown values', () => {
  const state = {
    query: 'matrix sign',
    decision: 'watch',
    venue: 'icml',
    track: 'preconditioning',
    sort: 'reviewed',
  };
  assert.deepEqual(
    parseCandidatePaperFilterState(serializeCandidatePaperFilterState(state)),
    state,
  );
  assert.deepEqual(
    parseCandidatePaperFilterState('?decision=unsafe&sort=unsafe'),
    DEFAULT_CANDIDATE_PAPER_FILTER_STATE,
  );
});

test('candidate sorting is stable for priority, review date, title, and venue', () => {
  assert.deepEqual(
    sortCandidatePaperFilterRecords(records, 'priority').map(
      (record) => record.readingPriority,
    ),
    ['full-read', 'screen', 'archive'],
  );
  assert.deepEqual(
    sortCandidatePaperFilterRecords(records, 'reviewed').map(
      (record) => record.originalOrder,
    ),
    [1, 2, 0],
  );
  assert.deepEqual(
    sortCandidatePaperFilterRecords(records, 'title').map((record) => record.title),
    [
      'Communication-Efficient Optimization',
      'Low-rank Riemannian Pretraining',
      'Unrelated Prompt Tuning',
    ],
  );
  assert.deepEqual(
    sortCandidatePaperFilterRecords(records, 'venue').map((record) => record.title),
    [
      'Low-rank Riemannian Pretraining',
      'Unrelated Prompt Tuning',
      'Communication-Efficient Optimization',
    ],
  );
});
