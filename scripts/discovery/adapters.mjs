import { decodeHtml, normalizeDoi } from './normalize.mjs';
import { fetchJson, fetchText } from './http.mjs';

export function dateFromParts(parts) {
  if (
    !Array.isArray(parts) ||
    parts.length !== 3 ||
    !parts.every(Number.isInteger)
  ) {
    return null;
  }
  const [year, month, day] = parts;
  const value =
    String(year).padStart(4, '0') +
    '-' +
    String(month).padStart(2, '0') +
    '-' + String(day).padStart(2, '0');
  const parsed = new Date(value + 'T00:00:00.000Z');
  return !Number.isNaN(parsed.valueOf()) &&
    parsed.toISOString().slice(0, 10) === value
    ? value
    : null;
}

function rawRecord({
  title,
  authors = [],
  publishedDate = null,
  targetSource,
  doi = null,
  arxivUrl = null,
  officialUrl = null,
  sourceKey,
  adapter,
  recordId,
  retrievedAt,
  abstract = '',
  keywords = '',
}) {
  return {
    title: decodeHtml(title),
    authors: authors.map(decodeHtml).filter(Boolean),
    publishedDate,
    targetSource,
    targetSources: [targetSource],
    doi: normalizeDoi(doi),
    arxivUrl,
    officialUrl,
    sourceKeys: [sourceKey],
    searchText: { title, abstract, keywords },
    provenance: [
      {
        adapter,
        target_source: targetSource,
        record_id: String(recordId),
        retrieved_at: retrievedAt,
      },
    ],
  };
}

export function parseCrossrefResponse(payload, source, retrievedAt) {
  const items = payload?.message?.items;
  if (!Array.isArray(items)) {
    throw new Error('Crossref response has no message.items array');
  }
  return items
    .map((item) => {
      const doi = normalizeDoi(item.DOI);
      const title = item.title?.[0];
      if (!title || !doi) return null;
      const published =
        item['published-online']?.['date-parts']?.[0] ??
        item['published-print']?.['date-parts']?.[0] ??
        item.published?.['date-parts']?.[0];
      return rawRecord({
        title,
        authors: (item.author ?? []).map((author) =>
          [author.given, author.family].filter(Boolean).join(' '),
        ),
        publishedDate: dateFromParts(published),
        targetSource: source.id,
        doi,
        officialUrl: 'https://doi.org/' + doi,
        sourceKey: 'crossref:' + doi,
        adapter: 'crossref-journal',
        recordId: doi,
        retrievedAt,
        abstract: item.abstract ?? '',
        keywords: (item.subject ?? []).join(' '),
      });
    })
    .filter(Boolean);
}

export function parsePmlrVolumeIndex(html) {
  const volumes = [];
  const pattern = /<item>[\s\S]*?<title>v(\d+)<\/title>[\s\S]*?<description>([\s\S]*?)<\/description>[\s\S]*?<link>([^<]+)<\/link>[\s\S]*?<\/item>/gi;
  for (const match of html.matchAll(pattern)) {
    const title = decodeHtml(match[2]);
    if (
      /^Proceedings of ICML \d{4}$/i.test(title) ||
      /^Proceedings of (?:the )?\d+(?:st|nd|rd|th) International Conference on Machine Learning/i.test(
        title,
      )
    ) {
      volumes.push({
        volume: Number(match[1]),
        title,
        url: new URL(match[3], 'https://proceedings.mlr.press/').href,
      });
    }
  }
  const uniqueVolumes = [...new Map(volumes.map((volume) => [volume.volume, volume])).values()]
    .sort((left, right) => right.volume - left.volume);
  if (uniqueVolumes.length === 0) {
    throw new Error('PMLR feed parser found no ICML proceedings volumes');
  }
  return uniqueVolumes;
}

export function parsePmlrVolume(html, source, retrievedAt, volumeNumber) {
  const records = [];
  const blocks = [...html.matchAll(/<div\s+class=["']paper["']>([\s\S]*?)<\/div>/gi)];
  for (const blockMatch of blocks) {
    const block = blockMatch[1];
    const title = decodeHtml(
      block.match(/<p\s+class=["']title["']>([\s\S]*?)<\/p>/i)?.[1],
    );
    const authors = decodeHtml(
      block.match(/<span\s+class=["']authors["']>([\s\S]*?)<\/span>/i)?.[1],
    )
      .split(/\s*,\s*/)
      .filter(Boolean);
    const link = block.match(
      new RegExp(
        'href=["\']([^"\']*/v' +
          volumeNumber +
          '/([^/"\']+)\\.html)["\'][^>]*>\\s*abs\\s*</a>',
        'i',
      ),
    );
    if (!title || !link) continue;
    const url = new URL(link[1], 'https://proceedings.mlr.press/').href;
    const slug = link[2];
    records.push(
      rawRecord({
        title,
        authors,
        targetSource: source.id,
        officialUrl: url,
        sourceKey: 'pmlr:v' + volumeNumber + '/' + slug,
        adapter: 'pmlr-icml',
        recordId: 'v' + volumeNumber + '/' + slug,
        retrievedAt,
      }),
    );
  }
  if (blocks.length > 0 && records.length !== blocks.length) {
    throw new Error(
      'PMLR parser canary failed: parsed ' +
        records.length +
        ' of ' +
        blocks.length +
        ' declared paper blocks',
    );
  }
  if (blocks.length === 0) {
    throw new Error('PMLR parser canary failed: no paper blocks found');
  }
  return records;
}

function parseConferenceProceedings(
  html,
  source,
  retrievedAt,
  year,
  { baseUrl, sourcePrefix, adapter, trackClasses },
) {
  const records = [];
  const items = [
    ...html.matchAll(
      /<li\s+class=["']([^"']+)["'][^>]*>([\s\S]*?)<\/li>/gi,
    ),
  ].filter((match) => trackClasses.includes(match[1]));
  for (const itemMatch of items) {
    const item = itemMatch[2];
    const link = item.match(
      /<a\s+[^>]*href=["']([^"']+-Abstract-[^"']+\.html)["'][^>]*>([\s\S]*?)<\/a>/i,
    );
    if (!link) continue;
    const title = decodeHtml(link[2]);
    const authors = decodeHtml(
      item.match(/<span\s+class=["']paper-authors["']>([\s\S]*?)<\/span>/i)?.[1],
    )
      .split(/\s*,\s*/)
      .filter(Boolean);
    const url = new URL(link[1], baseUrl).href;
    const recordId = url.split('/').pop().replace(/-Abstract-Conference\.html$/, '');
    const normalizedRecordId = recordId.replace(/-Abstract-[^.]+\.html$/, '');
    records.push(
      rawRecord({
        title,
        authors,
        publishedDate: null,
        targetSource: source.id,
        officialUrl: url,
        sourceKey: sourcePrefix + ':' + year + '/' + normalizedRecordId,
        adapter,
        recordId: year + '/' + normalizedRecordId,
        retrievedAt,
      }),
    );
  }
  const declaredCountMatch = html.match(
    /class=["']paper-count["'][^>]*>\s*([\d,]+)\s+papers/i,
  );
  if (!declaredCountMatch) {
    throw new Error(adapter + ' parser canary failed: paper count is missing');
  }
  const declaredCount = Number(declaredCountMatch[1].replaceAll(',', ''));
  if (Number.isFinite(declaredCount) && records.length !== declaredCount) {
    throw new Error(
      adapter +
        ' parser canary failed: parsed ' +
        records.length +
        ' of ' +
        declaredCount +
        ' declared papers',
    );
  }
  return records;
}

export function parseNeuripsProceedings(html, source, retrievedAt, year) {
  return parseConferenceProceedings(html, source, retrievedAt, year, {
    baseUrl: 'https://proceedings.neurips.cc/',
    sourcePrefix: 'neurips',
    adapter: 'neurips-proceedings',
    trackClasses: [
      'conference',
      'datasets_and_benchmarks_track',
      'position_paper_track',
    ],
  });
}

export function parseIclrProceedings(html, source, retrievedAt, year) {
  return parseConferenceProceedings(html, source, retrievedAt, year, {
    baseUrl: 'https://proceedings.iclr.cc/',
    sourcePrefix: 'iclr',
    adapter: 'iclr-proceedings',
    trackClasses: ['conference'],
  });
}

export async function discoverSource(
  source,
  {
    windowStart,
    currentYear,
    retrievedAt,
    fetchTextImpl = fetchText,
    fetchJsonImpl = fetchJson,
    crossrefRows = 100,
    maxCrossrefPages = 20,
  },
) {
  if (source.adapter === 'crossref-journal') {
    const records = [];
    let cursor = '*';
    for (let page = 0; page < maxCrossrefPages; page += 1) {
      const url =
        'https://api.crossref.org/journals/' +
        encodeURIComponent(source.issn) +
        '/works?filter=from-pub-date:' +
        windowStart +
        '&rows=' +
        crossrefRows +
        '&cursor=' +
        encodeURIComponent(cursor) +
        '&select=DOI,title,author,published-online,published-print,published,URL,abstract,subject' +
        (process.env.CROSSREF_MAILTO
          ? '&mailto=' + encodeURIComponent(process.env.CROSSREF_MAILTO)
          : '');
      const payload = await fetchJsonImpl(url);
      const items = payload?.message?.items;
      const pageRecords = parseCrossrefResponse(payload, source, retrievedAt);
      records.push(...pageRecords);
      const nextCursor = payload?.message?.['next-cursor'];
      if (!Array.isArray(items) || items.length < crossrefRows || !nextCursor) {
        return records;
      }
      cursor = nextCursor;
    }
    throw new Error(
      'Crossref pagination exceeded the configured maximum of ' +
        maxCrossrefPages +
        ' pages',
    );
  }

  if (source.adapter === 'pmlr-icml') {
    const index = parsePmlrVolumeIndex(
      await fetchTextImpl('https://proceedings.mlr.press/assets/rss/feed.xml'),
    );
    const recentVolumes = index.filter((volume) => {
      const year = Number(volume.title.match(/\b(20\d{2})\b/)?.[1]);
      return !Number.isFinite(year) || year >= currentYear - 1;
    }).slice(0, 2);
    const records = [];
    for (const volume of recentVolumes) {
      records.push(
        ...parsePmlrVolume(
          await fetchTextImpl(volume.url),
          source,
          retrievedAt,
          volume.volume,
        ),
      );
    }
    return records;
  }

  if (source.adapter === 'neurips-proceedings') {
    const records = [];
    for (const year of [currentYear, currentYear - 1]) {
      try {
        const url =
          'https://proceedings.neurips.cc/paper_files/paper/' + year;
        records.push(
          ...parseNeuripsProceedings(
            await fetchTextImpl(url, { retries: year === currentYear ? 1 : 3 }),
            source,
            retrievedAt,
            year,
          ),
        );
      } catch (error) {
        if (year !== currentYear || error.status !== 404) throw error;
      }
    }
    return records;
  }

  if (source.adapter === 'iclr-proceedings') {
    const records = [];
    for (const year of [currentYear, currentYear - 1]) {
      try {
        const url = 'https://proceedings.iclr.cc/paper_files/paper/' + year;
        records.push(
          ...parseIclrProceedings(
            await fetchTextImpl(url, { retries: year === currentYear ? 1 : 3 }),
            source,
            retrievedAt,
            year,
          ),
        );
      } catch (error) {
        if (year !== currentYear || error.status !== 404) throw error;
      }
    }
    return records;
  }

  throw new Error('Unknown discovery adapter: ' + source.adapter);
}
