import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { produtosIniciais } from "@/mock/cardapio/dados"
import { pedidosDeExemplo } from "@/mock/pedidos/exemplos"
import { CartaoPedido } from "./CartaoPedido"

const agora = new Date("2026-10-18T19:00:00Z")
const pedidos = pedidosDeExemplo(produtosIniciais, agora)
const pedido = (id: number) => {
  const p = pedidos.find((x) => x.id === id)
  if (!p) throw new Error(String(id))
  return p
}

describe("CartaoPedido", () => {
  it("mostra número, cliente, itens, total e status", () => {
    render(<CartaoPedido pedido={pedido(1)} agora={agora} />)
    const cartao = screen.getByRole("article", { name: "Pedido #1" })
    expect(cartao).toHaveTextContent("Mariana Souza")
    expect(cartao).toHaveTextContent("2× Pastel de Carne")
    expect(cartao).toHaveTextContent(/R\$\s35,00/)
    expect(within(cartao).getByText("Pedido recebido")).toBeInTheDocument()
    expect(cartao).toHaveTextContent("2 min")
  })

  it("dinheiro com troco avisa quanto levar", () => {
    render(<CartaoPedido pedido={pedido(1)} agora={agora} />)
    expect(screen.getByText(/Troco para R\$\s50,00/)).toBeInTheDocument()
  })

  it("o botão principal avança com o texto da próxima etapa", async () => {
    const aoAvancar = vi.fn()
    render(<CartaoPedido pedido={pedido(3)} agora={agora} aoAvancar={aoAvancar} />)
    await userEvent.click(screen.getByRole("button", { name: "Marcar como pronto" }))
    expect(aoAvancar).toHaveBeenCalledWith(pedido(3))
  })

  it("pedido concluído não tem botão de avançar", () => {
    render(<CartaoPedido pedido={pedido(8)} agora={agora} aoAvancar={() => {}} />)
    expect(screen.queryByRole("button", { name: /Iniciar|Marcar|Saiu|Confirmar/ })).toBeNull()
  })

  it("pagamento online já pago aparece como pago", () => {
    render(<CartaoPedido pedido={pedido(5)} agora={agora} />)
    expect(screen.getByText("Pix · pago")).toBeInTheDocument()
  })
})
