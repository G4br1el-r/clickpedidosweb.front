import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { arredondar, calcularItem, type OpcaoSelecionada } from "@/mock/regras/preco"
import type { Produto } from "@/types/entidades"

export interface ItemSacola {
  /** Produto + opções + observação: itens iguais se somam numa linha só. */
  chave: string
  produtoId: number
  quantidade: number
  observacao: string
  opcoes: OpcaoSelecionada[]
}

interface NovoItem {
  produtoId: number
  quantidade: number
  observacao?: string
  opcoes?: OpcaoSelecionada[]
}

interface EstadoSacola {
  itens: ItemSacola[]
  adicionar: (item: NovoItem) => void
  alterarQuantidade: (chave: string, quantidade: number) => void
  remover: (chave: string) => ItemSacola | undefined
  restaurar: (item: ItemSacola, posicao: number) => void
  limpar: () => void
}

const MAX_POR_ITEM = 50

function chaveDoItem(produtoId: number, opcoes: OpcaoSelecionada[], observacao: string) {
  const ordenadas = [...opcoes]
    .filter((o) => o.quantidade > 0)
    .sort((a, b) => a.grupoId - b.grupoId || a.itemId - b.itemId)
  return `${produtoId}|${JSON.stringify(ordenadas)}|${observacao}`
}

// Porta de wwwroot/js/sacola.js. Os preços são conferidos de novo ao criar o pedido.
export const useSacola = create<EstadoSacola>()(
  persist(
    (set, get) => ({
      itens: [],
      adicionar: ({ produtoId, quantidade, observacao = "", opcoes = [] }) => {
        const obs = observacao.trim()
        const chave = chaveDoItem(produtoId, opcoes, obs)
        const itens = [...get().itens]
        const existente = itens.findIndex((i) => i.chave === chave)
        if (existente >= 0) {
          const atual = itens[existente]
          if (atual)
            itens[existente] = {
              ...atual,
              quantidade: Math.min(MAX_POR_ITEM, atual.quantidade + quantidade),
            }
        } else {
          itens.push({
            chave,
            produtoId,
            quantidade: Math.min(MAX_POR_ITEM, quantidade),
            observacao: obs,
            opcoes: opcoes.filter((o) => o.quantidade > 0),
          })
        }
        set({ itens })
      },
      alterarQuantidade: (chave, quantidade) =>
        set({
          itens:
            quantidade <= 0
              ? get().itens.filter((i) => i.chave !== chave)
              : get().itens.map((i) =>
                  i.chave === chave ? { ...i, quantidade: Math.min(MAX_POR_ITEM, quantidade) } : i,
                ),
        }),
      remover: (chave) => {
        const item = get().itens.find((i) => i.chave === chave)
        set({ itens: get().itens.filter((i) => i.chave !== chave) })
        return item
      },
      restaurar: (item, posicao) => {
        const itens = get().itens.filter((i) => i.chave !== item.chave)
        itens.splice(Math.min(posicao, itens.length), 0, item)
        set({ itens })
      },
      limpar: () => set({ itens: [] }),
    }),
    {
      name: "cp_sacola_v1",
      version: 1,
      storage: createJSONStorage(() => {
        try {
          return window.localStorage
        } catch {
          return sessionStorageOuMemoria()
        }
      }),
      partialize: (s) => ({ itens: s.itens }),
    },
  ),
)

function sessionStorageOuMemoria(): Storage {
  const memoria = new Map<string, string>()
  return {
    getItem: (k) => memoria.get(k) ?? null,
    setItem: (k, v) => void memoria.set(k, v),
    removeItem: (k) => void memoria.delete(k),
    clear: () => memoria.clear(),
    key: () => null,
    length: 0,
  }
}

export interface LinhaSacola extends ItemSacola {
  nome: string
  produto: Produto | null
  precoUnitario: number
  resumo: string | null
  total: number
  /** Produto saiu do cardápio ou esgotou: não entra no pedido. */
  indisponivel: boolean
}

export function linhasDaSacola(itens: ItemSacola[], produtos: Produto[]): LinhaSacola[] {
  const porId = new Map(produtos.map((p) => [p.id, p]))
  return itens.map((item) => {
    const produto = porId.get(item.produtoId) ?? null
    if (!produto?.ativo || !produto.disponivel)
      return {
        ...item,
        nome: produto?.nome ?? "Item indisponível",
        produto,
        precoUnitario: 0,
        resumo: null,
        total: 0,
        indisponivel: true,
      }
    const { precoUnitario, resumo } = calcularItem(produto, item.opcoes)
    return {
      ...item,
      nome: produto.nome,
      produto,
      precoUnitario,
      resumo,
      total: arredondar(precoUnitario * item.quantidade),
      indisponivel: false,
    }
  })
}

export function resumoSacola(linhas: LinhaSacola[]) {
  const validas = linhas.filter((l) => !l.indisponivel)
  return {
    quantidade: validas.reduce((s, l) => s + l.quantidade, 0),
    subtotal: arredondar(validas.reduce((s, l) => s + l.total, 0)),
    temIndisponivel: linhas.some((l) => l.indisponivel),
  }
}
