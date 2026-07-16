import { createHash } from 'node:crypto';

export function decodeHtml(value) {
  return String(value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeDoi(value) {
  if (!value) {
    return null;
  }
  const normalized = String(value)
    .trim()
    .toLocaleLowerCase('en-US')
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//, '')
    .replace(/^doi:\s*/, '');
  return /^10\.\d{4,9}\/\S+$/.test(normalized) ? normalized : null;
}

export function extractArxivId(value) {
  const match = String(value ?? '').match(
    /(?:arxiv:\s*|arxiv\.org\/(?:abs|pdf|html)\/)(\d{4}\.\d{4,5})(?:v\d+)?/i,
  );
  return match?.[1] ?? null;
}

export function canonicalArxivUrl(value) {
  const id = extractArxivId(value);
  return id ? 'https://arxiv.org/abs/' + id : null;
}

export function titleFingerprint(value) {
  return decodeHtml(value)
    .normalize('NFKC')
    .toLocaleLowerCase('en-US')
    .replace(/[^\p{Letter}\p{Number}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export function authorFingerprint(value) {
  return decodeHtml(value)
    .normalize('NFKC')
    .toLocaleLowerCase('en-US')
    .replace(/[^\p{Letter}\p{Number}]+/gu, ' ')
    .trim();
}

export function stableCandidateId(record) {
  const key =
    (record.doi && 'doi:' + record.doi) ||
    (record.arxivUrl && 'arxiv:' + extractArxivId(record.arxivUrl)) ||
    [...record.sourceKeys].sort()[0] ||
    'title:' + titleFingerprint(record.title);
  return (
    'candidate-' +
    createHash('sha256').update(key).digest('hex').slice(0, 16)
  );
}

export function publicationYear(value) {
  if (!value || !/^\d{4}/.test(value)) {
    return null;
  }
  return Number(value.slice(0, 4));
}
