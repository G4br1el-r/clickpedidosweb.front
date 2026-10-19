import { describe, expect, it } from "vitest"
import { dadosIniciais } from "./dados-iniciais"

describe("dadosIniciais", () => {
  const dados = dadosIniciais()

  it("começa com 10 mesas, como o Seed.cs, e a mesa 4 ocupada pelo pedido dela", () => {
    expect(dados.mesas.map((m) => m.nome)).toEqual(
      Array.from({ length: 10 }, (_, i) => `Mesa ${String(i + 1).padStart(2, "0")}`),
    )
    const mesa4 = dados.mesas.find((m) => m.numero === 4)
    const pedidoMesa = dados.pedidos.find((p) => p.mesaNumero === 4)
    expect(mesa4?.status).toBe("Ocupada")
    expect(mesa4?.pedidoAtivoId).toBe(pedidoMesa?.id)
  })

  it("tem o usuário admin de teste e motoboys ativos", () => {
    expect(dados.usuarios).toEqual([
      { id: 1, login: "admin", nome: "Administrador", senha: "clickpedido" },
    ])
    expect(dados.motoboys.filter((m) => m.ativo).length).toBeGreaterThanOrEqual(2)
  })

  it("os próximos ids ficam acima de todos os ids já usados", () => {
    expect(dados.proximosIds.pedido).toBeGreaterThan(Math.max(...dados.pedidos.map((p) => p.id)))
    expect(dados.proximosIds.mesa).toBe(11)
    expect(dados.proximosIds.pedidoItem).toBeGreaterThan(
      Math.max(...dados.pedidos.flatMap((p) => p.itens.map((i) => i.id))),
    )
  })
})
