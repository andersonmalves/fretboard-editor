const { test, expect } = require("./fixtures");

test.describe("Modelo musical", () => {
  test("AC-2: marcador sem rotulo mostra a nota calculada pela afinacao", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(6, 3);

    expect(await fretboard.drawnMarkerLabels()).toEqual(["G"]);
    await expect(fretboard.badge).toHaveText("G");
    await expect(fretboard.selectionName).toHaveText("Corda 6 · casa 3 · nota G");
  });

  test("AC-24: corda 1 e a mais aguda no topo e corda 6 a mais grave na base", async ({ fretboard }) => {
    await expect(fretboard.cell(1, 0)).toHaveAttribute("aria-label", /nota Mi 4/);
    await expect(fretboard.cell(6, 0)).toHaveAttribute("aria-label", /nota Mi 2/);
  });

  // AC-3 e AC-29: cada preset declara seu proprio estilo de acidente.
  const casosDeAfinacao = [
    { id: "standard", corda: 6, casa: 0, nota: "Mi 2", desenhado: "E" },
    { id: "standard", corda: 6, casa: 2, nota: "Fá sustenido 2", desenhado: "F#" },
    { id: "standard", corda: 1, casa: 1, nota: "Fá 4", desenhado: "F" },
    { id: "drop-d", corda: 6, casa: 0, nota: "Ré 2", desenhado: "D" },
    { id: "drop-d", corda: 6, casa: 3, nota: "Fá 2", desenhado: "F" },
    { id: "eb-standard", corda: 6, casa: 0, nota: "Mi bemol 2", desenhado: "Eb" },
    { id: "eb-standard", corda: 6, casa: 3, nota: "Sol bemol 2", desenhado: "Gb" },
    { id: "open-g", corda: 6, casa: 0, nota: "Ré 2", desenhado: "D" },
    { id: "open-g", corda: 1, casa: 0, nota: "Ré 4", desenhado: "D" },
    { id: "open-c", corda: 6, casa: 0, nota: "Dó 2", desenhado: "C" },
    { id: "open-c", corda: 2, casa: 0, nota: "Dó 4", desenhado: "C" }
  ];

  for (const caso of casosDeAfinacao) {
    test(`AC-3/AC-29: ${caso.id} corda ${caso.corda} casa ${caso.casa} soa ${caso.nota}`, async ({
      fretboard
    }) => {
      await fretboard.chooseTuning(caso.id);

      await expect(fretboard.cell(caso.corda, caso.casa)).toHaveAttribute(
        "aria-label",
        new RegExp(`nota ${caso.nota.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")},`)
      );

      await fretboard.pickTool(caso.casa === 0 ? "outline" : "filled");
      await fretboard.activate(caso.corda, caso.casa);
      expect(await fretboard.drawnMarkerLabels()).toEqual([caso.desenhado]);
    });
  }

  test("AC-29: o nome acessivel inclui a oitava", async ({ fretboard }) => {
    await expect(fretboard.cell(1, 0)).toHaveAttribute("aria-label", /Mi 4/);
    await expect(fretboard.cell(6, 12)).toHaveAttribute("aria-label", /Mi 3/);
  });

  test("AC-8: trocar de afinacao preserva posicoes e recalcula as notas", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(6, 3);
    await fretboard.activate(5, 2);
    expect(await fretboard.drawnMarkerLabels()).toEqual(["G", "B"]);

    await fretboard.chooseTuning("drop-d");

    const markers = await fretboard.markers();
    expect(markers.map((m) => [m.stringIndex, m.fret])).toEqual([
      [5, 3],
      [4, 2]
    ]);
    expect(await fretboard.drawnMarkerLabels()).toEqual(["F", "B"]);
  });

  test("AC-8: rotulos customizados sobrevivem a troca de afinacao", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(6, 3);
    await fretboard.setLabel("R");
    // Desmarcar encerra a edicao e zera o rotulo pendente, que e sticky como a
    // ferramenta ativa (ver EditorState.activeCustomLabel na spec, secao 8).
    await fretboard.deselect.click();
    await fretboard.activate(5, 2);
    expect(await fretboard.drawnMarkerLabels()).toEqual(["R", "B"]);

    await fretboard.chooseTuning("open-c");

    // O rotulo manual permanece; o automatico e recalculado para a nova afinacao.
    // Corda 5 casa 2: A2 -> B em Padrao, G2 -> A em Open C.
    expect(await fretboard.drawnMarkerLabels()).toEqual(["R", "A"]);
  });

  test("a nota exibida e derivada, nunca persistida no marcador", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(6, 3);

    const marker = await fretboard.markerAt(6, 3);
    expect(Object.keys(marker).sort()).toEqual(
      ["color", "customLabel", "fret", "id", "stringIndex", "type"].sort()
    );
  });
});
