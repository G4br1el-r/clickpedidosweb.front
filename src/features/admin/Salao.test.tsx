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

const mesa = (numero: number) => banco.ler().mesas.find((m) => m.numero === numero)
const pedido = (id: number | null | undefined) => banco.ler().pedidos.find((p) => p.id === id)

describe("Mesas", () => {
  it("mostra a grade com a mesa ocupada e fecha a conta com a forma escolhida", async () => {
    await abrir("/admin/mesas")
    const quatro = await screen.findByRole("article", { name: "Mesa 04" })
    expect(within(quatro).getByText("Ocupada")).toBeInTheDocument()
    expect(screen.getByText(/10 mesas · 1 ocupada · 9 livres/)).toBeInTheDocument()
    const pedidoId = mesa(4)?.pedidoAtivoId

    await userEvent.click(within(quatro).getByRole("button", { name: "Fechar conta" }))
    const painel = await screen.findByRole("dialog")
    await userEvent.click(within(painel).getByRole("radio", { name: "Pix" }))
    await userEvent.click(
      within(painel).getByRole("button", { name: "Confirmar pagamento e liberar" }),
    )
    await waitFor(() => expect(mesa(4)?.status).toBe("Livre"))
    expect(pedido(pedidoId)).toMatchObject({ statusPagamento: "Pago", pagamento: "Pix" })
  })

  it("cadastra mesa nova e recusa número repetido", async () => {
    await abrir("/admin/mesas")
    await screen.findByRole("article", { name: "Mesa 01" })
    await userEvent.click(screen.getByRole("button", { name: "Nova mesa" }))
    const painel = await screen.findByRole("dialog")
    const numero = within(painel).getByLabelText("Número da mesa")
    expect(numero).toHaveValue(11)
    await userEvent.clear(numero)
    await userEvent.type(numero, "3")
    await userEvent.click(within(painel).getByRole("button", { name: "Cadastrar mesa" }))
    expect(
      await within(painel).findByText("Já existe uma mesa com o número 3."),
    ).toBeInTheDocument()

    await userEvent.clear(numero)
    await userEvent.type(numero, "15")
    await userEvent.type(within(painel).getByLabelText("Identificação (opcional)"), "Varanda")
    await userEvent.click(within(painel).getByRole("button", { name: "Cadastrar mesa" }))
    await waitFor(() => expect(mesa(15)?.nome).toBe("Varanda"))
  })

  it("exclui mesa livre com confirmação", async () => {
    await abrir("/admin/mesas")
    await userEvent.click(await screen.findByRole("button", { name: "Excluir Mesa 10" }))
    const dialogo = await screen.findByRole("alertdialog")
    await userEvent.click(within(dialogo).getByRole("button", { name: "Excluir" }))
    await waitFor(() => expect(mesa(10)).toBeUndefined())
  })
})

describe("Comanda", () => {
  it("lista os itens com o total e libera a mesa com confirmação", async () => {
    const quatro = mesa(4)
    const p = pedido(quatro?.pedidoAtivoId)
    const roteador = await abrir(`/admin/mesas/${quatro?.id}`)
    expect(await screen.findByRole("heading", { name: "Comanda · Mesa 04" })).toBeInTheDocument()
    expect(screen.getByText(p?.itens[0]?.nomeProduto ?? "")).toBeInTheDocument()
    expect(screen.getByText("Total da comanda")).toBeInTheDocument()

    await userEvent.click(screen.getByRole("button", { name: "Liberar mesa manualmente" }))
    const dialogo = await screen.findByRole("alertdialog")
    await userEvent.click(within(dialogo).getByRole("button", { name: "Liberar mesa" }))
    await waitFor(() => expect(roteador.state.location.pathname).toBe("/admin/mesas"))
    expect(mesa(4)?.status).toBe("Livre")
  })

  it("mesa inexistente mostra o caminho de volta", async () => {
    await abrir("/admin/mesas/999")
    expect(await screen.findByRole("heading", { name: "Mesa não encontrada" })).toBeInTheDocument()
  })
})

describe("Modo garçom", () => {
  it("escolhe a mesa, lança item com observação e envia para a cozinha", async () => {
    await abrir("/admin/garcom")
    await userEvent.click(await screen.findByRole("radio", { name: "Mesa 02, livre" }))
    await userEvent.type(screen.getByLabelText("Garçom"), "Ana")
    await userEvent.type(screen.getByLabelText("Buscar no cardápio"), "x-salada")
    await userEvent.click(await screen.findByRole("button", { name: /^X-Salada/ }))
    const modal = await screen.findByRole("dialog")
    await userEvent.type(within(modal).getByRole("textbox"), "sem tomate")
    await userEvent.click(within(modal).getByRole("button", { name: /^Lançar ·/ }))

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Ver itens a lançar" })).toHaveTextContent(
        "1 item",
      ),
    )
    await userEvent.click(screen.getByRole("button", { name: "Enviar para a cozinha" }))
    await waitFor(() => expect(mesa(2)?.status).toBe("Ocupada"))
    const novo = pedido(mesa(2)?.pedidoAtivoId)
    expect(novo).toMatchObject({ tipo: "Mesa", garcomNome: "Ana", status: "Recebido" })
    expect(novo?.itens[0]).toMatchObject({ nomeProduto: "X-Salada", observacao: "sem tomate" })
    expect(localStorage.getItem("cp_garcom_nome")).toContain("Ana")
  })

  it("lista de itens permite tirar item antes de enviar", async () => {
    await abrir("/admin/garcom?mesa=4")
    await userEvent.click(await screen.findByRole("button", { name: /^Refrigerante Lata/ }))
    const modal = await screen.findByRole("dialog")
    await userEvent.click(within(modal).getByRole("button", { name: /^Lançar ·/ }))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())

    await userEvent.click(screen.getByRole("button", { name: "Ver itens a lançar" }))
    const lista = await screen.findByRole("dialog")
    await userEvent.click(
      within(lista).getByRole("button", { name: "Tirar Refrigerante Lata da lista" }),
    )
    expect(within(lista).getByText("Nenhum item na lista.")).toBeInTheDocument()
  })

  it("mostra esgotado online, mas deixa lançar", async () => {
    banco.atualizar((d) => {
      const p = d.produtos.find((x) => x.nome === "X-Bacon")
      if (p) p.disponivel = false
    })
    await abrir("/admin/garcom?mesa=1")
    const botao = await screen.findByRole("button", { name: /^X-Bacon/ })
    expect(botao).toBeEnabled()
    expect(within(botao).getByText("Esgotado online")).toBeInTheDocument()
  })
})

describe("Cozinha", () => {
  it("filtra mesas e avança o ticket", async () => {
    await abrir("/admin/cozinha")
    expect(await screen.findByRole("heading", { name: "Cozinha" })).toBeInTheDocument()
    await screen.findAllByRole("article")
    await userEvent.click(screen.getByRole("radio", { name: "Mesas" }))
    const id = mesa(4)?.pedidoAtivoId
    // A saída dos tickets é animada: espera os de fora do filtro saírem.
    await waitFor(() =>
      expect(screen.getAllByRole("article").map((t) => t.getAttribute("aria-label"))).toEqual([
        `Pedido #${id}`,
      ]),
    )
    const tickets = screen.getAllByRole("article")

    const status = pedido(id)?.status
    const botao = within(tickets[0] as HTMLElement).getByRole("button")
    await userEvent.click(botao)
    await waitFor(() => expect(pedido(id)?.status).not.toBe(status))
  })

  it("sem sessão manda para o login", async () => {
    const roteador = criarRoteador({ entradasIniciais: ["/admin/cozinha"] })
    render(
      <Providers>
        <RouterProvider router={roteador} />
      </Providers>,
    )
    await waitFor(() => expect(roteador.state.location.pathname).toBe("/admin/login"))
  })
})
