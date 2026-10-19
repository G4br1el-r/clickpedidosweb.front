import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react"
import { ContextoTema, type Tema } from "./contexto"

const CHAVE = "cp_tema"
const CONSULTA_ESCURO = "(prefers-color-scheme: dark)"

function lerSalvo(): Tema | null {
  try {
    const salvo = window.localStorage.getItem(CHAVE)
    return salvo === "claro" || salvo === "escuro" || salvo === "sistema" ? salvo : null
  } catch {
    return null
  }
}

const sistemaEscuro = () =>
  typeof window.matchMedia === "function" && window.matchMedia(CONSULTA_ESCURO).matches

export function ProvedorTema({
  children,
  temaPadrao = "sistema",
}: {
  children: ReactNode
  temaPadrao?: Tema
}) {
  const [tema, setTema] = useState<Tema>(() => lerSalvo() ?? temaPadrao)
  const [escuroNoSistema, setEscuroNoSistema] = useState(sistemaEscuro)

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return
    const consulta = window.matchMedia(CONSULTA_ESCURO)
    const aoMudar = (e: MediaQueryListEvent) => setEscuroNoSistema(e.matches)
    consulta.addEventListener("change", aoMudar)
    return () => consulta.removeEventListener("change", aoMudar)
  }, [])

  const temaEfetivo = tema === "sistema" ? (escuroNoSistema ? "escuro" : "claro") : tema

  useEffect(() => {
    document.documentElement.classList.toggle("dark", temaEfetivo === "escuro")
  }, [temaEfetivo])

  const definirTema = useCallback((novo: Tema) => {
    setTema(novo)
    try {
      window.localStorage.setItem(CHAVE, novo)
    } catch {
      // segue sem salvar
    }
  }, [])

  const valor = useMemo(
    () => ({ tema, temaEfetivo, definirTema }) as const,
    [tema, temaEfetivo, definirTema],
  )

  return <ContextoTema.Provider value={valor}>{children}</ContextoTema.Provider>
}
