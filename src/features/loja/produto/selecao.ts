import type { OpcaoSelecionada } from "@/mock/regras/preco"
import type { Produto, ProdutoOpcaoGrupo } from "@/types/entidades"

/** grupoId → itemId → quantidade */
export type Selecao = Record<number, Record<number, number>>

/** Porta de cardapio.js: grupo de escolha única obrigatório já vem com a primeira opção. */
export function selecaoInicial(produto: Produto): Selecao {
  const selecao: Selecao = {}
  for (const g of produto.gruposOpcoes) {
    selecao[g.id] = {}
    const primeiro = g.itens[0]
    if (g.minimo === 1 && g.maximo === 1 && primeiro) selecao[g.id] = { [primeiro.id]: 1 }
  }
  return selecao
}

export const totalDoGrupo = (selecao: Selecao, grupoId: number) =>
  Object.values(selecao[grupoId] ?? {}).reduce((s, q) => s + q, 0)

export function escolherUnico(selecao: Selecao, grupoId: number, itemId: number): Selecao {
  return { ...selecao, [grupoId]: { [itemId]: 1 } }
}

export function alterarItem(
  selecao: Selecao,
  grupo: ProdutoOpcaoGrupo,
  itemId: number,
  delta: number,
): Selecao {
  const atual = selecao[grupo.id]?.[itemId] ?? 0
  const nova = Math.max(0, atual + delta)
  if (
    delta > 0 &&
    grupo.maximo > 0 &&
    totalDoGrupo(selecao, grupo.id) - atual + nova > grupo.maximo
  )
    return selecao
  const doGrupo = { ...(selecao[grupo.id] ?? {}) }
  if (nova === 0) delete doGrupo[itemId]
  else doGrupo[itemId] = nova
  return { ...selecao, [grupo.id]: doGrupo }
}

/** Lista para o pedido, na ordem dos grupos e itens do cardápio. */
export function paraOpcoes(produto: Produto, selecao: Selecao): OpcaoSelecionada[] {
  return produto.gruposOpcoes.flatMap((g) =>
    g.itens
      .filter((i) => (selecao[g.id]?.[i.id] ?? 0) > 0)
      .map((i) => ({ grupoId: g.id, itemId: i.id, quantidade: selecao[g.id]?.[i.id] ?? 0 })),
  )
}

/** Etiqueta da regra do grupo, no tom do cardápio atual. */
export function regraDoGrupo(grupo: ProdutoOpcaoGrupo, total: number): string {
  if (grupo.gratisAte > 0) {
    const cobrados = Math.max(0, total - grupo.gratisAte)
    const escolhidos = `${total} ${total === 1 ? "escolhido" : "escolhidos"}`
    return `${grupo.gratisAte} inclusos · ${escolhidos}${cobrados > 0 ? ` · +${cobrados} cobrado${cobrados > 1 ? "s" : ""}` : ""}`
  }
  if (grupo.maximo === 1) return "Escolha 1"
  if (grupo.maximo > 1)
    return total > 0
      ? `Até ${grupo.maximo} · ${total} ${total === 1 ? "escolhido" : "escolhidos"}`
      : `Até ${grupo.maximo}`
  return total > 0 ? `${total} ${total === 1 ? "escolhido" : "escolhidos"}` : "À vontade"
}
