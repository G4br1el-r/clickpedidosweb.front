import type { Produto } from "@/types/entidades"

export interface OpcaoSelecionada {
  grupoId: number
  itemId: number
  quantidade: number
}

const selecionadasDoGrupo = (opcoes: OpcaoSelecionada[], grupoId: number) =>
  opcoes.filter((o) => o.grupoId === grupoId && o.quantidade > 0)

// Porta de PedidoService.CriarAsync (validação de mínimo e máximo por grupo ativo).
export function validarOpcoes(produto: Produto, opcoes: OpcaoSelecionada[]): string | null {
  for (const grupo of produto.gruposOpcoes.filter((g) => g.ativo)) {
    const total = selecionadasDoGrupo(opcoes, grupo.id).reduce((s, o) => s + o.quantidade, 0)
    if (grupo.minimo > 0 && total < grupo.minimo)
      return `Escolha ao menos ${grupo.minimo} opção em '${grupo.nome}'.`
    if (grupo.maximo > 0 && total > grupo.maximo)
      return `Máximo de ${grupo.maximo} opções permitidas em '${grupo.nome}'.`
  }
  return null
}

// Porta de PedidoService.CriarAsync (preço final do item e resumo das opções).
export function calcularItem(
  produto: Produto,
  opcoes: OpcaoSelecionada[],
): { precoUnitario: number; resumo: string | null } {
  let extra = 0
  const partesResumo: string[] = []

  for (const grupo of produto.gruposOpcoes.filter((g) => g.ativo)) {
    const itensAtivos = new Map(grupo.itens.filter((i) => i.ativo).map((i) => [i.id, i]))
    const precosUnitarios: number[] = []
    const descricoes: string[] = []

    for (const sel of selecionadasDoGrupo(opcoes, grupo.id)) {
      const item = itensAtivos.get(sel.itemId)
      if (!item) continue
      for (let k = 0; k < sel.quantidade; k++) precosUnitarios.push(item.precoAdicional)
      descricoes.push(sel.quantidade > 1 ? `${sel.quantidade}x ${item.nome}` : item.nome)
    }

    // As primeiras "gratisAte" unidades são grátis, começando pelas mais baratas.
    const aCobrar =
      grupo.gratisAte > 0
        ? [...precosUnitarios].sort((a, b) => a - b).slice(grupo.gratisAte)
        : precosUnitarios
    extra += aCobrar.reduce((s, p) => s + p, 0)

    if (descricoes.length > 0) partesResumo.push(`${grupo.nome}: ${descricoes.join(", ")}`)
  }

  return {
    precoUnitario: arredondar(produto.preco + extra),
    resumo: partesResumo.length > 0 ? partesResumo.join(" | ") : null,
  }
}

/** Evita lixo de ponto flutuante (0,1 + 0,2) em valores de dinheiro. */
export const arredondar = (valor: number) => Math.round(valor * 100) / 100

/** Porta da regra do Views/Home/Index.cshtml: grupo obrigatório com opção paga → "A partir de". */
export function temPrecoAPartirDe(produto: Produto): boolean {
  return produto.gruposOpcoes.some(
    (g) => g.ativo && g.minimo > 0 && g.itens.some((i) => i.ativo && i.precoAdicional > 0),
  )
}
