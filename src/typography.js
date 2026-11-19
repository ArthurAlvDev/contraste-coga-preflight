/* Tipografia e layout legível: tamanho, entrelinha, medida, alinhamento, caixa alta. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Typography = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DEFAULTS = {
    fontSizePx: 16,
    lineHeight: 1.5,
    maxWidthCh: 66,
    letterSpacingEm: 0,
    paragraphChars: 0,
  };

  const RULES = {
    size: { label: 'Tamanho do texto', ref: 'WCAG 1.4.4 / boas práticas' },
    leading: { label: 'Entrelinha', ref: 'WCAG 1.4.12' },
    measure: { label: 'Medida da linha', ref: 'Legibilidade' },
    spacing: { label: 'Espaçamento entre letras', ref: 'WCAG 1.4.12' },
    align: { label: 'Alinhamento', ref: 'COGA / dislexia' },
    case: { label: 'Uso de caixa alta', ref: 'COGA' },
    paragraph: { label: 'Densidade do parágrafo', ref: 'COGA' },
  };

  function auditTypography(input) {
    const data = Object.assign({}, DEFAULTS, input || {});
    const issues = [];

    if (data.fontSizePx < 16) {
      issues.push({
        rule: 'size',
        severity: data.fontSizePx < 12 ? 'error' : 'warning',
        message: `Texto base com ${data.fontSizePx} px. Recomendado: 16 px ou mais.`,
        suggestion: 'Aumente o tamanho base; o usuário deve conseguir ampliar até 200% sem perda (1.4.4).',
      });
    }

    const minimumLeading = data.fontSizePx * 1.5;
    if (data.lineHeight * data.fontSizePx < minimumLeading) {
      issues.push({
        rule: 'leading',
        severity: 'warning',
        message: `Entrelinha de ${data.lineHeight} (${Math.round(data.lineHeight * data.fontSizePx)} px) abaixo de 1,5.`,
        suggestion: 'Use 1,5 ou mais para texto corrido.',
      });
    }

    if (data.maxWidthCh > 80) {
      issues.push({
        rule: 'measure',
        severity: 'warning',
        message: `Linhas de até ${data.maxWidthCh} caracteres. Acima de 80 o olho perde o retorno.`,
        suggestion: 'Limite a coluna a 60–75 caracteres.',
      });
    } else if (data.maxWidthCh < 30) {
      issues.push({
        rule: 'measure',
        severity: 'warning',
        message: `Coluna muito estreita (${data.maxWidthCh} caracteres): quebra excessiva.`,
        suggestion: 'Use entre 45 e 75 caracteres por linha.',
      });
    }

    if (data.letterSpacingEm < 0) {
      issues.push({
        rule: 'spacing',
        severity: 'error',
        message: 'Espaçamento entre letras negativo comprime o texto.',
        suggestion: 'Mantenha 0 ou valores positivos; 1.4.12 exige suportar ajuste do usuário.',
      });
    }

    if (data.textAlign === 'justify') {
      issues.push({
        rule: 'align',
        severity: 'warning',
        message: 'Texto justificado cria rios de espaço e atrapalha quem tem dislexia.',
        suggestion: 'Prefira alinhamento à esquerda.',
      });
    }

    const uppercase = String(data.sample || '');
    if (uppercase.length >= 40 && uppercase === uppercase.toUpperCase() && /[A-ZÀ-Ú]/.test(uppercase)) {
      issues.push({
        rule: 'case',
        severity: 'warning',
        message: 'Trecho longo todo em caixa alta: a leitura fica mais lenta.',
        suggestion: 'Reserve caixa alta para títulos curtos e siglas.',
      });
    }

    if (data.paragraphChars > 600) {
      issues.push({
        rule: 'paragraph',
        severity: 'warning',
        message: `Parágrafo com ${data.paragraphChars} caracteres.`,
        suggestion: 'Divida em blocos menores e use subtítulos.',
      });
    }

    const penalties = issues.reduce((sum, i) => sum + (i.severity === 'error' ? 12 : 6), 0);
    return { issues, score: Math.max(0, 100 - penalties), data };
  }

  return { auditTypography, DEFAULTS, RULES };
});
