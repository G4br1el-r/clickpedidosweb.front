import { describe, expect, it } from "vitest"
import type { Pedido } from "@/types/entidades"
import { avancar, cancelar, confirmarPagamento, definirStatus, proximoStatus } from "./status"

const agora = new Date("2026-10-18T20:00:00Z")

function pedido(campos: Partial<Pedido>): Pedido {
  return {
    status: "Recebido",
    tipo: "Entrega",
    statusPagamento: "NaEntrega",
    pagoEm: null,
    atualizadoEm: "2026-10-18T19:00:00Z",
    ...campos,
  } as Pedido
}

describe("proximoStatus (PedidoService.Proximo)", () => {
  it.each([
    ["Recebido", "Entrega", "EmPreparo"],
    ["EmPreparo", "Mesa", "Pronto"],
    ["Pronto", "Entrega", "SaiuParaEntrega"],
    ["Pronto", "Retirada", "Concluido"],
    ["Pronto", "Mesa", "Concluido"],
    ["SaiuParaEntrega", "Entrega", "Concluido"],
    ["Concluido", "Entrega", null],
    ["AguardandoPagamento", "Entrega", null],
  ] as const)("%s (%s) → %s", (status, tipo, esperado) => {
    expect(proximoStatus(pedido({ status, tipo }))).toBe(esperado)
  })
})

describe("avancar e definirStatus", () => {
  it("avancar muda o status e a hora de atualização", () => {
    const p = pedido({ status: "Recebido" })
    expect(avancar(p, agora)).toBe(true)
    expect(p.status).toBe("EmPreparo")
    expect(p.atualizadoEm).toBe(agora.toISOString())
  })

  it("concluir pedido pago na entrega marca como pago", () => {
    const p = pedido({ status: "SaiuParaEntrega", statusPagamento: "NaEntrega" })
    definirStatus(p, "Concluido", agora)
    expect(p.statusPagamento).toBe("Pago")
    expect(p.pagoEm).toBe(agora.toISOString())
  })

  it("avancar sem próxima etapa não muda nada", () => {
    const p = pedido({ status: "Cancelado" })
    expect(avancar(p, agora)).toBe(false)
    expect(p.status).toBe("Cancelado")
  })
})

describe("cancelar (PedidoService.Cancelar)", () => {
  it("cancela e cancela o pagamento pendente ou a cobrar", () => {
    const p = pedido({ statusPagamento: "Pendente" })
    cancelar(p, agora)
    expect(p.status).toBe("Cancelado")
    expect(p.statusPagamento).toBe("Cancelado")
  })

  it("pagamento já pago continua pago (estorno é outro fluxo)", () => {
    const p = pedido({ statusPagamento: "Pago" })
    cancelar(p, agora)
    expect(p.statusPagamento).toBe("Pago")
  })
})

describe("confirmarPagamento (PedidoService.ConfirmarPagamento)", () => {
  it("pedido aguardando pagamento entra na fila como recebido", () => {
    const p = pedido({ status: "AguardandoPagamento", statusPagamento: "Pendente" })
    confirmarPagamento(p, agora)
    expect(p.status).toBe("Recebido")
    expect(p.statusPagamento).toBe("Pago")
  })

  it("reabre pedido cancelado por expiração que foi pago depois", () => {
    const p = pedido({ status: "Cancelado", statusPagamento: "Cancelado" })
    confirmarPagamento(p, agora)
    expect(p.status).toBe("Recebido")
  })

  it("já pago não muda nada", () => {
    const p = pedido({ status: "EmPreparo", statusPagamento: "Pago", pagoEm: "x" })
    confirmarPagamento(p, agora)
    expect(p.status).toBe("EmPreparo")
    expect(p.pagoEm).toBe("x")
  })
})
