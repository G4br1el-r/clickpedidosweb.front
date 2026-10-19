import type { Pedido, StatusPedido } from "@/types/entidades"

// Porta das regras de status de Services/PedidoService.cs (fila, admin e webhook).

export function proximoStatus(p: Pick<Pedido, "status" | "tipo">): StatusPedido | null {
  switch (p.status) {
    case "Recebido":
      return "EmPreparo"
    case "EmPreparo":
      return "Pronto"
    case "Pronto":
      return p.tipo === "Entrega" ? "SaiuParaEntrega" : "Concluido"
    case "SaiuParaEntrega":
      return "Concluido"
    default:
      return null
  }
}

export function definirStatus(p: Pedido, status: StatusPedido, agora: Date = new Date()) {
  p.status = status
  p.atualizadoEm = agora.toISOString()
  if (status === "Concluido" && p.statusPagamento === "NaEntrega") {
    p.statusPagamento = "Pago"
    p.pagoEm = agora.toISOString()
  }
}

export function avancar(p: Pedido, agora: Date = new Date()): boolean {
  const proximo = proximoStatus(p)
  if (!proximo) return false
  definirStatus(p, proximo, agora)
  return true
}

export function cancelar(p: Pedido, agora: Date = new Date()) {
  p.status = "Cancelado"
  if (p.statusPagamento === "Pendente" || p.statusPagamento === "NaEntrega")
    p.statusPagamento = "Cancelado"
  p.atualizadoEm = agora.toISOString()
}

/** Pagamento online confirmado: o pedido entra na fila. */
export function confirmarPagamento(p: Pedido, agora: Date = new Date()) {
  if (p.statusPagamento === "Pago") return
  p.statusPagamento = "Pago"
  p.pagoEm = agora.toISOString()
  // Também reabre pedido cancelado por expiração que foi pago depois.
  if (p.status === "AguardandoPagamento" || p.status === "Cancelado") p.status = "Recebido"
  p.atualizadoEm = agora.toISOString()
}
