# ADR 004 — Orçamento de bytes para pan da janela

**Status:** Accepted
**Date:** 2026-08-10
**Spec:** [`specs/pan-window.md`](../specs/pan-window.md)
**Relacionado:** [`adr/003-budget-bytes-intercambio-json.md`](003-budget-bytes-intercambio-json.md)
  (renderer e contrato SVG/HTML **permanecem**; este ADR **substitui apenas o teto de bytes**)

## Context

O produto é uma SPA autocontida em `index.html`, sem build nem dependências de runtime. O ADR 003
fixou o teto verificável em **65.536 bytes** (`64 × 1024`).

Medição atual na Discovery desta feature:

- `wc -c index.html` ≈ **65.533** bytes;
- folga sob 65.536 ≈ **3** bytes.

A feature aprovada em produto — **pan horizontal da janela do braço** — exige handlers de pointer,
`touch-action`, slop de gesto, `aria-label` descritivo, affordance de cursor e ajustes de ajuda
contextual. A auditoria de UI pós-implementação acrescenta rótulos acessíveis e feedback visual.
Estimativa conservadora do delta no fonte: **≈ 400–700 B**, o que estoura a folga sem cortar a11y.

## Problem

Qual teto de bytes deve vigorar para o `index.html` fonte, de modo a caber o pan da janela e os
ajustes de a11y/UX sem minificar o fonte nem remover controles de acessibilidade?

## Alternatives Considered

### A. Manter 65.536 e caber por compressão agressiva

- **Pros:** não muda o contrato numérico já publicado.
- **Cons:** 3 B de folga não cobrem gesto + strings pt-BR + cursor; comprimir degradaria a11y.

### B. Entregar a feature cortando outra capacidade existente

- **Pros:** teto inalterado.
- **Cons:** remove valor já entregue; fora do escopo pedido.

### C. Subir o teto em +3 KiB → **68.608** (`67 × 1024`)

- **Pros:** acomoda o delta estimado com margem (~2,7 KiB de folga); mantém `N × 1024`.
- **Cons:** sobe o teto além do mínimo estrito.

## Decision

Adotar a alternativa **C**. O limite verificável passa a ser:

```text
wc -c index.html  →  ≤ 68.608
```

Este ADR **substitui o teto de 65.536 bytes** declarado no ADR 003. A decisão de renderer do ADR
001 (SVG canônico + grade HTML semântica + Canvas só offscreen) **não** é alterada.

## Consequences

- **Positive:** permite pan da janela com a11y e affordance visual sem minificar o fonte.
- **Positive:** mantém a regra operacional clara (`wc -c` no fonte UTF-8).
- **Negative:** o orçamento fica menos apertado; features futuras ainda precisam justificar bytes.
- **Neutral / to monitor:** se após a implementação `wc -c` estabilizar com folga grande, um ADR
  posterior pode rebaixar o teto; se novas features exigirem >68.608, novo ADR com medição atual.

## Trade-offs

Troca-se ~3 KiB de teto por navegação gestual da janela com descoberta e rótulos acessíveis.
Prefere-se subir o limite documentado a cortar a11y ou comprimir o fonte até a ilegibilidade.
