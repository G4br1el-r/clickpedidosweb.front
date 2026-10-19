import { formatarMoeda } from "@/lib/moeda"
import type { ConfiguracaoLoja, Pedido } from "@/types/entidades"
import { enderecoCompleto } from "./acompanhamento"
import { rotuloPagamento, rotuloStatus } from "./rotulos"
import { formatarTelefone, primeiroNome } from "./texto"

// Porta de Infra/Rotulos.cs (classe Mensagens): textos prontos para o WhatsApp.

export function paraMotoboy(p: Pedido, loja: ConfiguracaoLoja): string {
  const endereco = enderecoCompleto(p) ?? ""
  const linhas = [
    `*${loja.nomeLoja}* – entrega do pedido #${p.id}`,
    `Cliente: ${p.clienteNome} – ${formatarTelefone(p.clienteTelefone)}`,
    `Endereço: ${endereco}`,
  ]
  if (p.referencia) linhas.push(`Referência: ${p.referencia}`)
  if (p.statusPagamento === "Pago") linhas.push("Pagamento: já pago online. Não cobrar.")
  else {
    let cobrar = `Cobrar: ${formatarMoeda(p.total)} (${rotuloPagamento(p.pagamento)})`
    if (p.trocoPara && p.trocoPara > p.total)
      cobrar += ` – levar ${formatarMoeda(p.trocoPara - p.total)} de troco (cliente paga com ${formatarMoeda(p.trocoPara)})`
    linhas.push(cobrar)
  }
  linhas.push(
    `Mapa: https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`,
  )
  return linhas.join("\n")
}

export function paraCliente(p: Pedido, loja: ConfiguracaoLoja, linkAcompanhamento: string): string {
  return (
    `Olá, ${primeiroNome(p.clienteNome)}! Aqui é do ${loja.nomeLoja}. ` +
    `Seu pedido #${p.id} está: ${rotuloStatus(p.status, p.tipo)}. Acompanhe aqui: ${linkAcompanhamento}`
  )
}

export const linkMapa = (p: Pedido) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoCompleto(p) ?? "")}`
