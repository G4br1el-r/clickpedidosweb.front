import { useEffect, useState } from "react"

const CONSULTA = "(prefers-reduced-motion: reduce)"

const ler = () => typeof window.matchMedia === "function" && window.matchMedia(CONSULTA).matches

/** Preferência do sistema por menos movimento, acompanhando mudanças em tempo real. */
export function useMovimentoReduzido(): boolean {
  const [reduzido, setReduzido] = useState(ler)
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return
    const consulta = window.matchMedia(CONSULTA)
    const aoMudar = (e: MediaQueryListEvent) => setReduzido(e.matches)
    consulta.addEventListener?.("change", aoMudar)
    return () => consulta.removeEventListener?.("change", aoMudar)
  }, [])
  return reduzido
}
