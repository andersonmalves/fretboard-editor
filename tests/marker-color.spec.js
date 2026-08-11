const { test, expect } = require("./fixtures");

test.describe("Cor do marcador", () => {
  test("AC-37: escolher cor antes de criar aplica no proximo marcador", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.pickColor("Azul");
    await fretboard.activate(3, 4);

    expect((await fretboard.markerAt(3, 4)).color).toBe("--color-marker-blue");
    const blue = await fretboard.markerTokenColor("--color-marker-blue");
    await expect(fretboard.svg.locator('[data-diagram-layer="markers"] circle').first()).toHaveAttribute(
      "fill",
      blue
    );
  });

  test("AC-37: alterar cor do marcador selecionado", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(3, 4);

    await fretboard.colorSwatch("Verde").click();

    expect((await fretboard.markerAt(3, 4)).color).toBe("--color-marker-green");
    await expect(fretboard.status).toContainText("alterada para verde");
    await expect(fretboard.colorName).toHaveText("Verde");
  });

  test("AC-37: cor aparece no SVG exportado", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.pickColor("Azul");
    await fretboard.activate(3, 4);

    const blue = await fretboard.markerTokenColor("--color-marker-blue");
    const svg = await fretboard.exportedSvg();

    expect(svg).toContain(blue);
  });

  test("AC-37: cor sobrevive undo e redo", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(3, 4);
    await fretboard.colorSwatch("Roxo").click();

    expect((await fretboard.markerAt(3, 4)).color).toBe("--color-marker-purple");

    await fretboard.undo.click();
    expect((await fretboard.markerAt(3, 4)).color).toBeNull();

    await fretboard.redo.click();
    expect((await fretboard.markerAt(3, 4)).color).toBe("--color-marker-purple");
  });

  test("AC-37: cor sobrevive troca de afinacao", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.pickColor("Laranja");
    await fretboard.activate(3, 4);

    await fretboard.chooseTuning("drop-d");

    expect((await fretboard.markerAt(3, 4)).color).toBe("--color-marker-orange");
  });

  test("AC-37: muted ignora cor no desenho", async ({ fretboard }) => {
    await fretboard.pickColor("Azul");
    await fretboard.pickTool("muted");
    await fretboard.activate(3, 0);

    const blue = await fretboard.markerTokenColor("--color-marker-blue");
    const ink = await fretboard.diagramInkColor();

    expect(await fretboard.svg.locator('[data-diagram-layer="markers"] circle').count()).toBe(0);
    const stroke = await fretboard.svg
      .locator('[data-diagram-layer="markers"] line')
      .first()
      .getAttribute("stroke");
    expect(stroke).toBe(ink);
    expect(stroke).not.toBe(blue);
  });

  test("AC-37: texto preenchido usa branco em fill escuro", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.pickColor("Azul");
    await fretboard.activate(3, 4);

    const white = await fretboard.markerTokenColor("--color-white");
    const textFill = await fretboard.svg
      .locator('[data-diagram-layer="markers"] text')
      .first()
      .getAttribute("fill");

    expect(textFill).toBe(white);
  });

  test("AC-37: setas navegam entre swatches de cor", async ({ fretboard }) => {
    await fretboard.colorSwatches().first().focus();
    await fretboard.page.keyboard.press("ArrowRight");

    const focusedLabel = await fretboard.page.evaluate(() => document.activeElement?.getAttribute("aria-label"));
    expect(focusedLabel).toBe("Azul");
    await expect(fretboard.colorSwatch("Azul")).toHaveAttribute("aria-checked", "true");
  });

  test("as cores têm alvo de toque de 44 px e confirmação visual", async ({ fretboard }) => {
    const boxes = await fretboard.colorSwatches().evaluateAll((swatches) =>
      swatches.map((swatch) => {
        const box = swatch.getBoundingClientRect();
        return { width: box.width, height: box.height, x: box.x, y: box.y };
      })
    );

    expect(boxes.every(({ width, height }) => width >= 44 && height >= 44)).toBe(true);
    expect(new Set(boxes.map(({ x }) => Math.round(x))).size).toBe(4);
    expect(new Set(boxes.map(({ y }) => Math.round(y))).size).toBe(2);
    await fretboard.colorSwatch("Azul").click();
    await expect(fretboard.colorName).toHaveText("Azul");
    const check = await fretboard
      .colorSwatch("Azul")
      .evaluate((swatch) => getComputedStyle(swatch, ":after").content);
    expect(check).toBe('"✓"');
  });
});
