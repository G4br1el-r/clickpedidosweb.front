export type IdDirecao = "feira" | "ladrilho" | "balcao"

export const DIRECOES: Array<{ id: IdDirecao; nome: string; resumo: string; adotada?: boolean }> = [
  {
    id: "feira",
    nome: "Feira",
    resumo:
      "A barraca de pastel: toldo listrado, laranja-queimado, amarelo-gema e tinta azul-noite. Bricolage Grotesque com cara de letreiro pintado.",
    adotada: true,
  },
  {
    id: "ladrilho",
    nome: "Ladrilho",
    resumo:
      "O azulejo colonial de Minas: azul-cobalto com o laranja da marca, cantos retos e Fraunces nos títulos.",
  },
  {
    id: "balcao",
    nome: "Balcão",
    resumo:
      "Operação primeiro: pedra e grafite, Archivo condensado para números grandes e leitura de longe na cozinha.",
  },
]

const CHAVE = "cp_direcao"

export function lerDirecaoSalva(): IdDirecao {
  try {
    const salva = window.localStorage.getItem(CHAVE)
    return DIRECOES.some((d) => d.id === salva) ? (salva as IdDirecao) : "feira"
  } catch {
    return "feira"
  }
}

export function salvarDirecao(id: IdDirecao) {
  try {
    window.localStorage.setItem(CHAVE, id)
  } catch {
    // segue sem salvar
  }
}
