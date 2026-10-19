import { describe, expect, it } from "vitest"
import type { StatusPedido, TipoEntrega } from "@/types/entidades"
import {
  rotuloAcao,
  rotuloPagamento,
  rotuloSituacaoPagamento,
  rotuloStatus,
  rotuloTipo,
} from "./rotulos"

describe("rotuloStatus (Rotulos.Status)", () => {
  it.each<[StatusPedido, TipoEntrega, string]>([
    ["AguardandoPagamento", "Entrega", "Aguardando pagamento"],
    ["Recebido", "Entrega", "Pedido recebido"],
    ["EmPreparo", "Mesa", "Em preparo"],
    ["Pronto", "Retirada", "Pronto para retirada"],
    ["Pronto", "Mesa", "Pronto para servir"],
    ["Pronto", "Entrega", "Pronto"],
    ["SaiuParaEntrega", "Entrega", "Saiu para entrega"],
    ["Concluido", "Retirada", "Retirado"],
    ["Concluido", "Mesa", "Servido / Finalizado"],
    ["Concluido", "Entrega", "Entregue"],
    ["Cancelado", "Entrega", "Cancelado"],
  ])("%s + %s → %s", (status, tipo, esperado) => {
    expect(rotuloStatus(status, tipo)).toBe(esperado)
  })
})

describe("rotuloAcao (Rotulos.Acao)", () => {
  it.each<[StatusPedido, TipoEntrega, string]>([
    ["Recebido", "Entrega", "Iniciar preparo"],
    ["EmPreparo", "Retirada", "Marcar como pronto"],
    ["Pronto", "Mesa", "Servir na mesa"],
    ["Pronto", "Entrega", "Saiu para entrega"],
    ["Pronto", "Retirada", "Cliente retirou"],
    ["SaiuParaEntrega", "Entrega", "Confirmar entrega"],
    ["Concluido", "Entrega", ""],
    ["AguardandoPagamento", "Entrega", ""],
  ])("%s + %s → %s", (status, tipo, esperado) => {
    expect(rotuloAcao(status, tipo)).toBe(esperado)
  })
})

describe("rótulos de pagamento e tipo", () => {
  it("formas de pagamento", () => {
    expect(rotuloPagamento("Pix")).toBe("Pix")
    expect(rotuloPagamento("CartaoOnline")).toBe("Cartão online")
    expect(rotuloPagamento("Dinheiro")).toBe("Dinheiro")
    expect(rotuloPagamento("CartaoNaEntrega")).toBe("Cartão na maquininha")
  })

  it("situação do pagamento", () => {
    expect(rotuloSituacaoPagamento("Pendente")).toBe("Aguardando")
    expect(rotuloSituacaoPagamento("Pago")).toBe("Pago")
    expect(rotuloSituacaoPagamento("NaEntrega")).toBe("A cobrar")
    expect(rotuloSituacaoPagamento("Cancelado")).toBe("Cancelado")
  })

  it("tipo de entrega", () => {
    expect(rotuloTipo("Entrega")).toBe("Entrega")
    expect(rotuloTipo("Retirada")).toBe("Retirada")
    expect(rotuloTipo("Mesa")).toBe("Mesa")
  })
})
