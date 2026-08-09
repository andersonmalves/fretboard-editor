# Redesign UX/UI do Fretboard Diagram Editor

**Feature slug:** `fretboard-editor`
**Date:** 2026-08-09
**Status:** approved
**Modo de redesign:** overhaul controlado

---

## 1. Goal

Permitir que uma pessoa crie, selecione, edite e exporte diagramas de braço de guitarra com
informação musical confiável, usando mouse, toque ou teclado, sem perda acidental de trabalho e
com uma experiência consistente de mobile a desktop.

## 2. Non-goals

- Suportar outros instrumentos ou quantidades de cordas nesta mudança.
- Adicionar backend, conta, colaboração ou sincronização em nuvem.
- Persistir diagramas entre sessões do navegador.
- Criar múltiplos temas de interface ou um editor livre de estilos de exportação.
- Adicionar framework ou dependência de runtime.
- Implementar analytics ou telemetria de produto.

## 3. User stories

### US-1: Criar marcador com informação musical

- **Given** que o diagrama está vazio
- **When** o usuário ativa uma posição do braço
- **Then** um marcador é criado, fica selecionado e mostra a nota calculada pela afinação atual

### US-2: Selecionar e editar marcador

- **Given** que existe um marcador no braço
- **When** o usuário o seleciona e altera tipo ou rótulo
- **Then** o mesmo marcador é atualizado sem precisar ser removido e recriado

### US-3: Remover marcador sem ambiguidade

- **Given** que um marcador está selecionado
- **When** o usuário aciona “Remover” ou a tecla `Delete`/`Backspace`
- **Then** somente o marcador selecionado é removido e a ação pode ser desfeita

### US-4: Recuperar uma ação destrutiva

- **Given** que o diagrama contém marcadores
- **When** o usuário limpa o diagrama ou altera uma edição por engano
- **Then** pode desfazer e restaurar o estado anterior durante a sessão

### US-5: Editar por teclado

- **Given** que o foco está no braço
- **When** o usuário navega com setas e ativa uma posição com `Enter` ou `Space`
- **Then** percorre cordas/casas e cria ou seleciona marcadores sem depender do mouse

### US-6: Editar em viewport estreito

- **Given** um viewport de 390 px
- **When** o editor carrega
- **Then** todas as cordas e casas da janela atual permanecem alcançáveis e os controles principais
  têm alvos adequados para toque

### US-7: Alterar afinação sem perder posições

- **Given** um diagrama com marcadores
- **When** o usuário escolhe outra afinação
- **Then** as posições permanecem e as notas automáticas são recalculadas

### US-8: Exportar o que foi visualizado

- **Given** um diagrama configurado
- **When** o usuário exporta PNG ou SVG
- **Then** o arquivo reproduz o artboard visível, com notas, rótulos, marcadores, ligações e fundo claros

### US-10: Ligar marcadores com linhas

- **Given** que existem dois ou mais marcadores no diagrama
- **When** o usuário ativa a ferramenta Ligar, escolhe a cor da ligação e clica em dois marcadores
- **Then** uma linha reta é desenhada entre os centros dos marcadores, entra no undo/redo e aparece na exportação

### US-11: Tratar entrada inválida

- **Given** o campo de casa inicial
- **When** o usuário informa valor vazio, não numérico ou fora do intervalo permitido
- **Then** o editor normaliza ou rejeita o valor com mensagem inline e nunca diverge do valor
  mostrado no campo

## 4. Assumptions

- O produto continua focado em guitarra de seis cordas nesta mudança.
- A linha superior representa a corda 1 (`E4`, mais aguda) e a inferior representa a corda 6
  (`E2`, mais grave); o estado de afinação segue essa mesma ordem.
- Doze casas ficam disponíveis a partir de 768 px; em 390 px, a janela mostra seis casas por vez.
  Controles anterior/próxima e casa inicial permitem alcançar todo o intervalo de 0 a 24.
- A SPA permanece local, sem dependências externas e sem etapa de build.
- A matriz de compatibilidade do redesign é Chrome, Firefox e Safari estáveis para teclado; Chrome
  e Safari estáveis com VoiceOver no macOS para a semântica assistiva.
- A interface pode mudar nomes, agrupamentos e ordem dos controles conforme este redesign; a
  aprovação desta spec autoriza essas mudanças.
- Não há analytics, rotas públicas adicionais ou identidade de marca consolidada a preservar.
- O renderer visual pode migrar de Canvas para SVG, com uma grade HTML semântica sobreposta para
  interação, preservando PNG e SVG como formatos de exportação.

## 5. Classificação de escopo

### Requisitos atuais

- Seleção e edição explícitas de marcador.
- Nota automática visível com suporte a sustenidos e bemóis usados pelas afinações disponíveis.
- Undo/redo em memória e ações destrutivas recuperáveis.
- Operação com mouse, toque e teclado.
- Responsividade em 390, 768 e 1440 px.
- Paridade visual entre editor e exportação.
- Tokens semânticos compartilhados pela UI e pelo renderer.

### Restrições atuais

- Arquivo HTML autocontido, sem framework nem dependência de runtime.
- Estado somente em memória.
- Exportação PNG e SVG client-side.
- Padrões de segurança, contraste, foco e reduced motion do repositório.

### Considerações futuras

- Outros instrumentos, número variável de cordas e afinações personalizadas.
- Persistência local, templates, compartilhamento e múltiplos diagramas.
- Temas de exportação configuráveis.

### Rejeitado nesta mudança

- Escalar o canvas inteiro para caber no mobile, pois reduziria leitura e alvos de toque.
- Confirmar toda ação destrutiva por modal; undo contextual preserva fluxo e reduz interrupção.
- Adicionar biblioteca de componentes para uma SPA de uma rota.

## 6. Direção UX/UI

### Modo e preservação

O redesign é um **overhaul controlado**: preserva a finalidade, a SPA de rota única, os campos de
afinação/casa inicial/rótulo e os formatos de exportação, mas substitui a composição visual e o
contrato de interação do protótipo.

### Plano compacto — passe 1

- **Color:** chrome grafite frio; artboard claro de desenho técnico; vermelho-laca apenas para
  seleção/ação primária; latão discreto nas cordas.
- **Type:** stack nativa de UI para legibilidade e ausência de dependência; `ui-monospace` para
  notas, casas e coordenadas musicais.
- **Layout:** command bar curta, artboard dominante e inspetor contextual persistente no desktop;
  inspetor abaixo do braço no mobile.
- **Signature:** régua de coordenadas musicais — a posição selecionada conecta visualmente corda,
  casa e nota por crosshair e uma faixa contextual.

### Comparação de layout

```text
Opção A — escolhida (desktop)
┌ Command bar: Afinação · Posição · Undo/Redo · Exportar ┐
├───────────────────────────────────────┬─────────────────┤
│ Artboard / braço                      │ Seleção         │
│ posição ativa com crosshair           │ nota, tipo,     │
│                                       │ rótulo, remover │
└───────────────────────────────────────┴─────────────────┘

Opção B — rejeitada
┌ Toolbar com todos os controles misturados ┐
├ Braço centralizado e fixo                  ┤
└ Atalhos                                    ┘
```

A opção A preserva contexto de seleção e separa configuração do diagrama, edição do marcador e
ações globais. No mobile, o artboard ocupa a largura disponível e o inspetor vira painel inferior.

### Crítica do plano — passe 2

A primeira direção usava papel marfim, tipografia serifada e latão como acento dominante. Ela foi
rejeitada por convergir ao clichê “premium artesanal” e enfraquecer a leitura técnica. A direção
revisada usa artboard cinza-claro frio, tipografia nativa/monoespaçada e concentra a personalidade
na régua musical e no crosshair. O vermelho-laca deixa de colorir ações secundárias e comunica
somente seleção ou ação primária.

### Papéis de cor

Os valores finais podem ser calibrados durante a implementação, preservando estes papéis:

| Token semântico | Papel |
|---|---|
| `--color-app-bg` | Fundo do workspace |
| `--color-panel-bg` | Command bar e inspetor |
| `--color-artboard-bg` | Fundo claro reproduzido na exportação |
| `--color-text-primary` | Texto principal da interface |
| `--color-text-muted` | Labels e ajuda com contraste AA |
| `--color-selection` | Marcador selecionado e ação primária |
| `--color-diagram-ink` | Notas, trastes e labels no artboard |
| `--color-string` | Cordas e detalhe material |
| `--color-focus` | Foco visível independente da seleção |
| `--color-destructive` | Remover/limpar, sem compartilhar seleção |
| `--color-marker-default` | Marcador preenchido sem cor customizada (`var(--color-selection)`) |
| `--color-marker-blue` … `--color-marker-gray` | Paleta fixa de cores customizadas do marcador |

## 7. Arquitetura a decidir em ADR

A recomendação refinada desta spec é usar **SVG como renderer visual principal e uma grade HTML
semântica como camada de interação**. O PNG seria rasterizado a partir do mesmo SVG em canvas
offscreen. A aprovação da spec autoriza avaliar formalmente a recomendação, mas a decisão só se
torna aceita no ADR, antes de qualquer atomic step dependente dela.

Um ADR deve registrar, após aprovação desta spec, as alternativas:

1. manter Canvas com grade semântica sincronizada;
2. usar SVG visual com grade HTML semântica sobreposta;
3. usar elementos HTML/CSS para grade e SVG somente na exportação.

## 8. Data model

```typescript
type MarkerType = 'filled' | 'outline' | 'muted';

interface TuningPreset {
  id: string;
  notes: string[];
  accidentalStyle: 'sharp' | 'flat';
}

interface Marker {
  id: string;
  stringIndex: number;
  fret: number;
  type: MarkerType;
  color: string | null;
  customLabel: string;
}

interface Connection {
  a: string;
  b: string;
  color: string | null;
}

interface DiagramContent {
  tuningPresetId: string;
  diagramTitle: string;
  markers: Marker[];
  connections: Connection[];
}

interface EditorState {
  startFret: number;
  visibleFrets: number;
  selectedMarkerId: string | null;
  activeMarkerType: MarkerType;
  activeMarkerColor: string | null;
  activeConnectionColor: string | null;
  activeTool: 'marker' | 'connect';
  linkFrom: string | null;
  activeCustomLabel: string;
}

interface HistoryState {
  past: DiagramContent[];
  present: DiagramContent;
  future: DiagramContent[];
}
```

Invariantes:

- No máximo um marcador por par `stringIndex + fret`.
- `selectedMarkerId` referencia marcador existente ou é `null`.
- Alterar afinação não altera posições, tipos, cores ou rótulos customizados.
- Cada preset declara `accidentalStyle: 'sharp' | 'flat'`; Standard, Drop D, Open G e Open C usam
  sustenidos, enquanto Eb Standard usa bemóis. O marcador mostra classe de altura sem oitava e o
  nome acessível inclui classe + oitava.
- Nota automática é derivada de afinação + posição e não é persistida no marcador.
- `customLabel` vazio usa a nota automática.
- `customLabel` é normalizado com trim, aceita no máximo seis caracteres visíveis e rejeita
  caracteres de controle.
- `muted` é válido somente na casa 0; `outline` na casa 0 representa corda solta.
- `color` é `null` ou um token CSS `--color-marker-*` da paleta canônica; `null` resolve para
  `--color-marker-default` (`var(--color-selection)`). Marcadores `muted` ignoram cor no desenho.
- `diagramTitle` é normalizado com trim, aceita no máximo 40 caracteres visíveis, rejeita
  caracteres de controle e usa `FRETBOARD / 06 STRING` quando vazio após normalização.
- A ferramenta de cor ativa (`activeMarkerColor`) é sticky como o tipo: não cria snapshots de
  histórico e não é resetada ao desmarcar.
- `connections` armazena pares normalizados (`a` < `b` lexicograficamente) sem duplicata; `color` segue
  a paleta de marcadores; remover marcador remove ligações incidentes; `clearDiagram` limpa ligações.
- `activeConnectionColor` e `activeTool` são sticky e não entram no histórico; `linkFrom` é efêmero.
- Histórico registra somente criação, edição, remoção, limpeza, ligação, desligação, mudança de
  afinação e — quando a feature [`transpose-shape`](transpose-shape.md) estiver entregue —
  transposição de forma. Seleção, ferramenta ativa, rótulo em digitação e navegação da janela não
  criam snapshots.
- Histórico mantém no máximo 50 estados em `past` e 50 em `future`; nova mutação após undo limpa
  `future`.
- Undo de remoção/limpeza restaura conteúdo e seleciona o marcador restaurado quando houver um alvo
  inequívoco; nos demais casos, a seleção fica `null`.
- O nut é uma faixa adjacente com seis alvos de corda solta/abafada e não conta como casa da janela.
  `startFret = 0` mantém essa faixa visível e mostra as casas 1..N. Para `startFret > 0`, a janela
  contém `startFret..startFret + visibleFrets - 1`, limitada à casa 24.
- Crosshair, foco e contorno de seleção são affordances de edição e não aparecem na exportação.

## 9. Error handling

- Casa inicial inválida: manter o último valor válido e exibir erro inline associado ao campo.
- Afinação inválida: não aplicar estado parcial; presets disponíveis devem ser sempre válidos.
- Falha ao rasterizar PNG: mostrar mensagem segura e preservar o diagrama para nova tentativa.
- Falha ao criar download SVG: mostrar mensagem segura; revogar qualquer object URL criado.
- Ação destrutiva: produzir estado desfazível e feedback contextual, não falhar silenciosamente.
- Posição fora da janela visível: ignorar a ativação sem alterar estado.

## 10. Observability

Não haverá telemetria remota. O editor deve oferecer observabilidade para o usuário por:

- região de status `aria-live` para criação, edição, remoção, undo/redo e erro de exportação;
- estado visível da seleção e da ferramenta ativa;
- erros de validação associados ao controle correspondente.

## 11. Quality attributes

- Em viewports de 390, 768 e 1440 px, nenhum conteúdo essencial nasce em coordenada horizontal
  negativa e todas as casas da janela são alcançáveis.
- Texto normal atinge contraste mínimo de 4,5:1; informação gráfica e foco, 3:1.
- Controles principais têm alvo mínimo de 44×44 px em viewport touch.
- O fluxo criar → selecionar → editar → remover → desfazer é executável apenas por teclado.
- No Chrome estável da máquina de desenvolvimento, o p95 de 100 atualizações de estado, após dez
  aquecimentos, permanece abaixo de 16 ms para 72 posições fretadas + seis alvos do nut.
- O arquivo-fonte UTF-8 `index.html` permanece em até **59.392** bytes, medido por
  `wc -c index.html`; não há artefato minificado separado. O teto anterior (57.344) foi
  substituído pelo [`ADR 002`](../adr/002-budget-bytes-transpor-forma.md) para caber a feature
  incremental [`transpose-shape`](transpose-shape.md).
- Não há dependências externas nem requisições de rede em runtime.
- Qualquer motion respeita `prefers-reduced-motion`.

## 12. Threat model

### Escopo e evidências

- **Runtime em escopo:** `index.html`, estado em memória, renderer SVG, serialização SVG,
  rasterização PNG e downloads por Blob URL.
- **Entry points:** rótulo customizado, controles de afinação/casa, interação mouse/toque/teclado e
  comandos de exportação.
- **Fora de escopo:** CI/build, backend, autenticação, persistência, upload e rede; nenhum deles
  existe no produto desta spec.
- **Evidências existentes:** `maxlength="6"` no input atual, escape manual no exportador SVG e
  geração local de Blob URL; esses controles serão substituídos e não são presumidos corretos no
  novo renderer.

### Modelo do sistema

| Componente / boundary | Entrada ou ativo | Controle atual / requerido |
|---|---|---|
| Input → estado | Rótulo não confiável; integridade do diagrama | Normalização, limite de seis caracteres e rejeição de controles |
| Estado → SVG DOM | Texto não confiável; integridade do DOM | Criar nós/atributos por API DOM e inserir label com `textContent`, nunca `innerHTML` |
| SVG DOM → arquivo SVG | Artefato que pode ser aberto/compartilhado | Serializar DOM validado; proibir elementos, atributos e URLs derivados do label |
| SVG → canvas offscreen → PNG | Estabilidade do navegador e arquivo | Dimensões limitadas ao diagrama 6×24; tratar falha sem perder estado |
| Blob → download local | Memória e ciclo de vida da URL | Revogar object URL após disparar download |

### Premissas e capacidades do atacante

- Um usuário local não autenticado pode informar qualquer texto aceito pelo navegador, acionar
  interações repetidamente e abrir ou compartilhar o SVG exportado.
- O atacante não acessa servidor, dados de outro usuário, filesystem arbitrário, segredo ou rede
  pelo produto.
- A prioridade de segurança é proteger a integridade do DOM/arquivo e a disponibilidade da aba;
  não há confidencialidade ou autorização em escopo.

### Abuse paths priorizados

| Prioridade | Cenário | Likelihood × impact | Controle existente | Mitigação requerida |
|---|---|---|---|---|
| Alta | Label vira markup/script no DOM ou SVG compartilhado | Média × Média: caracteres especiais cabem em seis posições e SVG pode ser aberto no browser | Escape manual apenas no exportador legado | Inserção exclusiva por `textContent`, serialização do DOM validado e regressão com `<>&"'` |
| Média | Label cria atributo/URL externa no SVG | Baixa × Média: exige interpolação insegura no novo renderer | Nenhum contrato estrutural atual | Labels só podem ocupar nó `<text>`; nenhum nome de elemento/atributo/URL deriva do input |
| Baixa | Repetição de ações/exportações pressiona memória da aba | Baixa × Baixa: estado é limitado a 6×24 e sem rede | Object URL é revogada no legado | Limitar histórico a 50 estados e revogar URL também nos caminhos de falha |

### Questões abertas de segurança

- Nenhuma. Não há dado sensível, privilégio, tenancy ou exposição de rede que altere a prioridade.

## 13. Rollout / Rollback

O rollout substitui o protótipo no mesmo `index.html`, sem migração de dados porque o estado não é
persistido. Nenhum estado intermediário será publicado: cada atomic step deixa o arquivo executável
e verificável, mas a publicação ocorre apenas após o último review. O rollback restaura o commit
imediatamente anterior ao primeiro step do redesign; durante a execução, cada step pode ser revertido
isoladamente por seu commit se seu contrato ainda não for dependência de step posterior.

## 14. Acceptance criteria

- [ ] AC-1: Abrir o editor mostra braço de seis cordas e a janela de casas configurada.
- [ ] AC-2: Criar marcador vazio mostra automaticamente a nota calculada.
- [ ] AC-3: Notas com `#` e `b` são calculadas corretamente para todos os presets existentes.
- [ ] AC-4: Clicar/tocar em marcador existente o seleciona sem removê-lo.
- [ ] AC-5: Alterar tipo ou rótulo atualiza o marcador selecionado.
- [ ] AC-6: “Remover” e `Delete`/`Backspace` removem somente o marcador selecionado.
- [ ] AC-7: Undo restaura criação, edição, remoção e limpeza; redo reaplica a ação.
- [ ] AC-8: Mudar afinação preserva posições e recalcula notas automáticas.
- [ ] AC-9: Casa inicial aceita `0` e mantém campo, estado e diagrama sincronizados.
- [ ] AC-10: A casa 12 exibe o marcador duplo de posição.
- [ ] AC-11: Em 390 px, seis casas ficam visíveis; em 768 e 1440 px, doze casas ficam disponíveis;
  em todos os casos, cordas, nut e casas da janela permanecem alcançáveis.
- [ ] AC-12: Em viewport touch, controles principais medem no mínimo 44×44 px.
- [ ] AC-13: Setas navegam entre posições; `Enter`/`Space` cria ou seleciona marcador.
- [ ] AC-14: O foco visível não depende apenas da cor de seleção.
- [ ] AC-15: Tipo ativo usa nome acessível e estado programático (`aria-pressed` ou equivalente).
- [ ] AC-16: Região `aria-live` anuncia criação, edição, remoção, undo/redo e erros.
- [ ] AC-17: Texto, foco e informação gráfica atendem aos contrastes definidos nos quality attributes.
- [ ] AC-18: Exportações PNG e SVG reproduzem o diagrama visível, sem crosshair, foco ou contorno
  de seleção, e não omitem notas/rótulos.
- [ ] AC-19: Rótulo customizado é escapado no DOM e no arquivo SVG exportado.
- [ ] AC-20: `lang`, labels, tooltips, mensagens e atalhos usam pt-BR consistente.
- [ ] AC-21: `Esc` cancela/deseleciona e nunca limpa o diagrama.
- [ ] AC-22: Limpar diagrama oferece desfazer e não exige modal em operação normal.
- [ ] AC-23: O editor não produz erros ou warnings no console nos fluxos cobertos.
- [ ] AC-24: A linha superior é a corda 1 (`E4`) e a inferior é a corda 6 (`E2`) na afinação padrão.
- [ ] AC-25: Casa inicial vazia, não numérica ou fora do intervalo mantém o último estado válido e
  mostra erro inline associado ao campo.
- [ ] AC-26: Falha de exportação mostra erro, preserva o diagrama e permite nova tentativa.
- [ ] AC-27: Marcador `muted` só pode ocupar a casa 0; `outline` na casa 0 representa corda solta.
- [ ] AC-28: Em 390 px, anterior/próxima e casa inicial alcançam todas as posições de 0 a 24 sem
  tornar nenhuma posição inacessível.
- [ ] AC-29: Standard, Drop D, Open G e Open C exibem sustenidos; Eb Standard exibe bemóis; o nome
  acessível inclui a oitava.
- [ ] AC-30: Undo/redo segue os eventos e o limite de 50 estados definidos no data model; seleção,
  ferramenta e navegação não criam snapshots.
- [ ] AC-31: UI, SVG e PNG consomem os mesmos papéis de cor; busca por cores literais fora da
  definição canônica (`:root` e tokens `--color-marker-*`) não encontra duplicação.
- [ ] AC-37: O inspetor oferece paleta de cor com `radiogroup` acessível; setas navegam entre
  swatches; a cor escolhida é aplicada ao próximo marcador ou ao selecionado; o valor persiste em
  undo/redo e troca de afinação; exportação SVG reproduz a cor resolvida; texto do marcador
  preenchido usa contraste legível (tinta ou branco conforme luminância do fill).
- [ ] AC-38: O título do diagrama é editável na barra de comandos; alterações refletem no SVG e na
  exportação; título vazio restaura o padrão; undo/redo inclui mudanças de título.
- [ ] AC-39: A ferramenta Ligar cria linhas entre dois marcadores distintos; pares duplicados são
  rejeitados; a cor da ligação é independente e sticky; undo/redo cobre criação e remoção.
- [ ] AC-40: Remover marcador ou limpar o diagrama remove ligações associadas; exportação SVG/PNG
  reproduz ligações visíveis sem affordances de edição.
- [ ] AC-41: Com marcador selecionado, o inspetor lista ligações incidentes com remoção individual.
- [ ] AC-32: A aplicação não faz requisições de rede em runtime e `wc -c index.html` retorna no
  máximo 59.392 bytes ([ADR 002](../adr/002-budget-bytes-transpor-forma.md)).
- [ ] AC-33: Com reduced motion ativo, nenhuma transição ou animação não essencial permanece.
- [ ] AC-34: Labels com `<>&"'`, whitespace e caracteres de controle são normalizados/rejeitados
  conforme o data model e nunca criam markup, atributos ou URLs.
- [ ] AC-35: No Chrome estável da máquina de desenvolvimento, o p95 de 100 atualizações após dez
  aquecimentos permanece abaixo de 16 ms com 72 posições fretadas + seis alvos do nut.
- [ ] AC-36: O fluxo por teclado passa em Chrome, Firefox e Safari estáveis; nomes, foco e anúncios
  passam em Chrome e Safari estáveis com VoiceOver no macOS.

## 15. Edge cases

- Ativar posição que já contém marcador selecionado.
- Tentar remover sem seleção.
- Mudar afinação com rótulos automáticos e customizados misturados.
- Desfazer após mudar a janela de casas.
- Seleção que sai da janela após alterar casa inicial.
- Label vazio, somente whitespace, com caracteres especiais ou no comprimento máximo.
- Exportar com diagrama vazio.
- Navegar por teclado nos limites da primeira/última corda e casa.
- Viewport estreito em zoom de 200%.
- Device pixel ratio fracionário ou maior que 1.

## 16. Risks

| Risco | Impacto | Mitigação |
|---|---|---|
| Reescrita para SVG introduzir regressão musical | Diagrama incorreto | Modelo musical puro e testes contra presets antes do renderer |
| Undo/redo armazenar estado demais | Crescimento de memória | Histórico com limite e snapshots apenas de estado serializável |
| SVG acessível ficar verboso | Navegação cansativa | Roving tabindex, nome curto por posição e anúncio contextual |
| Mobile mostrar poucas casas | Perda de contexto | Indicador explícito de intervalo e navegação anterior/próxima |
| Tela e exportação divergirem | Perda de confiança | Um único SVG como fonte de renderização e exportação |
| Tokens virarem valores duplicados no JS | Drift visual recorrente | Paleta compartilhada lida por renderer e serializada na exportação |

## 17. Open questions

- Nenhuma questão aberta bloqueante na spec pai. Feature incremental em draft:
  [`transpose-shape`](transpose-shape.md) + [`ADR 002`](../adr/002-budget-bytes-transpor-forma.md)
  (orçamento); aguardam aprovação antes dos atomic steps.

## 18. Implementation plan

1. Entregar criação com nota correta em SVG canônico + grade HTML, exportação SVG e segurança de label.
2. Entregar seleção, edição, remoção e undo/redo com verificação reproduzível de estado e teclado.
3. Entregar janela responsiva 0..24, navegação de casas, command bar e inspetor.
4. Entregar tokens compartilhados, contraste, touch targets, pt-BR e reduced motion.
5. Entregar rasterização PNG, falha recuperável, paridade, performance e regressão final.
