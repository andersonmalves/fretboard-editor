# Step 6: Polish — teclas de atalho, responsividade, estilo

**Feature:** fretboard-editor
**Covers AC:** todos com verificação integrada

## Contract

- Teclas: 0-9 (casa inicial), Esc (limpar), F/O/X (tipo marcador), S (SVG), P (PNG)
- Canvas HiDPI com devicePixelRatio
- Tema escuro consistente
- Hover com indicador de posição e cursor pointer
- Afinações alternativas no select (Drop D, Eb, Open G, Open C)

## Verification

- [x] Tecla F muda para tipo preenchido
- [x] Tecla 5 posiciona casa inicial em 5
- [x] Não quebra em viewport 768px
- [x] Hover mostra círculo fantasma na posição
