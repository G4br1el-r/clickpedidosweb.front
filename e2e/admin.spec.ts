import { expect, type Page, test } from "@playwright/test"

async function entrar(page: Page, destino = "/admin/fila") {
  await page.goto(destino)
  await page.getByLabel("Login").fill("admin")
  await page.getByLabel("Senha").fill("clickpedido")
  await page.getByRole("button", { name: "Entrar" }).click()
}

test.beforeEach(async ({ page }) => {
  await page.goto("/")
  await page.evaluate(() => window.localStorage.clear())
})

test("pedido feito na loja chega na fila e avança até sair para entrega", async ({ page }) => {
  // Cliente faz um pedido de entrega em dinheiro.
  await page.goto("/")
  await page.getByRole("button", { name: /^X-Burger/ }).click()
  await page.getByRole("button", { name: /^Adicionar ·/ }).click()
  await page.getByRole("button", { name: /Ver sacola/ }).click()
  await page.getByRole("button", { name: "Continuar" }).click()
  await page.getByRole("radio", { name: /Entrega/ }).click()
  await page.getByLabel("Nome").fill("Cliente do Teste")
  await page.getByLabel("WhatsApp").fill("12991234567")
  await page.getByLabel("CEP").fill("12630001")
  await expect(page.getByLabel("Rua")).toHaveValue("Rua Barão de Castro Lima")
  await page.getByLabel("Número").fill("10")
  await page.getByRole("radio", { name: /^Dinheiro/ }).click()
  await page.getByRole("button", { name: /^Fazer pedido/ }).click()
  await expect(page).toHaveURL(/\/pedido\//)

  // Equipe vê o pedido na fila e leva até a rua.
  await entrar(page)
  const novos = page.getByRole("region", { name: "Novos" })
  const card = novos.getByRole("article").filter({ hasText: "Cliente do Teste" })
  await expect(card).toBeVisible()
  await card.getByRole("button", { name: "Iniciar preparo" }).click()

  const emPreparo = page.getByRole("region", { name: "Em preparo" })
  const noPreparo = emPreparo.getByRole("article").filter({ hasText: "Cliente do Teste" })
  await noPreparo.getByRole("button", { name: "Marcar como pronto" }).click()

  const prontos = page.getByRole("region", { name: "Prontos" })
  await prontos
    .getByRole("article")
    .filter({ hasText: "Cliente do Teste" })
    .getByRole("button", { name: "Saiu para entrega" })
    .click()

  await expect(
    page
      .getByRole("region", { name: "Em rota" })
      .getByRole("article")
      .filter({ hasText: "Cliente do Teste" }),
  ).toBeVisible()
})

test("cupom de 80 mm abre com os dados do pedido", async ({ page }) => {
  await entrar(page, "/admin/pedidos/1/imprimir")
  await expect(page.getByRole("heading", { name: "PEDIDO #1" })).toBeVisible()
  await expect(page.getByText("ENTREGA", { exact: true })).toBeVisible()
})

test("produto esgotado e Pix desligado no admin aparecem assim na loja", async ({ page }) => {
  await entrar(page, "/admin/produtos")
  const lanches = page.getByRole("region", { name: /Lanches/ })
  await lanches.getByRole("switch", { name: "X-Burger disponível para pedir" }).click()
  await expect(lanches.getByText("Esgotado")).toHaveCount(1)

  await page.goto("/admin/configuracoes")
  await page.getByRole("switch", { name: "Pix" }).click()
  await page.getByRole("button", { name: "Salvar configurações" }).click()
  await expect(page.getByText("Configurações e horários de funcionamento salvos")).toBeVisible()

  await page.goto("/")
  await expect(page.getByRole("button", { name: /^X-Burger/ })).toBeDisabled()
  await page.getByRole("button", { name: /^X-Salada/ }).click()
  await page.getByRole("button", { name: /^Adicionar ·/ }).click()
  await page.getByRole("button", { name: /Ver sacola/ }).click()
  await page.getByRole("button", { name: "Continuar" }).click()
  await expect(page.getByRole("radio", { name: /^Dinheiro/ })).toBeVisible()
  await expect(page.getByRole("radio", { name: /^Pix/ })).toHaveCount(0)
})
