# Pan horizontal da janela do braço

Adendo à [`fretboard-editor.md`](fretboard-editor.md). Move a janela visível (`startFret`) por arraste
horizontal na prancha, em mouse e touch, sem alterar undo/redo nem o conteúdo do diagrama.

## Comportamento

- Arraste contínuo na `#board-canvas`: distância horizontal mapeia para casas; esquerda aumenta
  `startFret`, direita diminui.
- Reutiliza `setStartFret` (clamp 0..`maxStartFret()`, foco, readout). Durante o arraste, atualizações
  são silenciosas; ao soltar, um único anúncio em `aria-live`.
- Toque/clique curto nas células continua criando/selecionando marcadores. Gestos com slop horizontal
  ≥ 8 px e predominância horizontal não disparam `click` fantasma na grade.
- Gestos mais verticais que horizontais não iniciam pan (scroll da página preservado via
  `touch-action: pan-y`).

## Critérios de aceite

- **AC-P1:** Arrastar ~uma largura de casa para a esquerda aumenta `startFret` em ~1 e atualiza o
  readout da janela.
- **AC-P2:** Arrastar até o limite superior fixa `startFret` em `maxStartFret()` sem erro.
- **AC-P3:** Toque curto em célula vazia cria marcador; arraste com slop na mesma célula muda a
  janela sem criar marcador.
- **AC-P4:** O `aria-label` da grade menciona arraste horizontal; teclado e botões ← → permanecem
  inalterados.
- **AC-P5:** Em viewport touch 390 px, o mesmo comportamento funciona via toque.
- **AC-P6:** `wc -c index.html` ≤ **77.824** (teto vigente no ADR 007); sem rede em runtime.
- **AC-P7:** O minimap na command bar mostra casas 0–24; ticks na janela visível usam
  `aria-pressed="true"`; clique em um tick chama `setStartFret` para essa casa.

## Fora de escopo

- Undo/redo de `startFret`; auto-pan após transposição; arraste vertical ou de marcadores.
