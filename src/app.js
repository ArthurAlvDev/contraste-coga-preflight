/* Pré-voo WCAG — interface (100% local). */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const state = { text: null, type: null, contrast: null };

  const SAMPLE = `A Diretoria de Administração informa que, no que tange à realização da entrega dos documentos, foi determinado que a disponibilização do formulário será efetuada mediante a implementação do novo sistema.

Outrossim, a supracitada documentação deverá ser encaminhada por conseguinte à coordenação, a fim de que seja viabilizada a autorização necessária para a continuidade do processo administrativo em questão.

O prazo termina em 30 de novembro. Guarde o recibo.`;

  const escapeHTML = (value) =>
    String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function setStatus(id, message, kind) {
    const el = $(id);
    el.textContent = message;
    el.dataset.kind = kind || 'info';
  }

  /* ---------- Contraste ---------- */

  function updateContrast() {
    const fg = $('fg').value.trim();
    const bg = $('bg').value.trim();
    const size = Number($('size').value) || 16;

    const result = Contrast.evaluate(fg, bg, { fontSizePx: size });
    state.contrast = result;

    const sample = $('sample');
    const parsedFg = Contrast.parseColor(fg);
    const parsedBg = Contrast.parseColor(bg);
    if (parsedFg && parsedBg) {
      sample.style.color = parsedFg.hex;
      sample.style.background = parsedBg.hex;
      sample.style.fontSize = `${Math.min(Math.max(size, 10), 48)}px`;
    }

    if (!result.ok) {
      $('contrast-result').hidden = true;
      setStatus('contrast-status', result.error, 'error');
      return;
    }

    $('contrast-result').hidden = false;
    $('ratio').textContent = `${result.ratio.toFixed(2)}:1`;
    [['grade-normal', result.normal], ['grade-large', result.large], ['grade-ui', result.ui]].forEach(([id, grade]) => {
      const el = $(id);
      el.textContent = grade;
      el.dataset.grade = grade;
    });
    $('contrast-hint').textContent = Contrast.suggest(result.ratio);

    if (result.ratio < 3) {
      setStatus('contrast-status', 'Contraste insuficiente para qualquer uso: corrija antes de publicar.', 'error');
    } else if (result.ratio < 4.5) {
      setStatus('contrast-status', 'Atende apenas texto grande e componentes de interface. Para texto normal, ajuste as cores.', 'info');
    } else {
      setStatus('contrast-status', `Contraste aprovado para texto normal (${result.ratio.toFixed(2)}:1).`, 'ok');
    }

    // mantém os seletores de cor sincronizados quando o valor digitado é válido
    if (parsedFg) $('fg-picker').value = parsedFg.hex;
    if (parsedBg) $('bg-picker').value = parsedBg.hex;
  }

  /* ---------- Tipografia ---------- */

  function renderIssues(list, issues) {
    list.innerHTML = '';
    if (!issues.length) {
      list.innerHTML = '<li data-severity="ok">Nenhum problema encontrado nas regras verificadas.</li>';
      return;
    }
    issues.forEach((issue) => {
      const li = document.createElement('li');
      li.dataset.severity = issue.severity;
      li.innerHTML =
        `<strong>${escapeHTML(issue.message)}</strong>` +
        (issue.suggestion ? `<span class="fix">${escapeHTML(issue.suggestion)}</span>` : '') +
        (issue.examples && issue.examples.length
          ? `<span class="examples">${issue.examples
              .map((e) => (typeof e === 'string' ? e : `${e.term} → ${e.alternative}`))
              .map(escapeHTML)
              .join(' · ')}</span>`
          : '');
      list.appendChild(li);
    });
  }

  function checkTypography() {
    const result = Typography.auditTypography({
      fontSizePx: Number($('font').value) || 16,
      lineHeight: Number($('leading').value) || 1.5,
      maxWidthCh: Number($('measure').value) || 66,
      letterSpacingEm: Number($('spacing').value) || 0,
      textAlign: $('align').value,
      paragraphChars: Number($('paragraph').value) || 0,
      sample: $('text').value || '',
    });

    state.type = result;
    $('type-result').hidden = false;
    $('type-score').textContent = String(result.score);
    renderIssues($('type-issues'), result.issues);
  }

  /* ---------- Texto ---------- */

  function analyzeText() {
    const source = $('text').value.trim();
    if (!source) {
      setStatus('text-status', 'Cole o texto que vai publicar para analisar.', 'error');
      return;
    }

    const result = SimpleLanguage.analyze(source);
    state.text = { result, source };

    $('text-result').hidden = false;
    $('m-words').textContent = String(result.metrics.words);
    $('m-sentences').textContent = String(result.metrics.sentences);
    $('m-avg').textContent = String(result.metrics.avgSentence);
    $('m-flesch').textContent = result.metrics.flesch === null ? '–' : String(result.metrics.flesch);
    $('m-score').textContent = String(result.score);
    $('flesch-label').textContent = result.fleschLabel;

    renderIssues($('text-issues'), result.issues);

    const kind = result.score >= 85 ? 'ok' : result.score >= 60 ? 'info' : 'error';
    setStatus('text-status', `Análise concluída: índice ${result.score}/100. ${result.fleschLabel}`, kind);
  }

  /* ---------- Exportação ---------- */

  function report() {
    const lines = ['# Relatório de pré-voo WCAG', ''];
    if (state.contrast && state.contrast.ok) {
      const c = state.contrast;
      lines.push('## Contraste', '', `- Texto: ${c.foreground}`, `- Fundo: ${c.background}`, `- Razão: **${c.ratio.toFixed(2)}:1**`);
      lines.push(`- Texto normal: **${c.normal}** · Texto grande: **${c.large}** · Interface: **${c.ui}**`, '');
    }
    if (state.type) {
      lines.push('## Tipografia', '', `- Índice: **${state.type.score}/100**`, '');
      state.type.issues.forEach((i) => lines.push(`- ${i.severity === 'error' ? 'Erro' : 'Aviso'}: ${i.message}${i.suggestion ? ` _(${i.suggestion})_` : ''}`));
      if (!state.type.issues.length) lines.push('- Nenhum problema.');
      lines.push('');
    }
    if (state.text) {
      const r = state.text.result;
      lines.push('## Linguagem simples', '');
      lines.push(`- Palavras: ${r.metrics.words}`, `- Frases: ${r.metrics.sentences}`, `- Média de palavras por frase: ${r.metrics.avgSentence}`);
      lines.push(`- Flesch (PT): ${r.metrics.flesch} — ${r.fleschLabel}`, `- Índice: **${r.score}/100**`, '');
      r.issues.forEach((i) => lines.push(`- ${i.severity === 'error' ? 'Erro' : 'Aviso'}: ${i.message}${i.suggestion ? ` _(${i.suggestion})_` : ''}`));
      lines.push('', `Trecho analisado (${state.text.source.length} caracteres).`, '');
    }
    lines.push('---', '', 'Gerado pelo Pré-voo WCAG · Made by OlacDev · https://olacdev.com/');
    return lines.join('\n') + '\n';
  }

  function bind() {
    ['fg', 'bg', 'size'].forEach((id) => $(id).addEventListener('input', updateContrast));
    $('fg-picker').addEventListener('input', (e) => { $('fg').value = e.target.value; updateContrast(); });
    $('bg-picker').addEventListener('input', (e) => { $('bg').value = e.target.value; updateContrast(); });

    $('btn-type').addEventListener('click', checkTypography);

    $('btn-text').addEventListener('click', analyzeText);
    $('btn-sample').addEventListener('click', () => {
      $('text').value = SAMPLE;
      analyzeText();
    });

    $('btn-copy').addEventListener('click', async () => {
      if (!state.contrast && !state.type && !state.text) {
        setStatus('text-status', 'Faça ao menos uma verificação antes de copiar o relatório.', 'error');
        return;
      }
      try {
        await navigator.clipboard.writeText(report());
        setStatus('text-status', 'Relatório copiado para a área de transferência.', 'ok');
      } catch (_e) {
        setStatus('text-status', 'O navegador bloqueou a cópia. Selecione o texto manualmente.', 'error');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    bind();
    updateContrast();
    checkTypography();
    $('text').value = SAMPLE;
    analyzeText();
    setStatus('contrast-status', 'Pronto. Nada é enviado para servidores: tudo é calculado no navegador.', 'info');
  });
})();
