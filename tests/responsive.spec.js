const { test, expect } = require("./fixtures");

test.describe("AC-11: janela de casas por viewport", () => {
  test.describe("320 px", () => {
    test.use({ viewport: { width: 320, height: 800 } });

    test("o seletor de afinação mantém largura útil e as ações usam outra linha", async ({
      fretboard
    }) => {
      const tuning = await fretboard.tuning.boundingBox();
      const actions = await fretboard.page.locator(".actions-cluster").boundingBox();

      expect(tuning.width).toBeGreaterThanOrEqual(200);
      expect(actions.y).toBeGreaterThanOrEqual(tuning.y + tuning.height);
      expect(await fretboard.page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
    });
  });

  test.describe("390 px", () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test("mostra seis casas e mantem nut e cordas alcancaveis", async ({ fretboard }) => {
      expect((await fretboard.state()).editor.visibleFrets).toBe(6);
      await expect(fretboard.readout).toHaveText("NUT + 01—06");
      // Seis cordas x (nut + seis casas).
      await expect(fretboard.grid.locator(".grid-cell")).toHaveCount(42);

      for (let corda = 1; corda <= 6; corda += 1) {
        await expect(fretboard.cell(corda, 0)).toBeVisible();
        await expect(fretboard.cell(corda, 6)).toBeVisible();
      }
    });

    test("AC-28: anterior e proxima alcancam a casa 24", async ({ fretboard }) => {
      await fretboard.startFret.fill("19");

      await expect(fretboard.readout).toHaveText("19—24");
      await expect(fretboard.cell(1, 24)).toBeVisible();
    });

    test("nenhum conteudo essencial nasce fora da tela", async ({ fretboard }) => {
      const overflow = await fretboard.page.evaluate(() => {
        const alvos = [...document.querySelectorAll(".grid-cell, .control, .button, .tool-bar-button")];
        return alvos
          .map((el) => el.getBoundingClientRect())
          .filter((r) => r.width > 0 && (r.left < -1 || r.right > window.innerWidth + 1)).length;
      });

      expect(overflow).toBe(0);
    });

    test("a pagina nao rola horizontalmente", async ({ fretboard }) => {
      const rolagem = await fretboard.page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth
      }));

      expect(rolagem.scrollWidth).toBeLessThanOrEqual(rolagem.clientWidth + 1);
    });
  });

  test.describe("768 px", () => {
    test.use({ viewport: { width: 768, height: 1024 } });

    test("mostra doze casas", async ({ fretboard }) => {
      expect((await fretboard.state()).editor.visibleFrets).toBe(12);
      await expect(fretboard.readout).toHaveText("NUT + 01—12");
      await expect(fretboard.grid.locator(".grid-cell")).toHaveCount(78);
    });
  });

  test.describe("1440 px", () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test("mostra doze casas e o inspetor ao lado da prancha", async ({ fretboard }) => {
      expect((await fretboard.state()).editor.visibleFrets).toBe(12);

      const prancha = await fretboard.page.locator(".artboard-panel").boundingBox();
      const inspetor = await fretboard.page.locator(".inspector").boundingBox();

      expect(inspetor.x).toBeGreaterThan(prancha.x + prancha.width - 1);
      expect(inspetor.width).toBeGreaterThanOrEqual(319);
      expect(inspetor.width).toBeLessThanOrEqual(321);
    });
  });
});

test.describe("AC-12: alvos de toque", () => {
  // A emulacao de ponteiro coarse depende de flags que so o Chromium expoe de forma
  // estavel no Playwright; o layout compacto em si e coberto acima nos tres motores.
  test.skip(({ browserName }) => browserName !== "chromium", "emulacao touch so no Chromium");
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("os controles principais medem ao menos 44 x 44 px", async ({ fretboard }) => {
    const seletores = [
      "#tuning-select",
      "#start-fret",
      "#previous-fret",
      "#next-fret",
      "#undo-button",
      "#redo-button",
      "#clear-button",
      "#export-menu-toggle",
      '.mode-group .tool-bar-button[data-tool="marker"]',
      '#marker-tool-bar .tool-bar-button[data-type="filled"]',
      "#sound-toggle"
    ];

    for (const seletor of seletores) {
      const caixa = await fretboard.page.locator(seletor).boundingBox();
      expect(caixa.width, `${seletor} largura`).toBeGreaterThanOrEqual(43.5);
      expect(caixa.height, `${seletor} altura`).toBeGreaterThanOrEqual(43.5);
    }

    await fretboard.activate(3, 4);
    for (const seletor of ["#remove-button", "#deselect-button"]) {
      const caixa = await fretboard.page.locator(seletor).boundingBox();
      expect(caixa.width, `${seletor} largura`).toBeGreaterThanOrEqual(43.5);
      expect(caixa.height, `${seletor} altura`).toBeGreaterThanOrEqual(43.5);
    }
  });

  test("as celulas da grade medem ao menos 44 x 44 px", async ({ fretboard }) => {
    const menor = await fretboard.page.evaluate(() => {
      const caixas = [...document.querySelectorAll(".grid-cell")].map((el) =>
        el.getBoundingClientRect()
      );
      return {
        largura: Math.min(...caixas.map((c) => c.width)),
        altura: Math.min(...caixas.map((c) => c.height))
      };
    });

    expect(menor.largura).toBeGreaterThanOrEqual(43.5);
    expect(menor.altura).toBeGreaterThanOrEqual(43.5);
  });

  test("criar por toque funciona na janela compacta", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.cell(3, 4).tap();

    expect(await fretboard.markers()).toHaveLength(1);
  });
});

test.describe("AC-33: movimento reduzido", () => {
  test.use({ reducedMotion: "reduce" });

  test("nenhuma transicao nao essencial permanece", async ({ fretboard }) => {
    const transicoes = await fretboard.page.evaluate(() =>
      [...document.querySelectorAll(".button, .control, .tool-bar-button, .grid-cell, .status")]
        .map((el) => getComputedStyle(el))
        .filter(
          (estilo) =>
            parseFloat(estilo.transitionDuration) > 0 || parseFloat(estilo.animationDuration) > 0
        ).length
    );

    expect(transicoes).toBe(0);
  });
});

test.describe("AC-23: console limpo", () => {
  test("os fluxos cobertos nao produzem erro nem warning", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(6, 3);
    await fretboard.setLabel("R");
    await fretboard.toolButton("outline").click();
    await fretboard.chooseTuning("eb-standard");
    await fretboard.startFret.fill("7");
    await fretboard.startFret.fill("");
    await fretboard.startFret.fill("0");
    await fretboard.undo.click();
    await fretboard.redo.click();
    await fretboard.clear.click();
    await fretboard.undo.click();
    await fretboard.openExportMenu();
    await Promise.all([
      fretboard.page.waitForEvent("download"),
      fretboard.exportSvg.click()
    ]);

    expect(fretboard.consoleErrors).toEqual([]);
  });
});
