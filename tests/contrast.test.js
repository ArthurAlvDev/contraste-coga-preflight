'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const contrast = require('../src/contrast.js');

test('lê hexadecimal curto e longo', () => {
  assert.equal(contrast.parseColor('#fff').hex, '#ffffff');
  assert.deepEqual(contrast.parseColor('#102030'), { r: 16, g: 32, b: 48, hex: '#102030' });
});

test('lê rgb() e nomes', () => {
  assert.equal(contrast.parseColor('rgb(255, 0, 0)').hex, '#ff0000');
  assert.equal(contrast.parseColor('white').hex, '#ffffff');
});

test('rejeita cor inválida', () => {
  assert.equal(contrast.parseColor('azulzinho'), null);
  assert.equal(contrast.parseColor(''), null);
});

test('preto sobre branco dá 21:1', () => {
  const value = contrast.ratio(contrast.parseColor('#000'), contrast.parseColor('#fff'));
  assert.ok(Math.abs(value - 21) < 0.01);
});

test('mesma cor dá 1:1', () => {
  const c = contrast.parseColor('#336699');
  assert.equal(contrast.ratio(c, c), 1);
});

test('a ordem dos argumentos não altera a razão', () => {
  const a = contrast.parseColor('#123456');
  const b = contrast.parseColor('#fedcba');
  assert.equal(contrast.ratio(a, b), contrast.ratio(b, a));
});

test('classifica texto normal e grande', () => {
  assert.equal(contrast.grade(7.1, false), 'AAA');
  assert.equal(contrast.grade(5, false), 'AA');
  assert.equal(contrast.grade(4.4, false), 'Falha');
  assert.equal(contrast.grade(3.1, true), 'AA');
  assert.equal(contrast.grade(2.9, true), 'Falha');
});

test('evaluate devolve razão arredondada e classificações', () => {
  const result = contrast.evaluate('#000', '#fff');
  assert.equal(result.ok, true);
  assert.equal(result.ratio, 21);
  assert.equal(result.normal, 'AAA');
  assert.equal(result.large, 'AAA');
  assert.equal(result.ui, 'AA');
});

test('evaluate trata cor inválida', () => {
  const result = contrast.evaluate('nada', '#fff');
  assert.equal(result.ok, false);
  assert.match(result.error, /cores válidas/);
});

test('sugestão muda com a razão', () => {
  assert.match(contrast.suggest(8), /qualquer texto/);
  assert.match(contrast.suggest(4.6), /AA/);
  assert.match(contrast.suggest(3.2), /texto grande/);
  assert.match(contrast.suggest(1.5), /Abaixo de 3:1/);
});

test('luminância de branco é 1 e de preto é 0', () => {
  assert.equal(contrast.luminance(contrast.parseColor('#fff')), 1);
  assert.equal(contrast.luminance(contrast.parseColor('#000')), 0);
});

test('toHex formata com dois dígitos', () => {
  assert.equal(contrast.toHex(1, 2, 3), '#010203');
  assert.equal(contrast.toHex(255, 255, 255), '#ffffff');
});
