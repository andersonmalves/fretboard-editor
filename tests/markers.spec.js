const { test, expect } = require("./fixtures");

test.describe("Criacao, selecao e edicao de marcadores", () => {
  test("AC-4: ativar um marcador existente o seleciona sem remove-lo", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(4, 5);
    await fretboard.deselect.click();

    await fretboard.activate(4, 5);

    expect(await fretboard.markers()).toHaveLength(1);
    await expect(fretboard.status).toContainText("selecionado");
    await expect(fretboard.coordinate).toHaveText("S4 / F05");
    await expect(fretboard.remove).toBeEnabled();
  });

  test("uma posicao nunca acumula dois marcadores", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(3, 4);
    await fretboard.activate(3, 4);
    await fretboard.activate(3, 4);

    expect(await fretboard.markers()).toHaveLength(1);
  });

  test("AC-5: trocar o tipo atualiza o marcador selecionado no lugar", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(2, 7);

    await fretboard.toolButton("outline").click();

    expect(await fretboard.markers()).toHaveLength(1);
    expect((await fretboard.markerAt(2, 7)).type).toBe("outline");
    await expect(fretboard.status).toContainText("alterado para vazado");
  });

  test("AC-5: editar o rotulo atualiza o marcador selecionado", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(2, 7);

    await fretboard.setLabel("R");

    expect((await fretboard.markerAt(2, 7)).customLabel).toBe("R");
    expect(await fretboard.drawnMarkerLabels()).toEqual(["R"]);
  });

  test("AC-6: Remover apaga somente o marcador selecionado", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(1, 2);
    await fretboard.activate(2, 3);
    await fretboard.activate(3, 4);

    await fretboard.activate(2, 3);
    await fretboard.remove.click();

    const restantes = (await fretboard.markers()).map((m) => [m.stringIndex, m.fret]);
    expect(restantes).toEqual([
      [0, 2],
      [2, 4]
    ]);
  });

  test("remover sem selecao avisa e nao altera o diagrama", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(1, 2);
    await fretboard.deselect.click();

    await expect(fretboard.remove).toBeDisabled();
    expect(await fretboard.markers()).toHaveLength(1);
  });

  test.describe("AC-27: invariantes do nut", () => {
    test("abafado e recusado fora da casa 0", async ({ fretboard }) => {
      await fretboard.pickTool("muted");
      await fretboard.activate(3, 5);

      expect(await fretboard.markers()).toHaveLength(0);
      await expect(fretboard.status).toContainText("só pode ser usado no nut, casa 0");
    });

    test("abafado e aceito na casa 0", async ({ fretboard }) => {
      await fretboard.pickTool("muted");
      await fretboard.activate(3, 0);

      expect((await fretboard.markerAt(3, 0)).type).toBe("muted");
    });

    test("criar com a ferramenta preenchida na casa 0 produz vazado", async ({ fretboard }) => {
      await fretboard.pickTool("filled");
      await fretboard.activate(3, 0);

      expect((await fretboard.markerAt(3, 0)).type).toBe("outline");
    });

    // Regressao D1: a normalizacao existia so na criacao; editSelected deixava passar.
    test("editar um marcador da casa 0 para preenchido continua produzindo vazado", async ({
      fretboard
    }) => {
      await fretboard.pickTool("outline");
      await fretboard.activate(3, 0);

      await fretboard.toolButton("filled").click();

      expect((await fretboard.markerAt(3, 0)).type).toBe("outline");
      await expect(fretboard.status).toContainText("vira vazado");
      await expect(fretboard.toolButton("outline")).toHaveAttribute("aria-pressed", "true");
      await expect(fretboard.toolButton("filled")).toHaveAttribute("aria-pressed", "false");
    });

    // Regressao D1: caminho com mudanca real de estado (abafado -> preenchido no nut).
    test("editar um marcador abafado da casa 0 para preenchido produz vazado", async ({
      fretboard
    }) => {
      await fretboard.pickTool("muted");
      await fretboard.activate(3, 0);

      await fretboard.toolButton("filled").click();

      expect((await fretboard.markerAt(3, 0)).type).toBe("outline");
      await expect(fretboard.status).toContainText("alterado para vazado");
    });

    test("editar um marcador fretado para abafado e recusado", async ({ fretboard }) => {
      await fretboard.pickTool("filled");
      await fretboard.activate(3, 6);

      await fretboard.toolButton("muted").click();

      expect((await fretboard.markerAt(3, 6)).type).toBe("filled");
      await expect(fretboard.status).toContainText("só pode ser usado no nut, casa 0");
    });

    // D10: a recusa de editar a selecao nao pode mais bloquear a escolha da ferramenta.
    test("a recusa preserva o marcador mas ativa a ferramenta pedida", async ({ fretboard }) => {
      await fretboard.pickTool("filled");
      await fretboard.activate(3, 6);

      await fretboard.toolButton("muted").click();

      expect((await fretboard.state()).editor.activeMarkerType).toBe("muted");
      await expect(fretboard.status).toContainText("Ferramenta abafado ativa");

      // E a ferramenta escolhida vale para o proximo marcador.
      await fretboard.deselect.click();
      await fretboard.activate(2, 0);
      expect((await fretboard.markerAt(2, 0)).type).toBe("muted");
    });

    test("pedir preenchido num marcador do nut mantem a ferramenta utilizavel", async ({
      fretboard
    }) => {
      await fretboard.pickTool("outline");
      await fretboard.activate(3, 0);

      await fretboard.toolButton("filled").click();

      // O marcador do nut continua vazado, mas a ferramenta segue o pedido.
      expect((await fretboard.markerAt(3, 0)).type).toBe("outline");
      expect((await fretboard.state()).editor.activeMarkerType).toBe("outline");

      await fretboard.deselect.click();
      await fretboard.toolButton("filled").click();
      await fretboard.activate(4, 5);
      expect((await fretboard.markerAt(4, 5)).type).toBe("filled");
    });

    test("nenhuma ferramenta inicial leva a um preenchido na casa 0", async ({ fretboard }) => {
      for (const ferramenta of ["filled", "outline", "muted"]) {
        await fretboard.pickTool(ferramenta);
        await fretboard.activate(1, 0);
        await fretboard.toolButton("filled").click();

        expect((await fretboard.markerAt(1, 0)).type).toBe("outline");
        await fretboard.clear.click();
      }
    });
  });

  test("AC-15: o tipo ativo usa estado programatico", async ({ fretboard }) => {
    await fretboard.pickTool("outline");

    await expect(fretboard.toolButton("outline")).toHaveAttribute("aria-pressed", "true");
    await expect(fretboard.toolButton("filled")).toHaveAttribute("aria-pressed", "false");
    await expect(fretboard.toolButton("muted")).toHaveAttribute("aria-pressed", "false");
  });

  test("o seletor de modo encerra Ligar e recupera os estilos", async ({ fretboard }) => {
    await fretboard.pickWorkTool("connect");
    await expect(fretboard.markerFields).toBeHidden();
    await expect(fretboard.sound).toBeHidden();
    await expect(fretboard.workToolButton("connect")).toHaveAttribute("aria-pressed", "true");
    await fretboard.pickWorkTool("marker");
    await expect(fretboard.markerFields).toBeVisible();
    await expect(fretboard.sound).toBeVisible();
    await fretboard.toolButton("outline").click();

    expect((await fretboard.state()).editor.activeTool).toBe("marker");
    await expect(fretboard.toolButton("outline")).toHaveAttribute("aria-pressed", "true");
  });

  test("o dock contextual distingue próximo marcador de edição", async ({ fretboard }) => {
    await expect(fretboard.kicker).toHaveText("Próximo marcador");
    await expect(fretboard.inspectorActions).toBeHidden();

    await fretboard.activate(3, 4);

    await expect(fretboard.kicker).toHaveText("Editando marcador");
    await expect(fretboard.selectionName).toContainText("Corda 3 · casa 4 · nota");
    await expect(fretboard.inspectorActions).toBeVisible();
  });

  test("AC-43: criação toca a altura real e o controle permite mutar", async ({ fretboard }) => {
    await fretboard.page.evaluate(() => {
      window.__playedNotes = [];
      window.playNote = function (s, f, t) {
        const ed = window.__fretboardEditor.getState().editor;
        if (!ed.soundEnabled || t === "muted") return;
        const hz = Math.round(440 * Math.pow(2, (window.parsePitch(window.currentTuning().notes[s]) + f - 69) / 12));
        window.__playedNotes.push(hz);
      };
    });

    await expect(fretboard.sound).toHaveAttribute("aria-pressed", "true");
    await fretboard.activate(1, 5); // E4 + 5 semitons = A4, 440 Hz.
    await fretboard.activate(1, 5); // Selecionar não repete o som.
    expect(await fretboard.page.evaluate(() => window.__playedNotes)).toEqual([440]);

    await fretboard.sound.click();
    await expect(fretboard.sound).toHaveAttribute("aria-pressed", "false");
    await expect(fretboard.status).toContainText("Som desativado");
    expect((await fretboard.state()).editor.activeMarkerType).toBe("filled");
    await fretboard.activate(2, 5);
    expect(await fretboard.page.evaluate(() => window.__playedNotes)).toEqual([440]);

    await fretboard.sound.click();
    await expect(fretboard.status).toContainText("Som ativado");
    await fretboard.pickTool("muted");
    await fretboard.activate(3, 0);
    expect(await fretboard.page.evaluate(() => window.__playedNotes)).toEqual([440]);
  });

  test("atalhos ficam disponíveis sem alongar o dock inicialmente", async ({ fretboard }) => {
    await expect(fretboard.shortcuts).not.toHaveAttribute("open", "");
    await expect(fretboard.shortcuts.locator(".shortcut-help")).toBeHidden();

    await fretboard.shortcuts.locator("summary").click();

    await expect(fretboard.shortcuts.locator(".shortcut-help")).toContainText("Enter: criar/selecionar");
  });

  test("AC-16: a regiao viva anuncia criacao, edicao e remocao", async ({ fretboard }) => {
    await expect(fretboard.status).toHaveAttribute("aria-live", "polite");

    await fretboard.pickTool("filled");
    await fretboard.activate(3, 4);
    await expect(fretboard.status).toContainText("criado");

    await fretboard.toolButton("outline").click();
    await expect(fretboard.status).toContainText("alterado");

    await fretboard.remove.click();
    await expect(fretboard.status).toContainText("removido");
  });
});
