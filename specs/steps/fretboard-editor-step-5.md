# Step 5: Export — PNG e SVG

**Feature:** fretboard-editor
**Covers AC:** AC-6 (PNG export), AC-7 (SVG export)

## Contract

- PNG: `canvas.toDataURL('image/png')` com fundo do braço
- SVG: string template com todos os elementos visuais, sanitização HTML
- Download via `Blob` + `URL.createObjectURL` + link click

## Verification

- [x] PNG baixado tem fundo marrom do braço e marcadores visíveis
- [x] SVG aberto em editor vetorial mantém todos os elementos editáveis
- [x] Labels escapados contra XSS
