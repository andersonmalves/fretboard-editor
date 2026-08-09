# ADR 002 — Orçamento de bytes para transpor forma

**Status:** Accepted
**Date:** 2026-08-09
**Spec:** [`specs/transpose-shape.md`](../specs/transpose-shape.md)
**Relacionado:** [`adr/001-svg-canonico-grade-html-semantica.md`](001-svg-canonico-grade-html-semantica.md)
  (renderer e contrato SVG/HTML **permanecem**; este ADR **substitui apenas o teto de bytes**)

## Context

O produto é uma SPA autocontida em `index.html`, sem build nem dependências de runtime. O ADR 001
fixou o teto verificável em **57.344 bytes** (`56 × 1024`), alinhado à spec pai
[`fretboard-editor.md`](../specs/fretboard-editor.md) (AC-32 / quality attributes).

Medição atual na Discovery desta feature:

- `wc -c index.html` ≈ **56.492** bytes;
- folga sob 57.344 ≈ **852** bytes.

A feature aprovada em produto — **transpor forma (±1 casa)** — exige controles na command bar,
mutação de estado, anúncios `aria-live`, estados disabled e cobertura mínima de UX. Estimativa
conservadora do delta no fonte: **≈ 1,0–1,6 KiB**, o que estoura a folga sem cortar a11y,
rótulos ou segurança.

Fonte atual: requisito da spec lite `transpose-shape` (AC-T8/AC-T9) e restrição vigente de arquivo
único UTF-8 medido por `wc -c`.

## Problem

Qual teto de bytes deve vigorar para o `index.html` fonte, de modo a caber a UI de transposição
sem minificar o fonte, sem remover controles de acessibilidade/segurança e sem abandonar o
contrato de SPA autocontida?

## Alternatives Considered

### A. Manter 57.344 e caber por compressão agressiva

- **Pros:** não muda o contrato numérico já publicado; força disciplina.
- **Cons:** 852 B de folga não cobrem UI + lógica + strings pt-BR com margem; comprimir nomes/
  remover labels acessíveis ou comentários de invariantes degradaria a11y e manutenção; risco de
  regressão só para “passar no `wc`”.

### B. Entregar a feature cortando outra capacidade existente

- **Pros:** teto inalterado.
- **Cons:** remove valor já entregue (cores, ligações, título, etc.) para ganhar bytes; não há
  candidato óbvio sem prejuízo de produto; fora do escopo pedido.

### C. Subir o teto em +2 KiB → **59.392** (`58 × 1024`)

- **Pros:** acomoda o delta estimado com margem (~1–2 KiB após a feature); mantém a métrica
  simples (`N × 1024`); preserva fonte legível, a11y e CSP; decisão reversível por ADR futuro se
  o arquivo estabilizar menor.
- **Cons:** relaxa a pressão que vinha limitando crescimento; exige atualizar AC-32, README e
  checks que citam 57.344.

### D. Subir para 61.440 (`60 × 1024`) “por folga futura”

- **Pros:** mais folga para features seguintes.
- **Cons:** sobe o teto sem necessidade mensurável atual (modo graus etc. não são requisito
  desta mudança); viola YAGNI do contrato de rastreabilidade.

## Decision

Adotar a alternativa **C**. O limite verificável passa a ser:

```text
wc -c index.html  →  ≤ 59.392
```

Este ADR **substitui o teto de 57.344 bytes** declarado no ADR 001 (Context, Medidas verificáveis e
Consequence “Neutral / to monitor” sobre o limite numérico). A decisão de renderer do ADR 001
(SVG canônico + grade HTML semântica + Canvas só offscreen) **não** é alterada.

Ao aceitar este ADR e implementar `transpose-shape`, atualizar na mesma entrega (ou imediatamente
após o aceite): AC-32 / quality attributes da spec pai, README e qualquer check de step que ainda
cite 57.344.

## Consequences

- **Positive:** permite a feature de transposição com UI mínima e a11y sem minificar o fonte.
- **Positive:** mantém a regra operacional clara (`wc -c` no fonte UTF-8, sem artefato minificado).
- **Negative:** o orçamento fica menos apertado; features futuras ainda precisam justificar bytes
  (não há autorização implícita para crescimento contínuo).
- **Neutral / to monitor:** se após a implementação `wc -c` estabilizar com folga grande e
  previsível, um ADR posterior pode rebaixar o teto; se novas features exigirem >59.392, novo ADR
  com medição e escopo atuais — não antecipar 60 KiB “por precaução”.

## Trade-offs

Troca-se ~2 KiB de teto por capacidade pedagógica (shapes móveis) sem abrir build, rede ou
framework. Prefere-se subir o limite documentado a cortar a11y ou comprimir o fonte até a
ilegibilidade. O gatilho para novo ADR de orçamento é: feature aprovada cujo delta medido no
protótipo ou na implementação estoure a folga restante sob 59.392.
