const { test, expect } = require("./fixtures");

test.describe("Transpor forma", () => {
  test("AC-T4: sem marcadores os controles ficam desabilitados", async ({ fretboard }) => {
    await expect(fretboard.transposeDown).toBeDisabled();
    await expect(fretboard.transposeUp).toBeDisabled();
    expect(await fretboard.drainUndo()).toBe(0);
  });

  test("AC-T1/T7/T8: +1 e −1 movem todos, preservam ids/cores/rótulos e anunciam", async ({
    fretboard
  }) => {
    await fretboard.pickTool("filled");
    await fretboard.pickColor("Azul");
    await fretboard.activate(3, 4);
    await fretboard.setLabel("R");
    await fretboard.deselect.click();
    await fretboard.pickColor("Padrão");
    await fretboard.activate(5, 5);

    const before = await fretboard.markers();
    const ids = before.map((marker) => marker.id).sort();
    const labeled = before.find((marker) => marker.customLabel === "R");

    await fretboard.transposeUp.click();
    await expect(fretboard.status).toContainText("para cima");

    const up = await fretboard.markers();
    expect(up.map((marker) => marker.id).sort()).toEqual(ids);
    expect(up.find((marker) => marker.id === labeled.id).fret).toBe(5);
    expect(up.find((marker) => marker.id === labeled.id).color).toBe(labeled.color);
    expect(up.find((marker) => marker.id === labeled.id).customLabel).toBe("R");
    expect(up.find((marker) => !marker.customLabel).fret).toBe(6);
    expect(await fretboard.drawnMarkerLabels()).toContain("R");

    await fretboard.transposeDown.click();
    await expect(fretboard.status).toContainText("para baixo");
    const restored = await fretboard.markers();
    expect(restored.map((marker) => `${marker.stringIndex}:${marker.fret}`).sort()).toEqual(
      before.map((marker) => `${marker.stringIndex}:${marker.fret}`).sort()
    );

    const box = await fretboard.transposeUp.boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
    await expect(fretboard.transposeUp).toHaveAttribute(
      "aria-label",
      "Transpor forma uma casa em direção ao corpo"
    );
    await expect(fretboard.transposeDown).toHaveAttribute(
      "aria-label",
      "Transpor forma uma casa em direção ao nut"
    );
  });

  test("AC-T2: ligacoes seguem pelos mesmos ids apos transpor", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(1, 4);
    await fretboard.activate(5, 6);
    await fretboard.connectMarkers(1, 4, 5, 6);
    const before = await fretboard.connections();

    await fretboard.transposeUp.click();

    expect(await fretboard.connections()).toEqual(before);
    expect(await fretboard.markerAt(1, 5)).not.toBeNull();
    expect(await fretboard.markerAt(5, 7)).not.toBeNull();
    await expect(fretboard.connectionLines()).toHaveCount(1);

    const svg = await fretboard.exportedSvg();
    expect(svg).toContain('data-diagram-layer="connections"');
  });

  test("AC-T3: rejeicao atomica nas bordas sem snapshot", async ({ fretboard }) => {
    async function undoCount() {
      return fretboard.page.evaluate(() => {
        const api = window.__fretboardEditor;
        const snap = () => JSON.stringify(api.getState().content);
        let count = 0;
        let previous = snap();
        while (count < 200) {
          api.undo();
          const current = snap();
          if (current === previous) break;
          previous = current;
          count += 1;
        }
        for (let index = 0; index < count; index += 1) api.redo();
        return count;
      });
    }

    await fretboard.pickTool("filled");
    await fretboard.activate(3, 0);
    await fretboard.activate(4, 2);
    const undosAtNut = await undoCount();

    await fretboard.transposeDown.click();
    await expect(fretboard.status).toContainText("sairia do nut");
    expect(await fretboard.markerAt(3, 0)).not.toBeNull();
    expect(await fretboard.markerAt(4, 2)).not.toBeNull();
    expect(await undoCount()).toBe(undosAtNut);

    await fretboard.clear.click();
    await fretboard.startFret.fill("13");
    await fretboard.pickTool("filled");
    await fretboard.activate(2, 24);
    await fretboard.activate(3, 22);
    const undosAtTop = await undoCount();

    await fretboard.transposeUp.click();
    await expect(fretboard.status).toContainText("casa 24");
    expect(await fretboard.markerAt(2, 24)).not.toBeNull();
    expect(await fretboard.markerAt(3, 22)).not.toBeNull();
    expect(await undoCount()).toBe(undosAtTop);
  });

  test("AC-T5: um snapshot; undo/redo; titulo, afinacao e startFret intactos", async ({
    fretboard
  }) => {
    await fretboard.setDiagramTitle("SHAPE MOVE");
    await fretboard.chooseTuning("drop-d");
    await fretboard.startFret.fill("3");
    await fretboard.pickTool("filled");
    await fretboard.activate(3, 5);
    await fretboard.activate(4, 7);

    const undosBefore = await fretboard.page.evaluate(() => {
      const api = window.__fretboardEditor;
      const snap = () => JSON.stringify(api.getState().content);
      let count = 0;
      let previous = snap();
      while (count < 200) {
        api.undo();
        const current = snap();
        if (current === previous) break;
        previous = current;
        count += 1;
      }
      for (let index = 0; index < count; index += 1) api.redo();
      return count;
    });

    await fretboard.transposeUp.click();
    expect((await fretboard.state()).content.diagramTitle).toBe("SHAPE MOVE");
    expect((await fretboard.state()).content.tuningPresetId).toBe("drop-d");
    expect((await fretboard.state()).editor.startFret).toBe(3);
    expect((await fretboard.state()).editor.activeTool).toBe("marker");
    expect(await fretboard.markerAt(3, 6)).not.toBeNull();
    expect(await fretboard.markerAt(4, 8)).not.toBeNull();

    await fretboard.undo.click();
    expect(await fretboard.markerAt(3, 5)).not.toBeNull();
    expect(await fretboard.markerAt(4, 7)).not.toBeNull();

    await fretboard.redo.click();
    expect(await fretboard.markerAt(3, 6)).not.toBeNull();
    expect(await fretboard.markerAt(4, 8)).not.toBeNull();

    const undosAfter = await fretboard.page.evaluate(() => {
      const api = window.__fretboardEditor;
      const snap = () => JSON.stringify(api.getState().content);
      let count = 0;
      let previous = snap();
      while (count < 200) {
        api.undo();
        const current = snap();
        if (current === previous) break;
        previous = current;
        count += 1;
      }
      for (let index = 0; index < count; index += 1) api.redo();
      return count;
    });
    expect(undosAfter).toBe(undosBefore + 1);
  });

  test("AC-T6: muted ao sair do nut vira filled; filled ao nut vira outline", async ({
    fretboard
  }) => {
    await fretboard.pickTool("muted");
    await fretboard.activate(2, 0);
    await fretboard.deselect.click();
    await fretboard.pickTool("filled");
    await fretboard.activate(4, 1);

    await fretboard.transposeUp.click();
    expect((await fretboard.markerAt(2, 1)).type).toBe("filled");
    expect((await fretboard.markerAt(4, 2)).type).toBe("filled");

    await fretboard.transposeDown.click();
    expect((await fretboard.markerAt(2, 0)).type).toBe("outline");
    expect((await fretboard.markerAt(4, 1)).type).toBe("filled");
  });

  test("AC-T5/T7: selecao permanece no mesmo marcador; linkFrom e limpo", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(1, 3);
    await fretboard.activate(3, 5);
    await fretboard.activate(1, 3);
    const selectedId = (await fretboard.state()).editor.selectedMarkerId;

    await fretboard.pickWorkTool("connect");
    await fretboard.activate(1, 3);
    expect((await fretboard.state()).editor.linkFrom).toBeTruthy();

    await fretboard.transposeUp.click();

    const state = await fretboard.state();
    expect(state.editor.selectedMarkerId).toBe(selectedId);
    expect(state.editor.linkFrom).toBeNull();
    expect(await fretboard.markerAt(1, 4)).not.toBeNull();
    await expect(fretboard.coordinate).toHaveText("—");

    await fretboard.pickWorkTool("marker");
    await expect(fretboard.coordinate).toHaveText("S1 / F04");
  });
});
