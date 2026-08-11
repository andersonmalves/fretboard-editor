const { test, expect } = require("./fixtures");

/**
 * O nut pertence ao diagrama apenas quando a janela comeca na primeira posicao (D8), e
 * marcadores que ficam fora da janela sao sinalizados antes de a exportacao os descartar (D7).
 */
test.describe("Posicao do braco e marcadores fora da janela", () => {
  test.describe("D8: o nut so existe na primeira posicao", () => {
    test("com a janela no nut, a faixa e os alvos de corda solta existem", async ({ fretboard }) => {
      await expect(fretboard.readout).toHaveText("NUT + 01—12");
      await expect(fretboard.cell(1, 0)).toBeVisible();
      await expect(fretboard.grid.locator(".grid-cell")).toHaveCount(78);

      expect(await fretboard.exportedSvg()).toContain(">NUT<");
    });

    test("fora da primeira posicao, o nut desaparece do desenho e da exportacao", async ({
      fretboard
    }) => {
      await fretboard.startFret.fill("9");

      expect(await fretboard.exportedSvg()).not.toContain(">NUT<");
      await expect(fretboard.readout).toHaveText("09—20");
    });

    test("fora da primeira posicao, o diagrama declara a posicao", async ({ fretboard }) => {
      await fretboard.startFret.fill("9");

      const svg = await fretboard.exportedSvg();
      expect(svg).toContain("9ª POSIÇÃO");
      expect(svg).toContain("9ª posição");

      // O rotulo de posicao nao pode encostar no numero da primeira casa da janela.
      const folga = await fretboard.page.evaluate(() => {
        const textos = [...document.querySelectorAll("#fretboard-svg text")];
        const posicao = textos.find((t) => t.textContent.includes("POSIÇÃO")).getBBox();
        const primeiraCasa = textos.find((t) => t.textContent === "9").getBBox();
        return Math.min(
          Math.abs(posicao.y - primeiraCasa.y),
          Math.abs(posicao.x - (primeiraCasa.x + primeiraCasa.width))
        );
      });
      expect(folga).toBeGreaterThan(10);
    });

    test("fora da primeira posicao, a casa 0 sai da grade", async ({ fretboard }) => {
      await fretboard.startFret.fill("5");

      await expect(fretboard.cell(1, 0)).toHaveCount(0);
      // Seis cordas x doze casas, sem a coluna do nut.
      await expect(fretboard.grid.locator(".grid-cell")).toHaveCount(72);
    });

    test("as casas ocupam a largura liberada pelo nut", async ({ fretboard }) => {
      const comNut = await fretboard.cell(1, 5).boundingBox();

      await fretboard.startFret.fill("5");
      const semNut = await fretboard.cell(1, 5).boundingBox();

      expect(semNut.width).toBeGreaterThan(comNut.width);
    });

    test("voltar para a primeira posicao traz o nut de volta", async ({ fretboard }) => {
      await fretboard.startFret.fill("9");
      await fretboard.startFret.fill("0");

      await expect(fretboard.cell(1, 0)).toBeVisible();
      expect(await fretboard.exportedSvg()).toContain(">NUT<");
    });

    test("a navegacao por teclado nao alcanca a casa 0 fora da primeira posicao", async ({
      fretboard
    }) => {
      await fretboard.startFret.fill("5");
      await fretboard.cell(3, 7).focus();

      await fretboard.page.keyboard.press("Home");

      expect(await fretboard.focusedCell()).toEqual({ corda: 3, casa: 5 });
    });

    test("o foco sai da casa 0 quando a janela deixa a primeira posicao", async ({ fretboard }) => {
      await fretboard.cell(2, 0).focus();
      expect(await fretboard.focusedCell()).toEqual({ corda: 2, casa: 0 });

      await fretboard.startFret.fill("9");

      expect((await fretboard.state()).editor.focusedPosition.fret).toBe(9);
    });

    test("ativar uma posicao fora da janela e ignorada sem alterar o estado", async ({
      fretboard
    }) => {
      await fretboard.startFret.fill("5");

      await fretboard.page.evaluate(() => window.__fretboardEditor.activatePosition(0, 0));

      expect(await fretboard.markers()).toHaveLength(0);
      await expect(fretboard.status).toContainText("fora da janela visível");
    });
  });

  test.describe("D7: aviso de marcadores fora da janela", () => {
    test("sem marcadores ocultos, a legenda mostra a dica padrao", async ({ fretboard }) => {
      await fretboard.pickTool("filled");
      await fretboard.activate(3, 5);

      await expect(fretboard.hint).toHaveText("Arraste horizontalmente para mover a janela · nota pela afinação");
      await expect(fretboard.hint).not.toHaveClass(/offscreen/);
    });

    test("marcadores fora da janela sao contados na legenda", async ({ fretboard }) => {
      await fretboard.pickTool("filled");
      await fretboard.activate(3, 5);

      await fretboard.startFret.fill("9");

      await expect(fretboard.hint).toHaveText("1 marcador fora da janela");
      await expect(fretboard.hint).toHaveClass(/offscreen/);
    });

    test("a contagem usa plural e inclui os marcadores do nut", async ({ fretboard }) => {
      await fretboard.pickTool("outline");
      await fretboard.activate(1, 0);
      await fretboard.pickTool("filled");
      await fretboard.activate(3, 5);

      await fretboard.startFret.fill("9");

      // Fora da janela 9..20: o marcador do nut e o da casa 5.
      await expect(fretboard.hint).toHaveText("2 marcadores fora da janela");
    });

    test("mudar a janela anuncia quantos marcadores ficaram de fora", async ({ fretboard }) => {
      await fretboard.pickTool("filled");
      await fretboard.activate(3, 5);

      await fretboard.startFret.fill("9");

      await expect(fretboard.status).toContainText("Janela iniciada na casa 9.");
      await expect(fretboard.status).toContainText("1 marcador fora da janela");
    });

    test("exportar SVG avisa que os marcadores ocultos nao entraram no arquivo", async ({
      fretboard
    }) => {
      await fretboard.pickTool("filled");
      await fretboard.activate(3, 5);
      await fretboard.startFret.fill("9");

      await Promise.all([fretboard.page.waitForEvent("download"), fretboard.downloadSvgClick()]);

      await expect(fretboard.status).toContainText("SVG preparado para download.");
      await expect(fretboard.status).toContainText(
        "1 marcador fora da janela não entrou no arquivo"
      );
    });

    test("exportar PNG carrega o mesmo aviso, no plural", async ({ fretboard }) => {
      await fretboard.pickTool("filled");
      await fretboard.activate(3, 5);
      await fretboard.activate(4, 6);
      await fretboard.startFret.fill("9");

      await Promise.all([fretboard.page.waitForEvent("download"), fretboard.downloadPngClick()]);

      await expect(fretboard.status).toContainText(
        "2 marcadores fora da janela não entraram no arquivo"
      );
    });

    test("sem marcadores ocultos, a exportacao nao carrega aviso", async ({ fretboard }) => {
      await fretboard.pickTool("filled");
      await fretboard.activate(3, 5);

      await Promise.all([fretboard.page.waitForEvent("download"), fretboard.downloadSvgClick()]);

      await expect(fretboard.status).toContainText("SVG preparado para download.");
      await expect(fretboard.status).not.toContainText("fora da janela");
    });

    test("o aviso desaparece quando a janela volta a conter os marcadores", async ({
      fretboard
    }) => {
      await fretboard.pickTool("filled");
      await fretboard.activate(3, 5);
      await fretboard.startFret.fill("9");
      await expect(fretboard.hint).toHaveClass(/offscreen/);

      await fretboard.startFret.fill("0");

      await expect(fretboard.hint).toHaveText("Arraste horizontalmente para mover a janela · nota pela afinação");
      await expect(fretboard.hint).not.toHaveClass(/offscreen/);
    });

    test("remover o marcador oculto limpa o aviso", async ({ fretboard }) => {
      await fretboard.pickTool("filled");
      await fretboard.activate(3, 5);
      await fretboard.startFret.fill("9");
      await expect(fretboard.hint).toHaveClass(/offscreen/);

      await fretboard.clear.click();

      await expect(fretboard.hint).toHaveText("Arraste horizontalmente para mover a janela · nota pela afinação");
    });
  });
});
