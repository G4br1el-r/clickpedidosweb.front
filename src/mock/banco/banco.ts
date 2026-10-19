export type ArmazenamentoBanco = Pick<Storage, "getItem" | "setItem" | "removeItem">

export interface Banco<T> {
  ler(): T
  atualizar(alterar: (dados: T) => void): T
  resetar(): T
  /** Relê o armazenamento: usado quando outra aba grava no mesmo banco. */
  recarregar(): T
  inscrever(aoMudar: () => void): () => void
}

interface OpcoesBanco<T> {
  chave: string
  versao: number
  armazenamento: ArmazenamentoBanco | null
  dadosIniciais: () => T
}

export function criarBanco<T extends { versao: number }>(opcoes: OpcoesBanco<T>): Banco<T> {
  const { chave, versao, armazenamento, dadosIniciais } = opcoes
  const inscritos = new Set<() => void>()
  let dados: T | null = null

  // Modo privado e cota cheia lançam exceção: o banco segue só em memória.
  function lerSalvo(): T | null {
    try {
      const bruto = armazenamento?.getItem(chave)
      if (!bruto) return null
      const salvo = JSON.parse(bruto) as T
      return salvo?.versao === versao ? salvo : null
    } catch {
      return null
    }
  }

  function salvar(valor: T) {
    try {
      armazenamento?.setItem(chave, JSON.stringify(valor))
    } catch {
      // segue só em memória
    }
  }

  function atual(): T {
    dados ??= lerSalvo() ?? dadosIniciais()
    return dados
  }

  function avisar() {
    for (const aoMudar of inscritos) aoMudar()
  }

  return {
    ler: () => structuredClone(atual()),
    atualizar(alterar) {
      const antes = atual()
      const copia = structuredClone(antes)
      alterar(copia)
      // Leituras que só "conferem" algo (ex.: expiração de pagamento) não podem disparar
      // aviso: o aviso recarrega as telas, que leem de novo, num laço sem fim.
      if (JSON.stringify(copia) === JSON.stringify(antes)) return structuredClone(antes)
      dados = copia
      salvar(copia)
      avisar()
      return structuredClone(copia)
    },
    resetar() {
      try {
        armazenamento?.removeItem(chave)
      } catch {
        // segue só em memória
      }
      dados = dadosIniciais()
      avisar()
      return structuredClone(dados)
    },
    recarregar() {
      dados = lerSalvo() ?? dadosIniciais()
      avisar()
      return structuredClone(dados)
    },
    inscrever(aoMudar) {
      inscritos.add(aoMudar)
      return () => {
        inscritos.delete(aoMudar)
      }
    },
  }
}

export function storageSeguro(): ArmazenamentoBanco | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage
  } catch {
    return null
  }
}
