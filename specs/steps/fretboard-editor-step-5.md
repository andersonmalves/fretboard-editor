# Passo 5: PNG, paridade e regressão final

## Goal

Entregar PNG derivado do snapshot SVG e fechar os requisitos de falha, paridade, performance e tamanho.

## Tarefas

1. Em `index.html`, rasterizar o mesmo snapshot standalone usado pelo download SVG em Canvas offscreen e baixar PNG.
2. Excluir crosshair, foco, seleção e controles dos dois formatos; materializar tokens e fontes no snapshot.
3. Tratar falha de serialização/rasterização com mensagem segura, preservar estado, permitir nova tentativa e revogar object URLs.
4. Medir p95 de 100 atualizações após dez aquecimentos no Chrome estável com 78 alvos.
5. Confirmar ausência de requisições de rede, `wc -c index.html <= 57344` e console sem warnings/errors nos fluxos cobertos.
6. Executar regressão funcional completa da spec em 390/768/1440 e comparar SVG/PNG visualmente.

## Delta de complexidade planejado

- Abstrações: `createExportSnapshot` e adaptador PNG → ADR 001, AC-18 e AC-26 exigem uma serialização compartilhada e um único estágio divergente.
- Dependências: none.
- Configuração: none.
- Extension points: none.
- Camadas arquiteturais: adaptador Canvas offscreen → ADR 001; não renderiza domínio nem mantém estado.

## Fora de Escopo

- Novos formatos de exportação.
- Persistência, compartilhamento ou backend.
- Outros instrumentos e temas.

## Critério de Pronto

- AC-16, AC-18, AC-23, AC-26, AC-31, AC-32 e AC-35 passam, sem regressão nos demais ACs.
- SVG e PNG contêm a mesma composição exportável.
- `git diff --check` e a regressão no navegador passam.

## Dependências

- Passo 4.

## Checklist pré-handoff

- [ ] Um arquivo lógico de produção afetado: `index.html`.
- [ ] Uma preocupação vertical: exportação PNG e fechamento verificável.
- [ ] O Canvas permanece apenas adaptador offscreen.
- [ ] Paths reais, fora de escopo e critério de pronto definidos.
- [ ] Toda complexidade aponta para AC atual ou ADR aceito.

---

## Prompt de handoff

```text
Implemente APENAS o passo abaixo — não expanda escopo.

Files:
- @index.html

Out of scope:
- novos formatos
- persistência/backend
- outros instrumentos/temas

Done criteria:
- cumprir o Critério de Pronto do Passo 5 e a regressão final

Siga as convenções do repositório.

---

@specs/steps/fretboard-editor-step-5.md
@specs/fretboard-editor.md
@adr/001-svg-canonico-grade-html-semantica.md
```
