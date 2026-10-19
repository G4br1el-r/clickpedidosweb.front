import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { BadgeStatus } from "./badge-status"
import { FotoProduto } from "./foto-produto"
import { Preco } from "./preco"
import { SeletorQuantidade } from "./seletor-quantidade"

// A Testing Library normaliza o espaço não separável do Intl para espaço comum.
describe("Preco", () => {
  it("mostra o valor em reais", () => {
    render(<Preco valor={9} />)
    expect(screen.getByText("R$ 9,00")).toBeInTheDocument()
  })

  it("com aPartirDe mostra 'A partir de'", () => {
    render(<Preco valor={18} aPartirDe />)
    expect(screen.getByText(/A partir de/)).toBeInTheDocument()
    expect(screen.getByText("R$ 18,00")).toBeInTheDocument()
  })

  it("com valorAntigo mostra o preço riscado com rótulo acessível", () => {
    render(<Preco valor={20} valorAntigo={25} />)
    expect(screen.getByText("R$ 25,00").closest("s")).toBeInTheDocument()
  })
})

describe("SeletorQuantidade", () => {
  it("Aumentar chama aoMudar com valor + 1", async () => {
    const aoMudar = vi.fn()
    render(<SeletorQuantidade valor={2} aoMudar={aoMudar} rotulo="Pastel de Carne" />)
    await userEvent.click(
      screen.getByRole("button", { name: "Aumentar quantidade de Pastel de Carne" }),
    )
    expect(aoMudar).toHaveBeenCalledWith(3)
  })

  it("Diminuir chama aoMudar com valor - 1", async () => {
    const aoMudar = vi.fn()
    render(<SeletorQuantidade valor={2} aoMudar={aoMudar} rotulo="X" />)
    await userEvent.click(screen.getByRole("button", { name: "Diminuir quantidade de X" }))
    expect(aoMudar).toHaveBeenCalledWith(1)
  })

  it("no máximo, Aumentar fica desabilitado", () => {
    render(<SeletorQuantidade valor={50} aoMudar={() => {}} rotulo="X" />)
    expect(screen.getByRole("button", { name: "Aumentar quantidade de X" })).toBeDisabled()
  })

  it("no mínimo, Diminuir fica desabilitado", () => {
    render(<SeletorQuantidade valor={1} aoMudar={() => {}} rotulo="X" />)
    expect(screen.getByRole("button", { name: "Diminuir quantidade de X" })).toBeDisabled()
  })

  it("anuncia a quantidade atual", () => {
    render(<SeletorQuantidade valor={3} aoMudar={() => {}} rotulo="X" />)
    expect(screen.getByRole("status")).toHaveTextContent("3")
  })
})

describe("BadgeStatus", () => {
  it("mostra o rótulo do status conforme o tipo", () => {
    render(<BadgeStatus status="Pronto" tipo="Retirada" />)
    expect(screen.getByText("Pronto para retirada")).toBeInTheDocument()
  })

  it("expõe o status em data-status", () => {
    render(<BadgeStatus status="EmPreparo" tipo="Entrega" />)
    expect(screen.getByText("Em preparo").closest("[data-status]")).toHaveAttribute(
      "data-status",
      "EmPreparo",
    )
  })
})

describe("FotoProduto", () => {
  it("com foto, renderiza img com alt do nome e carregamento preguiçoso", () => {
    render(
      <FotoProduto
        produto={{ id: 1, nome: "Pastel de Carne", imagemUrl: "https://images.unsplash.com/x" }}
        tamanho="md"
      />,
    )
    const img = screen.getByRole("img", { name: "Pastel de Carne" })
    expect(img).toHaveAttribute("loading", "lazy")
    expect(img).toHaveAttribute("width")
    expect(img).toHaveAttribute("height")
  })

  it("sem foto, renderiza a inicial sem img", () => {
    render(<FotoProduto produto={{ id: 2, nome: "Água Mineral", imagemUrl: null }} tamanho="md" />)
    expect(screen.queryByRole("img")).not.toBeInTheDocument()
    expect(screen.getByText("Á")).toBeInTheDocument()
  })
})
