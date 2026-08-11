const INDEX_HTML_BYTE_BUDGET = 68608;

const base = require("@playwright/test");
const { FretboardPage } = require("./fretboard-page");

const test = base.test.extend({
  fretboard: async ({ page }, use) => {
    const fretboard = new FretboardPage(page);
    await fretboard.goto();
    await use(fretboard);
  }
});

module.exports = { test, expect: base.expect, INDEX_HTML_BYTE_BUDGET };
