export const CANDIDATE_DECISION_FILTERS = [
  'active',
  'all',
  'pending',
  'include',
  'watch',
  'exclude',
];

export const CANDIDATE_PAPER_SORTS = [
  'priority',
  'reviewed',
  'title',
  'venue',
];

export const DEFAULT_CANDIDATE_PAPER_FILTER_STATE = Object.freeze({
  query: '',
  decision: 'active',
  venue: '',
  track: '',
  sort: 'priority',
});

const READING_PRIORITY_ORDER = new Map([
  ['full-read', 0],
  ['screen', 1],
  ['archive', 2],
]);

const CANDIDATE_VENUE_LABELS = new Map([
  ['mathematical-programming', 'Mathematical Programming'],
  ['siam-journal-on-optimization', 'SIAM Journal on Optimization'],
  ['iclr', 'ICLR'],
  ['icml', 'ICML'],
  ['neurips', 'NeurIPS'],
]);

export function candidateVenueLabel(value) {
  return CANDIDATE_VENUE_LABELS.get(value) ?? String(value ?? '');
}

export function normalizeCandidateSearchText(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('en-US')
    .replace(/[^\p{L}\p{N}\p{Sm}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export function parseCandidatePaperFilterState(searchParams) {
  const params =
    searchParams instanceof URLSearchParams
      ? searchParams
      : new URLSearchParams(searchParams);
  const requestedDecision = params.get('decision') ?? 'active';
  const requestedSort = params.get('sort') ?? 'priority';

  return {
    query: (params.get('q') ?? '').trim(),
    decision: CANDIDATE_DECISION_FILTERS.includes(requestedDecision)
      ? requestedDecision
      : 'active',
    venue: (params.get('venue') ?? '').trim(),
    track: (params.get('track') ?? '').trim(),
    sort: CANDIDATE_PAPER_SORTS.includes(requestedSort)
      ? requestedSort
      : 'priority',
  };
}

export function serializeCandidatePaperFilterState(state) {
  const params = new URLSearchParams();
  if (state.query.trim()) params.set('q', state.query.trim());
  if (state.decision && state.decision !== 'active') {
    params.set('decision', state.decision);
  }
  if (state.venue) params.set('venue', state.venue);
  if (state.track) params.set('track', state.track);
  if (state.sort && state.sort !== 'priority') params.set('sort', state.sort);
  return params;
}

function matchesDecision(recordDecision, requestedDecision) {
  if (requestedDecision === 'all') return true;
  if (requestedDecision === 'active') return recordDecision !== 'exclude';
  return recordDecision === requestedDecision;
}

export function matchesCandidatePaperFilter(record, state) {
  const query = normalizeCandidateSearchText(state.query);
  const searchableText = normalizeCandidateSearchText(record.searchText);
  const queryTerms = query ? query.split(' ') : [];

  return (
    queryTerms.every((term) => searchableText.includes(term)) &&
    matchesDecision(record.decision, state.decision) &&
    (!state.venue || record.venue === state.venue) &&
    (!state.track || record.tracks.includes(state.track))
  );
}

export function sortCandidatePaperFilterRecords(records, sort = 'priority') {
  const safeSort = CANDIDATE_PAPER_SORTS.includes(sort) ? sort : 'priority';

  return [...records].sort((left, right) => {
    let compared = 0;
    if (safeSort === 'priority') {
      compared =
        (READING_PRIORITY_ORDER.get(left.readingPriority) ?? 99) -
        (READING_PRIORITY_ORDER.get(right.readingPriority) ?? 99);
    } else if (safeSort === 'reviewed') {
      compared = right.lastReviewed.localeCompare(left.lastReviewed, 'en-US');
    } else if (safeSort === 'title') {
      compared = left.title.localeCompare(right.title, 'en-US');
    } else if (safeSort === 'venue') {
      compared =
        left.venue.localeCompare(right.venue, 'en-US') ||
        left.title.localeCompare(right.title, 'en-US');
    }
    return compared || left.originalOrder - right.originalOrder;
  });
}
