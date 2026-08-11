# ADR 005 — Orçamento de bytes para minimap e barra mobile

**Status:** Accepted
**Date:** 2026-08-10
**Spec:** adendo de minimap em [`specs/pan-window.md`](../specs/pan-window.md)
**Relacionado:** [`adr/004-budget-bytes-pan-window.md`](004-budget-bytes-pan-window.md)
  (renderer e contrato SVG/HTML **permanecem**; este ADR **substitui apenas o teto de bytes**)

## Context

O produto é uma SPA autocontida em `index.html`, sem build nem dependências de runtime. O ADR 004
fixou o teto verificável em **68.608 bytes** (`67 × 1024`).

Medição na Discovery desta mudança:

- `wc -c index.html` ≈ **68.607** bytes;
- folga sob 68.608 ≈ **1** byte.

A adoção cirúrgica de padrões UX do redesign (minimap da janela 0–24, texto de afinação ativa e
barra rápida mobile) exige HTML, CSS e handlers adicionais sem comprimir a11y nem remover
capacidades existentes. Estimativa conservadora do delta: **≈ 800–1.400 B**.

## Problem

Qual teto de bytes deve vigorar para o `index.html` fonte, de modo a caber minimap, helper de
afinação e barra mobile sem minificar o fonte nem remover controles de acessibilidade?

## Alternatives Considered

### A. Manter 68.608 e caber por compressão agressiva

- **Pros:** não muda o contrato numérico já publicado.
- **Cons:** 1 B de folga não cobre três affordances novas; comprimir degradaria a11y.

### B. Entregar a feature cortando outra capacidade existente

- **Pros:** teto inalterado.
- **Cons:** remove valor já entregue; fora do escopo pedido.

### C. Subir o teto em +3 KiB → **71.680** (`70 × 1024`)

- **Pros:** acomoda o delta estimado com margem (~2,7 KiB de folga); mantém `N × 1024`.
- **Cons:** sobe o teto além do mínimo estrito.

## Decision

Adotar a alternativa **C**. O limite verificável passa a ser:

```text
wc -c index.html  →  ≤ 71.680
```

Este ADR **substitui o teto de 68.608 bytes** declarado no ADR 004. A decisão de renderer do ADR
001 (SVG canônico + grade HTML semântica + Canvas só offscreen) **não** é alterada.

## Consequences

- **Positive:** permite minimap, helper de afinação e barra mobile sem minificar o fonte.
- **Positive:** mantém a regra operacional clara (`wc -c` no fonte UTF-8).
- **Negative:** o orçamento fica menos apertado; features futuras ainda precisam justificar bytes.
- **Neutral / to monitor:** se após a implementação `wc -c` estabilizar com folga grande, um ADR
  posterior pode rebaixar o teto; se novas features exigirem >71.680, novo ADR com medição atual.

## Trade-offs

Troca-se ~3 KiB de teto por descoberta da janela de casas e ferramentas sempre visíveis no mobile.
Prefere-se subir o limite documentado a cortar a11y ou comprimir o fonte até a ilegibilidade.
