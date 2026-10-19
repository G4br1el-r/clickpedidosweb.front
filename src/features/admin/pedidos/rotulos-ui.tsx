import { BikeIcon, ShoppingBagIcon, UtensilsCrossedIcon } from "lucide-react"
import { formatarMoeda } from "@/lib/moeda"
import { rotuloPagamento } from "@/mock/regras/rotulos"
import type { Pedido, TipoEntrega } from "@/types/entidades"

export const iconeTipo: Record<TipoEntrega, typeof BikeIcon> = {
  Entrega: BikeIcon,
  Retirada: ShoppingBagIcon,
  Mesa: UtensilsCrossedIcon,
}

/** "Mesa 4 · Lucas", "Entrega · Centro", "Retirada". */
export function origemDoPedido(p: Pedido): string {
  if (p.tipo === "Mesa") {
    const mesa = `Mesa ${p.mesaNumero ?? p.mesaId ?? ""}`.trim()
    return p.garcomNome ? `${mesa} · ${p.garcomNome}` : mesa
  }
  if (p.tipo === "Entrega") return p.bairro ? `Entrega · ${p.bairro}` : "Entrega"
  return "Retirada"
}

export function resumoPagamento(p: Pedido): string {
  const forma = rotuloPagamento(p.pagamento)
  if (p.statusPagamento === "Pago") return `${forma} · pago`
  if (p.statusPagamento === "Cancelado") return `${forma} · cancelado`
  if (p.statusPagamento === "Pendente") return `${forma} · aguardando`
  return `${forma} · a cobrar`
}

export function textoTroco(p: Pedido): string | null {
  if (p.pagamento !== "Dinheiro" || !p.trocoPara || p.trocoPara <= p.total) return null
  return `Troco para ${formatarMoeda(p.trocoPara)} (levar ${formatarMoeda(p.trocoPara - p.total)})`
}
