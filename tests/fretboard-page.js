const { expect } = require("@playwright/test");

/**
 * Page Object do editor.
 *
 * Convencao: `corda` e 1-based como a interface mostra ao usuario (corda 1 = mais aguda,
 * no topo), enquanto o estado interno usa `stringIndex` 0-based.
 *
 * Os testes dirigem a UI real (cliques, teclado, inputs). `window.__fretboardEditor`
 * e usado apenas para *ler* estado nas assercoes, nunca para executar a acao sob teste —
 * os defeitos historicos deste editor viviam nos handlers de evento, nao na API exposta.
 */
class FretboardPage {
  constructor(page) {
    this.page = page;
    this.svg = page.locator("#fretboard-svg");
    this.grid = page.locator("#fretboard-grid");
    this.tuning = page.locator("#tuning-select");
    this.startFret = page.locator("#start-fret");
    this.startFretError = page.locator("#start-fret-error");
    this.previousFret = page.locator("#previous-fret");
    this.nextFret = page.locator("#next-fret");
    this.undo = page.locator("#undo-button");
    this.redo = page.locator("#redo-button");
    this.clear = page.locator("#clear-button");
    this.remove = page.locator("#remove-button");
    this.deselect = page.locator("#deselect-button");
    this.label = page.locator("#label-input");
    this.exportSvg = page.locator("#export-svg");
    this.exportPng = page.locator("#export-png");
    this.status = page.locator("#status");
    this.readout = page.locator("#window-readout");
    this.badge = page.locator("#note-badge");
    this.coordinate = page.locator("#selection-coordinate");
    this.selectionName = page.locator("#selection-name");
    this.hint = page.locator("#board-hint");
    this.kicker = page.locator("#selection-kicker");
    this.colorGroup = page.locator("#color-group");
    this.diagramTitle = page.locator("#diagram-title");
    this.consoleErrors = [];
  }

  async goto() {
    this.page.on("console", (message) => {
      if (message.type() === "error" || message.type() === "warning") {
        this.consoleErrors.push(`${message.type()}: ${message.text()}`);
      }
    });
    this.page.on("pageerror", (error) => this.consoleErrors.push(`pageerror: ${error.message}`));
    await this.page.goto("/");
    await expect(this.svg).toBeVisible();
  }

  cell(corda, casa) {
    return this.grid.locator(`[data-string-index="${corda - 1}"][data-fret="${casa}"]`);
  }

  /** Ativa uma posicao por clique — cria ou seleciona, conforme o estado. */
  async activate(corda, casa) {
    await this.cell(corda, casa).click();
  }

  toolButton(tipo) {
    return this.page.locator(`.type-button[data-type="${tipo}"]`);
  }

  colorSwatch(label) {
    return this.colorGroup.locator(`.color-swatch[aria-label="${label}"]`);
  }

  colorSwatches() {
    return this.colorGroup.locator(".color-swatch");
  }

  /**
   * Escolhe a cor do proximo marcador. Desmarca antes, porque os swatches editam a selecao
   * quando ela existe (mesmo padrao dos botoes de tipo).
   */
  async pickColor(label) {
    if (await this.deselect.isEnabled()) await this.deselect.click();
    await this.colorSwatch(label).click();
  }

  async markerTokenColor(token) {
    return this.page.evaluate((name) => {
      return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    }, token);
  }

  async diagramInkColor() {
    return this.markerTokenColor("--color-diagram-ink");
  }

  /**
   * Escolhe a ferramenta do proximo marcador. Desmarca antes, porque os botoes de tipo
   * editam a selecao quando ela existe (ver D10 no relatorio de revisao).
   */
  async pickTool(tipo) {
    if (await this.deselect.isEnabled()) await this.deselect.click();
    await this.toolButton(tipo).click();
  }

  async setLabel(texto) {
    await this.label.fill(texto);
  }

  async setDiagramTitle(texto) {
    await this.diagramTitle.fill(texto);
    await this.diagramTitle.blur();
  }

  async typeDiagramTitle(texto) {
    await this.diagramTitle.click();
    await this.diagramTitle.fill(texto);
    await this.diagramTitle.blur();
  }

  /** Digita tecla a tecla no fim do campo, sem limpar — reproduz digitacao humana. */
  async typeLabel(texto) {
    await this.label.click();
    await this.label.press("End");
    await this.label.pressSequentially(texto);
  }

  async chooseTuning(id) {
    await this.tuning.selectOption(id);
  }

  async state() {
    return this.page.evaluate(() => window.__fretboardEditor.getState());
  }

  async markers() {
    return (await this.state()).content.markers;
  }

  async markerAt(corda, casa) {
    const markers = await this.markers();
    return markers.find((m) => m.stringIndex === corda - 1 && m.fret === casa) || null;
  }

  /** Numero de undos disponiveis, medido drenando o historico ate o estado parar de mudar. */
  async drainUndo() {
    return this.page.evaluate(() => {
      const api = window.__fretboardEditor;
      const snapshot = () => JSON.stringify(api.getState().content);
      let count = 0;
      let previous = snapshot();
      while (count < 200) {
        api.undo();
        const current = snapshot();
        if (current === previous) break;
        previous = current;
        count += 1;
      }
      return count;
    });
  }

  async exportedSvg() {
    return this.page.evaluate(() => window.__fretboardEditor.exportedSvgMarkup());
  }

  /** Textos dos marcadores desenhados, na ordem em que aparecem no SVG. */
  async drawnMarkerLabels() {
    return this.svg.locator('[data-diagram-layer="markers"] text').allTextContents();
  }

  async drawnMarkerCount() {
    return this.svg.locator('[data-diagram-layer="markers"] circle, [data-diagram-layer="markers"] line').count();
  }

  /** Posicoes horizontais dos pontos de inlay (marcadores de posicao do braco). */
  async inlayDots() {
    return this.page.evaluate(() => {
      const svg = document.querySelector("#fretboard-svg");
      const inlayRow = Math.max(
        ...[...svg.querySelectorAll("circle")].map((c) => Number(c.getAttribute("cy")))
      );
      return [...svg.querySelectorAll("circle")]
        .filter((c) => Number(c.getAttribute("cy")) === inlayRow)
        .map((c) => Number(c.getAttribute("cx")));
    });
  }

  async focusedCell() {
    return this.page.evaluate(() => {
      const active = document.activeElement;
      if (!active || !active.classList.contains("grid-cell")) return null;
      return { corda: Number(active.dataset.stringIndex) + 1, casa: Number(active.dataset.fret) };
    });
  }

  /** Celulas na ordem de tabulacao. O padrao roving tabindex admite exatamente uma. */
  async tabbableCells() {
    return this.grid.locator('.grid-cell[tabindex="0"]').count();
  }
}

module.exports = { FretboardPage };
