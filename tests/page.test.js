'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

test('declara idioma e título descritivo', () => {
  assert.match(html, /<html lang="pt-BR">/);
  assert.match(html, /<title>[^<]*WCAG/);
  assert.match(html, /name="description"/);
});

test('tem estrutura semântica e um único h1', () => {
  assert.match(html, /class="skip-link" href="#main"/);
  assert.match(html, /<main id="main">/);
  assert.equal((html.match(/<h1/g) || []).length, 1);
});

test('referências locais existem', () => {
  const refs = [...html.matchAll(/(?:href|src)="([^"#]+)"/g)]
    .map((m) => m[1])
    .filter((r) => !/^https?:|^data:/.test(r));
  assert.ok(refs.length >= 5);
  for (const ref of refs) assert.ok(fs.existsSync(path.join(root, ref)), `ausente: ${ref}`);
});

test('status é anunciado por região viva', () => {
  assert.match(html, /id="contrast-status"[^>]*role="status"/);
  assert.match(html, /aria-live="polite"/);
});

test('CSP restritiva e nenhum script externo', () => {
  assert.match(html, /Content-Security-Policy/);
  assert.match(html, /default-src 'self'/);
  assert.doesNotMatch(html, /src="https?:\/\//);
});

test('campos de texto e seleção têm rótulo', () => {
  const ids = [
    ...html.matchAll(/<input[^>]*type="(?:text|number)"[^>]*id="([^"]+)"/g),
    ...html.matchAll(/<select[^>]*id="([^"]+)"/g),
    ...html.matchAll(/<textarea[^>]*id="([^"]+)"/g),
  ].map((m) => m[1]);
  assert.ok(ids.length >= 6);
  for (const id of ids) assert.match(html, new RegExp(`for="${id}"`), `sem rótulo: ${id}`);
});

test('seletores de cor têm nome acessível', () => {
  const pickers = [...html.matchAll(/<input[^>]*type="color"[^>]*>/g)].map((m) => m[0]);
  assert.equal(pickers.length, 2);
  for (const p of pickers) assert.match(p, /aria-label="[^"]+"/);
});

test('credita OlacDev', () => {
  assert.match(html, /Made by OlacDev/);
  assert.match(html, /https:\/\/olacdev\.com\//);
});

test('o exemplo embutido produz achados coerentes', () => {
  const simples = require('../src/simples.js');
  const app = fs.readFileSync(path.join(root, 'src/app.js'), 'utf8');
  const match = app.match(/const SAMPLE = `([\s\S]*?)`;/);
  assert.ok(match, 'esperava amostra no app.js');
  const out = simples.analyze(match[1]);
  assert.ok(out.metrics.words > 40);
  assert.ok(out.issues.some((i) => i.rule === 'jargon'));
  assert.ok(out.score < 90);
});
