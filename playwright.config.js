const { defineConfig, devices } = require("@playwright/test");

const PORT = 4176;
const BASE_URL = `http://127.0.0.1:${PORT}`;

// A matriz de compatibilidade da spec (secao 4) e Chrome, Firefox e Safari estaveis.
// Viewport e ponteiro coarse sao controlados por test.use() dentro de responsive.spec.js.
module.exports = defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure"
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } }
  ],
  webServer: {
    command: `python3 -m http.server ${PORT} --bind 127.0.0.1`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    stdout: "ignore"
  }
});
