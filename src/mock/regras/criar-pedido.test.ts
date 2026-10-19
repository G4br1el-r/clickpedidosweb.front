import { beforeEach, describe, expect, it } from "vitest"
import { dadosIniciais } from "@/mock/banco/dados-iniciais"
import type { BancoDados } from "@/mock/banco/esquema"
import { type CriarPedidoRequest, criarPedidoNosDados } from "./criar-pedido"

const agora = new Date("2026-10-18T19:00:00Z")
let dados: BancoDados

const base = (campos: Partial<CriarPedidoRequest> = {}): CriarPedidoRequest => ({
  nome: "Maria da Silva",
  telefone: "(12) 99123-4567",
  tipo: "Retirada",
  pagamento: "Dinheiro",
  itens: [{ produtoId: 1, quantidade: 2 }],
  ...campos,
})

const entrega = (campos: Partial<CriarPedidoRequest> = {}): CriarPedidoRequest =>
  base({
    tipo: "Entrega",
    cep: "12630-000",
    logradouro: "Rua Barão de Castro Lima",
    numero: "214",
    bairro: "Embaú",
    cidade: "Cachoeira Paulista",
    uf: "sp",
    ...campos,
  })

const criar = (req: CriarPedidoRequest) => criarPedidoNosDados(dados, req, agora)

describe("criarPedidoNosDados (porta de PedidoService.CriarAsync)", () => {
  beforeEach(() => {
    dados = dadosIniciais(agora)
  })

  it("retirada em dinheiro entra direto na fila como recebido, a cobrar", () => {
    const r = criar(base())
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.pedido).toMatchObject({
      status: "Recebido",
      statusPagamento: "NaEntrega",
      subtotal: 18,
      taxaEntrega: 0,
      total: 18,
      clienteTelefone: "12991234567",
    })
    expect(dados.pedidos.at(-1)?.id).toBe(r.pedido.id)
  })

  it("loja fechada recusa com a mensagem da loja", () => {
    dados.loja.lojaAberta = false
    dados.loja.mensagemFechada = "Voltamos amanhã às 10h."
    expect(criar(base())).toEqual({ ok: false, erro: "Voltamos amanhã às 10h." })
  })

  it("loja fechada sem mensagem usa o texto padrão", () => {
    dados.loja.lojaAberta = false
    expect(criar(base())).toEqual({
      ok: false,
      erro: "A loja está fechada agora. Tente de novo no horário de funcionamento.",
    })
  })

  it("forma de receber desligada", () => {
    dados.loja.aceitaRetirada = false
    expect(criar(base())).toEqual({
      ok: false,
      erro: "Essa forma de receber não está disponível agora.",
    })
  })

  it("forma de pagamento desligada", () => {
    dados.loja.aceitaDinheiro = false
    expect(criar(base())).toEqual({
      ok: false,
      erro: "Essa forma de pagamento não está disponível. Escolha outra.",
    })
  })

  it("sacola vazia e quantidade fora do limite", () => {
    expect(criar(base({ itens: [] }))).toEqual({ ok: false, erro: "Sua sacola está vazia." })
    expect(criar(base({ itens: [{ produtoId: 1, quantidade: 51 }] }))).toEqual({
      ok: false,
      erro: "Revise as quantidades da sacola.",
    })
  })

  it("nome e WhatsApp obrigatórios", () => {
    expect(criar(base({ nome: "  " }))).toEqual({ ok: false, erro: "Informe seu nome." })
    expect(criar(base({ telefone: "9912" }))).toEqual({
      ok: false,
      erro: "Informe seu WhatsApp com DDD.",
    })
  })

  it("produto esgotado não pode ser pedido", () => {
    const p = dados.produtos.find((x) => x.id === 1)
    if (p) p.disponivel = false
    expect(criar(base())).toEqual({
      ok: false,
      erro: "Um item da sacola não está mais disponível. Volte ao cardápio e revise a sacola.",
    })
  })

  it("opção obrigatória faltando devolve a mensagem do grupo", () => {
    expect(criar(base({ itens: [{ produtoId: 21, quantidade: 1 }] }))).toEqual({
      ok: false,
      erro: "Escolha ao menos 1 opção em 'Escolha o tamanho'.",
    })
  })

  it("preço vem do banco, com opções e resumo", () => {
    const r = criar(
      base({
        itens: [
          {
            produtoId: 21,
            quantidade: 2,
            opcoes: [
              { grupoId: 1, itemId: 3, quantidade: 1 },
              { grupoId: 2, itemId: 6, quantidade: 2 },
            ],
            observacao: "  Capricha  ",
          },
        ],
      }),
    )
    if (!r.ok) throw new Error(r.erro)
    expect(r.pedido.itens[0]).toMatchObject({
      nomeProduto: "Açaí Paçoca",
      precoUnitario: 24,
      quantidade: 2,
      total: 48,
      opcoesResumo: "Escolha o tamanho: 500 ml | Adicionais (todos pagos): 2x Coco Ralado",
      observacao: "Capricha",
    })
  })

  it("pedido mínimo vale para entrega e retirada", () => {
    expect(criar(base({ itens: [{ produtoId: 20, quantidade: 1 }] }))).toEqual({
      ok: false,
      erro: "O pedido mínimo é R$ 15,00.",
    })
  })

  it("entrega exige endereço completo", () => {
    expect(criar(entrega({ numero: "" }))).toEqual({
      ok: false,
      erro: "Preencha o endereço de entrega: CEP, rua, número, bairro e cidade.",
    })
  })

  it("entrega fora das cidades atendidas sugere retirar", () => {
    expect(criar(entrega({ cidade: "Lorena" }))).toEqual({
      ok: false,
      erro: "Ainda não entregamos em Lorena. Você pode escolher retirar no quiosque.",
    })
  })

  it("taxa vem do bairro (sem acento e caixa) ou da loja", () => {
    const comBairro = criar(entrega({ bairro: "embau" }))
    if (!comBairro.ok) throw new Error(comBairro.erro)
    expect(comBairro.pedido.taxaEntrega).toBe(15)
    expect(comBairro.pedido.total).toBe(33)
    expect(comBairro.pedido.uf).toBe("SP")

    const semBairro = criar(entrega({ bairro: "Bairro Novo" }))
    if (!semBairro.ok) throw new Error(semBairro.erro)
    expect(semBairro.pedido.taxaEntrega).toBe(5)
  })

  it("troco menor que o total é recusado", () => {
    expect(criar(base({ trocoPara: 10 }))).toEqual({
      ok: false,
      erro: "O troco precisa ser para um valor maior que o total (R$ 18,00).",
    })
    const ok = criar(base({ trocoPara: 50 }))
    expect(ok.ok && ok.pedido.trocoPara).toBe(50)
  })

  it("Pix exige CPF válido e gera o código com validade de 30 minutos", () => {
    expect(criar(base({ pagamento: "Pix", cpf: "111.111.111-11" }))).toEqual({
      ok: false,
      erro: "Informe um CPF válido para gerar o Pix.",
    })
    const r = criar(base({ pagamento: "Pix", cpf: "529.982.247-25", email: "" }))
    if (!r.ok) throw new Error(r.erro)
    expect(r.pedido).toMatchObject({
      status: "AguardandoPagamento",
      statusPagamento: "Pendente",
      clienteCpf: "52998224725",
      clienteEmail: "cliente_52998224725@clickpedidoweb.com.br",
    })
    expect(r.pedido.pixCopiaECola).toBeTruthy()
    expect(r.pedido.pixExpiraEm).toBe("2026-10-18T19:30:00.000Z")
  })

  it("cartão online aguarda o pagamento no checkout", () => {
    const r = criar(base({ pagamento: "CartaoOnline" }))
    if (!r.ok) throw new Error(r.erro)
    expect(r.pedido.status).toBe("AguardandoPagamento")
    expect(r.pedido.pixCopiaECola).toBeNull()
  })

  it("mesa aceita sem nome e telefone, ignora pedido mínimo e ocupa a mesa", () => {
    const r = criar({
      tipo: "Mesa",
      pagamento: "Dinheiro",
      mesaId: 2,
      mesaNumero: 2,
      garcomNome: "Lucas",
      itens: [{ produtoId: 20, quantidade: 1 }],
    })
    if (!r.ok) throw new Error(r.erro)
    expect(r.pedido).toMatchObject({
      clienteNome: "Mesa 2",
      status: "Recebido",
      garcomNome: "Lucas",
    })
    expect(dados.mesas.find((m) => m.id === 2)).toMatchObject({
      status: "Ocupada",
      pedidoAtivoId: r.pedido.id,
    })
  })

  it("ids e token são novos a cada pedido", () => {
    const a = criar(base())
    const b = criar(base())
    if (!a.ok || !b.ok) throw new Error("falhou")
    expect(b.pedido.id).toBe(a.pedido.id + 1)
    expect(a.pedido.token).not.toBe(b.pedido.token)
    expect(a.pedido.token).toMatch(/^[0-9a-f]{32}$/)
  })
})
