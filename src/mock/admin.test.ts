import { describe, expect, it } from "vitest"
import { banco } from "@/mock/banco"
import { entrar, obterSessao, sair, trocarSenha } from "@/mock/conta/acoes"
import { obterDashboard } from "@/mock/dashboard/acoes"
import {
  abrirFecharLoja,
  avancarPedido,
  cancelarPedido,
  definirMotoboy,
  obterFila,
} from "@/mock/fila/acoes"
import {
  listarPedidos,
  marcarImpresso,
  marcarPago,
  mudarStatus,
  obterPedidoAdmin,
} from "@/mock/pedidos/admin"
import { paraCliente, paraMotoboy } from "@/mock/regras/mensagens"

describe("conta (Admin/Conta)", () => {
  it("entra com o login de teste e cria a sessão", async () => {
    expect(await entrar("admin", "errada")).toEqual({
      ok: false,
      erro: "Login ou senha incorretos.",
    })
    const r = await entrar(" admin ", "clickpedido")
    expect(r).toEqual({ ok: true, nome: "Administrador" })
    expect(obterSessao()?.nome).toBe("Administrador")
    sair()
    expect(obterSessao()).toBeNull()
  })

  it("sessão expira em 12 horas", async () => {
    await entrar("admin", "clickpedido")
    expect(obterSessao(new Date(Date.now() + 13 * 3600_000))).toBeNull()
  })

  it("trocar senha confere a atual e exige 8 caracteres", async () => {
    await entrar("admin", "clickpedido")
    expect(await trocarSenha("x", "novasenha123")).toEqual({
      ok: false,
      erro: "Senha atual incorreta.",
    })
    expect(await trocarSenha("clickpedido", "curta")).toEqual({
      ok: false,
      erro: "A nova senha precisa ter pelo menos 8 caracteres.",
    })
    expect(await trocarSenha("clickpedido", "novasenha123")).toEqual({ ok: true })
    expect((await entrar("admin", "novasenha123")).ok).toBe(true)
  })
})

describe("dashboard (DashboardController)", () => {
  it("conta só os pedidos válidos do dia", async () => {
    const d = await obterDashboard()
    // Exemplos: 10 pedidos; 1 aguardando pagamento e 1 cancelado ficam fora.
    expect(d.pedidos).toBe(8)
    expect(d.aguardandoPagamento).toBe(1)
    expect(d.cancelados).toBe(1)
    expect(d.emAndamento).toBe(6)
    expect(d.ticketMedio).toBeCloseTo(d.faturamento / 8, 2)
    expect(d.topProdutos[0]).toMatchObject({
      nome: expect.any(String),
      quantidade: expect.any(Number),
    })
    expect(d.ultimos).toHaveLength(8)
  })
})

describe("fila (GET /api/admin/fila e ações)", () => {
  it("lista só pedidos em andamento, do mais antigo para o mais novo", async () => {
    const f = await obterFila()
    expect(f.pedidos.map((p) => p.status)).not.toContain("AguardandoPagamento")
    expect(f.pedidos.map((p) => p.status)).not.toContain("Concluido")
    const horarios = f.pedidos.map((p) => p.criadoEm)
    expect([...horarios].sort()).toEqual(horarios)
    expect(f).toMatchObject({ lojaAberta: true, concluidosHoje: 2, aguardandoPagamento: 1 })
    expect(f.motoboys.map((m) => m.nome)).toEqual(["Diego", "Rodrigo"])
  })

  it("avançar segue a regra do backend e devolve o novo status", async () => {
    expect(await avancarPedido(1)).toEqual({ ok: true, status: "EmPreparo" })
    expect(await avancarPedido(8)).toEqual({
      ok: false,
      erro: "Este pedido não tem próxima etapa.",
    })
    expect(await avancarPedido(999)).toEqual({ ok: false, erro: "Pedido não encontrado." })
  })

  it("cancelar", async () => {
    expect(await cancelarPedido(2)).toEqual({ ok: true, status: "Cancelado" })
  })

  it("motoboy só para entrega, só ativo, e devolve o WhatsApp com os dados", async () => {
    expect(await definirMotoboy(2, 1)).toEqual({
      ok: false,
      erro: "Pedido de retirada não precisa de motoboy.",
    })
    expect(await definirMotoboy(1, 3)).toEqual({ ok: false, erro: "Escolha um motoboy ativo." })
    const r = await definirMotoboy(1, 1)
    expect(r.ok && r.whatsappUrl).toMatch(/^https:\/\/wa\.me\/5512991110001\?text=/)
    expect(banco.ler().pedidos.find((p) => p.id === 1)?.motoboyId).toBe(1)
  })

  it("abrir e fechar a loja", async () => {
    expect(await abrirFecharLoja(false)).toEqual({ lojaAberta: false })
    expect(banco.ler().loja.lojaAberta).toBe(false)
  })
})

describe("pedidos do admin (PedidosController)", () => {
  it("lista o dia, filtra por status e ordena do mais novo", async () => {
    const todos = await listarPedidos({})
    expect(todos).toHaveLength(10)
    expect(todos[0]?.id).toBe(7)
    expect((await listarPedidos({ status: "Concluido" })).map((p) => p.id).sort()).toEqual([8, 9])
    expect(await listarPedidos({ data: "2020-01-01" })).toEqual([])
  })

  it("detalhe traz motoboys ativos e o link do WhatsApp do cliente", async () => {
    const d = await obterPedidoAdmin(1, "https://loja.test")
    expect(d?.pedido.id).toBe(1)
    expect(d?.motoboys.map((m) => m.nome)).toEqual(["Diego", "Rodrigo"])
    expect(decodeURIComponent(d?.whatsappCliente ?? "")).toContain(
      "https://loja.test/pedido/exemplo01",
    )
  })

  it("mudar status, marcar pago e marcar impresso", async () => {
    expect(await mudarStatus(1, "Pronto")).toEqual({ ok: true, mensagem: "Pedido #1: Pronto." })
    expect(await mudarStatus(1, "Cancelado")).toEqual({
      ok: true,
      mensagem: "Pedido #1: Cancelado.",
    })
    expect(await marcarPago(7)).toEqual({ ok: true, mensagem: "Pedido #7: Pedido recebido." })
    await marcarImpresso(1)
    expect(banco.ler().pedidos.find((p) => p.id === 1)?.impressoEm).toBeTruthy()
  })
})

describe("mensagens (Infra/Rotulos.cs: Mensagens)", () => {
  const pedido = () => {
    const p = banco.ler().pedidos.find((x) => x.id === 1)
    if (!p) throw new Error("sem pedido")
    return p
  }

  it("para o motoboy: endereço, cobrança com troco e mapa", () => {
    const texto = paraMotoboy(pedido(), banco.ler().loja)
    expect(texto).toContain("*Quiosque do Mineiro* – entrega do pedido #1")
    expect(texto).toContain("Cliente: Mariana Souza – (12) 99123-4567")
    expect(texto).toMatch(
      /Cobrar: R\$\s35,00 \(Dinheiro\) – levar R\$\s15,00 de troco \(cliente paga com R\$\s50,00\)/,
    )
    expect(texto).toContain("Mapa: https://www.google.com/maps/search/?api=1&query=")
  })

  it("para o cliente: primeiro nome, status e link", () => {
    expect(paraCliente(pedido(), banco.ler().loja, "https://x/pedido/1")).toBe(
      "Olá, Mariana! Aqui é do Quiosque do Mineiro. Seu pedido #1 está: Pedido recebido. Acompanhe aqui: https://x/pedido/1",
    )
  })
})
