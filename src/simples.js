/* Linguagem simples em PT-BR: frases, sílabas, Flesch adaptado, jargão e voz passiva. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SimpleLanguage = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const JARGON = {
    'no que tange': 'sobre',
    'no tocante a': 'sobre',
    'com vistas a': 'para',
    'afim de': 'para',
    'por conseguinte': 'por isso',
    'destarte': 'assim',
    'outrossim': 'além disso',
    'doravante': 'a partir de agora',
    'supracitado': 'citado antes',
    'supramencionado': 'citado antes',
    'hodiernamente': 'hoje',
    'viabilizar': 'permitir',
    'disponibilizar': 'oferecer',
    'implementar': 'fazer',
    'utilizar': 'usar',
    'realizar': 'fazer',
    'efetuar': 'fazer',
    'necessário': 'precisa',
    'imprescindível': 'essencial',
    'conforme': 'como',
    'entretanto': 'mas',
    'contudo': 'mas',
    'todavia': 'mas',
    'porém': 'mas',
    'mediante': 'com',
    'através de': 'por',
    'de forma a': 'para',
    'devido ao fato de que': 'porque',
    'em virtude de': 'por',
    'a fim de': 'para',
  };

  const PASSIVE_RE = /\b(foi|foram|será|serão|é|são|era|eram)\s+\w+(?:ado|ada|ados|adas|ido|ida|idos|idas)\b/gi;
  const NOMINALIZATION_RE = /\b\w{4,}(?:ção|ções|mento|mentos)\b/gi;

  function normalize(text) {
    return String(text || '').replace(/\s+/g, ' ').trim();
  }

  function splitSentences(text) {
    const clean = normalize(text);
    if (!clean) return [];
    return clean
      .split(/(?<=[.!?])\s+(?=[A-ZÀ-Ú"“])/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  function words(text) {
    const clean = normalize(text).toLowerCase();
    if (!clean) return [];
    return clean
      .replace(/[.,!?;:()"“”'’—–-]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 0);
  }

  const VOWELS = 'aeiouáàâãéêíóôõúü';

  function syllables(word) {
    const clean = String(word).toLowerCase().replace(/[^a-záàâãéêíóôõúüç]/g, '');
    if (!clean) return 0;
    let count = 0;
    let previousWasVowel = false;
    for (const ch of clean) {
      const isVowel = VOWELS.includes(ch);
      if (isVowel && !previousWasVowel) count += 1;
      previousWasVowel = isVowel;
    }
    return Math.max(1, count);
  }

  function countSyllables(list) {
    return list.reduce((sum, w) => sum + syllables(w), 0);
  }

  function fleschPT(metrics) {
    if (!metrics.sentences || !metrics.words) return null;
    const asl = metrics.words / metrics.sentences;
    const asw = metrics.syllables / metrics.words;
    return Math.round(248.835 - 1.015 * asl - 84.6 * asw);
  }

  function fleschLabel(score) {
    if (score === null) return 'Sem texto suficiente.';
    if (score >= 75) return 'Muito fácil — leitura confortável para a maioria.';
    if (score >= 60) return 'Fácil — adequado para público geral.';
    if (score >= 50) return 'Razoavelmente difícil — revise frases longas e jargão.';
    if (score >= 30) return 'Difícil — acima do recomendado para comunicação pública.';
    return 'Muito difícil — reescreva antes de publicar.';
  }

  function analyze(text) {
    const list = words(text);
    const sentences = splitSentences(text);
    const metrics = {
      words: list.length,
      sentences: sentences.length,
      syllables: countSyllables(list),
      chars: normalize(text).length,
    };
    metrics.avgSentence = metrics.sentences ? Math.round((metrics.words / metrics.sentences) * 10) / 10 : 0;
    metrics.avgWord = metrics.words ? Math.round((metrics.syllables / metrics.words) * 100) / 100 : 0;
    metrics.flesch = fleschPT(metrics);

    const issues = [];

    const longSentences = sentences.filter((s) => words(s).length > 25);
    if (longSentences.length) {
      issues.push({
        rule: 'sentence',
        severity: longSentences.length > 2 ? 'error' : 'warning',
        count: longSentences.length,
        message: `${longSentences.length} frase(s) com mais de 25 palavras.`,
        suggestion: 'Quebre em frases de 15 a 20 palavras, uma ideia por frase.',
        examples: longSentences.slice(0, 3),
      });
    }

    const jargons = [];
    const lower = normalize(text).toLowerCase();
    Object.keys(JARGON).forEach((term) => {
      const matches = lower.split(term).length - 1;
      if (matches > 0) jargons.push({ term, alternative: JARGON[term], count: matches });
    });
    if (jargons.length) {
      issues.push({
        rule: 'jargon',
        severity: 'warning',
        count: jargons.length,
        message: `${jargons.length} expressão(ões) de jargão encontradas.`,
        suggestion: 'Troque por alternativas diretas (ex.: "utilizar" → "usar").',
        examples: jargons,
      });
    }

    const passive = text.match(PASSIVE_RE) || [];
    if (passive.length > 1) {
      issues.push({
        rule: 'passive',
        severity: 'warning',
        count: passive.length,
        message: `${passive.length} trechos com voz passiva.`,
        suggestion: 'Prefira voz ativa: diga quem faz o quê.',
        examples: passive.slice(0, 3),
      });
    }

    const nominalizations = text.match(NOMINALIZATION_RE) || [];
    if (nominalizations.length > 4) {
      issues.push({
        rule: 'nominalization',
        severity: 'warning',
        count: nominalizations.length,
        message: `${nominalizations.length} substantivos abstratos terminados em -ção/-mento.`,
        suggestion: 'Prefira o verbo: "a realização da análise" → "analisar".',
        examples: [...new Set(nominalizations.map((n) => n.toLowerCase()))].slice(0, 5),
      });
    }

    const repeated = repeatedWords(text);
    if (repeated.length) {
      issues.push({
        rule: 'repetition',
        severity: 'warning',
        count: repeated.length,
        message: `${repeated.length} palavra(s) repetida(s) em sequência próxima.`,
        suggestion: 'Varie ou remova repetições desnecessárias.',
        examples: repeated.slice(0, 4),
      });
    }

    const penalties = issues.reduce((sum, i) => sum + (i.severity === 'error' ? 14 : 7), 0);
    const score = Math.max(0, 100 - penalties);

    return { metrics, issues, score, fleschLabel: fleschLabel(metrics.flesch), jargon: jargons };
  }

  function repeatedWords(text) {
    const list = words(text);
    const found = [];
    for (let i = 0; i < list.length; i += 1) {
      const word = list[i];
      if (word.length < 4) continue;
      let count = 1;
      for (let j = i + 1; j < Math.min(list.length, i + 10); j += 1) {
        if (list[j] === word) count += 1;
      }
      if (count >= 3) found.push(`${word} (${count}×)`);
    }
    return [...new Set(found)].slice(0, 5);
  }

  return { analyze, splitSentences, words, syllables, fleschPT, fleschLabel, JARGON, repeatedWords };
});
