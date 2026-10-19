import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { produtosIniciais } from "@/mock/cardapio/dados"
import { ProdutoLinha } from "./ProdutoLinha"

const produto = (nome: string) => {
  const p = produtosIniciais.find((x) => x.nome === nome)
  if (!p) throw new Error(nome)
  return p
}

describe("ProdutoLinha", () => {
  it("mostra nome, descrição e preço, e abre o produto ao tocar", async () => {
    const aoAbrir = vi.fn()
    render(<ProdutoLinha produto={produto("Pastel de Carne")} aoAbrir={aoAbrir} />)
    const botao = screen.getByRole("button", { name: /Pastel de Carne/ })
    expect(botao).toHaveTextContent("Carne moída temperada da casa.")
    expect(botao).toHaveTextContent(/R\$\s9,00/)
    await userEvent.click(botao)
    expect(aoAbrir).toHaveBeenCalledWith(produto("Pastel de Carne"))
  })

  it("produto com tamanho pago obrigatório mostra 'A partir de'", () => {
    render(<ProdutoLinha produto={produto("Açaí Paçoca")} aoAbrir={() => {}} />)
    expect(screen.getByText("A partir de")).toBeInTheDocument()
  })

  it("esgotado aparece, mas não pode ser aberto", async () => {
    const aoAbrir = vi.fn()
    render(
      <ProdutoLinha produto={{ ...produto("X-Bacon"), disponivel: false }} aoAbrir={aoAbrir} />,
    )
    const botao = screen.getByRole("button", { name: /X-Bacon/ })
    expect(botao).toBeDisabled()
    expect(botao).toHaveTextContent("Esgotado")
    await userEvent.click(botao)
    expect(aoAbrir).not.toHaveBeenCalled()
  })

  it("somente consulta (cardápio digital) não vira botão", () => {
    render(<ProdutoLinha produto={produto("Pastel de Carne")} />)
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
    expect(screen.getByText("Pastel de Carne")).toBeInTheDocument()
  })
})
