import { banco, simularLatencia } from "@/mock/banco"
import { lerDecimal, limitar } from "@/mock/regras/texto"
import type { Categoria, Produto } from "@/types/entidades"

const TIPOS_FOTO = ["image/jpeg", "image/png", "image/webp"]
/** 3 MB, como no backend (o data URL em base64 fica ~4/3 do arquivo). */
export const TAMANHO_MAXIMO_FOTO = 3 * 1024 * 1024

export interface ProdutoForm {
  id: number
  categoriaId: number
  nome: string
  descricao: string
  preco: string
  ordem: number
  ativo: boolean
  disponivel: boolean
  /** Foto nova em data URL (no backend vai para wwwroot/uploads/produtos). */
  imagem: string | null
  removerImagem: boolean
}

type ErrosProduto = Partial<Record<"nome" | "preco" | "categoriaId" | "imagem", string>>

export type CategoriaComProdutos = Categoria & { produtos: Produto[] }

const porOrdem = <T extends { ordem: number; nome: string }>(a: T, b: T) =>
  a.ordem - b.ordem || a.nome.localeCompare(b.nome, "pt-BR")

// Replica ProdutosController.Index
export async function listarProdutosAdmin(): Promise<CategoriaComProdutos[]> {
  await simularLatencia()
  const d = banco.ler()
  return [...d.categorias].sort(porOrdem).map((c) => ({
    ...c,
    produtos: d.produtos.filter((p) => p.categoriaId === c.id).sort(porOrdem),
  }))
}

// Replica ProdutosController.Editar (GET)
export async function obterProduto(id: number): Promise<Produto | null> {
  await simularLatencia(80, 200)
  return banco.ler().produtos.find((p) => p.id === id) ?? null
}

function validarFoto(dataUrl: string): string | null {
  const tipo = /^data:([^;]+);base64,/.exec(dataUrl)?.[1]
  if (!tipo || !TIPOS_FOTO.includes(tipo)) return "Envie a foto em JPG, PNG ou WEBP."
  const bytes = Math.floor(((dataUrl.length - dataUrl.indexOf(",") - 1) * 3) / 4)
  if (bytes > TAMANHO_MAXIMO_FOTO) return "A foto deve ter até 3 MB."
  return null
}

// Replica ProdutosController.Salvar
export async function salvarProduto(
  form: ProdutoForm,
): Promise<{ ok: true; id: number; mensagem: string } | { ok: false; erros: ErrosProduto }> {
  await simularLatencia()
  const dados = banco.ler()
  const erros: ErrosProduto = {}
  const nome = limitar(form.nome, 80)
  if (!nome) erros.nome = "Informe o nome do produto."
  const preco = lerDecimal(form.preco)
  if (preco === null || preco <= 0 || preco > 9999)
    erros.preco = "Informe um preço válido, por exemplo 12,50."
  if (!dados.categorias.some((c) => c.id === form.categoriaId))
    erros.categoriaId = "Escolha a categoria."
  if (form.imagem) {
    const erroFoto = validarFoto(form.imagem)
    if (erroFoto) erros.imagem = erroFoto
  }
  if (Object.keys(erros).length > 0 || !nome || preco === null) return { ok: false, erros }

  let id = form.id
  banco.atualizar((d) => {
    let p = d.produtos.find((x) => x.id === form.id)
    if (!p) {
      id = d.proximosIds.produto++
      p = {
        id,
        categoriaId: form.categoriaId,
        nome,
        descricao: null,
        preco,
        imagemUrl: null,
        ativo: true,
        disponivel: true,
        ordem: 0,
        gruposOpcoes: [],
      }
      d.produtos.push(p)
    }
    p.categoriaId = form.categoriaId
    p.nome = nome
    p.descricao = limitar(form.descricao, 300)
    p.preco = Math.round(preco * 100) / 100
    p.ordem = form.ordem
    p.ativo = form.ativo
    p.disponivel = form.disponivel
    if (form.imagem) p.imagemUrl = form.imagem
    else if (form.removerImagem) p.imagemUrl = null
  })
  return { ok: true, id, mensagem: `${nome} salvo.` }
}

// Replica ProdutosController.Alternar
export async function alternarProduto(id: number, campo: "disponivel" | "ativo"): Promise<void> {
  await simularLatencia(80, 200)
  banco.atualizar((d) => {
    const p = d.produtos.find((x) => x.id === id)
    if (p) p[campo] = !p[campo]
  })
}

// Replica ProdutosController.Excluir
export async function excluirProduto(
  id: number,
): Promise<{ ok: true; mensagem: string } | { ok: false; erro: string }> {
  await simularLatencia()
  const p = banco.ler().produtos.find((x) => x.id === id)
  if (!p) return { ok: false, erro: "Produto não encontrado." }
  banco.atualizar((d) => {
    d.produtos = d.produtos.filter((x) => x.id !== id)
  })
  return { ok: true, mensagem: `${p.nome} excluído.` }
}
