import assert from 'node:assert/strict';
import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  GENERATED_PAGE_MARKER,
  createGeneratedPaperPages,
  synchronizeGeneratedPaperPages,
} from '../scripts/lib/paper-page-generation.mjs';
import { loadPaperDataset } from '../scripts/lib/paper-data.mjs';
import { DISAGREEMENT_TOPICS } from '../src/lib/disagreement-topics.mjs';
import { TODO_UNVERIFIED } from '../src/data/paper-schema.mjs';
import {
  createPaperView,
  paperSourceLinks,
  reportedStateLabel,
} from '../src/lib/paper-views.mjs';

const projectRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const datasetPath = path.join(projectRoot, 'src', 'data', 'papers.yml');
const papers = await loadPaperDataset(datasetPath);

function idsInView(view) {
  return view.groups.flatMap((group) => group.papers.map((paper) => paper.id));
}

function occurrenceMap(ids) {
  const counts = new Map();
  for (const id of ids) {
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return counts;
}

test('generated page plan contains four views and one detail route per paper', () => {
  const pages = createGeneratedPaperPages(papers);
  assert.equal(pages.size, papers.length + 4);

  for (const route of [
    path.join('all', 'index.mdx'),
    path.join('by-research-track', 'index.mdx'),
    path.join('by-publication-status', 'index.mdx'),
    path.join('by-year', 'index.mdx'),
  ]) {
    assert.equal(pages.has(route), true, 'missing generated view: ' + route);
    assert.match(pages.get(route), /PaperCollection/);
  }

  for (const paper of papers) {
    const route = path.join('papers', paper.id, 'index.mdx');
    assert.equal(pages.has(route), true, 'missing paper route: ' + route);
    assert.match(pages.get(route), new RegExp(`paperId="${paper.id}"`));
  }

  const colonTitle = papers.find((paper) => paper.title.includes(':'));
  const colonPage = pages.get(
    path.join('papers', colonTitle.id, 'index.mdx'),
  );
  assert.ok(
    colonPage.includes('title: ' + JSON.stringify(colonTitle.title)),
    'generated frontmatter must quote titles containing punctuation',
  );
});

test('paper views classify every record from explicit dataset fields', () => {
  const allIds = papers.map((paper) => paper.id).sort();

  for (const viewName of ['all', 'by-status', 'by-year']) {
    const ids = idsInView(createPaperView(papers, viewName));
    assert.deepEqual([...ids].sort(), allIds, viewName + ' membership');
    assert.equal(new Set(ids).size, papers.length, viewName + ' duplicates');
  }

  const trackOccurrences = occurrenceMap(
    idsInView(createPaperView(papers, 'by-track')),
  );
  for (const paper of papers) {
    assert.equal(
      trackOccurrences.get(paper.id),
      paper.research_tracks.length,
      paper.id + ' track membership',
    );
  }

  assert.deepEqual(
    idsInView(createPaperView(papers, 'unread')).sort(),
    papers
      .filter((paper) => paper.reading_status === 'unread')
      .map((paper) => paper.id)
      .sort(),
  );
  assert.deepEqual(
    idsInView(createPaperView(papers, 'frontier')).sort(),
    papers
      .filter((paper) => paper.frontier_watch && paper.status === 'preprint')
      .map((paper) => paper.id)
      .sort(),
  );
});

test('reporting states remain distinct and disagreement IDs resolve', () => {
  assert.equal(reportedStateLabel(true), 'Reported');
  assert.equal(reportedStateLabel(false), 'Not reported');
  assert.equal(reportedStateLabel('TODO_UNVERIFIED'), 'TODO_UNVERIFIED');

  assert.equal(DISAGREEMENT_TOPICS.length, 5);
  const knownIds = new Set(papers.map((paper) => paper.id));
  for (const topic of DISAGREEMENT_TOPICS) {
    assert.ok(topic.paperIds.length >= 2);
    for (const paperId of topic.paperIds) {
      assert.equal(
        knownIds.has(paperId),
        true,
        `${topic.id} references unknown paper ${paperId}`,
      );
    }
  }
});

test('reader links prefer arXiv while preserving distinct official sources', () => {
  const published = {
    status: 'published',
    arxiv_url: 'https://arxiv.org/abs/2401.00001',
    paper_url: 'https://example.invalid/proceedings/paper',
  };
  assert.deepEqual(paperSourceLinks(published), [
    {
      href: 'https://arxiv.org/abs/2401.00001',
      label: 'Read on arXiv',
    },
    {
      href: 'https://example.invalid/proceedings/paper',
      label: 'Official version',
    },
  ]);

  assert.deepEqual(
    paperSourceLinks({
      ...published,
      arxiv_url: 'https://arxiv.org/abs/2401.00001v2',
      paper_url: 'https://arxiv.org/abs/2401.00001',
    }),
    [
      {
        href: 'https://arxiv.org/abs/2401.00001v2',
        label: 'Read on arXiv',
      },
    ],
  );

  assert.deepEqual(
    paperSourceLinks({
      status: 'published',
      arxiv_url: TODO_UNVERIFIED,
      paper_url: 'https://arxiv.org/abs/2401.00001',
    }),
    [
      {
        href: 'https://arxiv.org/abs/2401.00001',
        label: 'Read on arXiv',
      },
    ],
  );

  assert.deepEqual(
    paperSourceLinks({
      status: 'preprint',
      arxiv_url: 'https://arxiv.org/abs/2401.00001',
      paper_url: 'https://openreview.net/forum?id=fixture',
    }),
    [
      {
        href: 'https://arxiv.org/abs/2401.00001',
        label: 'Read on arXiv',
      },
      {
        href: 'https://openreview.net/forum?id=fixture',
        label: 'Primary source',
      },
    ],
  );

  assert.deepEqual(
    paperSourceLinks({
      status: 'published',
      arxiv_url: TODO_UNVERIFIED,
      paper_url: 'https://example.invalid/proceedings/paper',
    }),
    [
      {
        href: 'https://example.invalid/proceedings/paper',
        label: 'Official version',
      },
    ],
  );

  assert.deepEqual(
    paperSourceLinks({
      status: 'preprint',
      arxiv_url: TODO_UNVERIFIED,
      paper_url: TODO_UNVERIFIED,
    }),
    [],
  );
});

test('generated page synchronization detects drift and protects unowned files', async () => {
  const temporaryDirectory = await mkdtemp(
    path.join(os.tmpdir(), 'llm-optimizer-pages-'),
  );
  const pages = createGeneratedPaperPages(papers.slice(0, 2));

  try {
    const initial = await synchronizeGeneratedPaperPages(
      temporaryDirectory,
      pages,
    );
    assert.equal(initial.ok, true);
    assert.equal(initial.written, 6);

    const cleanCheck = await synchronizeGeneratedPaperPages(
      temporaryDirectory,
      pages,
      { check: true },
    );
    assert.equal(cleanCheck.ok, true);

    const allPage = path.join(temporaryDirectory, 'all', 'index.mdx');
    const expectedAllPage = pages.get(path.join('all', 'index.mdx'));
    const crlfAllPage = expectedAllPage.replace(/\n/g, '\r\n');
    await writeFile(allPage, crlfAllPage, 'utf8');
    const crlfCheck = await synchronizeGeneratedPaperPages(
      temporaryDirectory,
      pages,
      { check: true },
    );
    assert.equal(crlfCheck.ok, true);
    const crlfNoop = await synchronizeGeneratedPaperPages(
      temporaryDirectory,
      pages,
    );
    assert.equal(crlfNoop.ok, true);
    assert.equal(crlfNoop.written, 0);
    assert.equal(await readFile(allPage, 'utf8'), crlfAllPage);

    await writeFile(allPage, crlfAllPage + '\r\n', 'utf8');
    const driftCheck = await synchronizeGeneratedPaperPages(
      temporaryDirectory,
      pages,
      { check: true },
    );
    assert.equal(driftCheck.ok, false);
    assert.match(driftCheck.issues.join('\n'), /out of date/);

    const repaired = await synchronizeGeneratedPaperPages(
      temporaryDirectory,
      pages,
    );
    assert.equal(repaired.ok, true);
    assert.equal(repaired.written, 1);
    assert.equal(await readFile(allPage, 'utf8'), expectedAllPage);

    const stalePage = path.join(temporaryDirectory, 'stale', 'index.mdx');
    await mkdir(path.dirname(stalePage), { recursive: true });
    await writeFile(
      stalePage,
      `---\ntitle: Stale\ndescription: Stale\n---\n\n${GENERATED_PAGE_MARKER}\n`,
      'utf8',
    );
    const removed = await synchronizeGeneratedPaperPages(
      temporaryDirectory,
      pages,
    );
    assert.equal(removed.ok, true);
    assert.equal(removed.removed, 1);

    const notesFile = path.join(temporaryDirectory, 'manual-notes.md');
    await writeFile(notesFile, 'manual content', 'utf8');
    const protectedResult = await synchronizeGeneratedPaperPages(
      temporaryDirectory,
      pages,
    );
    assert.equal(protectedResult.ok, false);
    assert.match(protectedResult.issues.join('\n'), /unowned file/);
    assert.equal(await readFile(notesFile, 'utf8'), 'manual content');
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
});

test('generated paths may not escape their owned output directory', async () => {
  const temporaryDirectory = await mkdtemp(
    path.join(os.tmpdir(), 'llm-optimizer-contained-'),
  );
  try {
    await assert.rejects(
      synchronizeGeneratedPaperPages(
        temporaryDirectory,
        new Map([['../escape.mdx', 'unsafe']]),
      ),
      /escapes the output directory/,
    );
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
});
