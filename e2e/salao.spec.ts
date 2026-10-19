import { expect, test } from "@playwright/test"

test.beforeEach(async ({ page }) => {
  await page.goto("/")
  await page.evaluate(() => window.localStorage.clear())
})

test("garçom lança na mesa, cozinha prepara e o caixa fecha a conta", async ({ page }) => {
  await page.goto("/admin/garcom?mesa=2")
  await page.getByLabel("Login").fill("admin")
  await page.getByLabel("Senha").fill("clickpedido")
  await page.getByRole("button", { name: "Entrar" }).click()

  // Garçom: mesa 2 já vem escolhida pelo link.
  await expect(page.getByRole("radio", { name: "Mesa 02, livre" })).toHaveAttribute(
    "aria-checked",
    "true",
  )
  await page.getByLabel("Garçom").fill("Ana")
  await page.getByLabel("Buscar no cardápio").fill("x-burger")
  await page.getByRole("button", { name: /^X-Burger/ }).click()
  await page.getByRole("button", { name: /^Lançar ·/ }).click()
  await page.getByRole("button", { name: "Enviar para a cozinha" }).click()
  await expect(page.getByText("Pedido da Mesa 2 enviado para a cozinha!")).toBeVisible()

  // Cozinha: o ticket da mesa 2 aparece e anda até servido.
  await page.goto("/admin/cozinha")
  await page.getByRole("radio", { name: "Mesas" }).click()
  const ticket = page.getByRole("article").filter({ hasText: "Mesa 2" })
  await ticket.getByRole("button", { name: "Iniciar preparo" }).click()
  await ticket.getByRole("button", { name: "Marcar como pronto" }).click()
  await ticket.getByRole("button", { name: "Servir na mesa" }).click()
  await expect(ticket).toHaveCount(0)

  // Caixa: a comanda continua aberta até fechar a conta.
  await page.goto("/admin/mesas")
  const mesa = page.getByRole("article", { name: "Mesa 02" })
  await expect(mesa.getByText("Ocupada")).toBeVisible()
  await expect(mesa.getByText("Garçom: Ana")).toBeVisible()
  await mesa.getByRole("button", { name: "Fechar conta" }).click()
  await page.getByRole("dialog").getByRole("radio", { name: "Cartão na maquininha" }).click()
  await page.getByRole("button", { name: "Confirmar pagamento e liberar" }).click()
  await expect(page.getByText("Mesa 2 finalizada e liberada com sucesso.")).toBeVisible()
  await expect(mesa.getByText("Livre")).toBeVisible()
})
