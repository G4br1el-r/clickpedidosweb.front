import { useSyncExternalStore } from "react"
import { obterSessao, ouvirSessao, type Sessao } from "@/mock/conta/acoes"

// Instantâneo estável entre leituras (useSyncExternalStore exige a mesma referência).
let ultimo: { chave: string; sessao: Sessao | null } = { chave: "", sessao: null }

function ler(): Sessao | null {
  const s = obterSessao()
  const chave = s ? `${s.usuarioId}:${s.nome}` : ""
  if (chave !== ultimo.chave) ultimo = { chave, sessao: s }
  return ultimo.sessao
}

export function useSessao(): Sessao | null {
  return useSyncExternalStore(ouvirSessao, ler, () => null)
}
