# Editor de braço

SPA local para criar, editar e exportar diagramas de braço de guitarra de seis cordas. O editor
calcula as notas automaticamente, funciona com mouse, toque ou teclado e não depende de framework,
backend ou serviço externo.

## Recursos

- Braço de seis cordas com navegação entre as casas 0 e 24.
- Afinações Padrão, Drop D, Eb padrão, Open G e Open C.
- Notas automáticas com sustenidos ou bemóis conforme a afinação.
- Marcadores preenchidos, vazados e abafados.
- Seleção, edição de rótulo e remoção individual.
- Histórico em memória com desfazer e refazer, limitado a 50 estados.
- Exportação client-side para SVG e PNG.
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
3. Escolha o tipo de marcador no inspetor.
4. Ative uma posição do braço para criar o marcador.
5. Selecione um marcador existente para alterar tipo ou rótulo.
6. Use **Baixar SVG** ou **Baixar PNG** para exportar a prancha visível.

Marcadores abafados são permitidos somente no nut, casa 0. Um marcador criado no nut com a
ferramenta preenchida é normalizado para vazado, representação usada para corda solta.

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

- `index.html` possui menos de 51.200 bytes.
- O renderer mediu p95 inferior a 1 ms em 100 atualizações, após 10 aquecimentos, no ambiente de
  desenvolvimento.
- Foco sobre a prancha tem contraste de 5,12:1.
- Trastes e regras sobre a prancha têm contraste de 3,32:1.
- Os fluxos de criação, edição, remoção, histórico, afinação e exportação foram verificados em
  navegador Chromium.

A matriz manual completa em Firefox, Safari e VoiceOver permanece uma validação recomendada antes
de publicação pública.

## Verificações locais

```bash
# Limite do arquivo autocontido
wc -c index.html

# Whitespace e conflitos de patch
git diff --check

# Servidor para smoke test manual
python3 -m http.server 4176 --bind 127.0.0.1
```

Checklist manual mínimo:

1. Criar um marcador e confirmar a nota automática.
2. Editar tipo e rótulo, remover e desfazer.
3. Alterar a afinação e confirmar que as posições são preservadas.
4. Navegar pela grade somente com teclado.
5. Validar as casas inicial 0 e 24 e um valor inválido.
6. Exportar SVG e PNG e comparar com a prancha visível.
7. Conferir os layouts em 390, 768 e 1440 px.

## Estrutura do repositório

```text
.
├── index.html                         # SPA autocontida
├── README.md                          # Visão geral e instruções
├── adr/
│   └── 001-svg-canonico-grade-html-semantica.md
└── specs/
    ├── fretboard-editor.md            # Especificação aprovada
    └── steps/                         # Handoffs de implementação
```

## Escopo atual

O editor atende guitarras de seis cordas. Persistência, contas, colaboração, instrumentos com
outra quantidade de cordas e afinações personalizadas não fazem parte da versão atual.

## Licença

Este repositório não contém um arquivo `LICENSE`. Não presuma permissão de uso, modificação ou
redistribuição sem orientação do responsável pelo projeto.
