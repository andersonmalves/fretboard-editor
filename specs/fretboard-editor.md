# Fretboard Diagram Editor

**Feature slug:** `fretboard-editor`
**Date:** 2026-08-09
**Status:** draft

---

## 1. Goal

Usuário cria diagramas visuais de braço de guitarra (fretboard) com marcadores, notas e labels, diretamente no navegador, e exporta como PNG/SVG.

## 2. Non-goals

- Suporte a múltiplos instrumentos (apenas guitarra 6 cordas EADGBE nesta spec)
- Animações ou transições
- Persistência em backend — estado vive apenas na sessão do navegador

## 3. User stories

**US-1: Criar diagrama vazio**
- Given que abro a ferramenta
- When a página carrega
- Then vejo um braço de guitarra com 6 cordas e 12 casas, começando na casa 1

**US-2: Adicionar marcador com nota**
- Given que o diagrama está visível
- When clico na interseção corda 5, casa 3
- Then aparece um círculo preenchido com a nota "C" (dó) calculada pela afinação padrão

**US-3: Customizar marcador**
- Given que um marcador está selecionado
- When escolho um tipo diferente (ex: "X" para corda solta, "O" para corda aberta, círculo vazio)
- Then o marcador muda de aparência

**US-4: Alterar rótulo do marcador**
- Given que um marcador está selecionado
- When digito um texto customizado no campo de label
- Then o texto aparece sobre o marcador no diagrama

**US-5: Navegar entre casas**
- Given que o diagrama mostra casas 1-12
- When clico no botão "próxima posição" (shift +1 casa)
- Then o diagrama mostra casas 2-13 com as notas recalculadas

**US-6: Exportar diagrama**
- Given que criei um diagrama com marcadores
- When clico em "Exportar PNG" ou "Exportar SVG"
- Then o navegador faz download da imagem do diagrama

**US-7: Limpar diagrama**
- Given que há marcadores no diagrama
- When clico em "Limpar"
- Then todos os marcadores são removidos e o diagrama volta ao estado inicial

**US-8: Traste vazio sem nota (erro tratado)**
- Given que adiciono um marcador
- When a posição está além do alcance do instrumento (ex: casa > 24)
- Then o editor mostra a nota mais aguda possível e não quebra

## 4. Assumptions

- Afinação padrão guitarra: E2-A2-D3-G3-B3-E4 (MIDI 40-45-50-55-59-64)
- 6 cordas, 12 casas visíveis por padrão
- Navegador moderno (Chrome/Firefox/Safari últimos 2 anos) com suporte a Canvas/SVG
- Sem dependências externas (zero npm install)

## 5. Risks

| Risco | Mitigação |
|---|---|
| Cálculo incorreto de notas em casas altas | Testar todas as 6 cordas × 24 casas contra tabela de referência |
| Exportação PNG com baixa qualidade em HiDPI | Renderizar canvas em 2x resolution scale |
| Layout responsivo quebrando em mobile | Viewport mínimo 768px, scroll horizontal em telas menores |

## 6. API contract

Não se aplica — ferramenta client-side pura, sem backend.

## 7. Data model

Estado em memória (JavaScript):

```typescript
interface Marker {
  string: number;    // 0-5 (0 = mais aguda/e弦)
  fret: number;      // 0 = corda solta (nut), 1+ = casa
  type: 'filled' | 'open' | 'x' | 'label';
  label: string;     // texto customizado (vazio = mostra nota automática)
}

interface DiagramState {
  tuning: string[];       // ["E2","A2","D3","G3","B3","E4"]
  visibleFrets: number;   // 12
  startFret: number;      // 1
  markers: Marker[];
  showNotes: boolean;     // true = auto-calc note names
}

// Notas musicais
const NOTES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
```

## 8. Error handling

- Clique fora da grade: ignorado silenciosamente
- Posição de traste inválida (>24): não adiciona marcador
- Exportação falha (browser antigo sem canvas.toBlob): alerta com instrução de screenshot manual

## 9. Observabilidade

Não se aplica — ferramenta client-side sem telemetria.

## 10. Quality attributes

- Renderização: < 16ms por frame (60fps) no canvas
- Tamanho total: < 50KB (HTML+CSS+JS em arquivo único)
- Tempo de carga: < 1s em conexão 3G

## 11. Threat model

- **XSS**: sanitizar labels customizados (escapar HTML)
- **Sem dados sensíveis**: tudo é local, sem envio a servidor
- **Download seguro**: SVG/PNG gerados client-side, sem risco de injeção

## 12. Rollout

Não se aplica — arquivo HTML único, sem deploy.

## 13. Rollback

Não se aplica.

## 14. Acceptance criteria

- [ ] AC-1: Abrir `index.html` no navegador mostra grade 6×12 com nome das cordas à esquerda
- [ ] AC-2: Clicar na interseção corda-casa adiciona círculo preenchido com nota automática
- [ ] AC-3: Clicar em marcador existente remove-o
- [ ] AC-4: Botão "Limpar" remove todos os marcadores
- [ ] AC-5: Campo de tuning permite alterar afinação; notas recalculam automaticamente
- [ ] AC-6: Botão "Exportar PNG" faz download de imagem com fundo branco
- [ ] AC-7: Botão "Exportar SVG" faz download de SVG editável
- [ ] AC-8: Slider/input de posição inicial move a janela de casas visíveis
- [ ] AC-9: Marcador tipo "X" na posição nut (fret=0) indica corda não tocada
- [ ] AC-10: Marcador tipo "O" na posição nut indica corda solta

## 15. Open questions

- (nenhuma — escopo fechado)

## 16. Implementation plan

1. **step-1**: Scaffold — arquivo `index.html` único com HTML semântico, CSS grid do braço e constantes musicais (notas, afinação)
2. **step-2**: Canvas/SVG rendering — desenhar cordas, trastes, marcadores de posição e labels de casa
3. **step-3**: Interação — clique para adicionar/remover marcadores, cálculo automático de nota por posição
4. **step-4**: Controles — barra de ferramentas (limpar, tipos de marcador, labels customizados, posição inicial)
5. **step-5**: Exportação — PNG via Canvas e SVG via string template
6. **step-6**: Polimento — responsividade, teclas de atalho, estilo visual final
