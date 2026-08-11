# ADR 006 — Orçamento de bytes para controles de seleção

**Status:** Accepted
**Date:** 2026-08-11
**Relacionado:** [`adr/005-budget-bytes-minimap-mobile.md`](005-budget-bytes-minimap-mobile.md)
  (renderer e contrato SVG/HTML **permanecem**; este ADR **substitui apenas o teto de bytes**)

## Context

O produto é uma SPA autocontida em `index.html`, sem build nem dependências de runtime. O ADR 005
fixou o teto verificável em **71.680 bytes** (`70 × 1024`).

Antes da melhoria de usabilidade, o arquivo media **71.598 bytes**, deixando apenas **82 bytes** de
folga. Alvos de cor com 28×28 px, a ação de ligação misturada aos estilos de marcador e feedback
visual pouco explícito exigiam correções de UX e acessibilidade. Após a mudança, o artefato mede
**71.395 bytes**.

## Problem

Qual teto deve vigorar para acomodar controles de seleção com alvos de 44×44 px, hierarquia mais
clara e confirmação visual, sem comprimir o fonte até a ilegibilidade nem cortar acessibilidade?

## Alternatives Considered

### A. Manter 71.680 bytes

- **Pros:** preserva o contrato numérico anterior.
- **Cons:** o comportamento aprovado excede o teto e não resta margem para correções pequenas.

### B. Ajustar o teto exatamente ao tamanho atual

- **Pros:** menor aumento possível.
- **Cons:** recria imediatamente o problema de orçamento sem folga.

### C. Adotar 72 KiB → **73.728 bytes** (`72 × 1024`)

- **Pros:** número redondo, verificável e com 2.333 bytes de folga sobre a implementação atual.
- **Cons:** aumenta o teto em 2 KiB.

## Decision

Adotar a alternativa **C**. O limite verificável passa a ser:

```text
wc -c index.html  →  ≤ 73.728
```

Este ADR **substitui o teto de 71.680 bytes** declarado no ADR 005. A decisão de renderer do ADR
001 (SVG canônico + grade HTML semântica + Canvas só offscreen) **não** é alterada.

## Consequences

- **Positive:** preserva alvos touch, feedback de seleção e legibilidade do fonte.
- **Positive:** mantém quase 2 KiB de margem para manutenção corretiva.
- **Negative:** features futuras continuam obrigadas a justificar novo aumento.
- **Neutral / to monitor:** o orçamento deve ser revisto por ADR se a folga ficar novamente abaixo
  do necessário para uma mudança aprovada.

## Trade-offs

Troca-se 2 KiB de teto por controles de seleção mais claros e acessíveis. A margem é deliberadamente
menor que os aumentos anteriores de 3 KiB: acomoda a mudança atual sem transformar o limite em meta.
