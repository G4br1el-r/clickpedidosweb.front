import { diaLocal } from "@/lib/datas"
import { banco, simularLatencia } from "@/mock/banco"
import { arredondar } from "@/mock/regras/preco"
import type { Pedido } from "@/types/entidades"

export interface Dashboard {
  pedidos: number
  faturamento: number
  ticketMedio: number
  emAndamento: number
  aguardandoPagamento: number
  cancelados: number
  topProdutos: Array<{ nome: string; quantidade: number; total: number }>
  ultimos: Pedido[]
}

// Replica DashboardController.Index (visão do dia)
export async function obterDashboard(agora: Date = new Date()): Promise<Dashboard> {
  await simularLatencia()
  const hoje = diaLocal(agora)
  const doDia = banco.ler().pedidos.filter((p) => diaLocal(p.criadoEm) === hoje)
  const validos = doDia.filter(
    (p) => p.status !== "Cancelado" && p.status !== "AguardandoPagamento",
  )
  const faturamento = arredondar(validos.reduce((s, p) => s + p.total, 0))

  const porProduto = new Map<string, { nome: string; quantidade: number; total: number }>()
  for (const i of validos.flatMap((p) => p.itens)) {
    const atual = porProduto.get(i.nomeProduto) ?? { nome: i.nomeProduto, quantidade: 0, total: 0 }
    atual.quantidade += i.quantidade
    atual.total = arredondar(atual.total + i.total)
    porProduto.set(i.nomeProduto, atual)
  }

  return {
    pedidos: validos.length,
    faturamento,
    ticketMedio: validos.length > 0 ? arredondar(faturamento / validos.length) : 0,
    emAndamento: validos.filter((p) => p.status !== "Concluido").length,
    aguardandoPagamento: doDia.filter((p) => p.status === "AguardandoPagamento").length,
    cancelados: doDia.filter((p) => p.status === "Cancelado").length,
    topProdutos: [...porProduto.values()].sort((a, b) => b.quantidade - a.quantidade).slice(0, 5),
    ultimos: [...doDia].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)).slice(0, 8),
  }
}
