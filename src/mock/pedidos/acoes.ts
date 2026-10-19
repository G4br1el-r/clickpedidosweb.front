import { banco, simularLatencia } from "@/mock/banco"
import { type Acompanhamento, montarAcompanhamento } from "@/mock/regras/acompanhamento"
import { type CriarPedidoRequest, criarPedidoNosDados } from "@/mock/regras/criar-pedido"
import { expirarPagamentosPendentes } from "@/mock/regras/expiracao"
import { confirmarPagamento } from "@/mock/regras/status"
import { PIX_AUTOMATICO_SEGUNDOS } from "@/mock/simulador/config"

export type { CriarPedidoRequest } from "@/mock/regras/criar-pedido"

export type ResultadoPedido =
  | { ok: true; token: string; numero: number }
  | { ok: false; erro: string }

// Replica POST /api/pedidos
export async function criarPedido(req: CriarPedidoRequest): Promise<ResultadoPedido> {
  await simularLatencia()
  let resultado: ResultadoPedido = { ok: false, erro: "Não foi possível enviar o pedido." }
  banco.atualizar((dados) => {
    const r = criarPedidoNosDados(dados, req)
    resultado = r.ok ? { ok: true, token: r.pedido.token, numero: r.pedido.id } : r
  })
  return resultado
}

// Replica GET /api/pedidos/{token} (+ o "plano B" que confere o pagamento no gateway).
export async function obterAcompanhamento(
  token: string,
  agora: Date = new Date(),
  opcoes: { simularPix?: boolean } = {},
): Promise<Acompanhamento | null> {
  await simularLatencia(80, 200)
  const simularPix = opcoes.simularPix ?? true

  const atual = banco.ler()
  const pedido = atual.pedidos.find((p) => p.token === token)
  if (!pedido) return null

  const pixVenceu =
    simularPix &&
    pedido.status === "AguardandoPagamento" &&
    pedido.pagamento === "Pix" &&
    agora.getTime() - new Date(pedido.criadoEm).getTime() >= PIX_AUTOMATICO_SEGUNDOS * 1000
  const vaiExpirar = pedido.status === "AguardandoPagamento"

  if (!pixVenceu && !vaiExpirar) return montarAcompanhamento(pedido, atual.loja)

  const dados = banco.atualizar((d) => {
    expirarPagamentosPendentes(d, agora)
    const p = d.pedidos.find((x) => x.token === token)
    if (p && pixVenceu && p.status === "AguardandoPagamento") confirmarPagamento(p, agora)
  })
  const depois = dados.pedidos.find((p) => p.token === token)
  return depois ? montarAcompanhamento(depois, dados.loja) : null
}

/** Só no mock: o cliente "paga" o Pix ou o cartão online na hora (botão de teste). */
export async function simularPagamento(token: string): Promise<void> {
  await simularLatencia(300, 700)
  banco.atualizar((d) => {
    const p = d.pedidos.find((x) => x.token === token)
    if (p && p.status === "AguardandoPagamento") confirmarPagamento(p)
  })
}
