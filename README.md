# Pré-voo WCAG

Verificador **100% local** de contraste (WCAG 2.2), tipografia legível e linguagem simples em PT-BR. Um pré-voo rápido antes de publicar qualquer página, comunicado ou material didático.

- Site: <https://contraste.olacdev.com>
- Licença: MIT
- Feito por **OlacDev** — <https://olacdev.com/>

## O que verifica

### 1. Contraste

Calcula a razão de contraste pela luminância relativa da WCAG 2.2 e classifica em **AAA / AA / Falha** para texto normal, texto grande e componentes de interface. Aceita `#rgb`, `#rrggbb`, `rgb(r, g, b)` e nomes comuns.

| Situação | Mínimo |
| --- | --- |
| Texto normal | 4,5:1 (AA) · 7:1 (AAA) |
| Texto grande (≥ 24 px, ou ≥ 19 px em negrito) | 3:1 |
| Componentes de interface e limites | 3:1 |

### 2. Tipografia e layout

Regras sobre tamanho base, entrelinha, medida da coluna, espaçamento entre letras, alinhamento, uso de caixa alta e densidade do parágrafo — com referência à WCAG 1.4.4, 1.4.12 e às diretrizes COGA.

### 3. Linguagem simples

Heurística em português: frases longas, jargão (com alternativa sugerida), voz passiva, nominalizações em `-ção/-mento` e repetições próximas. Calcula o **índice de Flesch adaptado ao português** (248,835 − 1,015 × ASL − 84,6 × ASW) e classifica a facilidade de leitura.

## Por que existe

Verificadores de contraste existem; verificadores de linguagem existem; guias de tipografia existem. O que falta é uma checagem única, rápida e local que una as três dimensões que mais afetam a leitura real — cor, forma e frase — com sugestão prática em vez de nota sem explicação.

O público-alvo é quem publica sem equipe de design: escolas, ONGs, setores públicos, pequenos negócios.

## Estrutura

```
index.html          interface (seções de contraste, tipografia e texto)
src/contrast.js     luminância, razão, classificação WCAG e sugestões
src/typography.js   regras de tipografia e layout legível
src/simples.js      métricas de legibilidade, jargão, passiva, repetição
src/app.js          interface, amostra ao vivo e relatório
tests/              47 testes (node:test), sem dependências
```

## Desenvolvimento

```bash
npm test        # 47 testes
npm run serve   # http://localhost:8082
```

## Decisões de projeto

- **Sem upload, sem API.** Tudo em memória; nenhuma requisição após o carregamento.
- **Explicação junto do número.** Cada achado traz o motivo e a correção sugerida.
- **Heurística declarada.** O verificador é um pré-voo, não um laudo de conformidade.
- **Português primeiro.** Jargão e sílabas são tratados com regras de PT-BR, não traduzidas do inglês.
- **Acessibilidade da própria interface:** foco visível, contraste AA, `aria-live`, alvos de toque adequados e respeito a `prefers-reduced-motion`.

## Limitações

1. A contagem de sílabas é heurística (grupos de vogais): o Flesch é uma estimativa.
2. A voz passiva é detectada por padrão verbal, não por análise sintática completa.
3. A lista de jargão é curada e finita; ampliá-la é o próximo incremento.
4. A tipografia é verificada pelos valores informados, não pelo CSS da página do usuário (não há extensão de navegador nesta versão).

## Licença

MIT — veja [LICENSE](LICENSE).

Citação sugerida:

> FERREIRA, A. A. **Pré-voo WCAG: verificador local de contraste, tipografia e linguagem simples**. 2026. Software. Disponível em: <https://contraste.olacdev.com>.
