import { expect, test } from "@playwright/test"

test("a página inicial abre com o nome da loja", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("heading", { name: "Quiosque do Mineiro" })).toBeVisible()
})
