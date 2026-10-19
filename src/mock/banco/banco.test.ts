import { describe, expect, it } from "vitest"
import { type ArmazenamentoBanco, criarBanco } from "./banco"

interface Dados {
  versao: 1
  nome: string
  itens: number[]
}

const iniciais = (): Dados => ({ versao: 1, nome: "Inicial", itens: [1, 2] })

function armazenamentoFalso(inicial: Record<string, string> = {}): ArmazenamentoBanco & {
  conteudo: Record<string, string>
} {
  const conteudo = { ...inicial }
  return {
    conteudo,
    getItem: (chave) => conteudo[chave] ?? null,
    setItem: (chave, valor) => {
      conteudo[chave] = valor
    },
    removeItem: (chave) => {
      delete conteudo[chave]
    },
  }
}

const criar = (armazenamento: ArmazenamentoBanco | null) =>
  criarBanco<Dados>({ chave: "teste", versao: 1, armazenamento, dadosIniciais: iniciais })

describe("criarBanco", () => {
  it("sem nada salvo, lê os dados iniciais", () => {
    expect(criar(armazenamentoFalso()).ler()).toEqual(iniciais())
  })

  it("atualizar persiste e a próxima instância lê o valor salvo", () => {
    const armazenamento = armazenamentoFalso()
    criar(armazenamento).atualizar((d) => {
      d.nome = "Teste"
    })
    expect(criar(armazenamento).ler().nome).toBe("Teste")
  })

  it("JSON corrompido volta aos dados iniciais", () => {
    expect(criar(armazenamentoFalso({ teste: "{quebrado" })).ler()).toEqual(iniciais())
  })

  it("versão diferente volta aos dados iniciais", () => {
    const antigo = JSON.stringify({ versao: 0, nome: "Velho", itens: [] })
    expect(criar(armazenamentoFalso({ teste: antigo })).ler()).toEqual(iniciais())
  })

  it("armazenamento que lança exceção não quebra: funciona só em memória", () => {
    const quebrado: ArmazenamentoBanco = {
      getItem: () => {
        throw new Error("modo privado")
      },
      setItem: () => {
        throw new Error("modo privado")
      },
      removeItem: () => {
        throw new Error("modo privado")
      },
    }
    const banco = criar(quebrado)
    expect(() =>
      banco.atualizar((d) => {
        d.nome = "Em memória"
      }),
    ).not.toThrow()
    expect(banco.ler().nome).toBe("Em memória")
  })

  it("sem armazenamento (null) funciona só em memória", () => {
    const banco = criar(null)
    banco.atualizar((d) => {
      d.itens.push(3)
    })
    expect(banco.ler().itens).toEqual([1, 2, 3])
  })

  it("resetar apaga o salvo e volta aos dados iniciais", () => {
    const armazenamento = armazenamentoFalso()
    const banco = criar(armazenamento)
    banco.atualizar((d) => {
      d.nome = "Mudado"
    })
    expect(banco.resetar()).toEqual(iniciais())
    expect(armazenamento.conteudo["teste"]).toBeUndefined()
    expect(criar(armazenamento).ler()).toEqual(iniciais())
  })

  it("ler devolve cópia: alterar o retorno não muda o banco", () => {
    const banco = criar(armazenamentoFalso())
    banco.ler().itens.push(99)
    expect(banco.ler().itens).toEqual([1, 2])
  })

  it("recarregar lê de novo o armazenamento (outra aba gravou) e avisa os inscritos", () => {
    const armazenamento = armazenamentoFalso()
    const banco = criar(armazenamento)
    banco.ler()
    let avisos = 0
    banco.inscrever(() => {
      avisos++
    })
    criar(armazenamento).atualizar((d) => {
      d.nome = "Outra aba"
    })
    banco.recarregar()
    expect(banco.ler().nome).toBe("Outra aba")
    expect(avisos).toBe(1)
  })

  it("atualizar sem mudança real não salva nem avisa (evita laço de recarga)", () => {
    const armazenamento = armazenamentoFalso()
    const banco = criar(armazenamento)
    let avisos = 0
    banco.inscrever(() => {
      avisos++
    })
    banco.atualizar(() => {})
    banco.atualizar((d) => {
      d.nome = "Inicial"
    })
    expect(avisos).toBe(0)
    expect(armazenamento.conteudo["teste"]).toBeUndefined()
  })

  it("avisa os inscritos quando os dados mudam", () => {
    const banco = criar(armazenamentoFalso())
    const avisos: string[] = []
    const cancelar = banco.inscrever(() => avisos.push("mudou"))
    banco.atualizar((d) => {
      d.nome = "X"
    })
    cancelar()
    banco.atualizar((d) => {
      d.nome = "Y"
    })
    expect(avisos).toEqual(["mudou"])
  })
})
