import { minutosDesdeMeiaNoite } from "@/lib/datas"
import { arredondar, calcularItem, type OpcaoSelecionada } from "@/mock/regras/preco"
import type {
  FormaPagamento,
  Pedido,
  PedidoItem,
  Produto,
  StatusPedido,
  TipoEntrega,
} from "@/types/entidades"

interface ItemExemplo {
  produtoId: number
  quantidade: number
  opcoes?: OpcaoSelecionada[]
  observacao?: string
}

interface PedidoExemplo {
  minutosAtras: number
  tipo: TipoEntrega
  status: StatusPedido
  pagamento: FormaPagamento
  cliente: [nome: string, telefone: string]
  itens: ItemExemplo[]
  endereco?: {
    logradouro: string
    numero: string
    bairro: string
    taxa: number
    referencia?: string
  }
  mesaNumero?: number
  garcomNome?: string
  trocoPara?: number
  observacao?: string
}

// Um dia normal do quiosque: pedidos em todas as etapas, para a fila, a cozinha e o
// dashboard abrirem com cara de operação de verdade.
const roteiro: PedidoExemplo[] = [
  {
    minutosAtras: 2,
    tipo: "Entrega",
    status: "Recebido",
    pagamento: "Dinheiro",
    cliente: ["Mariana Souza", "12991234567"],
    itens: [
      { produtoId: 1, quantidade: 2, observacao: "Bem sequinho, por favor" },
      { produtoId: 18, quantidade: 2 },
    ],
    endereco: { logradouro: "Rua Barão de Castro Lima", numero: "214", bairro: "Centro", taxa: 5 },
    trocoPara: 50,
  },
  {
    minutosAtras: 4,
    tipo: "Retirada",
    status: "Recebido",
    pagamento: "Pix",
    cliente: ["João Pedro", "12988776655"],
    itens: [
      {
        produtoId: 21,
        quantidade: 1,
        opcoes: [
          { grupoId: 1, itemId: 3, quantidade: 1 },
          { grupoId: 2, itemId: 6, quantidade: 1 },
        ],
      },
    ],
  },
  {
    minutosAtras: 9,
    tipo: "Entrega",
    status: "EmPreparo",
    pagamento: "CartaoNaEntrega",
    cliente: ["Ana Clara Ribeiro", "12997001122"],
    itens: [
      { produtoId: 10, quantidade: 1, observacao: "Sem cebola" },
      { produtoId: 15, quantidade: 1 },
      { produtoId: 17, quantidade: 2 },
    ],
    endereco: {
      logradouro: "Rua Comendador Custódio Vieira",
      numero: "58",
      bairro: "Vila Carmen",
      taxa: 5,
      referencia: "Portão verde",
    },
  },
  {
    minutosAtras: 12,
    tipo: "Mesa",
    status: "EmPreparo",
    pagamento: "Dinheiro",
    cliente: ["Mesa 4", ""],
    mesaNumero: 4,
    garcomNome: "Lucas",
    itens: [
      { produtoId: 5, quantidade: 3 },
      { produtoId: 19, quantidade: 2 },
    ],
  },
  {
    minutosAtras: 18,
    tipo: "Entrega",
    status: "Pronto",
    pagamento: "Pix",
    cliente: ["Rafael Lima", "12996543210"],
    itens: [
      { produtoId: 9, quantidade: 2 },
      { produtoId: 39, quantidade: 1, opcoes: [{ grupoId: 30, itemId: 368, quantidade: 1 }] },
    ],
    endereco: { logradouro: "Rua São José", numero: "1020", bairro: "São José", taxa: 5 },
  },
  {
    minutosAtras: 26,
    tipo: "Entrega",
    status: "SaiuParaEntrega",
    pagamento: "Dinheiro",
    cliente: ["Beatriz Santos", "12992223344"],
    itens: [{ produtoId: 35, quantidade: 1 }],
    endereco: { logradouro: "Estrada do Embaú", numero: "s/n", bairro: "Embaú", taxa: 15 },
    trocoPara: 100,
  },
  {
    minutosAtras: 1,
    tipo: "Entrega",
    status: "AguardandoPagamento",
    pagamento: "Pix",
    cliente: ["Carlos Henrique", "12993334455"],
    itens: [{ produtoId: 7, quantidade: 2 }],
    endereco: {
      logradouro: "Avenida Ministro Rodrigues Alves",
      numero: "88",
      bairro: "Centro",
      taxa: 5,
    },
  },
  {
    minutosAtras: 95,
    tipo: "Retirada",
    status: "Concluido",
    pagamento: "Dinheiro",
    cliente: ["Fernanda Alves", "12991112233"],
    itens: [
      { produtoId: 2, quantidade: 2 },
      { produtoId: 20, quantidade: 1 },
    ],
  },
  {
    minutosAtras: 140,
    tipo: "Entrega",
    status: "Concluido",
    pagamento: "CartaoOnline",
    cliente: ["Gustavo Pereira", "12994445566"],
    itens: [
      { produtoId: 13, quantidade: 2 },
      { produtoId: 42, quantidade: 1 },
    ],
    endereco: {
      logradouro: "Rua Doutor Cícero Prado",
      numero: "300",
      bairro: "Jardim da Fonte",
      taxa: 5,
    },
  },
  {
    minutosAtras: 170,
    tipo: "Retirada",
    status: "Cancelado",
    pagamento: "Pix",
    cliente: ["Patrícia Gomes", "12995556677"],
    itens: [{ produtoId: 11, quantidade: 1 }],
  },
]

export function pedidosDeExemplo(produtos: Produto[], agora: Date = new Date()): Pedido[] {
  const porId = new Map(produtos.map((p) => [p.id, p]))
  let proximoItem = 1
  // Logo depois da meia-noite, comprime o roteiro para todos os pedidos ficarem em "hoje".
  const maisAntigo = Math.max(...roteiro.map((r) => r.minutosAtras))
  const disponivel = Math.max(0, minutosDesdeMeiaNoite(agora) - 0.5)
  const escala = disponivel < maisAntigo ? disponivel / maisAntigo : 1

  return roteiro.map((ex, indice) => {
    const id = indice + 1
    const criadoEm = new Date(agora.getTime() - ex.minutosAtras * escala * 60_000).toISOString()
    const itens: PedidoItem[] = ex.itens.flatMap((it) => {
      const produto = porId.get(it.produtoId)
      if (!produto) return []
      const { precoUnitario, resumo } = calcularItem(produto, it.opcoes ?? [])
      return [
        {
          id: proximoItem++,
          pedidoId: id,
          produtoId: produto.id,
          nomeProduto: produto.nome,
          precoUnitario,
          quantidade: it.quantidade,
          opcoesResumo: resumo,
          observacao: it.observacao ?? null,
          total: arredondar(precoUnitario * it.quantidade),
        },
      ]
    })
    const subtotal = arredondar(itens.reduce((s, i) => s + i.total, 0))
    const taxaEntrega = ex.endereco?.taxa ?? 0
    const pago =
      ex.status !== "AguardandoPagamento" &&
      ex.status !== "Cancelado" &&
      (ex.pagamento === "Pix" || ex.pagamento === "CartaoOnline")

    return {
      id,
      token: `exemplo${String(id).padStart(2, "0")}`,
      clienteNome: ex.cliente[0],
      clienteTelefone: ex.cliente[1],
      clienteEmail: null,
      clienteCpf: null,
      tipo: ex.tipo,
      mesaId: ex.mesaNumero ?? null,
      mesaNumero: ex.mesaNumero ?? null,
      garcomNome: ex.garcomNome ?? null,
      cep: ex.endereco ? "12630-000" : null,
      logradouro: ex.endereco?.logradouro ?? null,
      numero: ex.endereco?.numero ?? null,
      complemento: null,
      bairro: ex.endereco?.bairro ?? null,
      cidade: ex.endereco ? "Cachoeira Paulista" : null,
      uf: ex.endereco ? "SP" : null,
      referencia: ex.endereco?.referencia ?? null,
      observacao: ex.observacao ?? null,
      subtotal,
      taxaEntrega,
      total: arredondar(subtotal + taxaEntrega),
      trocoPara: ex.trocoPara ?? null,
      pagamento: ex.pagamento,
      statusPagamento:
        ex.status === "Cancelado"
          ? "Cancelado"
          : pago || ex.status === "Concluido"
            ? "Pago"
            : ex.pagamento === "Pix" || ex.pagamento === "CartaoOnline"
              ? "Pendente"
              : "NaEntrega",
      status: ex.status,
      pixCopiaECola: ex.status === "AguardandoPagamento" ? pixFalso(id) : null,
      pixQrCodeUrl: null,
      checkoutUrl: null,
      pixExpiraEm:
        ex.status === "AguardandoPagamento"
          ? new Date(new Date(criadoEm).getTime() + 30 * 60_000).toISOString()
          : null,
      pagoEm: pago ? criadoEm : null,
      motoboyId: ex.status === "SaiuParaEntrega" ? 1 : null,
      criadoEm,
      atualizadoEm: criadoEm,
      impressoEm: ex.status === "Recebido" ? null : criadoEm,
      itens,
    }
  })
}

/** Código "copia e cola" de mentira, no formato de um Pix (não paga nada). */
export function pixFalso(pedidoId: number): string {
  return `00020126580014br.gov.bcb.pix0136mock-clickpedido-${String(pedidoId).padStart(6, "0")}5204000053039865802BR5919QUIOSQUE DO MINEIRO6018CACHOEIRA PAULISTA62070503***6304ABCD`
}
