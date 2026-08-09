const { test, expect } = require("./fixtures");

test.describe("Janela de casas e validacao", () => {
  test("AC-1: abre com seis cordas e a janela configurada", async ({ fretboard }) => {
    await expect(fretboard.grid.locator('[role="row"]')).toHaveCount(6);
    await expect(fretboard.readout).toHaveText("NUT + 01—12");
    // Seis cordas x (nut + doze casas).
    await expect(fretboard.grid.locator(".grid-cell")).toHaveCount(78);
  });

  test("AC-9: casa inicial aceita 0 e mantem campo, estado e diagrama sincronizados", async ({
    fretboard
  }) => {
    await fretboard.startFret.fill("5");
    await expect(fretboard.readout).toHaveText("05—16");

    await fretboard.startFret.fill("0");

    await expect(fretboard.startFret).toHaveValue("0");
    await expect(fretboard.readout).toHaveText("NUT + 01—12");
    await expect(fretboard.startFretError).toBeEmpty();
    expect((await fretboard.state()).editor.startFret).toBe(0);
  });

  // O nut so pertence a primeira posicao; as demais janelas sao cobertas em position.spec.js.
  test("o nut oferece seis alvos de corda solta na primeira posicao", async ({ fretboard }) => {
    await fretboard.startFret.fill("9");
    await fretboard.startFret.fill("0");

    for (let corda = 1; corda <= 6; corda += 1) {
      await expect(fretboard.cell(corda, 0)).toBeVisible();
    }
  });

  test.describe("AC-25: entrada invalida na casa inicial", () => {
    // Regressao D2: Number("") e 0, entao o campo vazio zerava a janela em silencio.
    test("campo vazio mantem o ultimo valor valido e reporta erro", async ({ fretboard }) => {
      await fretboard.startFret.fill("7");
      await expect(fretboard.startFretError).toBeEmpty();

      await fretboard.startFret.fill("");

      expect((await fretboard.state()).editor.startFret).toBe(7);
      await expect(fretboard.startFret).toHaveValue("7");
      await expect(fretboard.startFretError).toHaveText("Informe uma casa inteira entre 0 e 24.");
      await expect(fretboard.startFret).toHaveAttribute("aria-invalid", "true");
      await expect(fretboard.status).toContainText("último valor válido foi mantido");
    });

    test("campo apenas com espacos mantem o ultimo valor valido", async ({ fretboard }) => {
      await fretboard.startFret.fill("7");

      await fretboard.page.evaluate(() => {
        const field = document.querySelector("#start-fret");
        field.value = "   ";
        field.dispatchEvent(new Event("input", { bubbles: true }));
      });

      expect((await fretboard.state()).editor.startFret).toBe(7);
      await expect(fretboard.startFretError).not.toBeEmpty();
    });

    test("valor acima de 24 mantem o ultimo valor valido", async ({ fretboard }) => {
      await fretboard.startFret.fill("7");

      await fretboard.startFret.fill("30");

      expect((await fretboard.state()).editor.startFret).toBe(7);
      await expect(fretboard.startFret).toHaveValue("7");
      await expect(fretboard.startFret).toHaveAttribute("aria-invalid", "true");
    });

    test("valor negativo mantem o ultimo valor valido", async ({ fretboard }) => {
      await fretboard.startFret.fill("7");

      await fretboard.startFret.fill("-1");

      expect((await fretboard.state()).editor.startFret).toBe(7);
      await expect(fretboard.startFret).toHaveValue("7");
    });

    test("valor fracionario mantem o ultimo valor valido", async ({ fretboard }) => {
      await fretboard.startFret.fill("7");

      await fretboard.startFret.fill("3.5");

      expect((await fretboard.state()).editor.startFret).toBe(7);
    });

    test("um valor valido depois de um invalido limpa o erro", async ({ fretboard }) => {
      await fretboard.startFret.fill("");
      await expect(fretboard.startFretError).not.toBeEmpty();

      await fretboard.startFret.fill("4");

      await expect(fretboard.startFretError).toBeEmpty();
      await expect(fretboard.startFret).not.toHaveAttribute("aria-invalid", "true");
      expect((await fretboard.state()).editor.startFret).toBe(4);
    });

    test("o campo declara a mensagem de erro por aria-describedby", async ({ fretboard }) => {
      await expect(fretboard.startFret).toHaveAttribute("aria-describedby", "start-fret-error");
    });
  });

  test("AC-28: anterior e proxima alcancam toda a extensao de 0 a 24", async ({ fretboard }) => {
    await expect(fretboard.previousFret).toBeDisabled();

    for (let passo = 0; passo < 24 && (await fretboard.nextFret.isEnabled()); passo += 1) {
      await fretboard.nextFret.click();
    }

    // A janela para de avancar quando a casa 24 ja esta visivel.
    expect((await fretboard.state()).editor.startFret).toBe(13);
    await expect(fretboard.nextFret).toBeDisabled();
    await expect(fretboard.readout).toHaveText("13—24");
    await expect(fretboard.cell(1, 24)).toBeVisible();

    for (let passo = 0; passo < 24 && (await fretboard.previousFret.isEnabled()); passo += 1) {
      await fretboard.previousFret.click();
    }

    expect((await fretboard.state()).editor.startFret).toBe(0);
    await expect(fretboard.previousFret).toBeDisabled();
    await expect(fretboard.cell(1, 0)).toBeVisible();
  });

  // D9: a janela encolhia perto do fim do braco em vez de recuar o inicio.
  test.describe("D9: a janela mantem a largura ate o fim do braco", () => {
    test("um inicio alto e recuado para preservar doze casas", async ({ fretboard }) => {
      await fretboard.startFret.fill("20");

      await expect(fretboard.readout).toHaveText("13—24");
      await expect(fretboard.startFret).toHaveValue("13");
      expect((await fretboard.state()).editor.startFret).toBe(13);
      await expect(fretboard.grid.locator(".grid-cell")).toHaveCount(72);
    });

    test("o ajuste e anunciado em vez de acontecer em silencio", async ({ fretboard }) => {
      await fretboard.startFret.fill("20");

      await expect(fretboard.status).toContainText(
        "Janela ajustada para a casa 13 para manter 12 casas visíveis."
      );
    });

    test("a casa 24 continua alcancavel e o campo nunca diverge do estado", async ({
      fretboard
    }) => {
      await fretboard.startFret.fill("24");

      await expect(fretboard.startFret).toHaveValue("13");
      await expect(fretboard.cell(6, 24)).toBeVisible();
      expect((await fretboard.state()).editor.startFret).toBe(13);
    });

    test("um inicio dentro do limite nao e ajustado", async ({ fretboard }) => {
      await fretboard.startFret.fill("13");

      await expect(fretboard.readout).toHaveText("13—24");
      await expect(fretboard.status).toContainText("Janela iniciada na casa 13.");
      await expect(fretboard.status).not.toContainText("ajustada");
    });
  });

  test("AC-10: a casa 12 exibe o marcador duplo de posicao", async ({ fretboard }) => {
    const pontos = await fretboard.inlayDots();
    // Casas 3, 5, 7 e 9 com um ponto, casa 12 com dois: seis pontos na janela 1..12.
    expect(pontos).toHaveLength(6);

    const duplicados = pontos.filter(
      (x, i) => pontos.some((outro, j) => i !== j && Math.abs(outro - x) < 40)
    );
    expect(duplicados).toHaveLength(2);
  });

  test("AC-10: a casa 24 tambem exibe o marcador duplo", async ({ fretboard }) => {
    await fretboard.startFret.fill("13");

    // Janela 13..24: pontos simples em 15, 17, 19 e 21 e duplo em 24.
    const pontos = await fretboard.inlayDots();
    expect(pontos).toHaveLength(6);

    const doisUltimos = pontos.slice(-2);
    expect(Math.abs(doisUltimos[1] - doisUltimos[0])).toBeLessThan(40);
  });

  test("marcadores fora da janela permanecem no estado", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(3, 5);

    await fretboard.startFret.fill("15");

    expect(await fretboard.markers()).toHaveLength(1);
    await expect(fretboard.clear).toBeEnabled();
  });
});
