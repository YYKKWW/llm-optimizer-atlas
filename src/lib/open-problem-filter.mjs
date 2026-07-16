export const OPEN_PROBLEM_SORTS = [
  'default',
  'title',
  'verified',
  'sources',
];

export const DEFAULT_OPEN_PROBLEM_FILTER_STATE = Object.freeze({
  query: '',
  track: '',
  type: '',
  sort: 'default',
});

export function normalizeProblemSearchText(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('en-US')
    .replace(/[^\p{L}\p{N}\p{Sm}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export function parseOpenProblemFilterState(searchParams) {
  const params =
    searchParams instanceof URLSearchParams
      ? searchParams
      : new URLSearchParams(searchParams);
  const requestedSort = params.get('sort') ?? 'default';
  return {
    query: (params.get('q') ?? '').trim(),
    track: (params.get('track') ?? '').trim(),
    type: (params.get('type') ?? '').trim(),
    sort: OPEN_PROBLEM_SORTS.includes(requestedSort)
      ? requestedSort
      : 'default',
  };
}

export function serializeOpenProblemFilterState(state) {
  const params = new URLSearchParams();
  if (state.query.trim()) params.set('q', state.query.trim());
  if (state.track) params.set('track', state.track);
  if (state.type) params.set('type', state.type);
  if (state.sort && state.sort !== 'default') params.set('sort', state.sort);
  return params;
}

export function matchesOpenProblemFilter(record, state) {
  const query = normalizeProblemSearchText(state.query);
  const searchableText = normalizeProblemSearchText(record.searchText);
  const queryTerms = query ? query.split(' ') : [];
  return (
    queryTerms.every((term) => searchableText.includes(term)) &&
    (!state.track || record.tracks.includes(state.track)) &&
    (!state.type || record.type === state.type)
  );
}

export function sortOpenProblemFilterRecords(records, sort = 'default') {
  const safeSort = OPEN_PROBLEM_SORTS.includes(sort) ? sort : 'default';
  return [...records].sort((left, right) => {
    let compared = 0;
    if (safeSort === 'title') {
      compared = left.title.localeCompare(right.title, 'en-US');
    } else if (safeSort === 'verified') {
      compared = right.lastVerified.localeCompare(left.lastVerified, 'en-US');
    } else if (safeSort === 'sources') {
      compared = right.sourceCount - left.sourceCount;
    }
    return compared || left.originalOrder - right.originalOrder;
  });
}
