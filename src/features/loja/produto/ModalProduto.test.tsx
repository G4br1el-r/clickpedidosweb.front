import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { produtosIniciais } from "@/mock/cardapio/dados"
import type { Produto } from "@/types/entidades"
import { ModalProduto } from "./ModalProduto"

const produto = (nome: string): Produto => {
  const p = produtosIniciais.find((x) => x.nome === nome)
  if (!p) throw new Error(nome)
  return p
}

function abrir(p: Produto, aoAdicionar = vi.fn()) {
  render(<ModalProduto produto={p} aberto aoFechar={() => {}} aoAdicionar={aoAdicionar} />)
  return aoAdicionar
}

const botaoAdicionar = () => screen.getByRole("button", { name: /^Adicionar ·/ })

describe("ModalProduto", () => {
  it("produto simples: adiciona com quantidade e observação", async () => {
    const aoAdicionar = abrir(produto("Pastel de Carne"))
    expect(screen.getByRole("heading", { name: "Pastel de Carne" })).toBeInTheDocument()
    await userEvent.click(
      screen.getByRole("button", { name: "Aumentar quantidade de Pastel de Carne" }),
    )
    await userEvent.type(screen.getByLabelText(/Alguma observação/), "Sem cebola")
    expect(botaoAdicionar()).toHaveTextContent(/R\$\s18,00/)
    await userEvent.click(botaoAdicionar())
    expect(aoAdicionar).toHaveBeenCalledWith({
      produtoId: 1,
      quantidade: 2,
      observacao: "Sem cebola",
      opcoes: [],
    })
  })

  it("grupo de escolha única obrigatório já vem com a primeira opção marcada", () => {
    abrir(produto("Açaí Paçoca"))
    const tamanho = screen.getByRole("radiogroup", { name: /Escolha o tamanho/ })
    expect(within(tamanho).getByRole("radio", { name: /300 ml/ })).toBeChecked()
    expect(botaoAdicionar()).toHaveTextContent(/R\$\s18,00/)
  })

  it("trocar o tamanho e somar adicionais atualiza o preço", async () => {
    const aoAdicionar = abrir(produto("Açaí Paçoca"))
    await userEvent.click(screen.getByRole("radio", { name: /500 ml/ }))
    await userEvent.click(screen.getByRole("button", { name: "Adicionar Coco Ralado" }))
    await userEvent.click(screen.getByRole("button", { name: "Adicionar Coco Ralado" }))
    expect(botaoAdicionar()).toHaveTextContent(/R\$\s24,00/)
    await userEvent.click(botaoAdicionar())
    expect(aoAdicionar).toHaveBeenCalledWith(
      expect.objectContaining({
        opcoes: [
          { grupoId: 1, itemId: 3, quantidade: 1 },
          { grupoId: 2, itemId: 6, quantidade: 2 },
        ],
      }),
    )
  })

  it("o limite do grupo bloqueia o + quando atingido", async () => {
    const p = produto("Açaí Paçoca")
    const comLimite: Produto = {
      ...p,
      gruposOpcoes: p.gruposOpcoes.map((g) => (g.minimo === 0 ? { ...g, maximo: 1 + 1 } : g)),
    }
    abrir(comLimite)
    await userEvent.click(screen.getByRole("button", { name: "Adicionar Coco Ralado" }))
    await userEvent.click(screen.getByRole("button", { name: "Adicionar Granulado" }))
    expect(screen.getByRole("button", { name: "Adicionar Sucrilhos" })).toBeDisabled()
    expect(screen.getByText("Até 2 · 2 escolhidos")).toBeInTheDocument()
  })

  it("grupo obrigatório sem escolha impede adicionar e explica o que falta", () => {
    const p = produto("Calabresa Acebolada")
    const semPadrao: Produto = {
      ...p,
      gruposOpcoes: p.gruposOpcoes.map((g) => ({ ...g, maximo: 1 + 1 })),
    }
    abrir(semPadrao)
    expect(botaoAdicionar()).toBeDisabled()
    expect(screen.getByText("Escolha ao menos 1 opção em 'Tamanho da Porção'.")).toBeInTheDocument()
  })
})
