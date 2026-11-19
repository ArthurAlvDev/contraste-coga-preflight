/* Contraste WCAG 2.2 — luminância relativa, razão e classificação. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Contrast = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const NAMED = {
    black: '#000000', white: '#ffffff', red: '#ff0000', green: '#008000',
    blue: '#0000ff', gray: '#808080', grey: '#808080', yellow: '#ffff00',
    silver: '#c0c0c0', navy: '#000080', teal: '#008080', purple: '#800080',
    orange: '#ffa500', maroon: '#800000', olive: '#808000', lime: '#00ff00',
    aqua: '#00ffff', fuchsia: '#ff00ff',
  };

  function parseColor(input) {
    if (!input) return null;
    const raw = String(input).trim().toLowerCase();

    if (NAMED[raw]) return parseColor(NAMED[raw]);

    let m = raw.match(/^#([0-9a-f]{3})$/);
    if (m) {
      const [r, g, b] = m[1].split('').map((c) => parseInt(c + c, 16));
      return { r, g, b, hex: `#${m[1]}${m[1]}`.slice(0, 7) };
    }

    m = raw.match(/^#([0-9a-f]{6})$/);
    if (m) {
      const value = m[1];
      return {
        r: parseInt(value.slice(0, 2), 16),
        g: parseInt(value.slice(2, 4), 16),
        b: parseInt(value.slice(4, 6), 16),
        hex: `#${value}`,
      };
    }

    m = raw.match(/^rgb\(\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*\)$/);
    if (m) {
      const r = Math.min(255, Number(m[1]));
      const g = Math.min(255, Number(m[2]));
      const b = Math.min(255, Number(m[3]));
      return { r, g, b, hex: toHex(r, g, b) };
    }

    return null;
  }

  function toHex(r, g, b) {
    return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
  }

  function channel(value) {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }

  function luminance(color) {
    const { r, g, b } = color;
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  }

  function ratio(foreground, background) {
    const l1 = luminance(foreground);
    const l2 = luminance(background);
    const light = Math.max(l1, l2);
    const dark = Math.min(l1, l2);
    return (light + 0.05) / (dark + 0.05);
  }

  function grade(value, isLargeText) {
    if (isLargeText) {
      if (value >= 4.5) return 'AAA';
      if (value >= 3) return 'AA';
      return 'Falha';
    }
    if (value >= 7) return 'AAA';
    if (value >= 4.5) return 'AA';
    return 'Falha';
  }

  function evaluate(fgInput, bgInput, options) {
    const fg = parseColor(fgInput);
    const bg = parseColor(bgInput);
    const opts = options || {};
    if (!fg || !bg) {
      return { ok: false, error: 'Informe cores válidas em hexadecimal (ex.: #102030) ou rgb().' };
    }
    const value = ratio(fg, bg);
    const rounded = Math.round(value * 100) / 100;
    return {
      ok: true,
      foreground: fg.hex,
      background: bg.hex,
      ratio: rounded,
      normal: grade(value, false),
      large: grade(value, true),
      ui: value >= 3 ? 'AA' : 'Falha',
      label: opts.fontSizePx && opts.fontSizePx >= 24 ? grade(value, true) : grade(value, false),
    };
  }

  function suggest(ratioValue) {
    if (ratioValue >= 7) return 'Contraste suficiente para qualquer texto.';
    if (ratioValue >= 4.5) return 'Atende AA para texto normal; AAA exige 7:1.';
    if (ratioValue >= 3) return 'Serve apenas para texto grande (≥ 24 px ou ≥ 19 px em negrito) e componentes de interface.';
    return 'Abaixo de 3:1: não atende nem texto grande. Escureça o texto ou clareie o fundo.';
  }

  return { parseColor, luminance, ratio, grade, evaluate, suggest, toHex, NAMED };
});
