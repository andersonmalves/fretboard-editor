const fs = require("node:fs");
const path = require("node:path");
const { test, expect } = require("./fixtures");
const { FretboardPage } = require("./fretboard-page");

test.describe("Exportacao", () => {
  test("AC-18: o SVG exportado reproduz o diagrama visivel", async ({ fretboard }) => {
    await fretboard.pickTool("outline");
    await fretboard.activate(6, 0);
    await fretboard.pickTool("filled");
    await fretboard.activate(5, 2);
    await fretboard.setLabel("R");

    const svg = await fretboard.exportedSvg();

    expect(svg).toContain("R");
    expect(svg).toContain("Padrão");
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('width="1200"');
  });

  test("AC-18: o arquivo exportado nao carrega mira, foco nem contorno de selecao", async ({
    fretboard
  }) => {
    await fretboard.pickTool("filled");
    await fretboard.cell(3, 5).focus();
    await fretboard.page.keyboard.press("Enter");

    // Na tela as affordances de edicao existem.
    await expect(fretboard.svg.locator("[data-editor-layer]")).toHaveCount(1);

    const svg = await fretboard.exportedSvg();

    expect(svg).not.toContain("data-editor-layer");
    expect(svg).not.toContain("stroke-dasharray");
    expect(svg).not.toContain('role="img"');
    expect(svg).not.toContain("aria-labelledby");
  });

  test("AC-18: ligacoes exportadas aparecem no SVG sem camada de edicao", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(1, 4);
    await fretboard.activate(5, 6);
    await fretboard.connectMarkers(1, 4, 5, 6);

    const svg = await fretboard.exportedSvg();

    expect(svg).toContain('data-diagram-layer="connections"');
    expect(svg).toContain("<line");
    expect(svg).not.toContain("data-editor-layer");
  });

  test("AC-18: marcadores e notas sobrevivem a exportacao", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(6, 3);
    await fretboard.activate(5, 2);

    const svg = await fretboard.exportedSvg();
    const textos = await fretboard.page.evaluate((markup) => {
      const doc = new DOMParser().parseFromString(markup, "image/svg+xml");
      return [...doc.querySelectorAll("text")].map((t) => t.textContent);
    }, svg);

    expect(textos).toContain("G");
    expect(textos).toContain("B");
    expect(textos).toContain("NUT");
  });

  test("baixar SVG entrega um arquivo com o nome do titulo", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(6, 3);

    const [download] = await Promise.all([
      fretboard.page.waitForEvent("download"),
      fretboard.exportSvg.click()
    ]);

    // Titulo padrao sanitizado (barra vira espaco).
    expect(download.suggestedFilename()).toBe("FRETBOARD 06 STRING.svg");
    const conteudo = fs.readFileSync(await download.path(), "utf8");
    expect(conteudo).toContain("<svg");
    expect(conteudo).toContain("</svg>");
    await expect(fretboard.status).toContainText("SVG preparado");
  });

  test("baixar PNG entrega um arquivo raster valido com o nome do titulo", async ({ fretboard }) => {
    await fretboard.pickTool("filled");
    await fretboard.activate(6, 3);

    const [download] = await Promise.all([
      fretboard.page.waitForEvent("download"),
      fretboard.exportPng.click()
    ]);

    expect(download.suggestedFilename()).toBe("FRETBOARD 06 STRING.png");
    const bytes = fs.readFileSync(await download.path());
    // Assinatura PNG.
    expect([...bytes.subarray(0, 4)]).toEqual([0x89, 0x50, 0x4e, 0x47]);
    await expect(fretboard.status).toContainText("PNG preparado");
  });

  test("export usa titulo customizado sanitizado como basename", async ({ fretboard }) => {
    await fretboard.setDiagramTitle("Pentatonica A / forma 1");

    const [download] = await Promise.all([
      fretboard.page.waitForEvent("download"),
      fretboard.exportSvg.click()
    ]);

    expect(download.suggestedFilename()).toBe("Pentatonica A forma 1.svg");
  });

  test("export sanitize caracteres invalidos e cai no fallback se sobrar vazio", async ({
    fretboard
  }) => {
    await fretboard.setDiagramTitle('A<>:"/\\|?*B');

    const [downloadOk] = await Promise.all([
      fretboard.page.waitForEvent("download"),
      fretboard.exportSvg.click()
    ]);
    expect(downloadOk.suggestedFilename()).toBe("A B.svg");

    // Barras sobrevivem no titulo do diagrama, mas viram vazias no basename → fallback.
    await fretboard.setDiagramTitle("///");
    const [downloadFallback] = await Promise.all([
      fretboard.page.waitForEvent("download"),
      fretboard.exportPng.click()
    ]);
    expect(downloadFallback.suggestedFilename()).toBe("diagrama-braco.png");
  });

  test("exportar um diagrama vazio nao falha", async ({ fretboard }) => {
    const [download] = await Promise.all([
      fretboard.page.waitForEvent("download"),
      fretboard.exportSvg.click()
    ]);

    expect(download.suggestedFilename()).toBe("FRETBOARD 06 STRING.svg");
  });

  test("AC-26: falha ao exportar preserva o diagrama e permite nova tentativa", async ({ page }) => {
    await page.addInitScript(() => {
      const original = URL.createObjectURL.bind(URL);
      window.__falharExport = true;
      URL.createObjectURL = (blob) => {
        if (window.__falharExport) throw new Error("createObjectURL indisponivel");
        return original(blob);
      };
    });

    const fretboard = new FretboardPage(page);
    await fretboard.goto();
    await fretboard.pickTool("filled");
    await fretboard.activate(6, 3);

    await fretboard.exportSvg.click();
    await expect(fretboard.status).toContainText("Não foi possível gerar o SVG");
    expect(await fretboard.markers()).toHaveLength(1);

    await fretboard.exportPng.click();
    await expect(fretboard.status).toContainText("Não foi possível gerar o PNG");
    expect(await fretboard.markers()).toHaveLength(1);

    // Com o erro removido, a mesma acao volta a funcionar.
    await page.evaluate(() => {
      window.__falharExport = false;
    });
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      fretboard.exportSvg.click()
    ]);
    expect(download.suggestedFilename()).toBe("FRETBOARD 06 STRING.svg");
  });

  test("AC-32: nao ha requisicao de rede em runtime", async ({ page }) => {
    const requisicoes = [];
    page.on("request", (request) => {
      const url = request.url();
      // O favicon e pedido pelo navegador, nao pela aplicacao. blob: e data: sao
      // leituras em memoria da propria aba — e o caminho pelo qual o PNG e rasterizado.
      if (url.includes("favicon") || url.startsWith("blob:") || url.startsWith("data:")) return;
      requisicoes.push(url);
    });

    const fretboard = new FretboardPage(page);
    await fretboard.goto();
    const aposCarregar = requisicoes.length;

    await fretboard.pickTool("filled");
    await fretboard.activate(6, 3);
    await fretboard.setLabel("R");
    await fretboard.chooseTuning("open-g");
    await fretboard.startFret.fill("5");
    await fretboard.undo.click();
    await Promise.all([page.waitForEvent("download"), fretboard.exportSvg.click()]);
    await Promise.all([page.waitForEvent("download"), fretboard.exportPng.click()]);

    expect(requisicoes.slice(aposCarregar)).toEqual([]);
    expect(requisicoes.filter((url) => !url.startsWith("http://127.0.0.1"))).toEqual([]);
  });

  test("a CSP bloqueia conexoes externas", async ({ page }) => {
    const csp = await page
      .goto("/")
      .then(() =>
        page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute("content")
      );

    expect(csp).toContain("default-src 'none'");
    expect(csp).not.toContain("connect-src");
  });

  test("CSS de impressao A4 landscape esta presente no documento", () => {
    const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

    expect(html).toContain("@media print");
    expect(html).toContain("size:A4 landscape");
    expect(html).toMatch(/\.command-bar[\s\S]*?display:none/);
    expect(html).toMatch(/\.inspector[\s\S]*?display:none/);
  });
});

test.describe("Orcamento do artefato", () => {
  test("AC-32: index.html permanece dentro de 65.536 bytes", () => {
    const arquivo = path.join(__dirname, "..", "index.html");
    const bytes = fs.statSync(arquivo).size;

    expect(bytes).toBeLessThanOrEqual(65536);
  });

  test("nao ha dependencia de runtime carregada pelo documento", () => {
    const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

    expect(html).not.toMatch(/<script[^>]+src=/i);
    expect(html).not.toMatch(/<link[^>]+rel=["']?stylesheet/i);
    expect(html).not.toMatch(/@import/i);
  });
});
