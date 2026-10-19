import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { produtosIniciais } from "@/mock/cardapio/dados"
import { pedidosDeExemplo } from "@/mock/pedidos/exemplos"
import { TicketCozinha } from "./TicketCozinha"

const agora = new Date("2026-10-18T19:00:00Z")
const pedidos = pedidosDeExemplo(produtosIniciais, agora)
const pedido = (id: number) => {
  const p = pedidos.find((x) => x.id === id)
  if (!p) throw new Error(String(id))
  return p
}

describe("TicketCozinha", () => {
  it("mostra a origem do pedido: mesa com garçom", () => {
    render(<TicketCozinha pedido={pedido(4)} agora={agora} />)
    const ticket = screen.getByRole("article", { name: "Pedido #4" })
    expect(ticket).toHaveTextContent("Mesa 4")
    expect(ticket).toHaveTextContent("Lucas")
  })

  it("lista os itens com quantidade, opções e observação", () => {
    render(<TicketCozinha pedido={pedido(3)} agora={agora} />)
    expect(screen.getByText("X-Tudo")).toBeInTheDocument()
    expect(screen.getByText("Sem cebola")).toBeInTheDocument()
  })

  it("a ação segue a etapa: em preparo → Marcar como pronto", async () => {
    const aoAvancar = vi.fn()
    render(<TicketCozinha pedido={pedido(3)} agora={agora} aoAvancar={aoAvancar} />)
    await userEvent.click(screen.getByRole("button", { name: "Marcar como pronto" }))
    expect(aoAvancar).toHaveBeenCalledWith(pedido(3))
  })

  it("marca a urgência pelo tempo de espera", () => {
    const { rerender } = render(<TicketCozinha pedido={pedido(1)} agora={agora} />)
    expect(screen.getByRole("article")).toHaveAttribute("data-urgencia", "normal")
    const depois = new Date(agora.getTime() + 20 * 60_000)
    rerender(<TicketCozinha pedido={pedido(1)} agora={depois} />)
    expect(screen.getByRole("article")).toHaveAttribute("data-urgencia", "atencao")
    const muitoDepois = new Date(agora.getTime() + 40 * 60_000)
    rerender(<TicketCozinha pedido={pedido(1)} agora={muitoDepois} />)
    expect(screen.getByRole("article")).toHaveAttribute("data-urgencia", "atrasado")
  })
})
