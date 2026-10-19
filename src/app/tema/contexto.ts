import { createContext } from "react"

export type Tema = "claro" | "escuro" | "sistema"

export interface ValorTema {
  tema: Tema
  temaEfetivo: "claro" | "escuro"
  definirTema: (tema: Tema) => void
}

export const ContextoTema = createContext<ValorTema | null>(null)
