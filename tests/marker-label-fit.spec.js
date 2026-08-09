const { test, expect } = require("./fixtures");

/** Largura do texto e diametro do disco do primeiro marcador desenhado. */
async function medidasDoMarcador(fretboard) {
  return fretboard.page.evaluate(() => {
    const camada = document.querySelector('#fretboard-svg [data-diagram-layer="markers"]');
    const texto = camada.querySelector("text");
    const circulo = camada.querySelector("circle");
    return {
      larguraTexto: texto.getComputedTextLength(),
      diametro: Number(circulo.getAttribute("r")) * 2,
      fontSize: Number(texto.getAttribute("font-size")),
      condensado: texto.hasAttribute("textLength")
    };
  });
}

test.describe("D5: o rotulo cabe dentro do marcador", () => {
  const rotulos = ["R", "R5", "min7", "ABCDE", "ABCDEF", "WWWWWW"];

  for (const rotulo of rotulos) {
    test(`"${rotulo}" nao transborda o disco`, async ({ fretboard }) => {
      await fretboard.pickTool("filled");
      await fretboard.activate(3, 5);

      await fretboard.setLabel(rotulo);

      const { larguraTexto, diametro } = await medidasDoMarcador(fretboard);
      expect(larguraTexto).toBeLessThanOrEqual(diametro);
    });
  }

  test("rotulos curtos mantem o corpo cheio da fonte", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(3, 5);

    await fretboard.setLabel("R5");
    const curto = await medidasDoMarcador(fretboard);

    await fretboard.setLabel("ABCDEF");
    const longo = await medidasDoMarcador(fretboard);

    expect(curto.fontSize).toBeGreaterThan(longo.fontSize);
    expect(curto.condensado).toBe(false);
  });

  test("a nota automatica tambem cabe em todas as posicoes da janela", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    for (const casa of [1, 2, 6, 12]) await fretboard.activate(2, casa);

    const transbordos = await fretboard.page.evaluate(() => {
      const camada = document.querySelector('#fretboard-svg [data-diagram-layer="markers"]');
      const textos = [...camada.querySelectorAll("text")];
      const circulos = [...camada.querySelectorAll("circle")];
      return textos.filter(
        (t, i) => t.getComputedTextLength() > Number(circulos[i].getAttribute("r")) * 2
      ).length;
    });

    expect(transbordos).toBe(0);
  });

  test("o marcador exportado nao carrega o atributo de ajuste", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(3, 5);
    await fretboard.setLabel("ABCDEF");

    const svg = await fretboard.exportedSvg();

    expect(svg).not.toContain("data-fit");
    expect(svg).toContain("ABCDEF");
  });

  test("o badge do inspetor encolhe para rotulos longos", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(3, 5);

    await fretboard.setLabel("R5");
    await expect(fretboard.badge).toHaveAttribute("data-long", "false");

    await fretboard.setLabel("ABCDEF");
    await expect(fretboard.badge).toHaveAttribute("data-long", "true");

    const cabe = await fretboard.badge.evaluate((el) => el.scrollWidth <= el.clientWidth);
    expect(cabe).toBe(true);
  });
});
