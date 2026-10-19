import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { RouterProvider } from "react-router"
import { describe, expect, it } from "vitest"
import { Providers } from "@/app/Providers"
import { criarRoteador } from "@/app/rotas"
import { banco } from "@/mock/banco"
import { entrar } from "@/mock/conta/acoes"

async function abrir(caminho: string) {
  await entrar("admin", "clickpedido")
  const roteador = criarRoteador({ entradasIniciais: [caminho] })
  render(
    <Providers>
      <RouterProvider router={roteador} />
    </Providers>,
  )
  return roteador
}

describe("Visão geral", () => {
  it("mostra os indicadores do dia e os mais vendidos", async () => {
    await abrir("/admin")
    const indicadores = await screen.findByRole("region", { name: "Indicadores do dia" })
    expect(indicadores).toHaveTextContent("Pedidos")
    expect(indicadores).toHaveTextContent("Faturamento")
    expect(screen.getByRole("heading", { name: "Mais vendidos hoje" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Últimos pedidos" })).toBeInTheDocument()
  })
})

describe("Pedidos do dia", () => {
  it("lista em tabela, filtra por status e abre o detalhe", async () => {
    const roteador = await abrir("/admin/pedidos")
    const tabela = await screen.findByRole("table")
    expect(within(tabela).getAllByRole("row")).toHaveLength(11)

    await userEvent.click(screen.getByRole("radio", { name: "Entregue" }))
    await waitFor(() =>
      expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(3),
    )

    await userEvent.click(screen.getByRole("row", { name: "Abrir pedido #8" }))
    await waitFor(() => expect(roteador.state.location.pathname).toBe("/admin/pedidos/8"))
  })
})

describe("Detalhe do pedido", () => {
  it("mostra cliente, itens e permite avançar e marcar como pago", async () => {
    await abrir("/admin/pedidos/7")
    expect(await screen.findByRole("heading", { name: "Pedido #7" })).toBeInTheDocument()
    expect(screen.getByText("Carlos Henrique")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Marcar como pago" }))
    await waitFor(() =>
      expect(banco.ler().pedidos.find((p) => p.id === 7)?.statusPagamento).toBe("Pago"),
    )
    expect(banco.ler().pedidos.find((p) => p.id === 7)?.status).toBe("Recebido")
  })

  it("cancelar pede confirmação", async () => {
    await abrir("/admin/pedidos/1")
    await userEvent.click(await screen.findByRole("button", { name: "Cancelar pedido" }))
    const dialogo = await screen.findByRole("alertdialog")
    await userEvent.click(within(dialogo).getByRole("button", { name: "Cancelar pedido" }))
    await waitFor(() =>
      expect(banco.ler().pedidos.find((p) => p.id === 1)?.status).toBe("Cancelado"),
    )
  })
})

describe("Cupom 80 mm", () => {
  it("mostra os dados do pedido e marca como impresso", async () => {
    await abrir("/admin/pedidos/1/imprimir")
    expect(await screen.findByRole("heading", { name: "PEDIDO #1" })).toBeInTheDocument()
    expect(screen.getByText("ENTREGA")).toBeInTheDocument()
    expect(screen.getByText(/Dinheiro – COBRAR/)).toBeInTheDocument()
    expect(screen.getByText(/Troco para R\$\s50,00/)).toBeInTheDocument()
    await waitFor(() =>
      expect(banco.ler().pedidos.find((p) => p.id === 1)?.impressoEm).toBeTruthy(),
    )
  })
})
