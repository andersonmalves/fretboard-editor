# ADR 003 — Orçamento de bytes para intercâmbio JSON

**Status:** Accepted
**Date:** 2026-08-10
**Spec:** [`specs/diagram-interchange.md`](../specs/diagram-interchange.md)
**Relacionado:** [`adr/002-budget-bytes-transpor-forma.md`](002-budget-bytes-transpor-forma.md)
  (renderer e contrato SVG/HTML **permanecem**; este ADR **substitui apenas o teto de bytes**)

## Context

O produto é uma SPA autocontida em `index.html`, sem build nem dependências de runtime. O ADR 002
fixou o teto verificável em **59.392 bytes** (`58 × 1024`).

Medição atual na Discovery desta feature:

- `wc -c index.html` ≈ **58.835** bytes;
- folga sob 59.392 ≈ **557** bytes.

A feature aprovada em produto — **importar e exportar diagramas em JSON** — exige controles na
command bar, serialização/validação do `DiagramContent`, `FileReader`, anúncios `aria-live` e
cobertura mínima de UX. Estimativa conservadora do delta no fonte: **≈ 1,0–1,8 KiB**, o que
estoura a folga sem cortar a11y, rótulos ou segurança.

## Problem

Qual teto de bytes deve vigorar para o `index.html` fonte, de modo a caber a UI e a lógica de
intercâmbio JSON sem minificar o fonte, sem remover controles de acessibilidade/segurança e sem
abandonar o contrato de SPA autocontida?

## Alternatives Considered

### A. Manter 59.392 e caber por compressão agressiva

- **Pros:** não muda o contrato numérico já publicado.
- **Cons:** 557 B de folga não cobrem UI + validação + strings pt-BR com margem; comprimir nomes
  ou remover labels acessíveis degradaria a11y e manutenção.

### B. Entregar a feature cortando outra capacidade existente

- **Pros:** teto inalterado.
- **Cons:** remove valor já entregue para ganhar bytes; fora do escopo pedido.

### C. Subir o teto em +2 KiB → **61.440** (`60 × 1024`)

- **Pros:** acomoda o delta estimado com margem; mantém a métrica simples (`N × 1024`).
- **Cons:** a estimativa inicial (≈ 1,0–1,8 KiB) subestimou a implementação com validação
  completa; medição pós-implementação ≈ **6,0 KiB** de delta.

### D. Subir para **65.536** (`64 × 1024`) com medição pós-implementação

- **Pros:** cobre o delta real (~6 KiB) com folga (~726 B); mantém `N × 1024`.
- **Cons:** sobe o teto além da estimativa inicial da Discovery.

## Decision

Adotar a alternativa **D**. O limite verificável passa a ser:

```text
wc -c index.html  →  ≤ 65.536
```

Este ADR **substitui o teto de 59.392 bytes** declarado no ADR 002. A decisão de renderer do ADR
001 (SVG canônico + grade HTML semântica + Canvas só offscreen) **não** é alterada.

## Consequences

- **Positive:** permite intercâmbio JSON com UI mínima e a11y sem minificar o fonte.
- **Positive:** mantém a regra operacional clara (`wc -c` no fonte UTF-8).
- **Negative:** o orçamento fica menos apertado; features futuras ainda precisam justificar bytes.
- **Neutral / to monitor:** se após a implementação `wc -c` estabilizar com folga grande, um ADR
  posterior pode rebaixar o teto; se novas features exigirem >61.440, novo ADR com medição atual.

## Trade-offs

Troca-se ~2 KiB de teto por capacidade de salvar e restaurar diagramas sem `localStorage`, rede ou
backend. Prefere-se subir o limite documentado a cortar a11y ou comprimir o fonte até a
ilegibilidade.
