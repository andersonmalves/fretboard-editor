# Passo 3: Janela responsiva e navegação 0..24

## Goal

Tornar todo o braço de 0 a 24 alcançável em mobile, tablet e desktop sem reduzir leitura ou alvos de interação.

## Tarefas

1. Em `index.html`, implementar seis casas em 390 px e doze casas a partir de 768 px, mantendo o nut como faixa adjacente.
2. Adicionar anterior/próxima e casa inicial para navegar por todo o intervalo, com clamp coerente no limite da casa 24.
3. Validar casa inicial vazia, não numérica ou fora do intervalo, preservar último estado válido e mostrar erro inline associado.
4. Estruturar command bar, workspace e inspetor para desktop; mover o inspetor abaixo do artboard no mobile.
5. Manter grade HTML, SVG e artboard alinhados sem conteúdo essencial em coordenada negativa.
6. Verificar alcance 0..24, zoom 200% e viewports 390/768/1440 em navegador local.

## Delta de complexidade planejado

- Abstrações: função de janela/clamp → AC-9, AC-11, AC-25 e AC-28 exigem uma única regra para viewport e controles.
- Dependências: none.
- Configuração: none.
- Extension points: none.
- Camadas arquiteturais: none.

## Fora de Escopo

- Recalibrar a paleta e tipografia finais.
- Alterar histórico além do necessário para manter navegação efêmera fora dos snapshots.
- Rasterização PNG.

## Critério de Pronto

- AC-9, AC-11, AC-12, AC-25 e AC-28 passam.
- Em 390/768/1440 px, `scrollWidth` não excede o viewport por conteúdo do app.
- Todas as posições 0..24 podem ser focadas e ativadas.

## Dependências

- Passo 2.

## Checklist pré-handoff

- [ ] Um arquivo lógico de produção afetado: `index.html`.
- [ ] Uma preocupação vertical: alcance responsivo do braço.
- [ ] Janela, validação e layout são verificados juntos.
- [ ] Paths reais, fora de escopo e critério de pronto definidos.
- [ ] Toda complexidade aponta para AC atual.

---

## Prompt de handoff

```text
Implemente APENAS o passo abaixo — não expanda escopo.

Files:
- @index.html

Out of scope:
- direção visual final
- mudanças no histórico fora da janela efêmera
- PNG

Done criteria:
- cumprir o Critério de Pronto do Passo 3

Siga as convenções do repositório.

---

@specs/steps/fretboard-editor-step-3.md
@specs/fretboard-editor.md
@adr/001-svg-canonico-grade-html-semantica.md
```
