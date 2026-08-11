# Intercâmbio de diagramas em JSON

> **Formato:** spec lite

**Feature slug:** `diagram-interchange`
**Date:** 2026-08-10
**Status:** approved
**Spec pai:** [`fretboard-editor.md`](fretboard-editor.md)
**ADR:** [`adr/003-budget-bytes-intercambio-json.md`](../adr/003-budget-bytes-intercambio-json.md)

---

## Goal

Permitir que a pessoa exporte o diagrama completo para um arquivo JSON e importe um arquivo JSON
válido, restaurando afinação, título, marcadores, ligações e janela de visualização, sem rede nem
persistência automática entre sessões.

## Non-goals

- `localStorage`, cookies, contas ou sincronização em nuvem.
- Importar SVG/PNG como fonte de edição.
- Mesclar parcialmente com o diagrama atual (importação substitui o conteúdo).
- Diálogo de confirmação antes de importar (substituição é desfazível).
- Múltiplas versões de schema simultâneas além de `schemaVersion: 1`.
- Minificar ou remover a11y/segurança para caber no teto antigo de bytes.

## Premissas (Discovery)

- O estado musical canônico já é `DiagramContent` na spec pai; notas automáticas não são
  persistidas.
- `startFret` é estado de viewport (`EditorState`), não entra no histórico undo/redo, mas melhora
  a experiência ao importar.
- Folga atual ≈ 557 B sob o teto de 59.392; a feature não cabe com margem segura — o teto sobe via
  ADR 003.

## Formato v1

```json
{
  "schemaVersion": 1,
  "tuningPresetId": "standard",
  "diagramTitle": "FRETBOARD / 06 STRING",
  "startFret": 0,
  "markers": [],
  "connections": []
}
```

Campos de marcador e ligação seguem os invariantes da spec pai (`id`, `stringIndex`, `fret`, `type`,
`color`, `customLabel`; conexões com `a`, `b`, `color`).

## Acceptance criteria

Cobertura: `tests/diagram-interchange.spec.js` (+ orçamento em `tests/export.spec.js` para AC-J9).

- [x] AC-J1: **Baixar JSON** serializa `schemaVersion`, `tuningPresetId`, `diagramTitle`,
  `startFret`, todos os marcadores (inclusive fora da janela visível) e todas as ligações.
- [x] AC-J2: O basename do download segue o mesmo sanitizador de SVG/PNG; extensão `.json`.
- [x] AC-J3: **Importar JSON** válido substitui o diagrama em um snapshot de undo; `aria-live`
  anuncia sucesso; `startFret` é restaurado.
- [x] AC-J4: JSON inválido (parse, schema, afinação, marcadores, ligações, tamanho) não altera o
  estado; `aria-live` anuncia erro seguro em pt-BR.
- [x] AC-J5: Undo após importação restaura o diagrama anterior integralmente.
- [x] AC-J6: Validação reutiliza normalizadores existentes (`normalizeDiagramTitle`,
  `normalizeLabel`, `normalizeType`, paleta `MARKER_COLORS`, presets `TUNINGS`).
- [x] AC-J7: Arquivo limitado a 64 KiB; no máximo 150 marcadores; conexões sem duplicata e com ids
  existentes.
- [x] AC-J8: UI mínima na command bar: **Baixar JSON** e **Importar JSON** (input oculto
  `accept="application/json,.json"`), alvos táteis ≥ 44×44 px.
- [x] AC-J9: `wc -c index.html` ≤ **65.536** (teto do ADR 003); sem rede em runtime.

## Threat model (delta)

| Boundary | Entrada | Controle |
|---|---|---|
| Arquivo JSON → estado | Texto não confiável | `JSON.parse` + validação fail-fast; limites de tamanho e contagem; normalização de strings |
| Estado → arquivo JSON | Dados do diagrama | `JSON.stringify` de campos validados; sem markup |

## Comportamento canônico

```text
Exportar → serializeDiagram() → Blob application/json → triggerDownload
Importar → FileReader → parseDiagramDocument → commitContent (replace) → setStartFret → render
Erro em qualquer etapa de validação → announce erro, estado intacto
```
