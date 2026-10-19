import { describe, expect, it } from "vitest"
import {
  alternarBairro,
  criarBairro,
  editarBairro,
  excluirBairro,
  listarBairrosAdmin,
} from "@/mock/bairros/acoes"
import { banco } from "@/mock/banco"
import {
  criarCategoria,
  excluirCategoria,
  listarCategoriasAdmin,
  salvarCategoria,
} from "@/mock/categorias/acoes"
import { obterConfiguracoes, salvarConfiguracoes } from "@/mock/configuracoes/acoes"
import { excluirMotoboy, listarMotoboys, salvarMotoboy } from "@/mock/motoboys/acoes"
import {
  alternarProduto,
  excluirProduto,
  listarProdutosAdmin,
  obterProduto,
  salvarProduto,
} from "@/mock/produtos/acoes"

const imagemPng = "data:image/png;base64,iVBORw0KGgo="

describe("produtos (ProdutosController)", () => {
  it("lista todas as categorias com todos os produtos, inclusive inativos", async () => {
    banco.atualizar((d) => {
      const p = d.produtos.find((x) => x.id === 1)
      if (p) p.ativo = false
    })
    const lista = await listarProdutosAdmin()
    expect(lista[0]?.nome).toBe("Pastéis")
    expect(lista[0]?.produtos.find((p) => p.id === 1)?.ativo).toBe(false)
  })

  it("cria produto com preço em texto e foto; valida preço e categoria", async () => {
    expect(
      await salvarProduto({
        id: 0,
        categoriaId: 1,
        nome: "Pastel de Bacon",
        descricao: "",
        preco: "abc",
        ordem: 0,
        ativo: true,
        disponivel: true,
        imagem: null,
        removerImagem: false,
      }),
    ).toEqual({
      ok: false,
      erros: { preco: "Informe um preço válido, por exemplo 12,50." },
    })
    expect(
      await salvarProduto({
        id: 0,
        categoriaId: 999,
        nome: "X",
        descricao: "",
        preco: "10",
        ordem: 0,
        ativo: true,
        disponivel: true,
        imagem: null,
        removerImagem: false,
      }),
    ).toEqual({
      ok: false,
      erros: { categoriaId: "Escolha a categoria." },
    })
    const r = await salvarProduto({
      id: 0,
      categoriaId: 1,
      nome: "  Pastel de Bacon ",
      descricao: "Crocante",
      preco: "13,90",
      ordem: 7,
      ativo: true,
      disponivel: true,
      imagem: imagemPng,
      removerImagem: false,
    })
    if (!r.ok) throw new Error(JSON.stringify(r.erros))
    expect(await obterProduto(r.id)).toMatchObject({
      nome: "Pastel de Bacon",
      preco: 13.9,
      imagemUrl: imagemPng,
      categoriaId: 1,
    })
  })

  it("rejeita foto que não é JPG, PNG ou WEBP", async () => {
    const r = await salvarProduto({
      id: 1,
      categoriaId: 1,
      nome: "Pastel",
      descricao: "",
      preco: "9",
      ordem: 1,
      ativo: true,
      disponivel: true,
      imagem: "data:image/gif;base64,R0lGOD",
      removerImagem: false,
    })
    expect(r).toEqual({ ok: false, erros: { imagem: "Envie a foto em JPG, PNG ou WEBP." } })
  })

  it("editar mantém o grupo de opções e pode remover a foto", async () => {
    const r = await salvarProduto({
      id: 21,
      categoriaId: 6,
      nome: "Açaí Paçoca",
      descricao: "",
      preco: "19",
      ordem: 1,
      ativo: true,
      disponivel: true,
      imagem: null,
      removerImagem: true,
    })
    expect(r.ok).toBe(true)
    const p = await obterProduto(21)
    expect(p).toMatchObject({ preco: 19, imagemUrl: null })
    expect(p?.gruposOpcoes).toHaveLength(2)
  })

  it("alternar esgotado e visível, e excluir", async () => {
    await alternarProduto(1, "disponivel")
    expect((await obterProduto(1))?.disponivel).toBe(false)
    await alternarProduto(1, "ativo")
    expect((await obterProduto(1))?.ativo).toBe(false)
    expect(await excluirProduto(1)).toEqual({ ok: true, mensagem: "Pastel de Carne excluído." })
    expect(await obterProduto(1)).toBeNull()
  })
})

describe("categorias (CategoriasController)", () => {
  it("lista com a contagem de produtos", async () => {
    const c = await listarCategoriasAdmin()
    expect(c.find((x) => x.nome === "Pastéis")?.totalProdutos).toBe(6)
  })

  it("cria, renomeia e não exclui categoria com produtos", async () => {
    expect(await criarCategoria("  ", 1)).toEqual({
      ok: false,
      erro: "Informe o nome da categoria.",
    })
    const r = await criarCategoria("Sobremesas", 12)
    expect(r).toEqual({ ok: true, mensagem: "Categoria Sobremesas criada." })
    const nova = (await listarCategoriasAdmin()).find((c) => c.nome === "Sobremesas")
    expect(await salvarCategoria(nova?.id ?? 0, "Doces", 12, false)).toEqual({
      ok: true,
      mensagem: "Categoria Doces salva.",
    })
    expect(await excluirCategoria(1)).toEqual({
      ok: false,
      erro: "A categoria Pastéis tem produtos. Mova ou exclua os produtos antes.",
    })
    expect(await excluirCategoria(nova?.id ?? 0)).toEqual({
      ok: true,
      mensagem: "Categoria Doces excluída.",
    })
  })
})

describe("bairros (BairrosController)", () => {
  it("filtra por cidade e busca, e lista as cidades", async () => {
    const r = await listarBairrosAdmin({ busca: "jardim" })
    expect(r.bairros.every((b) => b.nome.toLowerCase().includes("jardim"))).toBe(true)
    expect(r.cidades).toEqual(["Cachoeira Paulista"])
  })

  it("cria com cidade padrão, edita, alterna e exclui", async () => {
    expect(await criarBairro("", "Novo", "abc")).toEqual({
      ok: false,
      erro: "Taxa de entrega inválida.",
    })
    expect(await criarBairro("", "", "5")).toEqual({
      ok: false,
      erro: "O nome do bairro é obrigatório.",
    })
    expect(await criarBairro("", "Vila Nova", "7,50")).toEqual({
      ok: true,
      mensagem: "Bairro 'Vila Nova' cadastrado com sucesso.",
    })
    const novo = (await listarBairrosAdmin({ busca: "Vila Nova" })).bairros.find(
      (b) => b.nome === "Vila Nova",
    )
    expect(novo).toMatchObject({ cidade: "Cachoeira Paulista", taxa: 7.5, ativo: true })
    expect(await editarBairro(novo?.id ?? 0, "Canas", "Vila Nova", "9", true)).toEqual({
      ok: true,
      mensagem: "Bairro 'Vila Nova' atualizado com sucesso.",
    })
    expect(await alternarBairro(novo?.id ?? 0)).toEqual({
      ok: true,
      mensagem: "Bairro 'Vila Nova' agora está inativo.",
    })
    expect(await excluirBairro(novo?.id ?? 0)).toEqual({
      ok: true,
      mensagem: "Bairro 'Vila Nova' excluído com sucesso.",
    })
  })
})

describe("motoboys (MotoboysController)", () => {
  it("lista ativos primeiro, valida e salva", async () => {
    expect((await listarMotoboys()).map((m) => m.nome)).toEqual(["Diego", "Rodrigo", "Tiago"])
    expect(await salvarMotoboy(0, "Zé", "123", true)).toEqual({
      ok: false,
      erro: "Informe o nome e o WhatsApp do motoboy com DDD.",
    })
    expect(await salvarMotoboy(0, "Zé", "(12) 98888-7777", false)).toEqual({
      ok: true,
      mensagem: "Motoboy Zé salvo.",
    })
    const ze = (await listarMotoboys()).find((m) => m.nome === "Zé")
    expect(ze).toMatchObject({ telefone: "12988887777", ativo: true })
    expect(await excluirMotoboy(ze?.id ?? 0)).toEqual({
      ok: true,
      mensagem: "Motoboy Zé removido.",
    })
  })
})

describe("configurações (ConfiguracoesController)", () => {
  it("devolve os horários de segunda a domingo", async () => {
    const c = await obterConfiguracoes()
    expect(c.horarios.map((h) => h.diaSemana)).toEqual([1, 2, 3, 4, 5, 6, 0])
  })

  it("valida valores em reais e salva loja e horários", async () => {
    const c = await obterConfiguracoes()
    expect(
      await salvarConfiguracoes({ ...c, taxaEntregaTexto: "x", pedidoMinimoTexto: "15" }),
    ).toEqual({
      ok: false,
      erros: { taxaEntregaTexto: "Taxa de entrega inválida." },
    })
    const horarios = c.horarios.map((h) => (h.diaSemana === 1 ? { ...h, aberto: false } : h))
    const r = await salvarConfiguracoes({
      ...c,
      loja: {
        ...c.loja,
        nomeLoja: "  Quiosque do Mineiro ",
        whatsApp: "(12) 99707-3047",
        horario: "",
      },
      horarios,
      taxaEntregaTexto: "6,50",
      pedidoMinimoTexto: "20",
    })
    expect(r).toEqual({
      ok: true,
      mensagem: "Configurações e horários de funcionamento salvos com sucesso.",
    })
    const d = banco.ler()
    expect(d.loja).toMatchObject({
      nomeLoja: "Quiosque do Mineiro",
      whatsApp: "12997073047",
      taxaEntrega: 6.5,
      pedidoMinimo: 20,
    })
    expect(d.loja.horario).toBe("Terça a Domingo, das 10:00 às 22:00")
    expect(d.horarios.find((h) => h.diaSemana === 1)?.aberto).toBe(false)
  })
})
