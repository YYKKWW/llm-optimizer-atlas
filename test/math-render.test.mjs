import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import yaml from 'js-yaml';

import { parseMathText } from '../src/lib/math-render.mjs';

function mathHtml(lines) {
  return lines
    .flatMap((line) => line.segments)
    .filter((segment) => segment.kind === 'math')
    .map((segment) => segment.html)
    .join('');
}

test('renders inline and display LaTeX without exposing it as code', () => {
  const lines = parseMathText(
    'Set $R=\\sqrt{d_{\\mathrm{out}}/d_{\\mathrm{in}}}$.\n$W_{t+1}=W_t-\\eta R\\Phi_t$.',
  );
  const html = mathHtml(lines);

  assert.match(html, /class="katex"/);
  assert.match(html, /class="katex-display"/);
  assert.equal(lines[0].display, false);
  assert.equal(lines[1].display, true);
});

test('keeps prose separate from non-trusting KaTeX HTML', () => {
  const lines = parseMathText('<script>alert(1)</script> and $x_1$.');
  const text = lines[0].segments.find((segment) => segment.kind === 'text');
  const html = mathHtml(lines);

  assert.equal(text.value, '<script>alert(1)</script> and ');
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /class="katex"/);
});

test('parses a formula before laying out newlines', () => {
  const lines = parseMathText('$x_t=\\frac{a_t}{\nb_t}$, then continue.');

  assert.equal(lines.length, 1);
  assert.equal(lines[0].display, false);
  assert.match(mathHtml(lines), /class="katex"/);
});

test('renders every canonical exact update without a KaTeX parse error', async () => {
  const source = await readFile(
    new URL('../src/data/papers.yml', import.meta.url),
    'utf8',
  );
  const papers = yaml.load(source);

  for (const paper of papers) {
    assert.doesNotThrow(() => parseMathText(paper.exact_update), paper.id);
  }
});
