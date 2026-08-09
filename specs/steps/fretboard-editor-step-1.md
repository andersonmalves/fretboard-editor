# Step 1: Scaffold — HTML structure, CSS, musical constants

**Feature:** fretboard-editor
**Covers AC:** AC-1 (render grid with string labels)

## Contract

- `index.html` com HTML semântico, CSS embutido e constantes musicais
- Toolbar com placeholder para todos os controles
- Canvas ready com dimensionamento HiDPI
- Constantes: `CHROMATIC`, `DEFAULT_TUNING`, helpers `noteToSemitone`/`semitoneToNote`

## Verification

- [x] Abrir `index.html` mostra toolbar e canvas
- [x] Afinações predefinidas no select
- [x] Canvas dimensionado com devicePixelRatio
