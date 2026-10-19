import { expect, test } from "@playwright/test"

test.beforeEach(async ({ page }) => {
  await page.goto("/")
  await page.evaluate(() => window.localStorage.clear())
})

test("cliente monta a sacola, paga com Pix e acompanha o pedido", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("heading", { level: 1, name: "Quiosque do Mineiro" })).toBeVisible()

  // Açaí com tamanho e adicional: o preço muda ao vivo.
  await page.getByRole("button", { name: /^Açaí Paçoca/ }).click()
  await page.getByRole("radio", { name: /500 ml/ }).click()
  await page.getByRole("button", { name: "Adicionar Coco Ralado" }).click()
  await expect(page.getByRole("button", { name: /^Adicionar ·/ })).toContainText("23,00")
  await page.getByRole("button", { name: /^Adicionar ·/ }).click()

  await page.getByRole("button", { name: /Ver sacola/ }).click()
  await page.getByRole("button", { name: "Continuar" }).click()

  await expect(page.getByRole("heading", { name: "Finalizar pedido" })).toBeVisible()
  await page.getByRole("radio", { name: /Retirada/ }).click()
  await page.getByLabel("Nome").fill("Maria da Silva")
  await page.getByLabel("WhatsApp").fill("12991234567")
  await page.getByRole("radio", { name: /^Pix/ }).click()
  await page.getByLabel(/CPF/).fill("52998224725")
  await page.getByRole("button", { name: /^Fazer pedido/ }).click()

  await expect(page).toHaveURL(/\/pedido\/[0-9a-f]{32}$/)
  const pix = page.getByRole("region", { name: "Pagamento com Pix" })
  await expect(pix.getByRole("img", { name: "QR Code do Pix" })).toBeVisible()
  await pix.getByRole("button", { name: /Simular pagamento/ }).click()

  await expect(page.getByText("Pagamento confirmado")).toBeVisible()
  await expect(page.getByRole("list", { name: "Andamento do pedido" })).toBeVisible()
})

test("entrega calcula a taxa do bairro pelo CEP", async ({ page }) => {
  await page.goto("/")
  await page.getByRole("button", { name: /^Pastel de Carne Carne moída/ }).click()
  await page.getByRole("button", { name: "Aumentar quantidade de Pastel de Carne" }).click()
  await page.getByRole("button", { name: /^Adicionar ·/ }).click()
  await page.getByRole("button", { name: /Ver sacola/ }).click()
  await page.getByRole("button", { name: "Continuar" }).click()

  await page.getByRole("radio", { name: /Entrega/ }).click()
  await page.getByLabel("CEP").fill("12630300")
  await expect(page.getByLabel("Rua")).toHaveValue("Estrada do Embaú")
  await expect(page.getByRole("region", { name: "Seu pedido" })).toContainText("15,00")
  await expect(page.getByRole("button", { name: /^Fazer pedido/ })).toContainText("33,00")
})
