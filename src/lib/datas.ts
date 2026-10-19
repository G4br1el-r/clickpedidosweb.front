// A loja fica em Cachoeira Paulista (SP): toda hora exibida é a de Brasília.
const FUSO = "America/Sao_Paulo"

const formatoHora = new Intl.DateTimeFormat("pt-BR", {
  timeZone: FUSO,
  hour: "2-digit",
  minute: "2-digit",
})

const formatoDataHora = new Intl.DateTimeFormat("pt-BR", {
  timeZone: FUSO,
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
})

const formatoData = new Intl.DateTimeFormat("pt-BR", {
  timeZone: FUSO,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})

export const formatarHora = (iso: string) => formatoHora.format(new Date(iso))
export const formatarDataHora = (iso: string) => formatoDataHora.format(new Date(iso))
export const formatarData = (iso: string) => formatoData.format(new Date(iso))

export function minutosDesde(iso: string, agora: Date = new Date()): number {
  return Math.max(0, Math.floor((agora.getTime() - new Date(iso).getTime()) / 60_000))
}

export function tempoDecorrido(iso: string, agora: Date = new Date()): string {
  const minutos = minutosDesde(iso, agora)
  if (minutos < 1) return "agora"
  if (minutos < 60) return `${minutos} min`
  return `${Math.floor(minutos / 60)} h ${String(minutos % 60).padStart(2, "0")}`
}

/** Data local (Brasília) no formato AAAA-MM-DD, usada nos filtros por dia. */
export function diaLocal(iso: string | Date): string {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(typeof iso === "string" ? new Date(iso) : iso)
  return partes
}
