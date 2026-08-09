const { test, expect } = require("./fixtures");

test.describe("Titulo do diagrama", () => {
  test("editar o titulo atualiza o cabecalho do SVG", async ({ fretboard }) => {
    await fretboard.typeDiagramTitle("POWER CHORD / 06");

    await expect(fretboard.diagramTitle).toHaveValue("POWER CHORD / 06");
    await expect(fretboard.svg.locator("text").first()).toHaveText("POWER CHORD / 06");
  });

  test("titulo customizado aparece na exportacao SVG", async ({ fretboard }) => {
    await fretboard.typeDiagramTitle("OPEN G SCALE");

    const svg = await fretboard.exportedSvg();

    expect(svg).toContain("OPEN G SCALE");
    expect(svg).toContain("<title id=\"svg-title\">OPEN G SCALE</title>");
  });

  test("titulo vazio restaura o padrao", async ({ fretboard }) => {
    await fretboard.typeDiagramTitle("CUSTOM TITLE");
    await fretboard.typeDiagramTitle("   ");

    await expect(fretboard.diagramTitle).toHaveValue("FRETBOARD / 06 STRING");
    await expect(fretboard.status).toContainText("restaurado ao padrão");
  });

  test("desfazer restaura o titulo anterior", async ({ fretboard }) => {
    await fretboard.typeDiagramTitle("DROP D RIFF");
    await fretboard.undo.click();

    await expect(fretboard.diagramTitle).toHaveValue("FRETBOARD / 06 STRING");
    const svg = await fretboard.exportedSvg();
    expect(svg).toContain("FRETBOARD / 06 STRING");
  });
});
