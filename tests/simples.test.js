'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const simples = require('../src/simples.js');

test('separa frases por pontuação final', () => {
  const out = simples.splitSentences('Primeira frase. Segunda frase! Terceira?');
  assert.equal(out.length, 3);
});

test('conta palavras ignorando pontuação', () => {
  assert.equal(simples.words('Olá, mundo!').length, 2);
});

test('conta sílabas por grupos de vogais', () => {
  assert.equal(simples.syllables('casa'), 2);
  assert.equal(simples.syllables('computador'), 4);
  assert.equal(simples.syllables('a'), 1);
});

test('calcula métricas básicas', () => {
  const out = simples.analyze('A equipe revisou o texto. O resultado ficou claro.');
  assert.equal(out.metrics.sentences, 2);
  assert.ok(out.metrics.words >= 8);
  assert.ok(out.metrics.flesch !== null);
});

test('frases longas viram problema', () => {
  const longa = 'Esta frase tem muitas palavras e continua sem parar porque o autor decidiu explicar cada detalhe do processo administrativo interno sem oferecer pausas para o leitor respirar e compreender o que está sendo dito de fato agora.';
  const out = simples.analyze(longa);
  assert.ok(out.issues.find((i) => i.rule === 'sentence'));
});

test('frases curtas não viram problema', () => {
  const out = simples.analyze('O prazo termina amanhã. Envie o documento. Guarde o recibo.');
  assert.equal(out.issues.find((i) => i.rule === 'sentence'), undefined);
});

test('detecta jargão e sugere alternativa', () => {
  const out = simples.analyze('Favor utilizar o formulário e viabilizar o envio.');
  const jargon = out.issues.find((i) => i.rule === 'jargon');
  assert.ok(jargon);
  assert.ok(jargon.examples.some((e) => e.term === 'utilizar' && e.alternative === 'usar'));
});

test('conta ocorrências de jargão', () => {
  const out = simples.analyze('Utilizar aqui. Utilizar ali. Utilizar sempre.');
  const entry = out.jargon.find((j) => j.term === 'utilizar');
  assert.equal(entry.count, 3);
});

test('detecta voz passiva repetida', () => {
  const out = simples.analyze('O documento foi enviado. O recibo foi arquivado. A cópia foi guardada.');
  assert.ok(out.issues.find((i) => i.rule === 'passive'));
});

test('detecta nominalizações em excesso', () => {
  const out = simples.analyze(
    'A realização da avaliação trouxe a constatação de que o encaminhamento do documento depende da autorização da coordenação.'
  );
  assert.ok(out.issues.find((i) => i.rule === 'nominalization'));
});

test('detecta repetição próxima', () => {
  const out = simples.analyze('O sistema abriu. O sistema travou. O sistema fechou.');
  assert.ok(out.issues.find((i) => i.rule === 'repetition'));
});

test('texto vazio não quebra', () => {
  const out = simples.analyze('');
  assert.equal(out.metrics.words, 0);
  assert.equal(out.metrics.sentences, 0);
  assert.equal(out.metrics.flesch, null);
  assert.equal(out.issues.length, 0);
});

test('o rótulo Flesch acompanha a pontuação', () => {
  assert.match(simples.fleschLabel(80), /Muito fácil/);
  assert.match(simples.fleschLabel(65), /Fácil/);
  assert.match(simples.fleschLabel(55), /Razoavelmente/);
  assert.match(simples.fleschLabel(35), /Difícil/);
  assert.match(simples.fleschLabel(10), /Muito difícil/);
  assert.match(simples.fleschLabel(null), /Sem texto/);
});

test('texto simples tem nota melhor que texto empolado', () => {
  const simplesTexto = 'A reunião é amanhã. Traga o documento. O portão abre às oito.';
  const empolado =
    'No que tange à realização da supracitada reunião, foi determinado que a disponibilização da documentação seja efetuada, outrossim, a implementação da autorização da coordenação será viabilizada por conseguinte.';
  assert.ok(simples.analyze(simplesTexto).score > simples.analyze(empolado).score);
});
