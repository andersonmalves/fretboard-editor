# Transpor forma (±casa)

> **Formato:** spec lite

**Feature slug:** `transpose-shape`
**Date:** 2026-08-09
**Status:** approved
**Spec pai:** [`fretboard-editor.md`](fretboard-editor.md)
**ADR:** [`adr/002-budget-bytes-transpor-forma.md`](../adr/002-budget-bytes-transpor-forma.md)

---

## Goal

Permitir que a pessoa desloque toda a forma do diagrama uma casa para cima ou para baixo,
preservando a geometria relativa, para estudar shapes móveis sem redesenhar marcadores e ligações.

## Non-goals

- Transpor por corda (±string) ou por intervalo musical arbitrário.
- Campo numérico ou atalho para deslocar N casas de uma vez (somente ±1 nesta entrega).
- Autoajustar a janela `startFret` após a transposição.
- Seleção parcial: a operação sempre considera **todos** os marcadores do diagrama.
- Persistência, templates, outros instrumentos ou qualquer mudança que contradiga os non-goals da
  spec pai.
- Minificar ou remover a11y/segurança para “caber” no teto antigo de bytes.

## Premissas (Discovery)

- Marcadores guardam `fret` absoluto em `0..24`; ligações referenciam `id` estável — mover casas
  sem trocar ids preserva as ligações automaticamente.
- Notas automáticas e rótulos vazios já recalculam a partir de afinação + posição; rótulo
  customizado permanece literal.
- `muted` só é válido na casa 0; `filled` na casa 0 normaliza para `outline` (invariantes da spec
  pai).
- Folga atual ≈ 852 B sob o teto de 57.344; a UI mínima de ±1 casa não cabe com margem segura —
  o teto sobe via ADR 002.
- Consideração futura (não vira AC): ±N casas, ±corda, atalho de teclado dedicado.

## Acceptance criteria

Cobertura: `tests/transpose-shape.spec.js` (+ orçamento/rede em `tests/export.spec.js` para AC-T9).

- [x] AC-T1: Com um ou mais marcadores, acionar **+1 casa** incrementa o `fret` de **todos** os
  marcadores em 1; **−1 casa** decrementa em 1. Cordas, cores, rótulos customizados e ids
  permanecem iguais.
- [x] AC-T2: Ligações existentes continuam conectando os mesmos marcadores após a transposição
  (sem recriar pares) e aparecem na exportação SVG/PNG nas novas posições quando visíveis.
- [x] AC-T3: Se **qualquer** marcador resultaria em `fret < 0` ou `fret > 24`, a operação é
  rejeitada por completo: nenhum marcador muda, nenhum snapshot de histórico é criado, e a região
  `aria-live` anuncia o erro em pt-BR.
- [x] AC-T4: Diagrama sem marcadores: os controles de transpor ficam desabilitados (ou equivalentes
  não acionáveis) e não criam histórico.
- [x] AC-T5: Uma transposição bem-sucedida cria **um** snapshot de undo; undo restaura frets e tipos
  anteriores; redo reaplica. Título, afinação, ferramenta ativa e `startFret` não mudam pela
  operação.
- [x] AC-T6: Após mover, tipos respeitam os invariantes do nut: `muted` que deixa a casa 0 vira
  `filled`; `filled` que chega à casa 0 vira `outline`; demais tipos permanecem.
- [x] AC-T7: Notas automáticas (rótulo vazio) refletem as novas casas; rótulos customizados não são
  alterados; seleção atual (se houver) permanece no mesmo marcador.
- [x] AC-T8: UI mínima na command bar: dois botões **−1 casa** e **+1 casa**, com nome acessível
  explícito (ex.: “Transpor forma uma casa em direção ao nut” / “… em direção ao corpo”), alvo
  tátil ≥ 44×44 px em viewport touch, e anúncio `aria-live` de sucesso (ex.: “Forma transposta uma
  casa para cima.”).
- [x] AC-T9: `wc -c index.html` ≤ **59.392** (teto do ADR 002); sem rede em runtime; sem framework.

## Comportamento canônico

```text
Δ ∈ {-1, +1}
se markers vazio → no-op (controles disabled)
se ∃ marker com fret+Δ ∉ [0, 24] → rejeitar (erro vivo, sem commit)
senão → para cada marker: fret' = fret+Δ; type' = normalizeTypeAfterTranspose(type, fret')
         ids/cores/customLabel/connections intactos
         um commitContent / um anúncio de sucesso
         startFret, título, afinação e EditorState sticky inalterados
         linkFrom efêmero é limpo
```

`normalizeTypeAfterTranspose(type, fret)`:

| Antes | fret' | Depois |
|---|---|---|
| `muted` | `> 0` | `filled` |
| `filled` | `0` | `outline` |
| demais | qualquer | inalterado |

Colisões `stringIndex + fret` não ocorrem com deslocamento uniforme sem clamp parcial; a rejeição
atômica nas bordas evita estados inválidos.

Marcadores que saem da janela visível permanecem no estado (aviso/legenda existentes); a janela
**não** auto-desloca nesta entrega.

## Implementation plan

Após aprovação explícita desta spec e do ADR 002:

1. Entregar UI ±1 casa, mutação atômica de frets com normalização de tipo, histórico/undo,
   anúncios a11y e regressão Playwright cobrindo AC-T1..T9 sob o novo teto de bytes.

(Um único atomic step: uma preocupação vertical; envelope ≤5 arquivos lógicos típicos:
`index.html`, spec/ADR já aprovados, 1–2 specs de teste, page object se necessário.)

## Open questions

- Nenhuma bloqueante para aprovação. Auto-pan da janela e ±N / ±corda ficam como consideração
  futura se o uso real pedir.
