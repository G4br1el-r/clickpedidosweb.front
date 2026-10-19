import { act, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { RouterProvider } from "react-router"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { Providers } from "@/app/Providers"
import { criarRoteador } from "@/app/rotas"
import { banco } from "@/mock/banco"
import { entrar } from "@/mock/conta/acoes"
import { criarPedido } from "@/mock/pedidos/acoes"
import { usePreferenciasFila } from "./preferencias"

// Fronteiras do navegador: áudio e diálogo de impressão.
vi.mock("@/lib/som", () => ({ tocarAlerta: vi.fn() }))
vi.mock("@/features/admin/impressao/impressao", () => ({
  imprimirCupom: vi.fn(),
  abrirCupom: vi.fn(),
}))
const { tocarAlerta } = await import("@/lib/som")
const { imprimirCupom } = await import("@/features/admin/impressao/impressao")

async function abrir() {
  await entrar("admin", "clickpedido")
  render(
    <Providers>
      <RouterProvider router={criarRoteador({ entradasIniciais: ["/admin/fila"] })} />
    </Providers>,
  )
  return screen.findByRole("heading", { name: "Fila de pedidos" })
}

const coluna = (nome: string) => screen.findByRole("region", { name: nome })

describe("PaginaFila", () => {
  beforeEach(() => {
    vi.mocked(tocarAlerta).mockClear()
    vi.mocked(imprimirCupom).mockClear()
    usePreferenciasFila.setState({ som: false, autoImprimir: false })
  })

  it("sem login, manda para o login e volta para a fila", async () => {
    const roteador = criarRoteador({ entradasIniciais: ["/admin/fila"] })
    render(
      <Providers>
        <RouterProvider router={roteador} />
      </Providers>,
    )
    expect(await screen.findByRole("heading", { name: "Entrar no admin" })).toBeInTheDocument()
    expect(roteador.state.location.search).toBe("?voltar=%2Fadmin%2Ffila")
    await userEvent.type(screen.getByLabelText("Login"), "admin")
    await userEvent.type(screen.getByLabelText("Senha"), "clickpedido")
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }))
    expect(await screen.findByRole("heading", { name: "Fila de pedidos" })).toBeInTheDocument()
  })

  it("mostra as quatro colunas com os pedidos em andamento e o resumo", async () => {
    await abrir()
    expect(
      await within(await coluna("Novos")).findByRole("article", { name: "Pedido #1" }),
    ).toBeInTheDocument()
    expect(
      within(await coluna("Em preparo")).getByRole("article", { name: "Pedido #3" }),
    ).toBeInTheDocument()
    expect(
      within(await coluna("Prontos")).getByRole("article", { name: "Pedido #5" }),
    ).toBeInTheDocument()
    expect(
      within(await coluna("Em rota")).getByRole("article", { name: "Pedido #6" }),
    ).toBeInTheDocument()
    expect(screen.getByText(/2 concluídos hoje · 1 aguardando pagamento/)).toBeInTheDocument()
  })

  it("avançar leva o pedido para a próxima coluna", async () => {
    await abrir()
    const card = await within(await coluna("Novos")).findByRole("article", { name: "Pedido #1" })
    await userEvent.click(within(card).getByRole("button", { name: "Iniciar preparo" }))
    expect(
      await within(await coluna("Em preparo")).findByRole("article", { name: "Pedido #1" }),
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(banco.ler().pedidos.find((p) => p.id === 1)?.status).toBe("EmPreparo"),
    )
  })

  it("cancelar pede confirmação", async () => {
    await abrir()
    const card = await within(await coluna("Novos")).findByRole("article", { name: "Pedido #2" })
    await userEvent.click(within(card).getByRole("button", { name: "Mais ações do pedido #2" }))
    await userEvent.click(await screen.findByRole("menuitem", { name: "Cancelar pedido" }))
    const confirmar = await screen.findByRole("alertdialog", { name: "Cancelar o pedido #2?" })
    await userEvent.click(within(confirmar).getByRole("button", { name: "Cancelar pedido" }))
    await waitFor(() =>
      expect(banco.ler().pedidos.find((p) => p.id === 2)?.status).toBe("Cancelado"),
    )
  })

  it("pedido novo toca o alerta e é impresso quando as opções estão ligadas", async () => {
    usePreferenciasFila.setState({ som: true, autoImprimir: true })
    await abrir()
    await within(await coluna("Novos")).findByRole("article", { name: "Pedido #1" })
    vi.mocked(imprimirCupom).mockClear()

    await act(async () => {
      const r = await criarPedido({
        nome: "Novo Cliente",
        telefone: "12990000000",
        tipo: "Retirada",
        pagamento: "Dinheiro",
        itens: [{ produtoId: 1, quantidade: 2 }],
      })
      if (!r.ok) throw new Error(r.erro)
    })

    expect(
      await within(await coluna("Novos")).findByRole("article", { name: "Pedido #11" }),
    ).toBeInTheDocument()
    await waitFor(() => expect(tocarAlerta).toHaveBeenCalled())
    await waitFor(() => expect(imprimirCupom).toHaveBeenCalledWith(11))
  })

  it("a chave Loja aberta fecha a loja", async () => {
    await abrir()
    await within(await coluna("Novos")).findByRole("article", { name: "Pedido #1" })
    const chave = await screen.findByRole("switch", { name: "Loja aberta" })
    await userEvent.click(chave)
    await waitFor(() => expect(banco.ler().loja.lojaAberta).toBe(false))
  })
})
