'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const typography = require('../src/typography.js');

test('aprova configuração confortável', () => {
  const out = typography.auditTypography({ fontSizePx: 18, lineHeight: 1.6, maxWidthCh: 66 });
  assert.equal(out.issues.length, 0);
  assert.equal(out.score, 100);
});

test('reprova texto base menor que 16 px', () => {
  const out = typography.auditTypography({ fontSizePx: 13 });
  assert.equal(out.issues[0].rule, 'size');
  assert.equal(out.issues[0].severity, 'warning');
});

test('trata texto muito pequeno como erro', () => {
  const out = typography.auditTypography({ fontSizePx: 10 });
  assert.equal(out.issues[0].severity, 'error');
});

test('reprova entrelinha abaixo de 1,5', () => {
  const out = typography.auditTypography({ fontSizePx: 16, lineHeight: 1.2 });
  assert.ok(out.issues.find((i) => i.rule === 'leading'));
});

test('reprova linha longa e linha estreita', () => {
  assert.ok(typography.auditTypography({ maxWidthCh: 95 }).issues.find((i) => i.rule === 'measure'));
  assert.ok(typography.auditTypography({ maxWidthCh: 20 }).issues.find((i) => i.rule === 'measure'));
});

test('reprova espaçamento negativo', () => {
  const out = typography.auditTypography({ letterSpacingEm: -0.02 });
  assert.equal(out.issues[0].rule, 'spacing');
  assert.equal(out.issues[0].severity, 'error');
});

test('reprova justificado', () => {
  assert.ok(typography.auditTypography({ textAlign: 'justify' }).issues.find((i) => i.rule === 'align'));
});

test('ignora alinhamento à esquerda', () => {
  assert.ok(!typography.auditTypography({ textAlign: 'left' }).issues.find((i) => i.rule === 'align'));
});

test('detecta caixa alta em trecho longo', () => {
  const sample = 'ATENÇÃO: TODOS OS DOCUMENTOS PRECISAM SER ENTREGUES NA RECEPÇÃO';
  assert.ok(typography.auditTypography({ sample }).issues.find((i) => i.rule === 'case'));
});

test('não confunde título curto em caixa alta', () => {
  assert.ok(!typography.auditTypography({ sample: 'AVISO' }).issues.find((i) => i.rule === 'case'));
});

test('reprova parágrafo muito extenso', () => {
  assert.ok(typography.auditTypography({ paragraphChars: 900 }).issues.find((i) => i.rule === 'paragraph'));
});

test('o índice cai conforme os problemas aparecem', () => {
  const bom = typography.auditTypography({ fontSizePx: 18, lineHeight: 1.6 });
  const ruim = typography.auditTypography({ fontSizePx: 10, lineHeight: 1, maxWidthCh: 120, letterSpacingEm: -0.1 });
  assert.ok(ruim.score < bom.score);
  assert.equal(ruim.score, Math.max(0, 100 - 12 * 3));
});
