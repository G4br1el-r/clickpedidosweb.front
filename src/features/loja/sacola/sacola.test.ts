import { beforeEach, describe, expect, it } from "vitest"
import { produtosIniciais } from "@/mock/cardapio/dados"
import { linhasDaSacola, resumoSacola, useSacola } from "./sacola"

const estado = () => useSacola.getState()

describe("sacola (porta de wwwroot/js/sacola.js)", () => {
  beforeEach(() => {
    estado().limpar()
  })

  it("adicionar soma itens iguais (mesmo produto, opções e observação)", () => {
    estado().adicionar({ produtoId: 1, quantidade: 1, observacao: " sem cebola " })
    estado().adicionar({ produtoId: 1, quantidade: 2, observacao: "sem cebola" })
    expect(estado().itens).toHaveLength(1)
    expect(estado().itens[0]).toMatchObject({ quantidade: 3, observacao: "sem cebola" })
  })

  it("opções diferentes viram itens separados", () => {
    estado().adicionar({
      produtoId: 21,
      quantidade: 1,
      opcoes: [{ grupoId: 1, itemId: 1, quantidade: 1 }],
    })
    estado().adicionar({
      produtoId: 21,
      quantidade: 1,
      opcoes: [{ grupoId: 1, itemId: 3, quantidade: 1 }],
    })
    expect(estado().itens).toHaveLength(2)
  })

  it("a soma para em 50 por item, como no backend", () => {
    estado().adicionar({ produtoId: 1, quantidade: 40 })
    estado().adicionar({ produtoId: 1, quantidade: 20 })
    expect(estado().itens[0]?.quantidade).toBe(50)
  })

  it("alterar para zero remove o item; remover devolve o item para desfazer", () => {
    estado().adicionar({ produtoId: 1, quantidade: 1 })
    const chave = estado().itens[0]?.chave ?? ""
    estado().alterarQuantidade(chave, 0)
    expect(estado().itens).toHaveLength(0)

    estado().adicionar({ produtoId: 2, quantidade: 2 })
    const removido = estado().remover(estado().itens[0]?.chave ?? "")
    expect(removido?.quantidade).toBe(2)
    if (removido) estado().restaurar(removido, 0)
    expect(estado().itens[0]?.produtoId).toBe(2)
  })

  it("persiste no navegador com a mesma chave do sistema atual", () => {
    estado().adicionar({ produtoId: 1, quantidade: 2 })
    expect(window.localStorage.getItem("cp_sacola_v1")).toContain('"produtoId":1')
  })
})

describe("linhasDaSacola e resumoSacola", () => {
  it("calcula preço com opções pelo cardápio atual e marca indisponíveis", () => {
    const itens = [
      {
        chave: "a",
        produtoId: 21,
        quantidade: 2,
        observacao: "",
        opcoes: [{ grupoId: 1, itemId: 3, quantidade: 1 }],
      },
      { chave: "b", produtoId: 999, quantidade: 1, observacao: "", opcoes: [] },
    ]
    const linhas = linhasDaSacola(itens, produtosIniciais)
    expect(linhas[0]).toMatchObject({
      nome: "Açaí Paçoca",
      precoUnitario: 22,
      total: 44,
      indisponivel: false,
    })
    expect(linhas[1]).toMatchObject({ indisponivel: true, total: 0 })
    expect(resumoSacola(linhas)).toEqual({ quantidade: 2, subtotal: 44, temIndisponivel: true })
  })
})
