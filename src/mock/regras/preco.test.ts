import { describe, expect, it } from "vitest"
import type { Produto, ProdutoOpcaoGrupo } from "@/types/entidades"
import { calcularItem, validarOpcoes } from "./preco"

function grupo(
  id: number,
  nome: string,
  regras: { minimo: number; maximo: number; gratisAte?: number },
  itens: Array<[id: number, nome: string, preco: number, ativo?: boolean]>,
): ProdutoOpcaoGrupo {
  return {
    id,
    produtoId: 1,
    nome,
    minimo: regras.minimo,
    maximo: regras.maximo,
    gratisAte: regras.gratisAte ?? 0,
    ordem: id,
    ativo: true,
    itens: itens.map(([itemId, itemNome, precoAdicional, ativo = true], i) => ({
      id: itemId,
      grupoId: id,
      nome: itemNome,
      precoAdicional,
      ordem: i,
      ativo,
    })),
  }
}

function produto(preco: number, gruposOpcoes: ProdutoOpcaoGrupo[] = []): Produto {
  return {
    id: 1,
    categoriaId: 1,
    nome: "Produto",
    descricao: null,
    preco,
    imagemUrl: null,
    ativo: true,
    disponivel: true,
    ordem: 1,
    gruposOpcoes,
  }
}

const tamanho = grupo(10, "Escolha o tamanho", { minimo: 1, maximo: 1 }, [
  [100, "300 ml", 0],
  [101, "500 ml", 4],
])
const adicionais = grupo(20, "Adicionais", { minimo: 0, maximo: 30 }, [
  [200, "Granola", 1],
  [201, "Banana", 1],
  [202, "Nutella", 2.5],
  [203, "Desativado", 9, false],
])
const gratis = grupo(30, "Adicionais Grátis (escolha até 2)", { minimo: 0, maximo: 2 }, [
  [300, "Leite condensado", 0],
  [301, "Leite em pó", 0],
  [302, "Granulado", 0],
])

describe("calcularItem", () => {
  it("sem opções, o preço é o do produto", () => {
    expect(calcularItem(produto(9), [])).toEqual({ precoUnitario: 9, resumo: null })
  })

  it("soma o adicional de cada unidade escolhida", () => {
    const r = calcularItem(produto(12, [adicionais]), [{ grupoId: 20, itemId: 202, quantidade: 2 }])
    expect(r.precoUnitario).toBe(17)
  })

  it("GratisAte cobra só o que passa do limite, a partir dos mais baratos", () => {
    const misto = grupo(40, "Mistos", { minimo: 0, maximo: 5, gratisAte: 2 }, [
      [400, "Coco", 1],
      [401, "Confete", 3.5],
      [402, "Creme de Ninho", 4.5],
    ])
    const r = calcularItem(produto(18, [misto]), [
      { grupoId: 40, itemId: 400, quantidade: 1 },
      { grupoId: 40, itemId: 401, quantidade: 1 },
      { grupoId: 40, itemId: 402, quantidade: 1 },
    ])
    expect(r.precoUnitario).toBe(22.5)
  })

  it("resumo segue o formato do backend", () => {
    const r = calcularItem(produto(15, [tamanho, adicionais]), [
      { grupoId: 10, itemId: 101, quantidade: 1 },
      { grupoId: 20, itemId: 200, quantidade: 2 },
      { grupoId: 20, itemId: 201, quantidade: 1 },
    ])
    expect(r).toEqual({
      precoUnitario: 22,
      resumo: "Escolha o tamanho: 500 ml | Adicionais: 2x Granola, Banana",
    })
  })

  it("item inativo é ignorado no preço e no resumo", () => {
    const r = calcularItem(produto(10, [adicionais]), [
      { grupoId: 20, itemId: 203, quantidade: 1 },
      { grupoId: 20, itemId: 200, quantidade: 1 },
    ])
    expect(r).toEqual({ precoUnitario: 11, resumo: "Adicionais: Granola" })
  })
})

describe("validarOpcoes", () => {
  it("dentro das regras devolve null", () => {
    expect(
      validarOpcoes(produto(15, [tamanho]), [{ grupoId: 10, itemId: 100, quantidade: 1 }]),
    ).toBeNull()
  })

  it("abaixo do mínimo devolve a mensagem do backend", () => {
    expect(validarOpcoes(produto(15, [tamanho]), [])).toBe(
      "Escolha ao menos 1 opção em 'Escolha o tamanho'.",
    )
  })

  it("acima do máximo devolve a mensagem do backend", () => {
    expect(
      validarOpcoes(produto(15, [gratis]), [
        { grupoId: 30, itemId: 300, quantidade: 1 },
        { grupoId: 30, itemId: 301, quantidade: 1 },
        { grupoId: 30, itemId: 302, quantidade: 1 },
      ]),
    ).toBe("Máximo de 2 opções permitidas em 'Adicionais Grátis (escolha até 2)'.")
  })

  it("quantidade zero não conta para o mínimo", () => {
    expect(
      validarOpcoes(produto(15, [tamanho]), [{ grupoId: 10, itemId: 100, quantidade: 0 }]),
    ).toBe("Escolha ao menos 1 opção em 'Escolha o tamanho'.")
  })
})
