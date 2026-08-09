# Passo 2: Seleção, edição e histórico recuperável

## Goal

Permitir selecionar, editar, remover, limpar e recuperar marcadores sem perda acidental de trabalho.

## Tarefas

1. Em `index.html`, separar conteúdo do diagrama de estado efêmero do editor e implementar histórico de até 50 estados conforme a spec.
2. Fazer clique/ativação em marcador existente selecionar sem remover e preencher o inspetor contextual.
3. Aplicar tipo e label ao marcador selecionado; remover somente por ação explícita ou `Delete`/`Backspace`.
4. Implementar undo/redo para criação, edição, remoção, limpeza e mudança de afinação; nova mutação após undo limpa `future`.
5. Preservar posições ao mudar afinação, reservar `Esc` para cancelar/deselecionar e anunciar mutações em `aria-live`.
6. Executar e registrar no navegador local a sequência reproduzível criar → selecionar por teclado
   → editar → remover → undo → redo → nova mutação, verificando controles, marcador e região viva.

## Delta de complexidade planejado

- Abstrações: `commitContent`, `undo` e `redo` → AC-7, AC-8, AC-22 e AC-30 exigem uma política única de snapshots.
- Dependências: none.
- Configuração: none.
- Extension points: none.
- Camadas arquiteturais: none; estado e funções permanecem no arquivo único existente.

## Fora de Escopo

- Navegação responsiva por janelas de casas.
- Tokens visuais finais e contraste.
- Rasterização PNG.

## Critério de Pronto

- AC-4, AC-5, AC-6, AC-7, AC-8, AC-13, AC-21, AC-22 e AC-30 passam.
- Anúncios das mutações cobertas pelo passo funcionam; AC-16 fecha no Passo 5 com todos os erros.
- Limpar e mudar afinação nunca descartam posições de forma irrecuperável.
- Controles desabilitados refletem ausência de seleção ou histórico.

## Dependências

- Passo 1.

## Checklist pré-handoff

- [ ] Um arquivo lógico de produção afetado: `index.html`.
- [ ] Uma preocupação vertical: edição recuperável do diagrama.
- [ ] Histórico não captura seleção, ferramenta, label em digitação ou navegação.
- [ ] Paths reais, fora de escopo e critério de pronto definidos.
- [ ] Toda complexidade aponta para AC atual.

---

## Prompt de handoff

```text
Implemente APENAS o passo abaixo — não expanda escopo.

Files:
- @index.html

Out of scope:
- responsividade final
- direção visual final
- PNG

Done criteria:
- cumprir o Critério de Pronto do Passo 2

Siga as convenções do repositório.

---

@specs/steps/fretboard-editor-step-2.md
@specs/fretboard-editor.md
@adr/001-svg-canonico-grade-html-semantica.md
```
