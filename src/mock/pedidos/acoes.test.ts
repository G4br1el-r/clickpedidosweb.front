import { describe, expect, it } from "vitest"
import { banco } from "@/mock/banco"
import { consultarCep } from "@/mock/loja/acoes"
import { criarPedido, obterAcompanhamento, simularPagamento } from "./acoes"

const pedidoPix = () =>
  criarPedido({
    nome: "Maria",
    telefone: "12991234567",
    tipo: "Retirada",
    pagamento: "Pix",
    cpf: "529.982.247-25",
    itens: [{ produtoId: 1, quantidade: 2 }],
  })

describe("criarPedido / obterAcompanhamento", () => {
  it("cria e devolve o token; o acompanhamento traz etapas, itens e totais", async () => {
    const r = await criarPedido({
      nome: "Maria",
      telefone: "12991234567",
      tipo: "Entrega",
      pagamento: "Dinheiro",
      cep: "12630000",
      logradouro: "Rua A",
      numero: "1",
      bairro: "Centro",
      cidade: "Cachoeira Paulista",
      uf: "SP",
      itens: [{ produtoId: 1, quantidade: 2 }],
    })
    if (!r.ok) throw new Error(r.erro)
    const a = await obterAcompanhamento(r.token)
    expect(a).toMatchObject({
      numero: r.numero,
      status: "Recebido",
      statusTexto: "Pedido recebido",
      tipo: "Entrega",
      tempoEstimado: "40–60 min",
      final: false,
      total: 23,
      taxaEntrega: 5,
    })
    expect(a?.etapas.map((e) => e.titulo)).toEqual([
      "Pedido recebido",
      "Em preparo",
      "Pronto",
      "Saiu para entrega",
      "Entregue",
    ])
    expect(a?.etapas[0]).toMatchObject({ feito: true, atual: true })
    expect(a?.etapas[1]).toMatchObject({ feito: false, atual: false })
    expect(a?.itens).toHaveLength(1)
    expect(a?.endereco).toBe("Rua A, 1 – Centro, Cachoeira Paulista/SP")
  })

  it("token desconhecido devolve null", async () => {
    expect(await obterAcompanhamento("nao-existe")).toBeNull()
  })

  it("Pix aguardando mostra o copia e cola e some depois de pago", async () => {
    const r = await pedidoPix()
    if (!r.ok) throw new Error(r.erro)
    const antes = await obterAcompanhamento(r.token)
    expect(antes?.pixCopiaECola).toBeTruthy()
    expect(antes?.pago).toBe(false)

    await simularPagamento(r.token)
    const depois = await obterAcompanhamento(r.token)
    expect(depois).toMatchObject({ status: "Recebido", pago: true, pixCopiaECola: null })
  })

  it("o simulador confirma o Pix sozinho depois de 20 segundos", async () => {
    const r = await pedidoPix()
    if (!r.ok) throw new Error(r.erro)
    const daqui = new Date(Date.now() + 21_000)
    const a = await obterAcompanhamento(r.token, daqui)
    expect(a?.pago).toBe(true)
  })

  it("pagamento online pendente há mais de 60 minutos é cancelado", async () => {
    const r = await pedidoPix()
    if (!r.ok) throw new Error(r.erro)
    banco.atualizar((d) => {
      const p = d.pedidos.find((x) => x.token === r.token)
      if (p) p.criadoEm = new Date(Date.now() - 61 * 60_000).toISOString()
    })
    const a = await obterAcompanhamento(r.token, new Date(), { simularPix: false })
    expect(a).toMatchObject({ status: "Cancelado", final: true })
  })
})

describe("consultarCep (mock de GET /api/cep)", () => {
  it("CEP conhecido devolve endereço, atendimento e a taxa do bairro", async () => {
    const r = await consultarCep("12630-300")
    expect(r).toMatchObject({
      ok: true,
      endereco: {
        cidade: "Cachoeira Paulista",
        uf: "SP",
        bairro: "Embaú",
        atendido: true,
        taxaEntrega: 15,
      },
    })
  })

  it("cidade fora da área avisa que não é atendida", async () => {
    const r = await consultarCep("12600000")
    expect(r.ok && r.endereco.atendido).toBe(false)
  })

  it("CEP desconhecido", async () => {
    expect(await consultarCep("99999-999")).toEqual({ ok: false, erro: "CEP não encontrado." })
  })

  it("CEP incompleto", async () => {
    expect(await consultarCep("1263")).toEqual({ ok: false, erro: "Digite os 8 números do CEP." })
  })
})
