import { expect, test } from "@playwright/test"

test("a /_design troca entre as três direções sem erro no console", async ({ page }) => {
  const erros: string[] = []
  page.on("console", (msg) => {
    if (msg.type() === "error") erros.push(msg.text())
  })
  page.on("pageerror", (erro) => erros.push(erro.message))

  await page.goto("/_design")
  await expect(page.getByRole("heading", { name: "Direções visuais" })).toBeVisible()

  for (const [nome, id] of [
    ["Ladrilho", "ladrilho"],
    ["Balcão", "balcao"],
    ["Feira", "feira"],
  ] as const) {
    await page.getByRole("radio", { name: nome }).click()
    await expect(page.locator("[data-direcao]").first()).toHaveAttribute("data-direcao", id)
  }

  await expect(page.getByRole("region", { name: "Cardápio no celular" })).toBeVisible()
  expect(erros).toEqual([])
})
