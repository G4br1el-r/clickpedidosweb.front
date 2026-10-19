import { criarBanco, storageSeguro } from "./banco"
import { dadosIniciais } from "./dados-iniciais"
import { type BancoDados, VERSAO_BANCO } from "./esquema"

export type { BancoDados } from "./esquema"
export { simularLatencia } from "./latencia"

export const CHAVE_BANCO = "cp_mock_db"

export const banco = criarBanco<BancoDados>({
  chave: CHAVE_BANCO,
  versao: VERSAO_BANCO,
  armazenamento: storageSeguro(),
  dadosIniciais,
})

// Loja e admin abertos em abas diferentes compartilham o mesmo banco: o pedido feito na
// loja aparece na fila da outra aba.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (evento) => {
    if (evento.key === CHAVE_BANCO || evento.key === null) banco.recarregar()
  })
}
