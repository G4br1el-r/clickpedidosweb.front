import { useEffect, useState } from "react"

const CONSULTA = "(max-width: 767px)"

const ler = () => typeof window.matchMedia === "function" && window.matchMedia(CONSULTA).matches

/** Tela de celular (abaixo de 768 px): decide entre gaveta inferior e modal central. */
export function useEhCelular(): boolean {
  const [celular, setCelular] = useState(ler)
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return
    const consulta = window.matchMedia(CONSULTA)
    const aoMudar = (e: MediaQueryListEvent) => setCelular(e.matches)
    consulta.addEventListener?.("change", aoMudar)
    return () => consulta.removeEventListener?.("change", aoMudar)
  }, [])
  return celular
}
