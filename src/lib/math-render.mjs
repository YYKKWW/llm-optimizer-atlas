import katex from 'katex';

function renderFormula(source, displayMode) {
  return katex.renderToString(source, {
    displayMode,
    output: 'htmlAndMathml',
    strict: 'error',
    throwOnError: true,
    trust: false,
  });
}

function appendText(lines, value) {
  const parts = value.split(/\n+/);

  parts.forEach((part, index) => {
    if (index > 0) {
      lines.push([]);
    }

    if (part) {
      lines.at(-1).push({ kind: 'text', value: part });
    }
  });
}

function isDisplayLine(segments) {
  const mathSegments = segments.filter((segment) => segment.kind === 'math');
  const prose = segments
    .filter((segment) => segment.kind === 'text')
    .map((segment) => segment.value)
    .join('')
    .trim();

  return mathSegments.length === 1 && /^[,.;:]?$/.test(prose);
}

export function parseMathText(value) {
  const tokens = value.trim().split('$');

  if (tokens.length % 2 === 0) {
    throw new Error('Unbalanced inline math delimiters in exact_update.');
  }

  const lines = [[]];

  tokens.forEach((token, index) => {
    if (index % 2 === 0) {
      appendText(lines, token);
      return;
    }

    lines.at(-1).push({ kind: 'math-source', value: token });
  });

  return lines
    .filter((segments) =>
      segments.some((segment) =>
        segment.kind === 'math-source'
          ? true
          : segment.value.trim().length > 0,
      ),
    )
    .map((segments) => {
      const display = isDisplayLine(
        segments.map((segment) =>
          segment.kind === 'math-source'
            ? { kind: 'math', value: segment.value }
            : segment,
        ),
      );

      return {
        display,
        segments: segments.map((segment) => {
          if (segment.kind === 'text') {
            return segment;
          }

          return {
            kind: 'math',
            html: renderFormula(segment.value, display),
          };
        }),
      };
    });
}
