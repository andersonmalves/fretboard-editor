const { test, expect } = require("./fixtures");

test.describe("Pan horizontal da janela do braço", () => {
  test("AC-P1: arrastar uma casa para a esquerda avança a janela", async ({ fretboard }) => {
    const fretPx = await fretboard.fretPixelWidth();

    await fretboard.panWindow(-fretPx * 1.1);

    expect((await fretboard.state()).editor.startFret).toBe(1);
    await expect(fretboard.readout).toHaveText("01—12");
    await expect(fretboard.status).toContainText("Janela iniciada na casa 1.");
  });

  test("AC-P2: arraste longo fixa no limite superior", async ({ fretboard }) => {
    const box = await fretboard.canvas.boundingBox();

    await fretboard.panWindow(-box.width * 0.9, { fromRatio: 0.9 });

    expect((await fretboard.state()).editor.startFret).toBe(13);
    await expect(fretboard.readout).toHaveText("13—24");
  });

  test("AC-P3: toque curto cria marcador; arraste com slop nao cria", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.cell(3, 4).click();

    expect(await fretboard.markers()).toHaveLength(1);

    const fretPx = await fretboard.fretPixelWidth();
    await fretboard.panWindow(-fretPx * 1.1, { fromRatio: 0.35 });

    expect(await fretboard.markers()).toHaveLength(1);
    expect((await fretboard.state()).editor.startFret).toBeGreaterThan(0);
  });

  test("AC-P4: a grade declara arraste horizontal", async ({ fretboard }) => {
    await expect(fretboard.grid).toHaveAttribute("aria-label", /arraste horizontal/i);
  });
});

test.describe("AC-P5: pan em viewport touch", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "emulacao touch so no Chromium");
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("arrastar no touch move a janela", async ({ fretboard }) => {
    const fretPx = await fretboard.fretPixelWidth();

    await fretboard.panWindow(-fretPx * 1.1);

    expect((await fretboard.state()).editor.startFret).toBe(1);
    await expect(fretboard.readout).toHaveText("01—06");
  });
});
