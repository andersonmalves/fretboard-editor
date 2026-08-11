# ADR 007 — Orçamento de bytes para feedback sonoro

**Status:** Accepted
**Date:** 2026-08-11
**Relacionado:** [`adr/006-budget-bytes-selection-controls.md`](006-budget-bytes-selection-controls.md)
  (o contrato funcional permanece; este ADR substitui apenas o teto de bytes)

## Context

O produto é uma SPA autocontida em `index.html`, sem build nem dependências de runtime. O ADR 006
fixou o teto em **73.728 bytes** (`72 × 1024`). Após o redesign dos controles, o arquivo media
**73.671 bytes**, deixando 57 bytes de folga.

O feedback sonoro aprovado adiciona um controle acessível, estado efêmero e síntese curta via Web
Audio API. A implementação mede **75.185 bytes** e mantém todo o áudio local, sem asset ou conexão
externa.

## Problem

Qual teto acomoda o feedback auditivo e preserva margem de manutenção sem minificar o fonte até
prejudicar a revisão?

## Alternatives Considered

### A. Manter 72 KiB

- **Pros:** não altera o contrato numérico.
- **Cons:** exige remover legibilidade ou funcionalidade já aprovada e não deixa margem corretiva.

### B. Adotar 74 ou 75 KiB

- **Pros:** menor aumento imediato.
- **Cons:** deixa entre 591 e 1.615 bytes, abaixo da margem recente do projeto.

### C. Adotar 76 KiB → **77.824 bytes** (`76 × 1024`)

- **Pros:** número redondo e verificável, com 2.639 bytes de folga sobre a implementação.
- **Cons:** aumenta o teto anterior em 4 KiB.

## Decision

Adotar a alternativa **C**:

```text
wc -c index.html  →  ≤ 77.824
```

Este ADR substitui somente o teto do ADR 006. A SPA continua autocontida, sem dependências de
runtime, persistência ou rede.

## Consequences

- **Positive:** comporta síntese Web Audio e controle acessível sem asset externo.
- **Positive:** recupera margem para manutenção corretiva.
- **Negative:** o artefato pode crescer até 4 KiB além do teto anterior.
- **Neutral / to monitor:** nova ampliação continua exigindo decisão explícita em ADR.

## Trade-offs

Aceita-se crescimento limitado do documento em troca de feedback auditivo imediato e código ainda
revisável. O teto permanece um limite, não uma meta.
