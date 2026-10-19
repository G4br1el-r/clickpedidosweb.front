import type {
  FormaPagamento,
  SituacaoPagamento,
  StatusPedido,
  TipoEntrega,
} from "@/types/entidades"

// Porta de Infra/Rotulos.cs: os textos precisam bater com o que o backend mostra.

export function rotuloStatus(status: StatusPedido, tipo: TipoEntrega): string {
  switch (status) {
    case "AguardandoPagamento":
      return "Aguardando pagamento"
    case "Recebido":
      return "Pedido recebido"
    case "EmPreparo":
      return "Em preparo"
    case "Pronto":
      return tipo === "Retirada"
        ? "Pronto para retirada"
        : tipo === "Mesa"
          ? "Pronto para servir"
          : "Pronto"
    case "SaiuParaEntrega":
      return "Saiu para entrega"
    case "Concluido":
      return tipo === "Retirada"
        ? "Retirado"
        : tipo === "Mesa"
          ? "Servido / Finalizado"
          : "Entregue"
    case "Cancelado":
      return "Cancelado"
  }
}

/** Texto do botão que leva o pedido para a próxima etapa. Vazio quando não há próxima. */
export function rotuloAcao(status: StatusPedido, tipo: TipoEntrega): string {
  switch (status) {
    case "Recebido":
      return "Iniciar preparo"
    case "EmPreparo":
      return "Marcar como pronto"
    case "Pronto":
      return tipo === "Mesa"
        ? "Servir na mesa"
        : tipo === "Entrega"
          ? "Saiu para entrega"
          : "Cliente retirou"
    case "SaiuParaEntrega":
      return "Confirmar entrega"
    default:
      return ""
  }
}

const pagamentos: Record<FormaPagamento, string> = {
  Pix: "Pix",
  CartaoOnline: "Cartão online",
  Dinheiro: "Dinheiro",
  CartaoNaEntrega: "Cartão na maquininha",
}

const situacoes: Record<SituacaoPagamento, string> = {
  Pendente: "Aguardando",
  Pago: "Pago",
  NaEntrega: "A cobrar",
  Cancelado: "Cancelado",
}

const tipos: Record<TipoEntrega, string> = {
  Entrega: "Entrega",
  Retirada: "Retirada",
  Mesa: "Mesa",
}

export const rotuloPagamento = (forma: FormaPagamento) => pagamentos[forma]
export const rotuloSituacaoPagamento = (situacao: SituacaoPagamento) => situacoes[situacao]
export const rotuloTipo = (tipo: TipoEntrega) => tipos[tipo]
