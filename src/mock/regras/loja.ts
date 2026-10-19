import type { ConfiguracaoLoja, DiaSemana, HorarioFuncionamento } from "@/types/entidades"
import { normalizar } from "./texto"

// Porta de Services/LojaService.cs.

export function cidadeAtendida(cidadesAtendidas: string | null, cidade: string | null): boolean {
  if (!cidadesAtendidas?.trim()) return true
  const alvo = normalizar(cidade)
  return cidadesAtendidas
    .split(/[,;\n]/)
    .map((c) => c.trim())
    .filter(Boolean)
    .some((c) => normalizar(c) === alvo)
}

function horaEmBrasilia(agora: Date): { dia: DiaSemana; minutos: number } {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(agora)
  const valor = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? ""
  const dias = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  return {
    dia: dias.indexOf(valor("weekday")) as DiaSemana,
    minutos: Number(valor("hour")) * 60 + Number(valor("minute")),
  }
}

const emMinutos = (hhmm: string): number | null => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim())
  return m ? Number(m[1]) * 60 + Number(m[2]) : null
}

export function estaAbertaPorHorario(
  horarios: HorarioFuncionamento[],
  agora: Date = new Date(),
): boolean {
  const { dia, minutos } = horaEmBrasilia(agora)

  const hoje = horarios.find((h) => h.diaSemana === dia)
  const abre = hoje ? emMinutos(hoje.abreAs) : null
  const fecha = hoje ? emMinutos(hoje.fechaAs) : null
  if (hoje?.aberto && abre !== null && fecha !== null) {
    if (fecha > abre && minutos >= abre && minutos < fecha) return true
    // Cruza a meia-noite (ex.: 18:00 às 02:00): hoje vale a partir da abertura.
    if (fecha < abre && minutos >= abre) return true
  }

  // Expediente de ontem que cruzou a meia-noite.
  const ontem = horarios.find((h) => h.diaSemana === (dia + 6) % 7)
  const abreOntem = ontem ? emMinutos(ontem.abreAs) : null
  const fechaOntem = ontem ? emMinutos(ontem.fechaAs) : null
  return Boolean(
    ontem?.aberto &&
      abreOntem !== null &&
      fechaOntem !== null &&
      fechaOntem < abreOntem &&
      minutos < fechaOntem,
  )
}

export function lojaEstaAberta(
  loja: Pick<ConfiguracaoLoja, "lojaAberta" | "controleHorarioAutomatico">,
  horarios: HorarioFuncionamento[],
  agora: Date = new Date(),
): boolean {
  return loja.controleHorarioAutomatico ? estaAbertaPorHorario(horarios, agora) : loja.lojaAberta
}

const NOMES_CURTOS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
export const NOMES_DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]

export function resumoHorarios(horarios: HorarioFuncionamento[]): string {
  // Segunda primeiro, domingo por último, como no backend.
  const lista = [...horarios].sort(
    (a, b) => (a.diaSemana === 0 ? 7 : a.diaSemana) - (b.diaSemana === 0 ? 7 : b.diaSemana),
  )
  const abertos = lista.filter((h) => h.aberto)
  const primeiro = abertos[0]
  if (!primeiro) return "Fechado temporariamente"

  const mesmoHorario = abertos.every(
    (h) => h.abreAs === primeiro.abreAs && h.fechaAs === primeiro.fechaAs,
  )
  if (mesmoHorario && abertos.length === 7)
    return `Todos os dias, das ${primeiro.abreAs} às ${primeiro.fechaAs}`
  if (mesmoHorario && abertos.length === 6 && !lista.find((h) => h.diaSemana === 1)?.aberto)
    return `Terça a Domingo, das ${primeiro.abreAs} às ${primeiro.fechaAs}`

  return abertos.map((h) => `${NOMES_CURTOS[h.diaSemana]}: ${h.abreAs} às ${h.fechaAs}`).join(" · ")
}
