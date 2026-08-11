# Editor de braço

SPA local para criar, editar e exportar diagramas de braço de guitarra de seis cordas. O editor
calcula as notas automaticamente, funciona com mouse, toque ou teclado e não depende de framework,
backend ou serviço externo.

## Recursos

- Braço de seis cordas com navegação entre as casas 0 e 24.
- Afinações Padrão, Drop D, Eb padrão, Open G e Open C.
- Notas automáticas com sustenidos ou bemóis conforme a afinação.
- Marcadores preenchidos, vazados e abafados.
- Dock contextual com preview, edição de marcador e fluxo guiado de ligações.
- Histórico em memória com desfazer e refazer, limitado a 50 estados.
- Exportação client-side para SVG, PNG e JSON.
- Importação de diagramas a partir de arquivo JSON.
- Interface responsiva com seis casas no mobile e doze em telas maiores.
- Grade semântica operável por teclado e compatível com tecnologias assistivas.
- Nenhuma requisição de rede durante o uso.

## Executar localmente

Não há dependências para instalar nem etapa de build. Na raiz do repositório, inicie um servidor
HTTP local:

```bash
python3 -m http.server 4176 --bind 127.0.0.1
```

Depois abra [http://127.0.0.1:4176](http://127.0.0.1:4176) no navegador.

Também é possível abrir `index.html` diretamente, mas um servidor local reproduz melhor o ambiente
usado nas validações e evita diferenças de segurança entre navegadores para URLs `file://`.

## Como usar

1. Escolha uma afinação.
2. Informe a casa inicial ou use as setas anterior e próxima.
3. No dock **Ferramentas**, escolha o modo **Marcar**, o estilo, a cor e o rótulo opcional.
4. Ative uma posição do braço para criar o marcador.
5. Selecione um marcador existente para editá-lo; use **Ligar** para escolher origem e destino.
6. Use **Baixar SVG**, **Baixar PNG** ou **Baixar JSON** para exportar a prancha visível (SVG/PNG) ou o diagrama completo (JSON).
7. Use **Importar JSON** para carregar um diagrama salvo; a importação substitui o conteúdo atual e pode ser desfeita.

Marcadores abafados são permitidos somente no nut, casa 0. Um marcador criado ou editado no nut com
a ferramenta preenchida é normalizado para vazado, representação usada para corda solta.

A janela mantém sua largura até o fim do braço: informar uma casa inicial alta demais recua o início
o suficiente para preservar as casas visíveis, com aviso, em vez de encolher o diagrama. Com doze
casas, a casa inicial vai até 13; com seis, até 19.

O nut faz parte do diagrama apenas quando a casa inicial é 0. A partir da casa 1 o editor produz um
diagrama de posição: a borda esquerda passa a ser um traste comum, a prancha declara a posição no
cabeçalho e os alvos de corda solta saem da grade. Marcadores que ficam fora da janela permanecem no
estado, mas são contados na legenda da prancha e no aviso de exportação, porque não entram no
arquivo gerado.

## Atalhos de teclado

| Atalho | Ação |
|---|---|
| `↑` `↓` `←` `→` | Navegar entre cordas e casas |
| `Home` / `End` | Ir ao primeiro ou último alvo da corda |
| `Enter` / `Space` | Criar ou selecionar marcador |
| `Delete` / `Backspace` | Remover o marcador selecionado |
| `Esc` | Desmarcar sem limpar o diagrama |
| `Ctrl/Cmd + Z` | Desfazer |
| `Ctrl/Cmd + Shift + Z` | Refazer |

## Arquitetura

O produto é autocontido em [`index.html`](index.html): HTML, CSS e JavaScript sem dependências de
runtime.

```text
DiagramContent + EditorState
            │
            ├── SVG ─────────────── visual canônico e exportação SVG
            ├── grade HTML ─────── interação semântica e teclado
            └── Canvas offscreen ─ rasterização da exportação PNG
```

O SVG e a grade HTML consomem o mesmo estado e as mesmas funções de geometria. Mira, foco e
contorno de seleção pertencem à camada de edição e são removidos do arquivo exportado. O Canvas não
é uma segunda implementação visual; ele é usado apenas para codificar o PNG.

Mais detalhes estão na
[`ADR 001 — SVG canônico com grade HTML semântica`](adr/001-svg-canonico-grade-html-semantica.md).

## Acessibilidade e responsividade

- A linha superior representa a corda 1, mais aguda; a inferior representa a corda 6, mais grave.
- A grade usa foco móvel: apenas uma posição participa da ordem de tabulação por vez.
- A criação ou edição preserva o foco na posição ativa.
- Estados de seleção e ferramenta usam atributos ARIA, além do tratamento visual.
- A região `aria-live` anuncia criação, edição, remoção, histórico e erros.
- Controles touch têm alvo mínimo de 44 × 44 px, inclusive em tablets com ponteiro coarse.
- O layout compacto mostra seis casas; a partir de 768 px, doze casas ficam disponíveis.
- `prefers-reduced-motion` remove transições não essenciais.

## Segurança e privacidade

- Todo o estado permanece na memória da aba e é descartado ao recarregar a página.
- Não há login, armazenamento persistente, analytics ou telemetria.
- A Content Security Policy bloqueia conexões externas em runtime.
- Rótulos são normalizados e inseridos com `textContent`, sem interpretação como markup.
- Exportações usam Blob URLs temporárias, revogadas após o uso.

## Qualidade

Na versão atual:

- `index.html` possui no máximo 73.728 bytes ([ADR 006](adr/006-budget-bytes-selection-controls.md)).
- O renderer mediu p95 inferior a 1 ms em 100 atualizações, após 10 aquecimentos, no ambiente de
  desenvolvimento.
- Foco sobre a prancha tem contraste de 5,12:1.
- Trastes e regras sobre a prancha têm contraste de 3,32:1.
- Os fluxos de criação, edição, remoção, histórico, afinação, teclado, responsividade e exportação
  são cobertos por testes automatizados em Chromium, Firefox e WebKit.

A validação com VoiceOver permanece manual e recomendada antes de publicação pública.

### Checklist pré-publicação (manual)

Não automatizar VoiceOver. Rodar com o servidor local (`python3 -m http.server 4176 --bind 127.0.0.1`)
antes de publicar.

**AC-14 — foco visível**

- [ ] Tabular pela command bar, inspetor e grade: o anel de foco é visível em cada controle.
- [ ] Na prancha, o foco da célula não depende só da cor de seleção (outline/anel distinto).
- [ ] Conferir em Chrome e Safari estáveis.

**AC-17 — contraste**

- [ ] Texto normal da UI ≥ 4,5:1 (DevTools / Contrast Checker).
- [ ] Foco e informação gráfica na prancha ≥ 3:1 (referência atual no README: foco 5,12:1;
  trastes/regras 3,32:1 — revalidar se tokens mudarem).
- [ ] Texto de marcador preenchido permanece legível em fills claros e escuros da paleta.

**AC-36 — teclado + VoiceOver (parte assistiva)**

- [ ] Fluxo criar → editar rótulo → remover → desfazer só por teclado (Chrome, Firefox, Safari).
  A matriz Playwright cobre o caminho de teclado; este item é smoke humano final.
- [ ] VoiceOver (macOS) + Safari: nomes acessíveis das células, ferramentas e anúncios
  `aria-live` fazem sentido ao criar, editar, remover e exportar.
- [ ] VoiceOver + Chrome: mesmo smoke curto (criar um marcador, ouvir o anúncio, navegar a grade).

Marcar estes itens só após a sessão manual. Não fechar AC-14 / AC-17 / a parte VoiceOver de AC-36
nas specs só porque este checklist existe.

## Testes

A suíte é end-to-end com Playwright e dirige a interface real — cliques, teclado e campos. O estado
interno é lido apenas nas asserções. As dependências são de desenvolvimento; o produto continua sem
dependência de runtime.

```bash
npm install
npx playwright install    # apenas na primeira execução
npm test                  # Chromium, Firefox e WebKit
npm test -- --project=chromium
npm run test:ui           # modo interativo
```

| Arquivo | Cobre |
|---|---|
| `tests/musical-model.spec.js` | AC-2, AC-3, AC-8, AC-24, AC-29 |
| `tests/markers.spec.js` | AC-4, AC-5, AC-6, AC-15, AC-16, AC-27 |
| `tests/history.spec.js` | AC-7, AC-22, AC-30 |
| `tests/window.spec.js` | AC-1, AC-9, AC-10, AC-25, AC-28 |
| `tests/position.spec.js` | Nut por posição e aviso de marcadores fora da janela |
| `tests/label.spec.js` | AC-19, AC-34, rótulo no nome acessível |
| `tests/marker-label-fit.spec.js` | Ajuste do rótulo ao disco do marcador |
| `tests/keyboard.spec.js` | AC-6, AC-13, AC-21 |
| `tests/export.spec.js` | AC-18, AC-18b (CSS print), AC-26, AC-32 |
| `tests/responsive.spec.js` | AC-11, AC-12, AC-23, AC-33 |
| `tests/marker-color.spec.js` | AC-37 |
| `tests/diagram-title.spec.js` | AC-38 |
| `tests/connections.spec.js` | AC-39, AC-40, AC-41 |
| `tests/transpose-shape.spec.js` | AC-T1…AC-T9 |

Permanecem fora do alcance automatizado: AC-14 (foco visual), AC-17 (contraste medido), AC-31
(auditoria estática de cores literais), AC-35 (p95 na máquina de desenvolvimento) e a parte de
AC-36 referente a VoiceOver — ver checklist pré-publicação acima.

## Verificações locais

```bash
# Limite do arquivo autocontido
wc -c index.html

# Whitespace e conflitos de patch
git diff --check

# Servidor para smoke test manual
python3 -m http.server 4176 --bind 127.0.0.1
```

## Estrutura do repositório

```text
.
├── index.html                         # SPA autocontida
├── AGENTS.md                          # Orientação curta para agentes
├── README.md                          # Visão geral, QA e checklist manual
├── package.json                       # Somente dependências de desenvolvimento
├── playwright.config.js               # Matriz Chromium, Firefox e WebKit
├── adr/
│   ├── 001-svg-canonico-grade-html-semantica.md
│   └── 002-budget-bytes-transpor-forma.md
├── specs/
│   ├── fretboard-editor.md            # Especificação aprovada
│   ├── transpose-shape.md             # Spec lite — transpor forma
│   └── steps/                         # Handoffs de implementação
└── tests/                             # Suíte end-to-end
    ├── fixtures.js
    └── fretboard-page.js              # Page Object
```

## Escopo atual

O editor atende guitarras de seis cordas. Persistência, contas, colaboração, instrumentos com
outra quantidade de cordas e afinações personalizadas não fazem parte da versão atual.

## Licença

Este repositório não contém um arquivo `LICENSE`. Não presuma permissão de uso, modificação ou
redistribuição sem orientação do responsável pelo projeto.
