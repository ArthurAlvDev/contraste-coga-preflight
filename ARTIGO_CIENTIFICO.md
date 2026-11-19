# Pré-voo WCAG: verificação local de contraste, tipografia e linguagem simples

**Arthur Alves Ferreira (Ferreira, A. A.)**
OlacDev · <https://olacdev.com/>

*Artigo técnico-científico — versão de trabalho (pré-print interno). Não publicado em repositório de dados. Sem DOI atribuído nesta versão.*

---

## Resumo

Três dimensões determinam se um texto publicado pode ser lido por quem tem baixa visão, dislexia ou pouca familiaridade com jargão: **cor** (contraste), **forma** (tipografia e layout) e **frase** (complexidade linguística). Ferramentas existentes cobrem cada dimensão isoladamente, exigem extensões de navegador ou entregam uma nota sem explicar o critério. Este trabalho apresenta o **Pré-voo WCAG**, aplicação web estática e local que integra as três verificações em um único fluxo: cálculo de razão de contraste pela luminância relativa da WCAG 2.2 com classificação AAA/AA/Falha; auditoria de tipografia por regras de tamanho, entrelinha, medida, espaçamento, alinhamento, caixa alta e densidade; e análise heurística de linguagem em português, com índice de Flesch adaptado, detecção de jargão com alternativa sugerida, voz passiva, nominalizações e repetições. Cada achado traz a razão da reprovação e a correção prática. A suíte de 47 testes automatizados cobre fórmulas de contraste, limites de classificação, regras tipográficas, heurísticas linguísticas e a integridade da própria página.

**Palavras-chave:** acessibilidade digital; contraste; WCAG 2.2; COGA; linguagem simples; legibilidade; Flesch.

## 1. Introdução

Publicar para "todo mundo" é uma afirmação frequente e raramente verificada. Boa parte dos problemas de acessibilidade em páginas institucionais não está em tecnologias avançadas, e sim em decisões básicas: cinza claro sobre branco, corpo de texto em 13 px, colunas justificadas de 110 caracteres, frases de 45 palavras com quatro nominalizações.

A WCAG 2.2 trata do contraste em 1.4.3 e 1.4.6, do redimensionamento em 1.4.4, do espaçamento em 1.4.12 e do contraste de componentes em 1.4.11. As diretrizes COGA (conteúdo acessível para pessoas com deficiências cognitivas e de aprendizagem) acrescentam recomendações sobre linguagem clara, frases curtas e estrutura previsível. Nenhuma dessas normas é obscura — o problema é operacional: quem publica não tem tempo de consultar cinco documentos antes de cada texto.

**Objetivo.** Entregar um pré-voo único, rápido e local que una cor, forma e frase, com diagnóstico explicado e sugestão de correção.

## 2. Fundamentação

### 2.1 Contraste e luminância

A razão de contraste da WCAG é definida a partir da luminância relativa: cada canal é linearizado (divisão por 255, correção gama) e combinado com pesos 0,2126 (R), 0,7152 (G) e 0,0722 (B). A razão é `(L_claro + 0,05) / (L_escuro + 0,05)`, variando de 1:1 a 21:1. Os limites são 4,5:1 para texto normal (AA), 7:1 para AAA e 3:1 para texto grande e componentes de interface.

### 2.2 Tipografia legível

Além do tamanho, a entrelinha e a medida da coluna afetam o retorno visual. A faixa usual recomendada é de 45 a 75 caracteres por linha, entrelinha de 1,5 ou mais e alinhamento à esquerda — o justificado cria rios de espaço que prejudicam leitores com dislexia.

### 2.3 Linguagem simples

O índice de Flesch, adaptado ao português por Martins e colaboradores, usa o número médio de palavras por frase (ASL) e de sílabas por palavra (ASW): `248,835 − 1,015·ASL − 84,6·ASW`. Valores altos indicam leitura fácil. Complementam a medida heurísticas qualitativas: jargão, voz passiva e nominalização excessiva.

## 3. Método

### 3.1 Contraste (`contrast.js`)

Parser de cores (`#rgb`, `#rrggbb`, `rgb()`, nomes comuns), linearização por canal, luminância, razão e classificação independente para texto normal, texto grande e interface. A interface sincroniza seletor de cor e campo de texto nos dois sentidos e atualiza a amostra ao vivo com as cores e o tamanho informados.

### 3.2 Tipografia (`typography.js`)

Sete regras com severidade: tamanho base (< 16 px aviso; < 12 px erro), entrelinha mínima de 1,5, medida entre 45 e 75 caracteres, espaçamento negativo (erro), justificado (aviso), caixa alta em trecho longo (≥ 40 caracteres) e parágrafo acima de 600 caracteres. O índice parte de 100 e desconta 12 por erro e 6 por aviso.

### 3.3 Linguagem (`simples.js`)

Métricas: palavras, frases, sílabas (grupos de vogais, com tratamento de acentos), médias e Flesch-PT. Achados: frases acima de 25 palavras (erro a partir da terceira), jargão de uma lista curada com alternativa em linguagem simples, voz passiva por padrão `foi/será + particípio`, nominalizações em `-ção/-mento` e repetições em janela de dez palavras. O índice desconta 14 por erro e 7 por aviso.

### 3.4 Relatório

As três verificações alimentam um relatório em Markdown copiável, com valores, classificações e achados — servindo como registro do pré-voo no processo editorial.

## 4. Validação

| Arquivo | Foco | Testes |
| --- | --- | --- |
| `contrast.test.js` | parsing de cores, luminância, razão, classificação, sugestões | 12 |
| `typography.test.js` | sete regras, severidades, índice | 12 |
| `simples.test.js` | frases, sílabas, Flesch, jargão, passiva, repetição, vazio | 14 |
| `page.test.js` | integridade, rótulos, CSP, amostra embutida | 9 |

Resultado: **47 testes, 47 aprovados, 0 falhas**. Casos notáveis: preto sobre branco resulta em 21:1 com tolerância de 0,01; a razão é invariante à ordem dos argumentos; texto empolado tem índice comprovadamente menor que texto simples; e o exemplo da interface é analisado durante os testes, garantindo que a demonstração pública permaneça coerente.

## 5. Acessibilidade da ferramenta

Foco visível de 3 px, contraste AA em tema claro e escuro, rótulos explícitos em todos os campos, `role="status"` com `aria-live="polite"`, seletores de cor com nome acessível, alvos de toque adequados e respeito a `prefers-reduced-motion`. O resultado nunca depende apenas de cor: cada classificação vem em texto ("AAA", "AA", "Falha").

## 6. Limitações

1. **Contagem de sílabas heurística.** O Flesch-PT é estimativa, não medida fonológica.
2. **Voz passiva por padrão verbal.** Construções atípicas escapam.
3. **Lista de jargão finita.** Cobre os casos mais comuns da comunicação pública brasileira.
4. **Tipografia informada, não lida do CSS.** Não há extensão de navegador nesta versão; o autor informa os valores.
5. **Sem teste com pessoas** nesta etapa. Verificador automatizado não substitui avaliação humana.

## 7. Trabalhos relacionados

Verificadores de contraste consolidados calculam a mesma razão, mas param aí. Ferramentas de legibilidade contam sílabas e palavras, sem olhar cor ou layout. Guias de estilo institucionais recomendam tudo isso em prosa, sem instrumento. O diferencial deste trabalho é a integração em um fluxo único, local e explicado.

## 8. Conclusão

O Pré-voo WCAG mostra que a maior parte dos erros evitáveis de acessibilidade textual pode ser detectada por regras explícitas, em segundos, sem servidor e sem instalação. O verificador não certifica conformidade: ele reduz a distância entre saber o que fazer e efetivamente fazer antes de publicar. Como continuação, prevê-se verificação de páginas por URL com leitura de CSS, ampliação da base de jargão e um estudo de uso com equipes de comunicação pública.

## Referências

BRASIL. **Lei nº 13.146, de 6 de julho de 2015**. Institui a Lei Brasileira de Inclusão da Pessoa com Deficiência. Brasília, DF, 2015.

FERREIRA, A. A. **Pré-voo WCAG**: verificador local de contraste, tipografia e linguagem simples. 2026. Software. Disponível em: <https://github.com/ArthurAlvDev/contraste-coga-preflight>.

FLESCH, R. A new readability yardstick. **Journal of Applied Psychology**, v. 32, n. 3, p. 221–233, 1948.

MARTINS, T. B. F. et al. Readability formulas applied to Portuguese texts. **Notas do ICMC-USP**, São Carlos, 1996.

W3C. **Making Content Usable for People with Cognitive and Learning Disabilities**. W3C Note. 2021. (COGA)

W3C. **Web Content Accessibility Guidelines (WCAG) 2.2**. Recommendation. 2023.

---

### Nota sobre publicação

Este texto é um pré-print interno. **Não houve submissão a periódico nem depósito em repositório de dados nesta etapa.** A versão citável do software é o repositório público indicado acima, sob licença MIT.
