# Launch Report — Pré-voo WCAG (ACC-002)

**Data:** 19/11/2026
**Projeto:** `contraste-coga-preflight`
**Licença:** MIT
**Responsável:** Ferreira, A. A. (OlacDev)

## Estado

| Etapa | Estado | Evidência |
| --- | --- | --- |
| Build local | Concluído | 11 arquivos, sem dependências de execução |
| Testes | 47/47 | `node --test tests/*.test.js` |
| GitHub | Publicado | `ArthurAlvDev/contraste-coga-preflight` (branch `main`) |
| Vercel | Publicado | `https://contraste-coga-preflight.vercel.app` (HTTP 200) |
| Domínio próprio | Pendente de DNS | `contraste.olacdev.com` adicionado; CNAME `a3f37024ed306b48.vercel-dns-017.com` |
| Artigo | Pronto (não publicado) | `ARTIGO_CIENTIFICO.md` |

## Escopo entregue

- Contraste WCAG 2.2 com classificação separada para texto normal, grande e componentes de interface.
- Seletor de cor e campo hexadecimal sincronizados, com amostra ao vivo.
- Sete regras de tipografia e layout, cada uma com motivo e correção.
- Linguagem simples: Flesch-PT, frases longas, jargão com alternativa, voz passiva, nominalizações, repetições.
- Relatório Markdown copiável com as três verificações.
- Marca: "Made by OlacDev" no rodapé.

## Verificações executadas

- `node --test`: 47 testes, 47 aprovados.
- Produção: `/` e `/src/simples.js` retornam 200.
- Teste garante que o exemplo embutido gera achados coerentes (jargão presente, índice < 90).

## Pendências e riscos

1. **DNS do domínio próprio** — CNAME `contraste` → `a3f37024ed306b48.vercel-dns-017.com`.
2. **Flesch-PT é estimativa** — sílabas por grupos de vogais.
3. **Tipografia informada manualmente** — sem extensão de navegador nesta versão.
4. **Sem teste com pessoas** — declarado no artigo.

## Próximo passo sugerido

Verificação por URL (ler CSS da página) e ampliação da base de jargão com revisão de equipe de comunicação.
