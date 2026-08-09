const { test, expect } = require("./fixtures");

test.describe("Operacao por teclado", () => {
  test("AC-13: as setas navegam entre cordas e casas", async ({ fretboard }) => {
    await fretboard.cell(1, 0).focus();
    expect(await fretboard.focusedCell()).toEqual({ corda: 1, casa: 0 });

    await fretboard.page.keyboard.press("ArrowRight");
    expect(await fretboard.focusedCell()).toEqual({ corda: 1, casa: 1 });

    await fretboard.page.keyboard.press("ArrowDown");
    expect(await fretboard.focusedCell()).toEqual({ corda: 2, casa: 1 });

    await fretboard.page.keyboard.press("ArrowLeft");
    expect(await fretboard.focusedCell()).toEqual({ corda: 2, casa: 0 });

    await fretboard.page.keyboard.press("ArrowUp");
    expect(await fretboard.focusedCell()).toEqual({ corda: 1, casa: 0 });
  });

  test("AC-13: a navegacao para nos limites da grade", async ({ fretboard }) => {
    await fretboard.cell(1, 0).focus();

    await fretboard.page.keyboard.press("ArrowUp");
    await fretboard.page.keyboard.press("ArrowLeft");
    expect(await fretboard.focusedCell()).toEqual({ corda: 1, casa: 0 });

    await fretboard.cell(6, 12).focus();
    await fretboard.page.keyboard.press("ArrowDown");
    await fretboard.page.keyboard.press("ArrowRight");
    expect(await fretboard.focusedCell()).toEqual({ corda: 6, casa: 12 });
  });

  test("Home e End vao ao primeiro e ao ultimo alvo da corda", async ({ fretboard }) => {
    await fretboard.cell(3, 5).focus();

    await fretboard.page.keyboard.press("End");
    expect(await fretboard.focusedCell()).toEqual({ corda: 3, casa: 12 });

    await fretboard.page.keyboard.press("Home");
    expect(await fretboard.focusedCell()).toEqual({ corda: 3, casa: 0 });
  });

  test("roving tabindex mantem uma unica celula na ordem de tabulacao", async ({ fretboard }) => {
    expect(await fretboard.tabbableCells()).toBe(1);

    await fretboard.cell(4, 6).focus();
    await fretboard.page.keyboard.press("ArrowRight");

    expect(await fretboard.tabbableCells()).toBe(1);
  });

  test("AC-13: Enter cria e depois seleciona um marcador", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.cell(3, 5).focus();

    await fretboard.page.keyboard.press("Enter");
    expect(await fretboard.markers()).toHaveLength(1);
    await expect(fretboard.status).toContainText("criado");

    await fretboard.deselect.click();
    await fretboard.cell(3, 5).focus();
    await fretboard.page.keyboard.press("Enter");

    expect(await fretboard.markers()).toHaveLength(1);
    await expect(fretboard.status).toContainText("selecionado");
  });

  test("AC-13: Space cria um marcador", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.cell(3, 5).focus();

    await fretboard.page.keyboard.press(" ");

    expect(await fretboard.markers()).toHaveLength(1);
  });

  test("AC-6: Delete e Backspace removem o marcador selecionado", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.cell(3, 5).focus();
    await fretboard.page.keyboard.press("Enter");

    await fretboard.page.keyboard.press("Delete");
    expect(await fretboard.markers()).toHaveLength(0);

    await fretboard.page.keyboard.press("Enter");
    expect(await fretboard.markers()).toHaveLength(1);

    await fretboard.page.keyboard.press("Backspace");
    expect(await fretboard.markers()).toHaveLength(0);
  });

  test("AC-21: Esc desmarca e nunca limpa o diagrama", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.cell(3, 5).focus();
    await fretboard.page.keyboard.press("Enter");
    await fretboard.cell(2, 4).focus();
    await fretboard.page.keyboard.press("Enter");
    expect(await fretboard.markers()).toHaveLength(2);

    await fretboard.page.keyboard.press("Escape");

    expect(await fretboard.markers()).toHaveLength(2);
    await expect(fretboard.remove).toBeDisabled();
    await expect(fretboard.coordinate).toHaveText("—");
  });

  test("desfazer e refazer por atalho", async ({ fretboard }) => {
    const mod = process.platform === "darwin" ? "Meta" : "Control";
    await fretboard.pickTool("filled");
    await fretboard.cell(3, 5).focus();
    await fretboard.page.keyboard.press("Enter");

    await fretboard.page.keyboard.press(`${mod}+z`);
    expect(await fretboard.markers()).toHaveLength(0);

    await fretboard.page.keyboard.press(`${mod}+Shift+z`);
    expect(await fretboard.markers()).toHaveLength(1);
  });

  test("o atalho de desfazer nao dispara ao digitar no rotulo", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.cell(3, 5).focus();
    await fretboard.page.keyboard.press("Enter");
    await fretboard.setLabel("R");

    await fretboard.label.focus();
    await fretboard.page.keyboard.press("Delete");

    // Delete dentro do campo edita texto, nao remove o marcador.
    expect(await fretboard.markers()).toHaveLength(1);
  });

  test("o fluxo completo criar > editar > remover > desfazer roda so por teclado", async ({
    fretboard
  }) => {
    await fretboard.pickTool("filled");
    await fretboard.cell(4, 7).focus();

    await fretboard.page.keyboard.press("Enter");
    expect((await fretboard.markerAt(4, 7)).type).toBe("filled");

    await fretboard.toolButton("outline").press("Enter");
    expect((await fretboard.markerAt(4, 7)).type).toBe("outline");

    await fretboard.cell(4, 7).focus();
    await fretboard.page.keyboard.press("Delete");
    expect(await fretboard.markers()).toHaveLength(0);

    const mod = process.platform === "darwin" ? "Meta" : "Control";
    await fretboard.page.keyboard.press(`${mod}+z`);
    expect(await fretboard.markers()).toHaveLength(1);
  });

  test("o foco volta para a posicao ativa depois de cada acao", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.cell(3, 5).focus();

    await fretboard.page.keyboard.press("Enter");

    expect(await fretboard.focusedCell()).toEqual({ corda: 3, casa: 5 });
  });

  test("o link de salto aponta para a grade e aparece ao receber foco", async ({ fretboard }) => {
    const skip = fretboard.page.locator(".skip-link");
    await expect(skip).toHaveAttribute("href", "#fretboard-grid");

    // Fora de foco ele fica deslocado para fora da tela.
    const escondido = await skip.evaluate((el) => getComputedStyle(el).transform);
    expect(escondido).not.toBe("none");

    await skip.focus();

    expect(await skip.evaluate((el) => getComputedStyle(el).transform)).toBe("none");
    await expect(skip).toBeInViewport();
  });

  test("o link de salto e o primeiro alvo da ordem de tabulacao", async ({ fretboard }) => {
    // No WebKit/macOS, Tab so alcanca links quando "Full Keyboard Access" esta ligado —
    // e uma preferencia do sistema, nao um contrato da pagina.
    test.skip(
      fretboard.page.context().browser().browserType().name() === "webkit",
      "Tab nao alcanca links no WebKit sem Full Keyboard Access"
    );

    await fretboard.page.keyboard.press("Tab");

    await expect(fretboard.page.locator(".skip-link")).toBeFocused();
  });
});
