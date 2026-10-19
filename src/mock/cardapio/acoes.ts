import { banco, simularLatencia } from "@/mock/banco"
import { type LojaPublica, lojaPublica } from "@/mock/loja/publica"
import type { Categoria, Produto } from "@/types/entidades"

export interface CategoriaCardapio extends Categoria {
  produtos: Produto[]
}

export interface Cardapio {
  loja: LojaPublica
  categorias: CategoriaCardapio[]
}

const porOrdemENome = <T extends { ordem: number; nome: string }>(a: T, b: T) =>
  a.ordem - b.ordem || a.nome.localeCompare(b.nome, "pt-BR")

// Replica GET /api/cardapio (+ filtro de categorias vazias de HomeController.MontarCardapioAsync)
export async function obterCardapio(): Promise<Cardapio> {
  await simularLatencia()
  const dados = banco.ler()

  const categorias = dados.categorias
    .filter((c) => c.ativa)
    .sort(porOrdemENome)
    .map((c) => ({
      ...c,
      produtos: dados.produtos
        .filter((p) => p.categoriaId === c.id && p.ativo)
        .sort(porOrdemENome)
        .map((p) => ({
          ...p,
          gruposOpcoes: p.gruposOpcoes
            .filter((g) => g.ativo)
            .sort((a, b) => a.ordem - b.ordem)
            .map((g) => ({
              ...g,
              itens: g.itens.filter((i) => i.ativo).sort((a, b) => a.ordem - b.ordem),
            })),
        })),
    }))
    .filter((c) => c.produtos.length > 0)

  return { loja: lojaPublica(dados), categorias }
}
