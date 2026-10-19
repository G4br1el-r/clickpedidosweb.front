// Espelho de Models/Entidades.cs do backend. Os enums viram uniões de string porque o
// backend serializa com JsonStringEnumConverter. Datas são strings ISO (UTC).

export const STATUS_PEDIDO = [
  "AguardandoPagamento",
  "Recebido",
  "EmPreparo",
  "Pronto",
  "SaiuParaEntrega",
  "Concluido",
  "Cancelado",
] as const
export type StatusPedido = (typeof STATUS_PEDIDO)[number]

export const TIPOS_ENTREGA = ["Entrega", "Retirada", "Mesa"] as const
export type TipoEntrega = (typeof TIPOS_ENTREGA)[number]

export const STATUS_MESA = ["Livre", "Ocupada", "ContaPedida"] as const
export type StatusMesa = (typeof STATUS_MESA)[number]

export const FORMAS_PAGAMENTO = ["Pix", "CartaoOnline", "Dinheiro", "CartaoNaEntrega"] as const
export type FormaPagamento = (typeof FORMAS_PAGAMENTO)[number]

export const SITUACOES_PAGAMENTO = ["Pendente", "Pago", "NaEntrega", "Cancelado"] as const
export type SituacaoPagamento = (typeof SITUACOES_PAGAMENTO)[number]

export interface Categoria {
  id: number
  nome: string
  ordem: number
  ativa: boolean
}

export interface ProdutoOpcaoItem {
  id: number
  grupoId: number
  nome: string
  precoAdicional: number
  ordem: number
  ativo: boolean
}

export interface ProdutoOpcaoGrupo {
  id: number
  produtoId: number
  nome: string
  minimo: number
  maximo: number
  /** Quantidade de escolhas gratuitas do grupo (ex.: 2 nos adicionais do açaí). */
  gratisAte: number
  ordem: number
  ativo: boolean
  itens: ProdutoOpcaoItem[]
}

export interface Produto {
  id: number
  categoriaId: number
  nome: string
  descricao: string | null
  preco: number
  imagemUrl: string | null
  /** Aparece no cardápio. */
  ativo: boolean
  /** Falso = "Esgotado": aparece, mas não pode ser pedido. */
  disponivel: boolean
  ordem: number
  gruposOpcoes: ProdutoOpcaoGrupo[]
}

export interface Mesa {
  id: number
  numero: number
  nome: string
  status: StatusMesa
  pedidoAtivoId: number | null
  clienteNome: string | null
  ocupadaEm: string | null
  ativa: boolean
}

export interface PedidoItem {
  id: number
  pedidoId: number
  /** Sem vínculo forte: o histórico vale mesmo se o produto for excluído. */
  produtoId: number
  nomeProduto: string
  precoUnitario: number
  quantidade: number
  opcoesResumo: string | null
  observacao: string | null
  total: number
}

export interface Pedido {
  id: number
  /** Identificador público do link de acompanhamento. */
  token: string
  clienteNome: string
  clienteTelefone: string
  clienteEmail: string | null
  clienteCpf: string | null
  tipo: TipoEntrega
  mesaId: number | null
  mesaNumero: number | null
  garcomNome: string | null
  cep: string | null
  logradouro: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  cidade: string | null
  uf: string | null
  referencia: string | null
  observacao: string | null
  subtotal: number
  taxaEntrega: number
  total: number
  trocoPara: number | null
  pagamento: FormaPagamento
  statusPagamento: SituacaoPagamento
  status: StatusPedido
  pixCopiaECola: string | null
  pixQrCodeUrl: string | null
  checkoutUrl: string | null
  pixExpiraEm: string | null
  pagoEm: string | null
  motoboyId: number | null
  criadoEm: string
  atualizadoEm: string
  impressoEm: string | null
  itens: PedidoItem[]
}

export interface Motoboy {
  id: number
  nome: string
  telefone: string
  ativo: boolean
}

export interface ConfiguracaoLoja {
  nomeLoja: string
  slogan: string | null
  telefone: string | null
  whatsApp: string | null
  endereco: string | null
  horario: string | null
  lojaAberta: boolean
  controleHorarioAutomatico: boolean
  mensagemFechada: string | null
  taxaEntrega: number
  pedidoMinimo: number
  tempoEntrega: string
  tempoRetirada: string
  /** Cidades separadas por vírgula. Vazio = entrega em qualquer cidade. */
  cidadesAtendidas: string | null
  aceitaEntrega: boolean
  aceitaRetirada: boolean
  aceitaPix: boolean
  aceitaCartaoOnline: boolean
  aceitaDinheiro: boolean
  aceitaCartaoNaEntrega: boolean
  nomeImpressoraTermica: string | null
  impressaoAutomatica: boolean
  cortarPapelImpressora: boolean
  mercadoPagoAccessToken: string | null
  mercadoPagoPublicKey: string | null
}

/** 0 = domingo, como o DayOfWeek do .NET. */
export type DiaSemana = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface HorarioFuncionamento {
  diaSemana: DiaSemana
  aberto: boolean
  abreAs: string
  fechaAs: string
}

export interface BairroEntrega {
  id: number
  cidade: string
  nome: string
  taxa: number
  ativo: boolean
  ordem: number
}

export interface Usuario {
  id: number
  login: string
  nome: string
  senha: string
}
