export const PAPER_STATUS_ORDER = ['published', 'accepted', 'preprint'];
export const RESEARCH_TRACK_LABELS = new Map([
  ['norm-duality', 'Norms, duality, and steepest descent'],
  ['preconditioning', 'Structured preconditioning'],
  ['manifold-constraints', 'Constraints, manifolds, and spectra'],
  ['benchmarking', 'Benchmarking and scaling'],
  ['systems', 'Systems and efficient optimization'],
]);

export function sortPapers(papers) {
  return [...papers].sort((left, right) => {
    const leftYear = typeof left.year === 'number' ? left.year : -Infinity;
    const rightYear = typeof right.year === 'number' ? right.year : -Infinity;
    return (
      rightYear - leftYear ||
      (left.id < right.id ? -1 : left.id > right.id ? 1 : 0)
    );
  });
}

export function createPaperView(papers, view) {
  const allPapers = sortPapers(papers);
  let groups;
  let uniqueCount = allPapers.length;
  let summary;

  if (view === 'all') {
    groups = [{ key: 'all', label: null, papers: allPapers }];
    summary = 'All validated paper records.';
  } else if (view === 'by-track') {
    groups = [...RESEARCH_TRACK_LABELS].map(([track, label]) => ({
      key: track,
      label,
      papers: allPapers.filter((paper) =>
        paper.research_tracks.includes(track),
      ),
    }));
    summary = 'Papers may appear in more than one research track.';
  } else if (view === 'by-status') {
    groups = PAPER_STATUS_ORDER.map((status) => ({
      key: status,
      label: status[0].toUpperCase() + status.slice(1),
      papers: allPapers.filter((paper) => paper.status === status),
    }));
    summary = 'Publication status is taken directly from the validated dataset.';
  } else if (view === 'by-year') {
    const years = [...new Set(allPapers.map((paper) => String(paper.year)))].sort(
      (left, right) => {
        const leftYear = /^\d+$/.test(left) ? Number(left) : -Infinity;
        const rightYear = /^\d+$/.test(right) ? Number(right) : -Infinity;
        return rightYear - leftYear;
      },
    );
    groups = years.map((year) => ({
      key: year,
      label: /^\d+$/.test(year) ? year : 'Unknown year',
      papers: allPapers.filter((paper) => String(paper.year) === year),
    }));
    summary = 'Years refer to the verified source version recorded for each paper.';
  } else if (view === 'unread') {
    const unread = allPapers.filter(
      (paper) => paper.reading_status === 'unread',
    );
    uniqueCount = unread.length;
    groups = [{ key: 'unread', label: null, papers: unread }];
    summary =
      'Only validated records whose reading status is unread are shown.';
  } else if (view === 'frontier') {
    const frontier = allPapers.filter(
      (paper) => paper.frontier_watch && paper.status === 'preprint',
    );
    uniqueCount = frontier.length;
    groups = [{ key: 'frontier', label: null, papers: frontier }];
    summary =
      'Only verified preprints explicitly marked for frontier monitoring are shown.';
  } else {
    throw new Error('Unknown paper collection view: ' + view);
  }

  return {
    groups: groups.filter((group) => group.papers.length > 0),
    uniqueCount,
    summary,
  };
}

export function hasVerifiedUrl(value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value);
}

function arxivWorkId(value) {
  if (!hasVerifiedUrl(value)) {
    return null;
  }

  try {
    const parsed = new URL(value);
    if (parsed.hostname !== 'arxiv.org') {
      return null;
    }
    const match = parsed.pathname.match(/^\/abs\/(.+?)(?:v\d+)?$/i);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

export function paperSourceLinks(paper) {
  const paperAvailable = hasVerifiedUrl(paper.paper_url);
  const arxivAvailable = hasVerifiedUrl(paper.arxiv_url);
  const paperArxivId = arxivWorkId(paper.paper_url);
  const arxivId = arxivWorkId(paper.arxiv_url);
  const links = [];

  if (arxivAvailable) {
    links.push({ href: paper.arxiv_url, label: 'Read on arXiv' });
  } else if (paperArxivId) {
    links.push({ href: paper.paper_url, label: 'Read on arXiv' });
  }

  const paperAlreadyShown =
    paperAvailable &&
    (paper.paper_url === paper.arxiv_url ||
      (paperArxivId !== null && paperArxivId === arxivId));

  if (paperAvailable && !paperAlreadyShown && !paperArxivId) {
    links.push({
      href: paper.paper_url,
      label: paper.status === 'preprint' ? 'Primary source' : 'Official version',
    });
  }

  return links;
}

export function withBase(baseUrl, route) {
  const base = baseUrl === '/' ? '' : baseUrl.replace(/\/$/, '');
  return base + '/' + route.replace(/^\/+/, '');
}

export function paperDetailRoute(paperId) {
  return 'paper-notes/generated/papers/' + paperId + '/';
}

export function reportedStateLabel(value) {
  if (value === true) {
    return 'Reported';
  }
  if (value === false) {
    return 'Not reported';
  }
  return 'TODO_UNVERIFIED';
}
