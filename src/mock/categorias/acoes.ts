import { banco, simularLatencia } from "@/mock/banco"
import { limitar } from "@/mock/regras/texto"
import type { Categoria } from "@/types/entidades"

type Resultado = { ok: true; mensagem: string } | { ok: false; erro: string }

// Replica CategoriasController.Index
export async function listarCategoriasAdmin(): Promise<
  Array<Categoria & { totalProdutos: number }>
> {
  await simularLatencia()
  const d = banco.ler()
  return [...d.categorias]
    .sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome, "pt-BR"))
    .map((c) => ({ ...c, totalProdutos: d.produtos.filter((p) => p.categoriaId === c.id).length }))
}

// Replica CategoriasController.Criar
export async function criarCategoria(nome: string, ordem: number): Promise<Resultado> {
  await simularLatencia()
  const limpo = limitar(nome, 60)
  if (!limpo) return { ok: false, erro: "Informe o nome da categoria." }
  banco.atualizar((d) => {
    d.categorias.push({ id: d.proximosIds.categoria++, nome: limpo, ordem, ativa: true })
  })
  return { ok: true, mensagem: `Categoria ${limpo} criada.` }
}

// Replica CategoriasController.Salvar
export async function salvarCategoria(
  id: number,
  nome: string,
  ordem: number,
  ativa: boolean,
): Promise<Resultado> {
  await simularLatencia()
  const limpo = limitar(nome, 60)
  if (!limpo) return { ok: false, erro: "O nome da categoria não pode ficar vazio." }
  let achou = false
  banco.atualizar((d) => {
    const c = d.categorias.find((x) => x.id === id)
    if (!c) return
    achou = true
    c.nome = limpo
    c.ordem = ordem
    c.ativa = ativa
  })
  return achou
    ? { ok: true, mensagem: `Categoria ${limpo} salva.` }
    : { ok: false, erro: "Categoria não encontrada." }
}

// Replica CategoriasController.Excluir
export async function excluirCategoria(id: number): Promise<Resultado> {
  await simularLatencia()
  const d = banco.ler()
  const c = d.categorias.find((x) => x.id === id)
  if (!c) return { ok: false, erro: "Categoria não encontrada." }
  if (d.produtos.some((p) => p.categoriaId === id))
    return {
      ok: false,
      erro: `A categoria ${c.nome} tem produtos. Mova ou exclua os produtos antes.`,
    }
  banco.atualizar((dados) => {
    dados.categorias = dados.categorias.filter((x) => x.id !== id)
  })
  return { ok: true, mensagem: `Categoria ${c.nome} excluída.` }
}
