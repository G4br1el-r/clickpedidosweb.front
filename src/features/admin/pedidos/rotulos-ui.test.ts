import { describe, expect, it } from "vitest"
import type { Pedido } from "@/types/entidades"
import { origemDoPedido, resumoPagamento, textoTroco } from "./rotulos-ui"

const pedido = (campos: Partial<Pedido>) =>
  ({
    tipo: "Retirada",
    mesaNumero: null,
    mesaId: null,
    garcomNome: null,
    bairro: null,
    pagamento: "Dinheiro",
    statusPagamento: "NaEntrega",
    trocoPara: null,
    total: 30,
    ...campos,
  }) as Pedido

describe("origemDoPedido", () => {
  it.each([
    [{ tipo: "Mesa", mesaNumero: 4, garcomNome: "Lucas" }, "Mesa 4 · Lucas"],
    [{ tipo: "Mesa", mesaId: 7 }, "Mesa 7"],
    [{ tipo: "Entrega", bairro: "Centro" }, "Entrega · Centro"],
    [{ tipo: "Entrega" }, "Entrega"],
    [{ tipo: "Retirada" }, "Retirada"],
  ] as const)("%o → %s", (campos, esperado) => {
    expect(origemDoPedido(pedido(campos))).toBe(esperado)
  })
})

describe("resumoPagamento", () => {
  it.each([
    ["Pago", "Pix · pago"],
    ["Pendente", "Pix · aguardando"],
    ["Cancelado", "Pix · cancelado"],
    ["NaEntrega", "Pix · a cobrar"],
  ] as const)("%s → %s", (statusPagamento, esperado) => {
    expect(resumoPagamento(pedido({ pagamento: "Pix", statusPagamento }))).toBe(esperado)
  })
})

describe("textoTroco", () => {
  it("só aparece em dinheiro com troco maior que o total", () => {
    expect(textoTroco(pedido({ trocoPara: 50 }))).toMatch(
      /Troco para R\$\s50,00 \(levar R\$\s20,00\)/,
    )
    expect(textoTroco(pedido({ trocoPara: 30 }))).toBeNull()
    expect(textoTroco(pedido({ pagamento: "Pix", trocoPara: 50 }))).toBeNull()
    expect(textoTroco(pedido({}))).toBeNull()
  })
})
