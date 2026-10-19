import { formatarHora } from "@/lib/datas"
import type {
  ConfiguracaoLoja,
  Pedido,
  PedidoItem,
  StatusPedido,
  TipoEntrega,
} from "@/types/entidades"
import { rotuloPagamento, rotuloStatus } from "./rotulos"

export interface EtapaAcompanhamento {
  titulo: string
  feito: boolean
  atual: boolean
}

/** AcompanhamentoDto do backend + itens, totais e endereço, que o Razor renderizava no servidor. */
export interface Acompanhamento {
  numero: number
  token: string
  status: StatusPedido
  statusTexto: string
  tipo: TipoEntrega
  mesaNumero: number | null
  garcomNome: string | null
  pagamento: Pedido["pagamento"]
  pagamentoTexto: string
  pago: boolean
  pixCopiaECola: string | null
  pixExpiraEm: string | null
  checkoutUrl: string | null
  aguardandoCartao: boolean
  tempoEstimado: string
  etapas: EtapaAcompanhamento[]
  final: boolean
  clienteNome: string
  criadoEm: string
  itens: PedidoItem[]
  subtotal: number
  taxaEntrega: number
  total: number
  trocoPara: number | null
  endereco: string | null
  referencia: string | null
  observacao: string | null
  whatsAppLoja: string | null
  nomeLoja: string
}

const ETAPAS: Record<TipoEntrega, Array<[StatusPedido, string]>> = {
  Entrega: [
    ["Recebido", "Pedido recebido"],
    ["EmPreparo", "Em preparo"],
    ["Pronto", "Pronto"],
    ["SaiuParaEntrega", "Saiu para entrega"],
    ["Concluido", "Entregue"],
  ],
  Retirada: [
    ["Recebido", "Pedido recebido"],
    ["EmPreparo", "Em preparo"],
    ["Pronto", "Pronto para retirada"],
    ["Concluido", "Retirado"],
  ],
  Mesa: [
    ["Recebido", "Pedido anotado"],
    ["EmPreparo", "Em preparo na cozinha"],
    ["Pronto", "Pronto para servir"],
    ["Concluido", "Servido na mesa"],
  ],
}

export function enderecoCompleto(
  p: Pick<Pedido, "logradouro" | "numero" | "complemento" | "bairro" | "cidade" | "uf">,
): string | null {
  if (!p.logradouro) return null
  const complemento = p.complemento ? ` - ${p.complemento}` : ""
  return `${p.logradouro}, ${p.numero}${complemento} – ${p.bairro}, ${p.cidade}/${p.uf}`
}

// Porta de ViewModels/ViewModels.cs (AcompanhamentoDto.De).
export function montarAcompanhamento(p: Pedido, loja: ConfiguracaoLoja): Acompanhamento {
  const etapas = ETAPAS[p.tipo]
  const atual = etapas.findIndex(([s]) => s === p.status)
  const aguardando = p.status === "AguardandoPagamento"

  return {
    numero: p.id,
    token: p.token,
    status: p.status,
    statusTexto: rotuloStatus(p.status, p.tipo),
    tipo: p.tipo,
    mesaNumero: p.mesaNumero,
    garcomNome: p.garcomNome,
    pagamento: p.pagamento,
    pagamentoTexto: rotuloPagamento(p.pagamento),
    pago: p.statusPagamento === "Pago",
    pixCopiaECola: aguardando ? p.pixCopiaECola : null,
    pixExpiraEm: aguardando && p.pixExpiraEm ? formatarHora(p.pixExpiraEm) : null,
    checkoutUrl: aguardando ? p.checkoutUrl : null,
    aguardandoCartao: aguardando && p.pagamento === "CartaoOnline",
    tempoEstimado:
      p.tipo === "Entrega"
        ? loja.tempoEntrega
        : p.tipo === "Mesa"
          ? "15–25 min"
          : loja.tempoRetirada,
    etapas: etapas.map(([, titulo], i) => ({
      titulo,
      feito: atual >= 0 && i <= atual,
      atual: i === atual,
    })),
    final: p.status === "Concluido" || p.status === "Cancelado",
    clienteNome: p.clienteNome,
    criadoEm: p.criadoEm,
    itens: p.itens,
    subtotal: p.subtotal,
    taxaEntrega: p.taxaEntrega,
    total: p.total,
    trocoPara: p.trocoPara,
    endereco: enderecoCompleto(p),
    referencia: p.referencia,
    observacao: p.observacao,
    whatsAppLoja: loja.whatsApp,
    nomeLoja: loja.nomeLoja,
  }
}
