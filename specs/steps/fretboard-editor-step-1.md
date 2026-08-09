# Passo 1: Criação musical em SVG canônico

## Goal

Entregar o fluxo criar marcador → mostrar nota correta → exportar SVG usando uma única árvore visual e uma grade HTML semântica.

## Tarefas

1. Em `index.html`, substituir o Canvas visível por SVG canônico em camadas exportável/editor e por uma grade de botões HTML sobreposta conforme o ADR 001.
2. Implementar presets ordenados de `E4` a `E2`, parser de sustenidos/bemóis, estilo de acidente por preset e cálculo de nota com oitava para o nome acessível.
3. Renderizar cordas, casas, nut adjacente, marcadores de posição — inclusive casa 12 dupla — e marcador criado com nota automática.
4. Normalizar label com trim, seis caracteres visíveis e rejeição de caracteres de controle; inserir texto somente por `textContent`.
5. Exportar SVG a partir de clone standalone sem camada de edição, handlers ou atributos interativos.
6. Verificar criação por clique, toque simulado, `Enter`/`Space`, presets e labels hostis em navegador local.

## Delta de complexidade planejado

- Abstrações: funções puras de nota, geometria e snapshot → AC-2, AC-3, AC-18, AC-29 e ADR 001 exigem uma fonte única reutilizada por tela/exportação.
- Dependências: none.
- Configuração: none.
- Extension points: none.
- Camadas arquiteturais: projeção visual SVG + projeção HTML de interação → ADR 001 e AC-13/AC-36; ambas consomem o mesmo estado/geometria.

## Fora de Escopo

- Seleção e edição de marcador existente.
- Undo/redo e ações destrutivas.
- Redesign responsivo completo e rasterização PNG.

## Critério de Pronto

- AC-1, AC-2, AC-3, AC-10, AC-18 (SVG), AC-19, AC-24, AC-27, AC-29 e AC-34 passam.
- O caminho de criação por `Enter`/`Space` requerido por AC-13 funciona; seleção por teclado fecha no Passo 2.
- `index.html` abre sem erro e não contém Canvas como renderer visual.
- Label `<>&"'` permanece texto no DOM e no SVG baixado.

## Dependências

- ADR 001 Accepted.

## Checklist pré-handoff

- [ ] Um arquivo lógico de produção afetado: `index.html`.
- [ ] Uma preocupação vertical: criação musical acessível e SVG exportável.
- [ ] Nenhuma fragmentação por camada; comportamento e verificação permanecem juntos.
- [ ] Paths reais, fora de escopo e critério de pronto definidos.
- [ ] Toda complexidade aponta para AC atual ou ADR aceito.

---

## Prompt de handoff

```text
Implemente APENAS o passo abaixo — não expanda escopo.

Files:
- @index.html

Out of scope:
- seleção/edição de marcador existente
- undo/redo
- responsividade final
- PNG

Done criteria:
- cumprir o Critério de Pronto do Passo 1

Siga as convenções do repositório.

---

@specs/steps/fretboard-editor-step-1.md
@specs/fretboard-editor.md
@adr/001-svg-canonico-grade-html-semantica.md
```
