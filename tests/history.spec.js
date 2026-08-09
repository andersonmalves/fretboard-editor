const { test, expect } = require("./fixtures");

test.describe("Historico", () => {
  test("AC-7: desfazer e refazer uma criacao", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(3, 4);

    await fretboard.undo.click();
    expect(await fretboard.markers()).toHaveLength(0);

    await fretboard.redo.click();
    expect(await fretboard.markers()).toHaveLength(1);
  });

  test("AC-7: desfazer e refazer uma edicao de tipo", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(3, 4);
    await fretboard.toolButton("outline").click();

    await fretboard.undo.click();
    expect((await fretboard.markerAt(3, 4)).type).toBe("filled");

    await fretboard.redo.click();
    expect((await fretboard.markerAt(3, 4)).type).toBe("outline");
  });

  test("AC-7: desfazer uma remocao restaura o marcador e o seleciona", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(3, 4);
    await fretboard.remove.click();
    expect(await fretboard.markers()).toHaveLength(0);

    await fretboard.undo.click();

    expect(await fretboard.markers()).toHaveLength(1);
    await expect(fretboard.coordinate).toHaveText("S3 / F04");
  });

  test("AC-7/AC-22: limpar e desfazivel e nao usa modal", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(1, 2);
    await fretboard.activate(2, 3);

    await fretboard.clear.click();

    expect(await fretboard.markers()).toHaveLength(0);
    await expect(fretboard.page.locator("dialog, [role=dialog], [role=alertdialog]")).toHaveCount(0);
    await expect(fretboard.status).toContainText("Desfazer");

    await fretboard.undo.click();
    expect(await fretboard.markers()).toHaveLength(2);
  });

  test("AC-7: mudanca de afinacao entra no historico", async ({ fretboard }) => {
    await fretboard.chooseTuning("open-g");
    expect((await fretboard.state()).content.tuningPresetId).toBe("open-g");

    await fretboard.undo.click();

    expect((await fretboard.state()).content.tuningPresetId).toBe("standard");
    await expect(fretboard.tuning).toHaveValue("standard");
  });

  test("nova acao apos desfazer descarta o futuro", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(3, 4);
    await fretboard.undo.click();
    await expect(fretboard.redo).toBeEnabled();

    await fretboard.activate(5, 6);

    await expect(fretboard.redo).toBeDisabled();
  });

  test("AC-30: selecao, ferramenta e navegacao de janela nao criam snapshots", async ({
    fretboard
  }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(3, 4);

    await fretboard.deselect.click();
    await fretboard.toolButton("outline").click(); // sem selecao: apenas troca a ferramenta
    await fretboard.activate(3, 4); // marcador ja existe: apenas seleciona
    await fretboard.deselect.click();
    await fretboard.nextFret.click();
    await fretboard.previousFret.click();
    await fretboard.startFret.fill("5");
    await fretboard.startFret.fill("0");
    await fretboard.cell(2, 3).focus();

    // Apenas a criacao deve estar no historico.
    expect(await fretboard.drainUndo()).toBe(1);
  });

  // Regressao D3: cada tecla criava um snapshot.
  test("AC-30: digitar um rotulo cria um unico snapshot", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(3, 4);

    await fretboard.typeLabel("R5x9");

    expect((await fretboard.markerAt(3, 4)).customLabel).toBe("R5x9");
    // 1 criacao + 1 sessao de digitacao.
    expect(await fretboard.drainUndo()).toBe(2);
  });

  test("AC-30: duas sessoes de digitacao separadas geram dois snapshots", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(3, 4);

    await fretboard.typeLabel("AB");
    await fretboard.label.blur();
    await fretboard.activate(3, 4);
    await fretboard.typeLabel("CD");
    await fretboard.label.blur();

    expect((await fretboard.markerAt(3, 4)).customLabel).toBe("ABCD");
    // 1 criacao + 2 sessoes.
    expect(await fretboard.drainUndo()).toBe(3);
  });

  test("desfazer no meio da digitacao nao corrompe o historico", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(3, 4);
    await fretboard.typeLabel("Z");

    await fretboard.undo.click();
    expect((await fretboard.markerAt(3, 4)).customLabel).toBe("");

    await fretboard.activate(3, 4);
    await fretboard.typeLabel("W");
    expect((await fretboard.markerAt(3, 4)).customLabel).toBe("W");

    // 1 criacao + 1 nova sessao de digitacao; a sessao desfeita nao deixa residuo.
    expect(await fretboard.drainUndo()).toBe(2);
    expect(await fretboard.markers()).toHaveLength(0);
  });

  test("AC-30: o historico guarda no maximo 50 estados", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.page.evaluate(() => {
      const api = window.__fretboardEditor;
      for (let corda = 0; corda < 6; corda += 1) {
        for (let casa = 1; casa <= 10; casa += 1) api.activatePosition(corda, casa);
      }
    });
    expect(await fretboard.markers()).toHaveLength(60);

    expect(await fretboard.drainUndo()).toBe(50);
    // Estados alem do limite foram descartados pela frente do historico.
    expect(await fretboard.markers()).toHaveLength(10);
    await expect(fretboard.undo).toBeDisabled();
  });

  test("desfazer sem historico avisa em vez de falhar", async ({ fretboard }) => {
    await expect(fretboard.undo).toBeDisabled();
    await expect(fretboard.redo).toBeDisabled();

    await fretboard.page.evaluate(() => window.__fretboardEditor.undo());
    await expect(fretboard.status).toContainText("Nada para desfazer");
  });
});
