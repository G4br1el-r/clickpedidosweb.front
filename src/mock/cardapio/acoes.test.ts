import { describe, expect, it } from "vitest"
import { banco } from "@/mock/banco"
import { obterCardapio } from "./acoes"

describe("obterCardapio", () => {
  it("devolve as categorias com seus produtos ativos e os dados da loja", async () => {
    const cardapio = await obterCardapio()
    expect(cardapio.categorias.map((c) => c.nome)).toEqual([
      "Pastéis",
      "Lanches",
      "Açaí",
      "Porções",
      "Bebidas",
      "Combos",
      "Açaí Gourmet",
    ])
    expect(cardapio.categorias[0]?.produtos[0]?.nome).toBe("Pastel de Carne")
    expect(cardapio.loja).toMatchObject({ nomeLoja: "Quiosque do Mineiro", lojaAberta: true })
  })

  it("categoria sem produto ativo não aparece", async () => {
    banco.atualizar((d) => {
      const bebidas = d.categorias.find((c) => c.nome === "Bebidas")
      for (const p of d.produtos) if (p.categoriaId === bebidas?.id) p.ativo = false
    })
    const cardapio = await obterCardapio()
    expect(cardapio.categorias.map((c) => c.nome)).not.toContain("Bebidas")
  })

  it("categoria inativa não aparece", async () => {
    banco.atualizar((d) => {
      const lanches = d.categorias.find((c) => c.nome === "Lanches")
      if (lanches) lanches.ativa = false
    })
    expect((await obterCardapio()).categorias.map((c) => c.nome)).not.toContain("Lanches")
  })

  it("produto esgotado aparece com disponivel false", async () => {
    banco.atualizar((d) => {
      const p = d.produtos.find((x) => x.nome === "X-Bacon")
      if (p) p.disponivel = false
    })
    const lanches = (await obterCardapio()).categorias.find((c) => c.nome === "Lanches")
    expect(lanches?.produtos.find((p) => p.nome === "X-Bacon")?.disponivel).toBe(false)
  })

  it("produto inativo não aparece", async () => {
    banco.atualizar((d) => {
      const p = d.produtos.find((x) => x.nome === "X-Bacon")
      if (p) p.ativo = false
    })
    const lanches = (await obterCardapio()).categorias.find((c) => c.nome === "Lanches")
    expect(lanches?.produtos.map((p) => p.nome)).not.toContain("X-Bacon")
  })

  it("grupos e itens inativos ficam de fora", async () => {
    banco.atualizar((d) => {
      const p = d.produtos.find((x) => x.nome === "Açaí Paçoca")
      const grupo = p?.gruposOpcoes[1]
      if (grupo) grupo.ativo = false
      const item = p?.gruposOpcoes[0]?.itens[0]
      if (item) item.ativo = false
    })
    const gourmet = (await obterCardapio()).categorias.find((c) => c.nome === "Açaí Gourmet")
    const pacoca = gourmet?.produtos.find((p) => p.nome === "Açaí Paçoca")
    expect(pacoca?.gruposOpcoes).toHaveLength(1)
    expect(pacoca?.gruposOpcoes[0]?.itens).toHaveLength(4)
  })
})
