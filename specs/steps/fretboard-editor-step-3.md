# Step 3: Interaction — click to add/remove markers

**Feature:** fretboard-editor
**Covers AC:** AC-2 (click adds marker), AC-3 (click removes marker), AC-9 (X marker on nut)

## Contract

- `posFromXY()` mapeia coordenadas do canvas para {string, fret}
- `toggleMarker()` adiciona ou remove marcador
- Cálculo automático de nota via `noteAt(stringIdx, fret)`
- Hover mostra tooltip com string, casa e nota

## Verification

- [x] Clique na interseção adiciona círculo preenchido
- [x] Clique em marcador existente remove-o
- [x] Tooltip mostra "String X · Fret Y · Nota"
- [x] Notas calculadas corretamente (ex: corda 5 casa 3 = C)
