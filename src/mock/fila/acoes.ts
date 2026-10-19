import { diaLocal } from "@/lib/datas"
import { banco, simularLatencia } from "@/mock/banco"
import { expirarPagamentosPendentes } from "@/mock/regras/expiracao"
import { lojaEstaAberta } from "@/mock/regras/loja"
import { paraMotoboy } from "@/mock/regras/mensagens"
import { avancar, cancelar } from "@/mock/regras/status"
import { linkWhatsApp } from "@/mock/regras/texto"
import type { Motoboy, Pedido, StatusPedido } from "@/types/entidades"

export const EM_ANDAMENTO: StatusPedido[] = ["Recebido", "EmPreparo", "Pronto", "SaiuParaEntrega"]

export interface Fila {
  lojaAberta: boolean
  concluidosHoje: number
  aguardandoPagamento: number
  motoboys: Pick<Motoboy, "id" | "nome">[]
  pedidos: Pedido[]
}

type Resultado<T> = ({ ok: true } & T) | { ok: false; erro: string }

// Replica GET /api/admin/fila
export async function obterFila(agora: Date = new Date()): Promise<Fila> {
  await simularLatencia(80, 200)
  // A expiração de pagamento roda em segundo plano no backend; aqui, a cada leitura da fila.
  const dados = banco.ler().pedidos.some((p) => p.status === "AguardandoPagamento")
    ? banco.atualizar((d) => void expirarPagamentosPendentes(d, agora))
    : banco.ler()
  const hoje = diaLocal(agora)
  return {
    lojaAberta: lojaEstaAberta(dados.loja, dados.horarios, agora),
    concluidosHoje: dados.pedidos.filter(
      (p) => p.status === "Concluido" && diaLocal(p.criadoEm) === hoje,
    ).length,
    aguardandoPagamento: dados.pedidos.filter((p) => p.status === "AguardandoPagamento").length,
    motoboys: dados.motoboys
      .filter((m) => m.ativo)
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
      .map((m) => ({ id: m.id, nome: m.nome })),
    pedidos: dados.pedidos
      .filter((p) => EM_ANDAMENTO.includes(p.status))
      .sort((a, b) => a.criadoEm.localeCompare(b.criadoEm)),
  }
}

function alterarPedido<T>(id: number, acao: (p: Pedido) => Resultado<T>): Resultado<T> {
  let resultado: Resultado<T> = { ok: false, erro: "Pedido não encontrado." }
  banco.atualizar((d) => {
    const p = d.pedidos.find((x) => x.id === id)
    if (p) resultado = acao(p)
  })
  return resultado
}

// Replica POST /api/admin/pedidos/{id}/avancar
export async function avancarPedido(id: number): Promise<Resultado<{ status: StatusPedido }>> {
  await simularLatencia(120, 300)
  return alterarPedido(id, (p) =>
    avancar(p)
      ? { ok: true, status: p.status }
      : { ok: false, erro: "Este pedido não tem próxima etapa." },
  )
}

// Replica POST /api/admin/pedidos/{id}/cancelar
export async function cancelarPedido(id: number): Promise<Resultado<{ status: StatusPedido }>> {
  await simularLatencia(120, 300)
  return alterarPedido(id, (p) => {
    cancelar(p)
    return { ok: true, status: p.status }
  })
}

// Replica POST /api/admin/pedidos/{id}/motoboy
export async function definirMotoboy(
  id: number,
  motoboyId: number,
): Promise<Resultado<{ whatsappUrl: string }>> {
  await simularLatencia(120, 300)
  let resultado: Resultado<{ whatsappUrl: string }> = { ok: false, erro: "Pedido não encontrado." }
  banco.atualizar((d) => {
    const p = d.pedidos.find((x) => x.id === id)
    if (!p) return
    if (p.tipo !== "Entrega") {
      resultado = { ok: false, erro: "Pedido de retirada não precisa de motoboy." }
      return
    }
    const motoboy = d.motoboys.find((m) => m.id === motoboyId)
    if (!motoboy?.ativo) {
      resultado = { ok: false, erro: "Escolha um motoboy ativo." }
      return
    }
    p.motoboyId = motoboy.id
    p.atualizadoEm = new Date().toISOString()
    resultado = { ok: true, whatsappUrl: linkWhatsApp(motoboy.telefone, paraMotoboy(p, d.loja)) }
  })
  return resultado
}

// Replica POST /api/admin/loja
export async function abrirFecharLoja(aberta: boolean): Promise<{ lojaAberta: boolean }> {
  await simularLatencia(120, 300)
  const d = banco.atualizar((dados) => {
    dados.loja.lojaAberta = aberta
  })
  return { lojaAberta: d.loja.lojaAberta }
}
