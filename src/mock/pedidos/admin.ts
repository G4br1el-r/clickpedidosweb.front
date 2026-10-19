import { diaLocal } from "@/lib/datas"
import { banco, simularLatencia } from "@/mock/banco"
import { paraCliente } from "@/mock/regras/mensagens"
import { rotuloStatus } from "@/mock/regras/rotulos"
import { cancelar, confirmarPagamento, definirStatus } from "@/mock/regras/status"
import { linkWhatsApp } from "@/mock/regras/texto"
import type { ConfiguracaoLoja, Motoboy, Pedido, StatusPedido } from "@/types/entidades"

type Mensagem = { ok: true; mensagem: string } | { ok: false; erro: string }

// Replica PedidosController.Index (pedidos do dia, com filtro de status)
export async function listarPedidos(filtro: {
  data?: string
  status?: StatusPedido
}): Promise<Pedido[]> {
  await simularLatencia()
  const dia = filtro.data ?? diaLocal(new Date())
  return banco
    .ler()
    .pedidos.filter(
      (p) => diaLocal(p.criadoEm) === dia && (!filtro.status || p.status === filtro.status),
    )
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
}

export interface PedidoAdmin {
  pedido: Pedido
  motoboy: Motoboy | null
  motoboys: Motoboy[]
  whatsappCliente: string
  loja: ConfiguracaoLoja
}

// Replica PedidosController.Detalhes
export async function obterPedidoAdmin(
  id: number,
  origem = window.location.origin,
): Promise<PedidoAdmin | null> {
  await simularLatencia()
  const d = banco.ler()
  const pedido = d.pedidos.find((p) => p.id === id)
  if (!pedido) return null
  return {
    pedido,
    motoboy: d.motoboys.find((m) => m.id === pedido.motoboyId) ?? null,
    motoboys: d.motoboys
      .filter((m) => m.ativo)
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
    whatsappCliente: linkWhatsApp(
      pedido.clienteTelefone,
      paraCliente(pedido, d.loja, `${origem}/pedido/${pedido.token}`),
    ),
    loja: d.loja,
  }
}

function alterar(id: number, acao: (p: Pedido) => void): Mensagem {
  let resultado: Mensagem = { ok: false, erro: "Pedido não encontrado." }
  banco.atualizar((d) => {
    const p = d.pedidos.find((x) => x.id === id)
    if (!p) return
    acao(p)
    resultado = { ok: true, mensagem: `Pedido #${id}: ${rotuloStatus(p.status, p.tipo)}.` }
  })
  return resultado
}

// Replica POST /Admin/Pedidos/Status
export async function mudarStatus(id: number, status: StatusPedido): Promise<Mensagem> {
  await simularLatencia(120, 300)
  return alterar(id, (p) => (status === "Cancelado" ? cancelar(p) : definirStatus(p, status)))
}

// Replica POST /Admin/Pedidos/MarcarPago
export async function marcarPago(id: number): Promise<Mensagem> {
  await simularLatencia(120, 300)
  return alterar(id, (p) => confirmarPagamento(p))
}

// Replica GET /Admin/Pedidos/Imprimir (marca o pedido como impresso)
export async function marcarImpresso(id: number): Promise<void> {
  banco.atualizar((d) => {
    const p = d.pedidos.find((x) => x.id === id)
    if (p) p.impressoEm ??= new Date().toISOString()
  })
}

/** Pedido + loja para o cupom (sem latência: a impressão automática não pode esperar). */
export function lerParaCupom(
  id: number,
): { pedido: Pedido; loja: ConfiguracaoLoja; motoboy: Motoboy | null } | null {
  const d = banco.ler()
  const pedido = d.pedidos.find((p) => p.id === id)
  if (!pedido) return null
  return {
    pedido,
    loja: d.loja,
    motoboy: d.motoboys.find((m) => m.id === pedido.motoboyId) ?? null,
  }
}
