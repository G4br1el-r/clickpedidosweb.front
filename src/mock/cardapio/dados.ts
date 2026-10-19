import type { BairroEntrega, Categoria, Produto } from "@/types/entidades"
import snapshot from "./cardapio-inicial.json"
import { fotoDoProduto } from "./fotos"

// Snapshot de GET /api/cardapio da loja real (18/10/2026). Ele é mais fiel que o Seed.cs,
// que difere do banco em produção. A API só manda o que é ativo, então tudo nasce ativo e a
// ordem vem da posição no snapshot.

export const categoriasIniciais: Categoria[] = snapshot.categorias.map((c, i) => ({
  id: c.id,
  nome: c.nome,
  ordem: i + 1,
  ativa: true,
}))

export const produtosIniciais: Produto[] = snapshot.categorias.flatMap((c) =>
  c.produtos.map((p, i) => ({
    id: p.id,
    categoriaId: c.id,
    nome: p.nome,
    descricao: p.descricao,
    preco: p.preco,
    imagemUrl: p.imagemUrl ?? fotoDoProduto(p.id),
    ativo: true,
    disponivel: p.disponivel,
    ordem: i + 1,
    gruposOpcoes: p.gruposOpcoes.map((g, gi) => ({
      id: g.id,
      produtoId: p.id,
      nome: g.nome,
      minimo: g.minimo,
      maximo: g.maximo,
      gratisAte: g.gratisAte,
      ordem: gi + 1,
      ativo: true,
      itens: g.itens.map((it, ii) => ({
        id: it.id,
        grupoId: g.id,
        nome: it.nome,
        precoAdicional: it.precoAdicional,
        ordem: ii + 1,
        ativo: true,
      })),
    })),
  })),
)

export const bairrosIniciais: BairroEntrega[] = snapshot.bairrosEntrega.map((b, i) => ({
  id: b.id,
  cidade: b.cidade,
  nome: b.nome,
  taxa: b.taxa,
  ativo: true,
  ordem: i + 1,
}))
