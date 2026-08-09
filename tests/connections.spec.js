const { test, expect } = require("./fixtures");

test.describe("Ligacoes entre marcadores", () => {
  test("modo ligar cria uma linha entre dois marcadores", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(1, 4);
    await fretboard.activate(6, 4);
    await fretboard.activate(5, 6);

    await fretboard.connectMarkers(1, 4, 5, 6);

    expect(await fretboard.connections()).toHaveLength(1);
    await expect(fretboard.connectionLines()).toHaveCount(1);
    await expect(fretboard.status).toContainText("Ligação criada");
  });

  test("nao duplica ligação entre o mesmo par", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(1, 4);
    await fretboard.activate(6, 4);
    await fretboard.activate(5, 6);

    await fretboard.connectMarkers(1, 4, 5, 6);
    await fretboard.connectMarkers(1, 4, 5, 6);

    expect(await fretboard.connections()).toHaveLength(1);
    await expect(fretboard.status).toContainText("já existe");
  });

  test("remover marcador remove ligacoes associadas", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(1, 4);
    await fretboard.activate(5, 6);
    await fretboard.connectMarkers(1, 4, 5, 6);

    await fretboard.activate(1, 4);
    await fretboard.remove.click();

    expect(await fretboard.connections()).toHaveLength(0);
    await expect(fretboard.connectionLines()).toHaveCount(0);
  });

  test("undo e redo restauram ligacoes", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(1, 4);
    await fretboard.activate(5, 6);
    await fretboard.connectMarkers(1, 4, 5, 6);

    await fretboard.undo.click();
    expect(await fretboard.connections()).toHaveLength(0);

    await fretboard.redo.click();
    expect(await fretboard.connections()).toHaveLength(1);
  });

  test("cor independente da ligacao aparece no SVG", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(1, 4);
    await fretboard.activate(5, 6);

    await fretboard.pickWorkTool("connect");
    await fretboard.pickColor("Azul");
    await fretboard.activate(1, 4);
    await fretboard.activate(5, 6);

    const azul = await fretboard.markerTokenColor("--color-marker-blue");
    const stroke = await fretboard.connectionLines().first().getAttribute("stroke");

    expect(stroke).toBe(azul);
    expect((await fretboard.connections())[0].color).toBe("--color-marker-blue");
  });

  test("inspetor remove ligacao individual", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(1, 4);
    await fretboard.activate(5, 6);
    await fretboard.activate(6, 4);
    await fretboard.connectMarkers(1, 4, 5, 6);
    await fretboard.connectMarkers(1, 4, 6, 4);

    await fretboard.activate(1, 4);
    await expect(fretboard.connectionField).toBeVisible();
    await expect(fretboard.connectionList.locator(".connection-item")).toHaveCount(2);

    await fretboard.connectionList.locator(".connection-remove").first().click();

    expect(await fretboard.connections()).toHaveLength(1);
    await expect(fretboard.connectionList.locator(".connection-item")).toHaveCount(1);
  });

  test("modo ligar ignora posicao vazia", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(1, 4);
    await fretboard.pickWorkTool("connect");
    await fretboard.activate(2, 5);

    expect(await fretboard.connections()).toHaveLength(0);
    await expect(fretboard.status).toContainText("Selecione um marcador");
  });

  test("export SVG inclui ligacoes e omite highlight de origem", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(1, 4);
    await fretboard.activate(5, 6);
    await fretboard.connectMarkers(1, 4, 5, 6);

    const svg = await fretboard.exportedSvg();

    expect(svg).toContain('data-diagram-layer="connections"');
    expect(svg).toContain("<line");
    expect(svg).not.toContain("data-editor-layer");
  });
});
