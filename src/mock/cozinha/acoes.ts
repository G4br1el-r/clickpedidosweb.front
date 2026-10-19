import { banco, simularLatencia } from "@/mock/banco"
import { definirStatus, proximoStatus } from "@/mock/regras/status"
import type { Pedido, StatusPedido } from "@/types/entidades"

export const NA_COZINHA: StatusPedido[] = ["Recebido", "EmPreparo", "Pronto"]

type Resultado = { ok: true; status: StatusPedido } | { ok: false; erro: string }

// Replica GET /api/admin/cozinha
export async function obterCozinha(): Promise<{ pedidos: Pedido[] }> {
  await simularLatencia(60, 160)
  return {
    pedidos: banco
      .ler()
      .pedidos.filter((p) => NA_COZINHA.includes(p.status))
      .sort((a, b) => a.criadoEm.localeCompare(b.criadoEm)),
  }
}

// Replica POST /Admin/Cozinha/Status com a próxima etapa do pedido. Mesa servida sai da
// cozinha, mas a conta continua em aberto até o caixa fechar a mesa.
export async function avancarNaCozinha(id: number, agora: Date = new Date()): Promise<Resultado> {
  await simularLatencia(80, 200)
  let resultado: Resultado = { ok: false, erro: "Pedido não encontrado." }
  banco.atualizar((d) => {
    const p = d.pedidos.find((x) => x.id === id)
    if (!p) return
    const proximo = proximoStatus(p)
    if (!proximo) {
      resultado = { ok: false, erro: "Este pedido não tem próxima etapa." }
      return
    }
    if (p.tipo === "Mesa") {
      p.status = proximo
      p.atualizadoEm = agora.toISOString()
    } else {
      definirStatus(p, proximo, agora)
    }
    resultado = { ok: true, status: p.status }
  })
  return resultado
}
