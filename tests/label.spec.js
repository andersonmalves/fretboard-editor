const { test, expect } = require("./fixtures");

/** Lista as tags presentes no SVG exportado, para comparar estrutura entre rotulos. */
async function tagsDoSvgExportado(fretboard) {
  const markup = await fretboard.exportedSvg();
  return fretboard.page.evaluate((svg) => {
    const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
    if (doc.querySelector("parsererror")) return "svg-invalido";
    return [...doc.querySelectorAll("*")].map((el) => el.tagName).sort();
  }, markup);
}

test.describe("Rotulo customizado", () => {
  test("rotulo vazio volta a usar a nota automatica", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(6, 3);
    await fretboard.setLabel("R");
    expect(await fretboard.drawnMarkerLabels()).toEqual(["R"]);

    await fretboard.setLabel("");

    expect(await fretboard.drawnMarkerLabels()).toEqual(["G"]);
    await expect(fretboard.status).toContainText("automático restaurado");
  });

  test("AC-34: o rotulo e limitado a seis caracteres visiveis", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(6, 3);

    await fretboard.setLabel("ABCDEFGHIJ");

    expect((await fretboard.markerAt(6, 3)).customLabel).toBe("ABCDEF");
    await expect(fretboard.label).toHaveValue("ABCDEF");
  });

  test("AC-34: whitespace e normalizado", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(6, 3);

    await fretboard.page.evaluate(() => {
      const field = document.querySelector("#label-input");
      field.value = "  a\t\t b  ";
      field.dispatchEvent(new Event("input", { bubbles: true }));
    });

    expect((await fretboard.markerAt(6, 3)).customLabel).toBe("a b");
  });

  test("AC-34: caracteres de controle sao removidos", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(6, 3);

    await fretboard.page.evaluate(() => {
      const field = document.querySelector("#label-input");
      const nul = String.fromCharCode(0);
      const unitSeparator = String.fromCharCode(31);
      const del = String.fromCharCode(127);
      field.value = `a${nul}b${unitSeparator}c${del}`;
      field.dispatchEvent(new Event("input", { bubbles: true }));
    });

    expect((await fretboard.markerAt(6, 3)).customLabel).toBe("abc");
  });

  // AC-19 e AC-34: o rotulo nunca vira markup, atributo ou URL.
  const rotulosHostis = ["<b>x", '"><g', "&#60;s", "'\"><", "</text", "&lt;i&"];

  for (const hostil of rotulosHostis) {
    test(`AC-19/AC-34: ${JSON.stringify(hostil)} permanece texto`, async ({ fretboard }) => {
      await fretboard.pickTool("filled");
      await fretboard.activate(6, 3);

      await fretboard.setLabel("R");
      const estruturaBenigna = await tagsDoSvgExportado(fretboard);

      await fretboard.setLabel(hostil);

      const esperado = hostil.replace(/\s+/g, " ").trim().slice(0, 6);
      expect((await fretboard.markerAt(6, 3)).customLabel).toBe(esperado);

      // No DOM vivo o rotulo ocupa um unico no de texto, sem filhos.
      const nos = await fretboard.svg
        .locator('[data-diagram-layer="markers"] text')
        .evaluateAll((elementos) =>
          elementos.map((el) => ({ texto: el.textContent, filhos: el.children.length }))
        );
      expect(nos).toEqual([{ texto: esperado, filhos: 0 }]);

      // O arquivo exportado continua sendo SVG valido e com a mesma estrutura de um
      // rotulo benigno: nenhum elemento novo foi criado a partir do input.
      const estruturaHostil = await tagsDoSvgExportado(fretboard);
      expect(estruturaHostil).not.toBe("svg-invalido");
      expect(estruturaHostil).toEqual(estruturaBenigna);
    });
  }

  test("AC-34: nenhum atributo, handler ou URL deriva do rotulo", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(6, 3);

    await fretboard.setLabel('" on');

    const svg = await fretboard.exportedSvg();
    expect(svg).not.toMatch(/\shref/i);
    expect(svg).not.toMatch(/xlink/i);
    expect(svg).not.toMatch(/url\(/i);
    expect(svg).not.toMatch(/\son[a-z]+\s*=/i);
    expect(svg).not.toMatch(/<script/i);
  });

  // Regressao D4: o input e o estado interno divergiam e o marcador nascia com um
  // rotulo invisivel.
  test("o rotulo pendente fica sempre visivel no campo", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(6, 3);
    await fretboard.setLabel("XYZ");

    await fretboard.clear.click();

    await expect(fretboard.label).toHaveValue("XYZ");
    expect((await fretboard.state()).editor.activeCustomLabel).toBe("XYZ");

    await fretboard.activate(4, 7);

    expect((await fretboard.markerAt(4, 7)).customLabel).toBe("XYZ");
    await expect(fretboard.label).toHaveValue("XYZ");
  });

  test("desmarcar limpa o rotulo pendente no estado e no campo", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(6, 3);
    await fretboard.setLabel("XYZ");

    await fretboard.deselect.click();

    await expect(fretboard.label).toHaveValue("");
    expect((await fretboard.state()).editor.activeCustomLabel).toBe("");
  });

  // D6: o texto desenhado no marcador precisa estar no nome acessivel da posicao.
  test("o rotulo customizado entra no nome acessivel da celula", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(3, 5);

    await fretboard.setLabel("R5");

    await expect(fretboard.cell(3, 5)).toHaveAttribute(
      "aria-label",
      "Corda 3, casa 5, nota Dó 4, marcador preenchido, rótulo R5"
    );
  });

  test("sem rotulo customizado o nome acessivel nao inventa um", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(3, 5);

    await expect(fretboard.cell(3, 5)).toHaveAttribute(
      "aria-label",
      "Corda 3, casa 5, nota Dó 4, marcador preenchido"
    );
  });

  test("apagar o rotulo remove a mencao do nome acessivel", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(3, 5);
    await fretboard.setLabel("R5");

    await fretboard.setLabel("");

    await expect(fretboard.cell(3, 5)).toHaveAttribute("aria-label", /marcador preenchido$/);
  });

  test("o inspetor anuncia o rotulo junto da nota", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(3, 5);
    await expect(fretboard.kicker).toHaveText("Nota Dó 4");

    await fretboard.setLabel("R5");

    await expect(fretboard.kicker).toHaveText("Rótulo R5 · nota Dó 4");
  });

  test("selecionar um marcador traz o rotulo dele para o campo", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(6, 3);
    await fretboard.setLabel("R");
    await fretboard.deselect.click();
    await fretboard.activate(5, 5);
    await expect(fretboard.label).toHaveValue("");

    await fretboard.activate(6, 3);

    await expect(fretboard.label).toHaveValue("R");
  });
});
