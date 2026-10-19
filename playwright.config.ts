import { defineConfig, devices } from "@playwright/test"

const url = "http://localhost:5173"

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  // O servidor de dev compila cada tela na primeira visita: folga para o primeiro carregamento.
  timeout: 45_000,
  expect: { timeout: 10_000 },
  forbidOnly: !!process.env["CI"],
  retries: process.env["CI"] ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: url,
    trace: "on-first-retry",
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
  },
  // A loja é usada no celular e a operação no desktop: os fluxos críticos rodam nos dois.
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "celular", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "pnpm dev --port 5173 --strictPort",
    url,
    timeout: 120_000,
    reuseExistingServer: !process.env["CI"],
  },
})
