# ADR 001 — SVG canônico com grade HTML semântica

**Status:** Accepted
**Date:** 2026-08-09
**Spec:** [`specs/fretboard-editor.md`](../specs/fretboard-editor.md)

## Context

O protótipo atual desenha o editor em Canvas e mantém um segundo renderer manual para exportar
SVG. O PNG é extraído diretamente do Canvas vivo. Essa separação já produziu drift: tokens visuais
estão duplicados, o marcador duplo da casa 12 não aparece e os exportadores não compartilham todos
os elementos do diagrama.

O redesign aprovado exige simultaneamente:

- interação por mouse, toque e teclado;
- nomes acessíveis e feedback para leitor de tela;
- paridade entre artboard, SVG e PNG;
- seis casas no viewport de 390 px e doze a partir de 768 px;
- ausência de framework, build e dependência de runtime;
- `index.html` autocontido com até 51.200 bytes;
- domínio de seis cordas, casas 1..24 e uma faixa adjacente de nut com seis alvos;
- labels não confiáveis inseridos e exportados sem criar markup ou atributos.

Um protótipo descartável em Chrome confirmou que elementos SVG com `role="gridcell"`, nome
acessível e roving tabindex aparecem na árvore acessível, recebem foco por seta e respondem a
`Enter` com anúncio em região viva. O protótipo foi removido após registrar este aprendizado.

## Problem

Qual projeção visual deve ser canônica para preservar acessibilidade, responsividade e paridade de
exportação sem manter representações visuais sincronizadas manualmente ou introduzir infraestrutura
desproporcional ao produto?

## Alternatives Considered

### A. Canvas visual + grade DOM semântica + exportador SVG

- **Pros:** preserva mais código do protótipo; Canvas já oferece rasterização PNG direta.
- **Cons:** mantém três representações — Canvas, grade DOM e SVG — com geometria, foco, estado e
  tokens sincronizados manualmente; o drift já existe no código atual; o Canvas vivo pode incluir
  affordances de edição no PNG.

### B. SVG DOM interativo como renderer e superfície semântica

- **Pros:** uma árvore visual vetorial; hit testing e foco nativos; semântica por posição; SVG
  exportável por clone; PNG deriva do mesmo snapshot; escala de até 78 alvos visíveis não exige
  otimização de Canvas.
- **Cons:** teclado e ARIA continuam manuais; o SVG exportado precisa materializar tokens/fontes;
  PNG ainda depende de rasterização assíncrona em Canvas offscreen; leitores de tela exigem
  validação em matriz real.

### C. Grade HTML/CSS interativa + exportador SVG

- **Pros:** botões/grade HTML oferecem semântica mais previsível; responsividade e foco são simples.
- **Cons:** a grade visual e o SVG exportado continuam sendo dois renderers; paridade geométrica e
  de tokens depende de disciplina/testes; desenho de cordas, trastes e marcadores fica menos natural
  em HTML/CSS.

### D. SVG visual canônico + grade HTML semântica sobreposta

- **Pros:** mantém uma única árvore visual/exportável; usa botões HTML nativos para foco, nome e
  ativação; SVG e PNG continuam compartilhando o mesmo snapshot; geometria do overlay deriva da
  mesma janela de cordas/casas, sem um segundo desenho.
- **Cons:** exige manter overlay e `viewBox` alinhados; adiciona uma projeção DOM de interação;
  hit areas transparentes precisam de foco visível desenhado na camada de edição do SVG.

## Decision

Adotar a alternativa D. O SVG DOM é a única árvore visual e a fonte
canônica do snapshot exportável; uma grade de botões HTML transparentes e semanticamente nomeados é
a única superfície de interação. Canvas permanece somente como adaptador offscreen para codificar
PNG, nunca como renderer do domínio.

O fluxo é:

```text
Estado puro → SVG DOM visível → clone exportável → serialização SVG
                                          └──────→ Image → Canvas offscreen → PNG
```

O contrato estrutural do SVG é:

1. **Camada exportável:** fundo do artboard, labels, cordas, trastes, marcadores de posição e notas.
2. **Camada de edição SVG:** crosshair, foco e contorno de seleção, identificada por
   `data-editor-layer` e removida do clone exportável.
3. **Grade HTML semântica:** botões transparentes cobrem as posições da janela e consomem a mesma
   lista ordenada de cordas/casas usada pelo renderer. Roving tabindex mantém um único botão na
   ordem de Tab; setas navegam, `Enter`/`Space` cria ou seleciona e `Delete`/`Backspace` remove a
   seleção conforme a spec. O botão focado aciona o desenho de foco na camada de edição SVG.
4. **Nut:** faixa adjacente com seis alvos de corda solta/abafada. Ela não conta como casa da janela.
   O pior caso de performance contém 72 posições fretadas + seis alvos do nut.
5. **Snapshot standalone:** clone sem camadas de edição, handlers ou atributos interativos; recebe
   dimensões, namespace, estilos/tokens resolvidos e somente conteúdo validado.
6. **Segurança:** labels entram em nós `<text>` por `textContent`; nenhum elemento, atributo, URL ou
   estilo deriva do label.

Matriz de validação da implementação:

- teclado: Chrome, Firefox e Safari estáveis;
- semântica assistiva: Chrome e Safari estáveis com VoiceOver no macOS;
- uma falha nessa matriz é bug da camada HTML semântica e não muda a escolha do renderer visual;
- se o overlay passar a desenhar conteúdo ou mantiver geometria/estado independentes do renderer,
  este ADR deve ser superseded antes de adotar a alternativa C.

Medidas verificáveis:

- tamanho: `wc -c index.html` deve retornar no máximo 51.200 bytes do arquivo-fonte UTF-8;
- performance: no Chrome estável da máquina de desenvolvimento, p95 abaixo de 16 ms para 100
  atualizações após dez aquecimentos, com 72 posições fretadas + seis alvos do nut;
- paridade: SVG baixado e entrada da rasterização PNG usam a mesma serialização do clone exportável.

## Consequences

- **Positive:** elimina os renderers manuais paralelos e reduz a causa estrutural do drift atual.
- **Positive:** torna cada posição nomeável, focável e acionável por controles HTML nativos sem uma
  grade visual duplicada.
- **Positive:** SVG e PNG compartilham composição, tokens e conteúdo por construção.
- **Positive:** `viewBox` preserva geometria estável enquanto a janela de casas muda por viewport.
- **Negative:** exige sincronizar o foco da grade HTML com a camada de edição do SVG.
- **Negative:** rasterização PNG passa a ser assíncrona e precisa tratar falha de carregamento.
- **Negative:** snapshot standalone exige materializar estilos que hoje dependem de CSS da página.
- **Neutral / to monitor:** o limite de 51.200 bytes pode pressionar testes/helpers embutidos; não
  autoriza remover controles de segurança ou acessibilidade.
- **Neutral / to monitor:** a validação VoiceOver pode exigir ajustes nos nomes e agrupamentos HTML,
  sem alterar a árvore visual canônica.

## Trade-offs

Aceita-se uma projeção HTML de interação e mais disciplina no pipeline de snapshot para eliminar o
custo permanente de sincronizar Canvas, dois desenhos e exportador. A solução otimiza manutenção,
acessibilidade e paridade — não throughput gráfico, que não é restrição na escala 6×12.

O estado musical, histórico e cálculo geométrico permanecem funções puras e independentes de APIs
SVG. Isso mantém reversibilidade: outro renderer pode consumir o mesmo estado se requisitos futuros
mudarem. Um novo ADR será necessário se o produto passar a exibir centenas de elementos simultâneos,
exigir renderização contínua medida ou se a grade HTML se tornar um segundo renderer de fato.
