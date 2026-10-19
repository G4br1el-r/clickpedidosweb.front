import type { BancoDados } from "@/mock/banco/esquema"
import { cancelar } from "./status"

/** Pagamento online pendente há mais disto é cancelado (Services/ExpiracaoPagamentoService.cs). */
export const EXPIRACAO_PAGAMENTO_MINUTOS = 60

// Porta de ExpiracaoPagamentoService: no backend roda em segundo plano; aqui, a cada leitura.
export function expirarPagamentosPendentes(dados: BancoDados, agora: Date = new Date()): number {
  const limite = agora.getTime() - EXPIRACAO_PAGAMENTO_MINUTOS * 60_000
  let cancelados = 0
  for (const p of dados.pedidos) {
    if (p.status === "AguardandoPagamento" && new Date(p.criadoEm).getTime() < limite) {
      cancelar(p, agora)
      cancelados++
    }
  }
  return cancelados
}
