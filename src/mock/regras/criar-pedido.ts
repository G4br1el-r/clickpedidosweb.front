import { formatarMoeda } from "@/lib/moeda"
import type { BancoDados } from "@/mock/banco/esquema"
import { pixFalso } from "@/mock/pedidos/exemplos"
import type { FormaPagamento, Pedido, PedidoItem, TipoEntrega } from "@/types/entidades"
import { cidadeAtendida, lojaEstaAberta } from "./loja"
import { arredondar, calcularItem, type OpcaoSelecionada, validarOpcoes } from "./preco"
import { cpfValido, digitos, limitar, normalizar } from "./texto"

export interface CriarPedidoItemRequest {
  produtoId: number
  quantidade: number
  opcoes?: OpcaoSelecionada[]
  observacao?: string | null
}

/** Mesmo formato do CriarPedidoRequest do backend (POST /api/pedidos). */
export interface CriarPedidoRequest {
  nome?: string | null
  telefone?: string | null
  email?: string | null
  cpf?: string | null
  tipo: TipoEntrega
  mesaId?: number | null
  mesaNumero?: number | null
  garcomNome?: string | null
  cep?: string | null
  logradouro?: string | null
  numero?: string | null
  complemento?: string | null
  bairro?: string | null
  cidade?: string | null
  uf?: string | null
  referencia?: string | null
  pagamento: FormaPagamento
  trocoPara?: number | null
  observacao?: string | null
  itens: CriarPedidoItemRequest[]
}

export type ResultadoCriarPedido = { ok: true; pedido: Pedido } | { ok: false; erro: string }

/** Validade do Pix (PagBank:ExpiracaoPixMinutos / MercadoPago:ExpiracaoPixMinutos). */
export const EXPIRACAO_PIX_MINUTOS = 30

// O backend monta as mensagens com "{0:C}", que usa espaço comum depois do "R$".
const moeda = (valor: number) => formatarMoeda(valor).replace(/ /g, " ")

const falha = (erro: string): ResultadoCriarPedido => ({ ok: false, erro })

/**
 * No mock, Pix e cartão online estão sempre "configurados": dependem só das chaves Aceita*.
 * Porta de PedidoService.FormaPermitida.
 */
export function formaPermitida(loja: BancoDados["loja"], forma: FormaPagamento): boolean {
  switch (forma) {
    case "Pix":
      return loja.aceitaPix
    case "CartaoOnline":
      return loja.aceitaCartaoOnline
    case "Dinheiro":
      return loja.aceitaDinheiro
    case "CartaoNaEntrega":
      return loja.aceitaCartaoNaEntrega
  }
}

export function gerarToken(): string {
  return crypto.randomUUID().replace(/-/g, "")
}

// Porta de PedidoService.CriarAsync. Altera "dados" (chame dentro de banco.atualizar).
export function criarPedidoNosDados(
  dados: BancoDados,
  r: CriarPedidoRequest,
  agora: Date = new Date(),
): ResultadoCriarPedido {
  const loja = dados.loja
  const ehMesa = r.tipo === "Mesa"

  if (!ehMesa && !lojaEstaAberta(loja, dados.horarios, agora))
    return falha(
      loja.mensagemFechada ??
        "A loja está fechada agora. Tente de novo no horário de funcionamento.",
    )

  if (
    (r.tipo === "Entrega" && !loja.aceitaEntrega) ||
    (r.tipo === "Retirada" && !loja.aceitaRetirada)
  )
    return falha("Essa forma de receber não está disponível agora.")

  if (!ehMesa && !formaPermitida(loja, r.pagamento))
    return falha("Essa forma de pagamento não está disponível. Escolha outra.")

  const itensReq = r.itens ?? []
  if (itensReq.length === 0) return falha("Sua sacola está vazia.")
  if (itensReq.length > 60 || itensReq.some((i) => i.quantidade < 1 || i.quantidade > 50))
    return falha("Revise as quantidades da sacola.")

  let nome = limitar(r.nome, 80)
  if (!nome) {
    if (!ehMesa) return falha("Informe seu nome.")
    nome = `Mesa ${r.mesaNumero ?? r.mesaId ?? 1}`
  }

  let telefone = digitos(r.telefone)
  if (telefone.length < 10 || telefone.length > 11) {
    if (!ehMesa) return falha("Informe seu WhatsApp com DDD.")
    const telLoja = digitos(loja.telefone)
    telefone = telLoja.length >= 10 && telLoja.length <= 11 ? telLoja : "11999999999"
  }

  let endereco: Pick<
    Pedido,
    "cep" | "logradouro" | "numero" | "complemento" | "bairro" | "cidade" | "uf" | "referencia"
  > = {
    cep: null,
    logradouro: null,
    numero: null,
    complemento: null,
    bairro: null,
    cidade: null,
    uf: null,
    referencia: null,
  }
  if (r.tipo === "Entrega") {
    endereco = {
      cep: digitos(r.cep),
      logradouro: limitar(r.logradouro, 120),
      numero: limitar(r.numero, 20),
      complemento: limitar(r.complemento, 60),
      bairro: limitar(r.bairro, 80),
      cidade: limitar(r.cidade, 80),
      uf: limitar(r.uf, 2)?.toUpperCase() ?? null,
      referencia: limitar(r.referencia, 120),
    }
    if (
      endereco.cep?.length !== 8 ||
      !endereco.logradouro ||
      !endereco.numero ||
      !endereco.bairro ||
      !endereco.cidade
    )
      return falha("Preencha o endereço de entrega: CEP, rua, número, bairro e cidade.")
    if (!cidadeAtendida(loja.cidadesAtendidas, endereco.cidade))
      return falha(
        `Ainda não entregamos em ${endereco.cidade}. Você pode escolher retirar no quiosque.`,
      )
  }

  let clienteCpf: string | null = null
  let clienteEmail: string | null = null
  if (r.pagamento === "Pix" && !ehMesa) {
    if (!cpfValido(r.cpf)) return falha("Informe um CPF válido para gerar o Pix.")
    clienteCpf = digitos(r.cpf)
    const email = limitar(r.email, 120)
    clienteEmail =
      email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ? email
        : `cliente_${clienteCpf}@clickpedidoweb.com.br`
  }

  // Preços sempre do banco, com as opções configuradas.
  const pedidoId = dados.proximosIds.pedido
  const itens: PedidoItem[] = []
  for (const i of itensReq) {
    const p = dados.produtos.find((x) => x.id === i.produtoId)
    if (!p) return falha("Um item da comanda não foi encontrado.")
    const categoria = dados.categorias.find((c) => c.id === p.categoriaId)
    if (!ehMesa && (!p.ativo || !p.disponivel || categoria?.ativa === false))
      return falha(
        "Um item da sacola não está mais disponível. Volte ao cardápio e revise a sacola.",
      )

    const opcoes = i.opcoes ?? []
    const erroOpcoes = validarOpcoes(p, opcoes)
    if (erroOpcoes) return falha(erroOpcoes)

    const { precoUnitario, resumo } = calcularItem(p, opcoes)
    itens.push({
      id: dados.proximosIds.pedidoItem + itens.length,
      pedidoId,
      produtoId: p.id,
      nomeProduto: p.nome,
      precoUnitario,
      quantidade: i.quantidade,
      opcoesResumo: limitar(resumo, 500),
      observacao: limitar(i.observacao, 140),
      total: arredondar(precoUnitario * i.quantidade),
    })
  }

  const subtotal = arredondar(itens.reduce((s, i) => s + i.total, 0))
  if (!ehMesa && loja.pedidoMinimo > 0 && subtotal < loja.pedidoMinimo)
    return falha(`O pedido mínimo é ${moeda(loja.pedidoMinimo)}.`)

  let taxaEntrega = 0
  if (r.tipo === "Entrega") {
    taxaEntrega = loja.taxaEntrega
    const normBairro = normalizar(endereco.bairro)
    const normCidade = normalizar(endereco.cidade)
    const ativos = dados.bairros.filter((b) => b.ativo)
    const bairro =
      ativos.find(
        (b) =>
          normalizar(b.nome) === normBairro && (!normCidade || normalizar(b.cidade) === normCidade),
      ) ?? ativos.find((b) => normalizar(b.nome) === normBairro)
    if (bairro) taxaEntrega = bairro.taxa
  }
  const total = arredondar(subtotal + taxaEntrega)

  let trocoPara: number | null = null
  if (r.pagamento === "Dinheiro" && r.trocoPara && r.trocoPara > 0) {
    if (r.trocoPara < total)
      return falha(`O troco precisa ser para um valor maior que o total (${moeda(total)}).`)
    trocoPara = r.trocoPara
  }

  const online = (r.pagamento === "Pix" || r.pagamento === "CartaoOnline") && !ehMesa
  const criadoEm = agora.toISOString()

  const pedido: Pedido = {
    id: pedidoId,
    token: gerarToken(),
    clienteNome: nome,
    clienteTelefone: telefone,
    clienteEmail,
    clienteCpf,
    tipo: r.tipo,
    mesaId: r.mesaId ?? null,
    mesaNumero: r.mesaNumero ?? null,
    garcomNome: limitar(r.garcomNome, 40),
    ...endereco,
    observacao: limitar(r.observacao, 300),
    subtotal,
    taxaEntrega,
    total,
    trocoPara,
    pagamento: r.pagamento,
    statusPagamento: online ? "Pendente" : "NaEntrega",
    status: online ? "AguardandoPagamento" : "Recebido",
    // Gateway simulado: o Pix tem código e validade; o cartão é "pago" na tela do pedido.
    pixCopiaECola: online && r.pagamento === "Pix" ? pixFalso(pedidoId) : null,
    pixQrCodeUrl: null,
    checkoutUrl: null,
    pixExpiraEm:
      online && r.pagamento === "Pix"
        ? new Date(agora.getTime() + EXPIRACAO_PIX_MINUTOS * 60_000).toISOString()
        : null,
    pagoEm: null,
    motoboyId: null,
    criadoEm,
    atualizadoEm: criadoEm,
    impressoEm: null,
    itens,
  }

  dados.pedidos.push(pedido)
  dados.proximosIds.pedido = pedidoId + 1
  dados.proximosIds.pedidoItem += itens.length

  if (ehMesa && r.mesaId) {
    const mesa = dados.mesas.find((m) => m.id === r.mesaId)
    if (mesa) {
      mesa.status = "Ocupada"
      mesa.pedidoAtivoId = pedido.id
      mesa.clienteNome = pedido.clienteNome
      mesa.ocupadaEm ??= criadoEm
    }
  }

  return { ok: true, pedido }
}
