const { test, expect } = require("./fixtures");

test.describe("Minimap da janela e afinação", () => {
  test.describe("AC-P7: minimap de casas 0 a 24", () => {
    test("mostra 25 ticks e destaca a janela inicial no nut", async ({ fretboard }) => {
      await expect(fretboard.windowMap).toBeVisible();
      await expect(fretboard.windowMap.locator(".window-tick")).toHaveCount(25);
      await expect(fretboard.windowTick(0)).toHaveAttribute("aria-pressed", "true");
      await expect(fretboard.windowTick(1)).toHaveAttribute("aria-pressed", "true");
      await expect(fretboard.windowTick(12)).toHaveAttribute("aria-pressed", "true");
      await expect(fretboard.windowTick(13)).toHaveAttribute("aria-pressed", "false");
    });

    test("clicar em um tick move a janela para essa casa", async ({ fretboard }) => {
      await fretboard.windowTick(12).click();

      await expect(fretboard.startFret).toHaveValue("12");
      await expect(fretboard.readout).toHaveText("12—23");
      await expect(fretboard.windowTick(12)).toHaveAttribute("aria-pressed", "true");
      await expect(fretboard.windowTick(0)).toHaveAttribute("aria-pressed", "false");
    });

    test("mudar a janela atualiza os ticks pressionados", async ({ fretboard }) => {
      await fretboard.startFret.fill("5");

      await expect(fretboard.windowTick(5)).toHaveAttribute("aria-pressed", "true");
      await expect(fretboard.windowTick(16)).toHaveAttribute("aria-pressed", "true");
      await expect(fretboard.windowTick(4)).toHaveAttribute("aria-pressed", "false");
    });

    test("anuncia a mudança de janela ao clicar no minimap", async ({ fretboard }) => {
      await fretboard.windowTick(9).click();

      await expect(fretboard.status).toContainText("Janela iniciada na casa 9.");
    });
  });

  test("o select identifica as afinações pelas notas sem repetir um helper", async ({ fretboard }) => {
    await expect(fretboard.tuning.locator('option[value="standard"]')).toHaveText(
      "Padrão · E A D G B E"
    );
    await expect(fretboard.page.locator("#tuning-notes")).toHaveCount(0);
  });
});

test.describe("Barra rápida mobile", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("mostra os modos Marcar e Ligar acima do braço", async ({ fretboard }) => {
    await expect(fretboard.mobileQuick).toBeVisible();
    await expect(fretboard.mobileQuick.locator('.tool-bar-button[data-tool="marker"]')).toBeVisible();
    await expect(fretboard.mobileQuick.locator('.tool-bar-button[data-tool="connect"]')).toBeVisible();
  });

  test("alternar para Ligar pela barra rápida", async ({ fretboard }) => {
    await fretboard.mobileQuick.locator('.tool-bar-button[data-tool="connect"]').click();

    const { editor } = await fretboard.state();
    expect(editor.activeTool).toBe("connect");
    await expect(fretboard.mobileQuick.locator('.tool-bar-button[data-tool="connect"]')).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  test("a cor ativa aparece no indicador da barra rápida", async ({ fretboard }) => {
    await fretboard.pickColor("Azul");

    const swatchColor = await fretboard.mobileSwatch.evaluate((node) => getComputedStyle(node).backgroundColor);
    const tokenColor = await fretboard.page.evaluate(() => {
      const probe = document.createElement("div");
      probe.style.color = getComputedStyle(document.documentElement).getPropertyValue("--color-marker-blue").trim();
      document.body.append(probe);
      const color = getComputedStyle(probe).color;
      probe.remove();
      return color;
    });

    expect(swatchColor).toBe(tokenColor);
  });
});
