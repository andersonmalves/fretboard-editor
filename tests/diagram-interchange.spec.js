const fs = require("node:fs");
const path = require("node:path");
const { test, expect, INDEX_HTML_BYTE_BUDGET } = require("./fixtures");

test.describe("Intercambio JSON", () => {
  test("AC-J1: exportar JSON inclui diagrama completo e startFret", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(3, 4);
    await fretboard.setLabel("R");
    await fretboard.startFret.fill("5");
    await fretboard.setDiagramTitle("Shape A");

    const raw = await fretboard.serializedDiagram();
    const doc = JSON.parse(raw);

    expect(doc.schemaVersion).toBe(1);
    expect(doc.tuningPresetId).toBe("standard");
    expect(doc.diagramTitle).toBe("Shape A");
    expect(doc.startFret).toBe(5);
    expect(doc.markers).toHaveLength(1);
    expect(doc.markers[0]).toMatchObject({
      stringIndex: 2,
      fret: 4,
      type: "filled",
      customLabel: "R"
    });
    expect(doc.connections).toEqual([]);
  });

  test("AC-J2: baixar JSON usa o titulo sanitizado", async ({ fretboard }) => {
    await fretboard.setDiagramTitle("Pentatonica A / forma 1");

    const [download] = await Promise.all([
      fretboard.page.waitForEvent("download"),
      fretboard.downloadJsonClick()
    ]);

    expect(download.suggestedFilename()).toBe("Pentatonica A forma 1.json");
    const conteudo = fs.readFileSync(await download.path(), "utf8");
    const doc = JSON.parse(conteudo);
    expect(doc.diagramTitle).toBe("Pentatonica A / forma 1");
    await expect(fretboard.status).toContainText("JSON preparado");
  });

  test("AC-J3/J5: round-trip via API restaura estado e undo volta ao anterior", async ({
    fretboard
  }) => {
    await fretboard.pickTool("filled");
    await fretboard.pickColor("Azul");
    await fretboard.activate(1, 3);
    await fretboard.activate(5, 5);
    await fretboard.connectMarkers(1, 3, 5, 5);
    await fretboard.startFret.fill("2");
    await fretboard.chooseTuning("open-g");
    await fretboard.setDiagramTitle("Open G shape");

    const exported = await fretboard.serializedDiagram();
    const before = await fretboard.state();

    await fretboard.clear.click();
    expect(await fretboard.markers()).toHaveLength(0);

    await fretboard.importDiagramDocument(exported);

    const after = await fretboard.state();
    expect(after.content).toEqual(before.content);
    expect(after.editor.startFret).toBe(2);
    await expect(fretboard.status).toContainText("Diagrama importado");

    await fretboard.undo.click();
    expect(await fretboard.markers()).toHaveLength(0);
    expect((await fretboard.state()).content).toEqual({
      tuningPresetId: "open-g",
      diagramTitle: "Open G shape",
      markers: [],
      connections: []
    });
  });

  test("AC-J4: JSON invalido preserva o diagrama e anuncia erro", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(6, 3);
    const before = JSON.stringify((await fretboard.state()).content);

    const cases = [
      { label: "parse", payload: "{" },
      { label: "schema", payload: JSON.stringify({ schemaVersion: 9 }) },
      { label: "afinacao", payload: JSON.stringify({ schemaVersion: 1, tuningPresetId: "x" }) },
      {
        label: "ligacao orfa",
        payload: JSON.stringify({
          schemaVersion: 1,
          tuningPresetId: "standard",
          diagramTitle: "X",
          startFret: 0,
          markers: [
            {
              id: "marker-1",
              stringIndex: 0,
              fret: 1,
              type: "filled",
              color: null,
              customLabel: ""
            }
          ],
          connections: [{ a: "marker-1", b: "marker-9", color: null }]
        })
      }
    ];

    for (const item of cases) {
      await fretboard.importDiagramDocument(item.payload);
      await expect(fretboard.status).toContainText(/inválid|não reconhecido|não é suportada|importar/i);
      expect(JSON.stringify((await fretboard.state()).content)).toBe(before);
    }
  });

  test("AC-J3: importar substitui diagrama existente", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(6, 1);

    const payload = JSON.stringify({
      schemaVersion: 1,
      tuningPresetId: "drop-d",
      diagramTitle: "Drop D",
      startFret: 3,
      markers: [
        {
          id: "marker-1",
          stringIndex: 5,
          fret: 7,
          type: "outline",
          color: "--color-marker-green",
          customLabel: "5"
        }
      ],
      connections: []
    });

    await fretboard.importDiagramDocument(payload);

    const state = await fretboard.state();
    expect(state.content.tuningPresetId).toBe("drop-d");
    expect(state.content.diagramTitle).toBe("Drop D");
    expect(state.content.markers).toHaveLength(1);
    expect(state.content.markers[0]).toMatchObject({
      stringIndex: 5,
      fret: 7,
      type: "outline",
      color: "--color-marker-green",
      customLabel: "5"
    });
    expect(state.editor.startFret).toBe(3);
  });

  test("AC-J8: input de importacao aceita application/json", async ({ fretboard }) => {
    await expect(fretboard.importJsonInput).toHaveAttribute(
      "accept",
      "application/json,.json"
    );
    await fretboard.openExportMenu();
    const box = await fretboard.importJson.boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  });
});

test.describe("Orcamento intercambio JSON", () => {
  test("AC-J9: index.html permanece dentro de 73.728 bytes", () => {
    const arquivo = path.join(__dirname, "..", "index.html");
    const bytes = fs.statSync(arquivo).size;

    expect(bytes).toBeLessThanOrEqual(INDEX_HTML_BYTE_BUDGET);
  });
});
