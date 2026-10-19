import { bairrosIniciais, categoriasIniciais, produtosIniciais } from "../cardapio/dados"
import { horariosIniciais, lojaInicial } from "../loja/dados"
import { type BancoDados, VERSAO_BANCO } from "./esquema"

const maiorId = (lista: { id: number }[]) => lista.reduce((m, x) => Math.max(m, x.id), 0)

export function dadosIniciais(): BancoDados {
  const grupos = produtosIniciais.flatMap((p) => p.gruposOpcoes)
  return structuredClone({
    versao: VERSAO_BANCO,
    loja: lojaInicial,
    horarios: horariosIniciais,
    categorias: categoriasIniciais,
    produtos: produtosIniciais,
    bairros: bairrosIniciais,
    pedidos: [],
    mesas: [],
    motoboys: [],
    usuarios: [],
    proximosIds: {
      categoria: maiorId(categoriasIniciais) + 1,
      produto: maiorId(produtosIniciais) + 1,
      grupo: maiorId(grupos) + 1,
      item: maiorId(grupos.flatMap((g) => g.itens)) + 1,
      bairro: maiorId(bairrosIniciais) + 1,
      pedido: 1,
      pedidoItem: 1,
      mesa: 1,
      motoboy: 1,
    },
  })
}
