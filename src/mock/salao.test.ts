import { describe, expect, it } from "vitest"
import { banco } from "@/mock/banco"
import { avancarNaCozinha, obterCozinha } from "@/mock/cozinha/acoes"
import { lancarNaMesa, obterCardapioGarcom } from "@/mock/garcom/acoes"
import {
  criarMesa,
  excluirMesa,
  fecharConta,
  liberarMesa,
  listarMesas,
  obterMesa,
} from "@/mock/mesas/acoes"

const mesa = (numero: number) => banco.ler().mesas.find((m) => m.numero === numero)
const pedido = (id: number | null | undefined) => banco.ler().pedidos.find((p) => p.id === id)

describe("mesas", () => {
  it("lista por número com a comanda ativa", async () => {
    const mesas = await listarMesas()
    expect(mesas.map((m) => m.numero)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    const quatro = mesas.find((m) => m.numero === 4)
    expect(quatro?.status).toBe("Ocupada")
    expect(quatro?.pedido?.tipo).toBe("Mesa")
    expect(mesas.find((m) => m.numero === 1)?.pedido).toBeNull()
  })

  it("cria mesa com nome padrão e recusa número repetido ou inválido", async () => {
    expect(await criarMesa(0, "")).toEqual({
      ok: false,
      erro: "Informe um número válido para a mesa.",
    })
    expect(await criarMesa(3, "")).toEqual({
      ok: false,
      erro: "Já existe uma mesa com o número 3.",
    })
    expect(await criarMesa(11, "  ")).toEqual({ ok: true, mensagem: "Mesa 11 cadastrada." })
    expect(mesa(11)).toMatchObject({ nome: "Mesa 11", status: "Livre", ativa: true })
    await criarMesa(12, " Varanda ")
    expect(mesa(12)?.nome).toBe("Varanda")
  })

  it("não exclui mesa ocupada", async () => {
    const quatro = mesa(4)
    expect(await excluirMesa(quatro?.id ?? 0)).toEqual({
      ok: false,
      erro: "A mesa 4 está ocupada. Finalize a comanda antes de excluir.",
    })
    expect(await excluirMesa(mesa(1)?.id ?? 0)).toEqual({ ok: true, mensagem: "Mesa 1 excluída." })
    expect(mesa(1)).toBeUndefined()
  })

  it("fechar conta conclui, marca pago com a forma escolhida e libera a mesa", async () => {
    const quatro = mesa(4)
    const pedidoId = quatro?.pedidoAtivoId
    expect(await fecharConta(quatro?.id ?? 0, "CartaoNaEntrega")).toEqual({
      ok: true,
      mensagem: "Mesa 4 finalizada e liberada com sucesso.",
    })
    expect(pedido(pedidoId)).toMatchObject({
      status: "Concluido",
      statusPagamento: "Pago",
      pagamento: "CartaoNaEntrega",
    })
    expect(pedido(pedidoId)?.pagoEm).toBeTruthy()
    expect(mesa(4)).toMatchObject({
      status: "Livre",
      pedidoAtivoId: null,
      clienteNome: null,
      ocupadaEm: null,
    })
  })

  it("liberar só solta a mesa", async () => {
    const pedidoId = mesa(4)?.pedidoAtivoId
    const statusAntes = pedido(pedidoId)?.status
    expect(await liberarMesa(mesa(4)?.id ?? 0)).toEqual({ ok: true, mensagem: "Mesa 4 liberada." })
    expect(mesa(4)?.status).toBe("Livre")
    expect(pedido(pedidoId)?.status).toBe(statusAntes)
  })

  it("obterMesa traz a comanda ou nulo", async () => {
    expect((await obterMesa(4))?.pedido?.id).toBe(mesa(4)?.pedidoAtivoId)
    expect(await obterMesa(999)).toBeNull()
  })
})

describe("garçom", () => {
  it("vê categorias ativas com todos os produtos, inclusive esgotados", async () => {
    banco.atualizar((d) => {
      const p = d.produtos[0]
      if (p) p.disponivel = false
    })
    const { categorias, mesas } = await obterCardapioGarcom()
    const primeiro = banco.ler().produtos[0]
    expect(categorias.flatMap((c) => c.produtos).some((p) => p.id === primeiro?.id)).toBe(true)
    expect(mesas).toHaveLength(10)
  })

  it("exige mesa e itens", async () => {
    expect(await lancarNaMesa({ mesaId: null, itens: [] })).toEqual({
      ok: false,
      erro: "Selecione a mesa para lançar o pedido.",
    })
    expect(await lancarNaMesa({ mesaId: 999, itens: [] })).toEqual({
      ok: false,
      erro: "Mesa não encontrada.",
    })
    expect(await lancarNaMesa({ mesaId: mesa(4)?.id ?? 0, itens: [] })).toEqual({
      ok: false,
      erro: "Nenhum item selecionado.",
    })
  })

  it("mesa livre abre comanda nova em dinheiro, ocupando a mesa", async () => {
    const r = await lancarNaMesa({
      mesaId: mesa(2)?.id ?? 0,
      garcomNome: "Ana",
      clienteNome: "Família Souza",
      itens: [{ produtoId: 1, quantidade: 2 }],
    })
    expect(r).toMatchObject({ ok: true, mensagem: "Pedido da Mesa 2 enviado para a cozinha!" })
    const dois = mesa(2)
    expect(dois).toMatchObject({ status: "Ocupada", clienteNome: "Família Souza" })
    expect(pedido(dois?.pedidoAtivoId)).toMatchObject({
      tipo: "Mesa",
      mesaNumero: 2,
      garcomNome: "Ana",
      pagamento: "Dinheiro",
      status: "Recebido",
    })
  })

  it("mesa com comanda soma os itens e devolve para a cozinha", async () => {
    const quatro = mesa(4)
    const antes = pedido(quatro?.pedidoAtivoId)
    banco.atualizar((d) => {
      const p = d.pedidos.find((x) => x.id === antes?.id)
      if (p) p.status = "Pronto"
    })
    const r = await lancarNaMesa({
      mesaId: quatro?.id ?? 0,
      garcomNome: "Bia",
      itens: [{ produtoId: 1, quantidade: 1, observacao: "sem cebola" }],
    })
    expect(r).toMatchObject({
      ok: true,
      mensagem: "Itens adicionados à comanda da Mesa 4 e enviados para a cozinha!",
    })
    const depois = pedido(quatro?.pedidoAtivoId)
    const preco = banco.ler().produtos.find((p) => p.id === 1)?.preco ?? 0
    expect(depois?.itens).toHaveLength((antes?.itens.length ?? 0) + 1)
    expect(depois?.total).toBeCloseTo((antes?.total ?? 0) + preco)
    expect(depois?.subtotal).toBe(depois?.total)
    expect(depois).toMatchObject({ status: "Recebido", garcomNome: "Bia" })
    expect(depois?.itens.at(-1)?.observacao).toBe("sem cebola")
  })

  it("comanda servida pela cozinha continua a mesma na próxima rodada", async () => {
    const quatro = mesa(4)
    const id = quatro?.pedidoAtivoId ?? 0
    banco.atualizar((d) => {
      const p = d.pedidos.find((x) => x.id === id)
      if (p) p.status = "Pronto"
    })
    await avancarNaCozinha(id)
    expect(pedido(id)?.status).toBe("Concluido")
    expect(pedido(id)?.statusPagamento).toBe("NaEntrega")
    expect(mesa(4)?.pedidoAtivoId).toBe(id)

    await lancarNaMesa({ mesaId: quatro?.id ?? 0, itens: [{ produtoId: 1, quantidade: 1 }] })
    expect(mesa(4)?.pedidoAtivoId).toBe(id)
    expect(pedido(id)?.status).toBe("Recebido")
  })
})

describe("cozinha", () => {
  it("mostra recebidos, em preparo e prontos por ordem de chegada", async () => {
    const { pedidos } = await obterCozinha()
    expect(pedidos.length).toBeGreaterThan(0)
    expect(pedidos.every((p) => ["Recebido", "EmPreparo", "Pronto"].includes(p.status))).toBe(true)
    const horas = pedidos.map((p) => p.criadoEm)
    expect(horas).toEqual([...horas].sort())
  })

  it("avança entrega pronta para em rota e retirada pronta para concluído", async () => {
    const { pedidos } = await obterCozinha()
    const entrega = pedidos.find((p) => p.tipo === "Entrega" && p.status === "Pronto")
    if (entrega) {
      expect(await avancarNaCozinha(entrega.id)).toEqual({ ok: true, status: "SaiuParaEntrega" })
    }
    const recebido = pedidos.find((p) => p.status === "Recebido")
    expect(await avancarNaCozinha(recebido?.id ?? 0)).toEqual({ ok: true, status: "EmPreparo" })
    expect(await avancarNaCozinha(999)).toEqual({ ok: false, erro: "Pedido não encontrado." })
  })
})
