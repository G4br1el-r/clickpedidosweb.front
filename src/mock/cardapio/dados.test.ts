import { describe, expect, it } from "vitest"
import { bairrosIniciais, categoriasIniciais, produtosIniciais } from "./dados"
import { creditosFotos } from "./fotos"

describe("dados iniciais do cardápio (snapshot da loja real)", () => {
  it("traz as 7 categorias na ordem da loja", () => {
    expect(categoriasIniciais.map((c) => c.nome)).toEqual([
      "Pastéis",
      "Lanches",
      "Açaí",
      "Porções",
      "Bebidas",
      "Combos",
      "Açaí Gourmet",
    ])
  })

  it("traz os 42 produtos, todos ativos e ligados a uma categoria existente", () => {
    expect(produtosIniciais).toHaveLength(42)
    const ids = new Set(categoriasIniciais.map((c) => c.id))
    expect(produtosIniciais.every((p) => p.ativo && ids.has(p.categoriaId))).toBe(true)
  })

  it("Pastel de Carne custa 9", () => {
    expect(produtosIniciais.find((p) => p.nome === "Pastel de Carne")?.preco).toBe(9)
  })

  it("Açaí Paçoca tem tamanho (1 a 1, 5 itens) e adicionais pagos (0 a 30, 21 itens)", () => {
    const grupos = produtosIniciais.find((p) => p.nome === "Açaí Paçoca")?.gruposOpcoes ?? []
    expect(
      grupos.map((g) => ({
        nome: g.nome,
        minimo: g.minimo,
        maximo: g.maximo,
        itens: g.itens.length,
        produtoId: g.produtoId,
      })),
    ).toEqual([
      { nome: "Escolha o tamanho", minimo: 1, maximo: 1, itens: 5, produtoId: 21 },
      { nome: "Adicionais (todos pagos)", minimo: 0, maximo: 30, itens: 21, produtoId: 21 },
    ])
  })

  it("traz os 28 bairros, todos com cidade e taxa", () => {
    expect(bairrosIniciais).toHaveLength(28)
    expect(bairrosIniciais.every((b) => b.cidade && b.taxa > 0)).toBe(true)
    expect(bairrosIniciais.find((b) => b.nome === "Embaú")?.taxa).toBe(15)
  })

  it("todo produto com foto usa o Unsplash e tem crédito", () => {
    const comFoto = produtosIniciais.filter((p) => p.imagemUrl)
    expect(comFoto.length).toBeGreaterThanOrEqual(12)
    for (const p of comFoto) {
      expect(p.imagemUrl).toMatch(/^https:\/\/images\.unsplash\.com\//)
      expect(creditosFotos[p.id]?.autor).toBeTruthy()
    }
  })

  it("toda categoria tem pelo menos um produto com foto", () => {
    for (const c of categoriasIniciais) {
      expect(produtosIniciais.some((p) => p.categoriaId === c.id && p.imagemUrl)).toBe(true)
    }
  })
})
