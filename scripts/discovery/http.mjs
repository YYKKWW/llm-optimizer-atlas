const DEFAULT_ALLOWED_HOSTS = new Set([
  'api.crossref.org',
  'proceedings.mlr.press',
  'proceedings.neurips.cc',
  'proceedings.iclr.cc',
]);

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
const MAX_REDIRECTS = 5;

function assertAllowedUrl(value, allowedHosts) {
  const parsed = value instanceof URL ? value : new URL(value);
  if (parsed.protocol !== 'https:' || !allowedHosts.has(parsed.hostname)) {
    throw new Error(
      'Discovery URL is not on the HTTPS allowlist: ' + parsed.href,
    );
  }
  return parsed;
}

function retryDelay(response, attempt) {
  const retryAfter = response?.headers?.get('retry-after');
  if (retryAfter && /^\d+$/.test(retryAfter)) {
    return Math.min(Number(retryAfter) * 1000, 30_000);
  }
  return Math.min(1000 * 2 ** attempt, 8000);
}

export async function fetchText(
  url,
  {
    allowedHosts = DEFAULT_ALLOWED_HOSTS,
    timeoutMs = 25_000,
    maxBytes = 10 * 1024 * 1024,
    retries = 3,
    headers = {},
    fetchImpl = globalThis.fetch,
    sleep = (milliseconds) =>
      new Promise((resolve) => setTimeout(resolve, milliseconds)),
  } = {},
) {
  const parsed = assertAllowedUrl(url, allowedHosts);

  let lastError;
  for (let attempt = 0; attempt < retries; attempt += 1) {
    let response;
    try {
      let requestUrl = parsed;
      for (let redirectCount = 0; ; redirectCount += 1) {
        response = await fetchImpl(requestUrl, {
          headers: {
            Accept: 'application/json, text/html;q=0.9, */*;q=0.1',
            'User-Agent':
              'llm-optimizer-atlas-candidate-discovery/1.0 (https://github.com/YYKKWW/llm-optimizer-atlas)',
            ...headers,
          },
          redirect: 'manual',
          signal: AbortSignal.timeout(timeoutMs),
        });

        if (!REDIRECT_STATUSES.has(response.status)) break;
        if (redirectCount >= MAX_REDIRECTS) {
          throw new Error('Discovery response exceeded redirect limit');
        }
        const location = response.headers.get('location');
        if (!location) {
          throw new Error('Discovery redirect is missing a Location header');
        }
        requestUrl = assertAllowedUrl(
          new URL(location, requestUrl),
          allowedHosts,
        );
      }

      if (!response.ok) {
        const error = new Error(
          'HTTP ' + response.status + ' from ' + (response.url || parsed.href),
        );
        error.status = response.status;
        if (
          attempt + 1 < retries &&
          (response.status === 429 || response.status >= 500)
        ) {
          await sleep(retryDelay(response, attempt));
          lastError = error;
          continue;
        }
        throw error;
      }

      const declaredLength = Number(response.headers.get('content-length'));
      if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
        throw new Error('Discovery response exceeds byte limit');
      }
      const buffer = await response.arrayBuffer();
      if (buffer.byteLength > maxBytes) {
        throw new Error('Discovery response exceeds byte limit');
      }
      return new TextDecoder().decode(buffer);
    } catch (error) {
      lastError = error;
      if (
        attempt + 1 < retries &&
        (error.name === 'TimeoutError' ||
          error.name === 'AbortError' ||
          error instanceof TypeError ||
          error.status === 429 ||
          error.status >= 500)
      ) {
        await sleep(retryDelay(response, attempt));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export async function fetchJson(url, options) {
  const source = await fetchText(url, options);
  try {
    return JSON.parse(source);
  } catch (error) {
    throw new Error('Discovery endpoint returned invalid JSON', { cause: error });
  }
}
