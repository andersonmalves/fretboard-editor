# Passo 4: Sistema visual e piso de acessibilidade

## Goal

Aplicar a direção “workspace de estúdio + artboard técnico” com tokens únicos, contraste, foco e linguagem consistentes.

## Tarefas

1. Em `index.html`, definir tokens semânticos canônicos e fazer UI/renderer consumirem esses papéis sem cores literais duplicadas.
2. Aplicar chrome grafite, artboard frio claro, seleção vermelho-laca, tipografia nativa de UI e monoespaçada para coordenadas.
3. Implementar régua/crosshair como elemento-assinatura e manter foco distinguível da seleção.
4. Garantir contraste 4,5:1 para texto, 3:1 para gráficos/foco e alvos principais 44×44 px em touch.
5. Padronizar pt-BR, nomes dos botões, `aria-pressed`, instruções e estados; respeitar `prefers-reduced-motion`.
6. Verificar teclado em Chrome/Firefox/Safari e semântica com VoiceOver em Chrome/Safari no macOS.

## Delta de complexidade planejado

- Abstrações: objeto/papéis de paleta lidos do CSS → AC-31 e ADR 001 exigem a mesma fonte para UI, SVG e snapshot.
- Dependências: none.
- Configuração: none.
- Extension points: none.
- Camadas arquiteturais: none.

## Fora de Escopo

- Novos comportamentos de domínio ou histórico.
- Temas alternativos.
- Rasterização PNG.

## Critério de Pronto

- AC-12, AC-14, AC-15, AC-17, AC-20, AC-33 e AC-36 passam.
- UI e SVG consomem a paleta canônica; AC-31 fecha no Passo 5 quando PNG existir.
- Busca por cores literais fora da definição canônica não encontra duplicação.
- A interface preserva hierarquia e legibilidade nos três viewports-alvo.

## Dependências

- Passo 3.

## Checklist pré-handoff

- [ ] Um arquivo lógico de produção afetado: `index.html`.
- [ ] Uma preocupação vertical: direção visual com piso de acessibilidade.
- [ ] Nenhuma identidade, fonte externa ou tema futuro foi introduzido.
- [ ] Paths reais, fora de escopo e critério de pronto definidos.
- [ ] Toda complexidade aponta para AC atual ou ADR aceito.

---

## Prompt de handoff

```text
Implemente APENAS o passo abaixo — não expanda escopo.

Files:
- @index.html

Out of scope:
- novos comportamentos de domínio
- temas alternativos
- PNG

Done criteria:
- cumprir o Critério de Pronto do Passo 4

Siga as convenções do repositório.

---

@specs/steps/fretboard-editor-step-4.md
@specs/fretboard-editor.md
@adr/001-svg-canonico-grade-html-semantica.md
```
