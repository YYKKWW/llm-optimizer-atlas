import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DEFAULT_OPEN_PROBLEM_FILTER_STATE,
  matchesOpenProblemFilter,
  normalizeProblemSearchText,
  parseOpenProblemFilterState,
  serializeOpenProblemFilterState,
  sortOpenProblemFilterRecords,
} from '../src/lib/open-problem-filter.mjs';

const records = [
  {
    title: 'Matrix Sign Accuracy',
    searchText: 'Matrix-sign accuracy, polar decomposition, finite precision',
    tracks: ['preconditioning'],
    type: 'mixed',
    lastVerified: '2026-07-17',
    sourceCount: 3,
    originalOrder: 0,
  },
  {
    title: 'Fair Optimizer Benchmarking',
    searchText: 'Benchmark protocol across batch size and hardware',
    tracks: ['benchmarking', 'systems'],
    type: 'benchmarking',
    lastVerified: '2026-07-16',
    sourceCount: 4,
    originalOrder: 1,
  },
  {
    title: 'Spectral Sphere Multiplicity',
    searchText: 'Spectral sphere repeated singular values',
    tracks: ['manifold-constraints'],
    type: 'theoretical',
    lastVerified: '2026-07-17',
    sourceCount: 2,
    originalOrder: 2,
  },
];

test('problem search normalization handles punctuation, case, and accents', () => {
  assert.equal(
    normalizeProblemSearchText('  MÁTRIX–Sign / Accuracy  '),
    'matrix sign accuracy',
  );
  assert.equal(
    normalizeProblemSearchText('  λ / ∞ / 范数  '),
    'λ ∞ 范数',
  );
  assert.equal(
    matchesOpenProblemFilter(records[0], {
      query: '范数',
      track: '',
      type: '',
    }),
    false,
  );
});

test('problem filters use AND semantics across query, track, and type', () => {
  assert.equal(
    matchesOpenProblemFilter(records[0], {
      query: 'matrix accuracy',
      track: 'preconditioning',
      type: 'mixed',
    }),
    true,
  );
  assert.equal(
    matchesOpenProblemFilter(records[0], {
      query: 'matrix accuracy',
      track: 'systems',
      type: 'mixed',
    }),
    false,
  );
});

test('problem filter URL state round-trips and rejects unknown sorts', () => {
  const state = {
    query: 'matrix sign',
    track: 'preconditioning',
    type: 'mixed',
    sort: 'sources',
  };
  assert.deepEqual(
    parseOpenProblemFilterState(serializeOpenProblemFilterState(state)),
    state,
  );
  assert.deepEqual(
    parseOpenProblemFilterState('?sort=unsafe'),
    DEFAULT_OPEN_PROBLEM_FILTER_STATE,
  );
});

test('problem sorting is stable for title, date, source count, and default', () => {
  assert.deepEqual(
    sortOpenProblemFilterRecords(records, 'title').map((record) => record.title),
    [
      'Fair Optimizer Benchmarking',
      'Matrix Sign Accuracy',
      'Spectral Sphere Multiplicity',
    ],
  );
  assert.deepEqual(
    sortOpenProblemFilterRecords(records, 'sources').map(
      (record) => record.sourceCount,
    ),
    [4, 3, 2],
  );
  assert.deepEqual(
    sortOpenProblemFilterRecords(records, 'verified').map(
      (record) => record.originalOrder,
    ),
    [0, 2, 1],
  );
  assert.deepEqual(
    sortOpenProblemFilterRecords(records, 'default').map(
      (record) => record.originalOrder,
    ),
    [0, 1, 2],
  );
});
