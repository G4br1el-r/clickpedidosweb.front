import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { RouterProvider } from "react-router"
import { beforeEach, describe, expect, it } from "vitest"
import { Providers } from "@/app/Providers"
import { criarRoteador } from "@/app/rotas"
import { useSacola } from "@/features/loja/sacola/sacola"
import { banco } from "@/mock/banco"

function abrir(caminho = "/") {
  const roteador = criarRoteador({ entradasIniciais: [caminho] })
  render(
    <Providers>
      <RouterProvider router={roteador} />
    </Providers>,
  )
  return roteador
}

describe("PaginaCardapio", () => {
  beforeEach(() => {
    useSacola.getState().limpar()
  })

  it("lista as categorias com abas para navegar", async () => {
    abrir()
    const abas = await screen.findByRole("navigation", { name: "Categorias" })
    expect(within(abas).getByRole("link", { name: "Pastéis" })).toHaveAttribute(
      "href",
      "#categoria-1",
    )
    expect(screen.getByRole("heading", { level: 2, name: "Açaí Gourmet" })).toBeInTheDocument()
  })

  it("adicionar um produto mostra a barra da sacola com quantidade e total", async () => {
    abrir()
    await userEvent.click(
      await screen.findByRole("button", { name: /^Pastel de Carne Carne moída/ }),
    )
    await userEvent.click(await screen.findByRole("button", { name: /^Adicionar ·/ }))
    const barra = await screen.findByRole("button", { name: /Ver sacola/ })
    expect(barra).toHaveTextContent("1")
    expect(barra).toHaveTextContent(/R\$\s9,00/)
  })

  it("a sacola mostra o item, avisa o pedido mínimo e leva ao checkout", async () => {
    useSacola.getState().adicionar({ produtoId: 1, quantidade: 1 })
    const roteador = abrir()
    await userEvent.click(await screen.findByRole("button", { name: /Ver sacola/ }))
    const sacola = await screen.findByRole("dialog", { name: "Sua sacola" })
    expect(within(sacola).getByText("Pastel de Carne")).toBeInTheDocument()
    expect(sacola).toHaveTextContent(/Faltam\s+R\$\s6,00 para o pedido mínimo/)
    expect(within(sacola).getByRole("button", { name: "Continuar" })).toBeDisabled()

    await userEvent.click(
      within(sacola).getByRole("button", { name: "Aumentar quantidade de Pastel de Carne" }),
    )
    await userEvent.click(within(sacola).getByRole("button", { name: "Continuar" }))
    await waitFor(() => expect(roteador.state.location.pathname).toBe("/checkout"))
  })

  it("loja fechada mostra o aviso e não deixa abrir produto", async () => {
    banco.atualizar((d) => {
      d.loja.lojaAberta = false
    })
    abrir()
    expect(await screen.findByText(/Estamos fechados agora/)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^Pastel de Carne Carne moída/ })).toBeDisabled()
  })

  it("o cardápio digital é só consulta, sem sacola", async () => {
    abrir("/cardapio")
    expect(await screen.findByText("Pastel de Carne")).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: /^Pastel de Carne Carne moída/ }),
    ).not.toBeInTheDocument()
  })
})
