import { describe, expect, it } from "vitest"
import { produtosIniciais } from "@/mock/cardapio/dados"
import { pedidosDeExemplo } from "./exemplos"

const agora = new Date("2026-10-18T19:00:00Z")

describe("pedidosDeExemplo", () => {
  const pedidos = pedidosDeExemplo(produtosIniciais, agora)

  it("cobre todas as colunas da fila e da cozinha", () => {
    const status = new Set(pedidos.map((p) => p.status))
    for (const s of [
      "AguardandoPagamento",
      "Recebido",
      "EmPreparo",
      "Pronto",
      "SaiuParaEntrega",
      "Concluido",
    ])
      expect(status.has(s as never)).toBe(true)
  })

  it("tem pedido de entrega, retirada e mesa", () => {
    const tipos = new Set(pedidos.map((p) => p.tipo))
    expect([...tipos].sort()).toEqual(["Entrega", "Mesa", "Retirada"])
  })

  it("o total de cada pedido é a soma dos itens mais a taxa", () => {
    for (const p of pedidos) {
      const soma = p.itens.reduce((s, i) => s + i.total, 0)
      expect(p.subtotal).toBeCloseTo(soma, 2)
      expect(p.total).toBeCloseTo(p.subtotal + p.taxaEntrega, 2)
    }
  })

  it("ids e tokens são únicos e todos foram criados antes de agora", () => {
    expect(new Set(pedidos.map((p) => p.id)).size).toBe(pedidos.length)
    expect(new Set(pedidos.map((p) => p.token)).size).toBe(pedidos.length)
    expect(pedidos.every((p) => new Date(p.criadoEm) <= agora)).toBe(true)
  })

  it("entrega tem endereço e retirada não", () => {
    for (const p of pedidos) {
      if (p.tipo === "Entrega") expect(p.logradouro && p.bairro).toBeTruthy()
      if (p.tipo === "Retirada") expect(p.logradouro).toBeNull()
    }
  })
})

describe("pedidosDeExemplo logo depois da meia-noite", () => {
  it("todos os pedidos ficam no mesmo dia local, mantendo a ordem", async () => {
    const { diaLocal } = await import("@/lib/datas")
    const madrugada = new Date("2026-10-19T03:10:00Z") // 00:10 em Brasília
    const pedidos = pedidosDeExemplo(produtosIniciais, madrugada)
    expect(new Set(pedidos.map((p) => diaLocal(p.criadoEm)))).toEqual(new Set(["2026-10-19"]))
    const porId = (id: number) => pedidos.find((p) => p.id === id)?.criadoEm ?? ""
    expect(porId(10) < porId(8)).toBe(true)
    expect(porId(8) < porId(1)).toBe(true)
  })
})
