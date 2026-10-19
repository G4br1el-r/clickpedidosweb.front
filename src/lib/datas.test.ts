import { describe, expect, it } from "vitest"
import { formatarHora, minutosDesde, tempoDecorrido } from "./datas"

const agora = new Date("2026-10-18T20:00:00Z")
const antes = (minutos: number) => new Date(agora.getTime() - minutos * 60_000).toISOString()

describe("tempoDecorrido", () => {
  it("menos de 1 minuto é 'agora'", () => {
    expect(tempoDecorrido(antes(0.5), agora)).toBe("agora")
  })

  it("minutos", () => {
    expect(tempoDecorrido(antes(7), agora)).toBe("7 min")
  })

  it("acima de uma hora mostra horas e minutos", () => {
    expect(tempoDecorrido(antes(65), agora)).toBe("1 h 05")
  })
})

describe("minutosDesde", () => {
  it("arredonda para baixo", () => {
    expect(minutosDesde(antes(12.8), agora)).toBe(12)
  })
})

describe("formatarHora", () => {
  it("mostra a hora local de Brasília", () => {
    expect(formatarHora("2026-10-18T20:05:00Z")).toBe("17:05")
  })
})
