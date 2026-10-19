import type { BancoDados } from "@/mock/banco"
import type { ConfiguracaoLoja } from "@/types/entidades"

/**
 * O que a loja expõe ao cliente. Inclui o que hoje o Razor monta no servidor
 * (formas aceitas, mensagem de fechada), que a API pública ainda não devolve.
 */
export type LojaPublica = Pick<
  ConfiguracaoLoja,
  | "nomeLoja"
  | "slogan"
  | "telefone"
  | "whatsApp"
  | "endereco"
  | "horario"
  | "lojaAberta"
  | "mensagemFechada"
  | "taxaEntrega"
  | "pedidoMinimo"
  | "tempoEntrega"
  | "tempoRetirada"
  | "aceitaEntrega"
  | "aceitaRetirada"
  | "aceitaPix"
  | "aceitaCartaoOnline"
  | "aceitaDinheiro"
  | "aceitaCartaoNaEntrega"
>

export function lojaPublica(dados: BancoDados): LojaPublica {
  const l = dados.loja
  return {
    nomeLoja: l.nomeLoja,
    slogan: l.slogan,
    telefone: l.telefone,
    whatsApp: l.whatsApp,
    endereco: l.endereco,
    horario: l.horario,
    lojaAberta: l.lojaAberta,
    mensagemFechada: l.mensagemFechada,
    taxaEntrega: l.taxaEntrega,
    pedidoMinimo: l.pedidoMinimo,
    tempoEntrega: l.tempoEntrega,
    tempoRetirada: l.tempoRetirada,
    aceitaEntrega: l.aceitaEntrega,
    aceitaRetirada: l.aceitaRetirada,
    aceitaPix: l.aceitaPix,
    aceitaCartaoOnline: l.aceitaCartaoOnline,
    aceitaDinheiro: l.aceitaDinheiro,
    aceitaCartaoNaEntrega: l.aceitaCartaoNaEntrega,
  }
}
