# Passo 1: Transpor forma (±1 casa)

## Goal

Entregar deslocamento atômico de todos os marcadores em ±1 casa, com UI na command bar,
histórico único, normalização de tipo no nut e anúncios `aria-live`, sob o teto do ADR 002.

## Tarefas

1. Em `index.html`, adicionar botões **−1 casa** / **+1 casa** na command bar (alvo ≥ 44×44,
   nomes acessíveis, desabilitados sem marcadores).
2. Implementar mutação atômica de `fret` com rejeição nas bordas `0..24` (sem snapshot),
   normalização `muted`→`filled` / `filled`→`outline`, preservação de ids/cores/rótulos/ligações,
   limpeza de `linkFrom`, um `commitContent` e anúncio de sucesso; sem auto-pan de `startFret`.
3. Estender o page object e cobrir AC-T1..T9 em Playwright; atualizar o check de bytes para
   **59.392**.
4. Verificar `wc -c index.html ≤ 59392` e a suíte relevante.

## Delta de complexidade planejado

- Abstrações: none.
- Dependências: none.
- Configuração: none.
- Extension points: none.
- Camadas arquiteturais: none.

## Fora de Escopo

- Transpor por corda, ±N casas, atalho de teclado dedicado.
- Autoajustar `startFret` após a operação.
- CI, README além do já alinhado ao ADR 002, outras features.

## Critério de Pronto

- AC-T1..AC-T9 da spec `transpose-shape` passam com evidência Playwright + `wc -c`.
- `git diff --check` limpo no escopo tocado.
- Envelope ≤5 arquivos lógicos de implementação/teste.

## Dependências

- Spec `transpose-shape` aprovada e ADR 002 **Accepted**.

## Arquivos previstos

- `index.html`
- `tests/fretboard-page.js`
- `tests/transpose-shape.spec.js`
- `tests/export.spec.js` (teto de bytes)

## Checklist pré-handoff

- [ ] Uma preocupação vertical: transpor forma ±1 casa.
- [ ] Paths reais, fora de escopo e critério de pronto definidos.
- [ ] Toda complexidade aponta para AC atual ou ADR aceito (nenhuma prevista).

---

## Prompt de handoff

```text
Implemente APENAS o passo abaixo — não expanda escopo.

Files:
- @index.html
- @tests/fretboard-page.js
- @tests/transpose-shape.spec.js
- @tests/export.spec.js

Out of scope:
- ±corda / ±N / auto-pan
- CI / outras features

Done criteria:
- cumprir o Critério de Pronto do Passo 1

Siga as convenções do repositório.

---

@specs/steps/transpose-shape-step-1.md
@specs/transpose-shape.md
@adr/002-budget-bytes-transpor-forma.md
```
