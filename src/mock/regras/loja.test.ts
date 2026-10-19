import { describe, expect, it } from "vitest"
import type { DiaSemana, HorarioFuncionamento } from "@/types/entidades"
import { cidadeAtendida, estaAbertaPorHorario, lojaEstaAberta, resumoHorarios } from "./loja"

const semana = (abre: string, fecha: string, fechados: DiaSemana[] = []): HorarioFuncionamento[] =>
  ([0, 1, 2, 3, 4, 5, 6] as DiaSemana[]).map((d) => ({
    diaSemana: d,
    aberto: !fechados.includes(d),
    abreAs: abre,
    fechaAs: fecha,
  }))

// 18/10/2026 é domingo. 13:00Z = 10:00 em Brasília.
const em = (iso: string) => new Date(iso)

describe("cidadeAtendida (LojaService.CidadeAtendida)", () => {
  it("lista vazia atende qualquer cidade", () => {
    expect(cidadeAtendida(null, "Lorena")).toBe(true)
  })

  it("compara sem acento e caixa, com vírgula ou ponto e vírgula", () => {
    expect(cidadeAtendida("Cachoeira Paulista; Canas", "CANAS")).toBe(true)
    expect(cidadeAtendida("Cachoeira Paulista, Canas", "Lorena")).toBe(false)
  })
})

describe("estaAbertaPorHorario (LojaService.EstaAbertaPorHorario)", () => {
  it("dentro do horário do dia", () => {
    expect(estaAbertaPorHorario(semana("10:00", "22:00"), em("2026-10-18T15:00:00Z"))).toBe(true)
  })

  it("antes de abrir e no minuto de fechar", () => {
    expect(estaAbertaPorHorario(semana("10:00", "22:00"), em("2026-10-18T12:59:00Z"))).toBe(false)
    expect(estaAbertaPorHorario(semana("10:00", "22:00"), em("2026-10-19T01:00:00Z"))).toBe(false)
  })

  it("dia fechado", () => {
    expect(estaAbertaPorHorario(semana("10:00", "22:00", [0]), em("2026-10-18T15:00:00Z"))).toBe(
      false,
    )
  })

  it("expediente que cruza a meia-noite vale até o fechamento no dia seguinte", () => {
    // Domingo 18:00 às 02:00; segunda 01:00 em Brasília = 04:00Z.
    const h = semana("18:00", "02:00")
    expect(estaAbertaPorHorario(h, em("2026-10-19T04:00:00Z"))).toBe(true)
    expect(estaAbertaPorHorario(h, em("2026-10-19T06:00:00Z"))).toBe(false)
  })
})

describe("lojaEstaAberta", () => {
  it("sem controle automático, vale a chave manual", () => {
    expect(
      lojaEstaAberta(
        { lojaAberta: false, controleHorarioAutomatico: false },
        semana("00:00", "23:59"),
      ),
    ).toBe(false)
  })

  it("com controle automático, vale o horário", () => {
    expect(
      lojaEstaAberta(
        { lojaAberta: false, controleHorarioAutomatico: true },
        semana("10:00", "22:00"),
        em("2026-10-18T15:00:00Z"),
      ),
    ).toBe(true)
  })
})

describe("resumoHorarios (LojaService.GerarResumoHorarios)", () => {
  it("todos os dias iguais", () => {
    expect(resumoHorarios(semana("10:00", "22:00"))).toBe("Todos os dias, das 10:00 às 22:00")
  })

  it("fechado na segunda", () => {
    expect(resumoHorarios(semana("10:00", "22:00", [1]))).toBe(
      "Terça a Domingo, das 10:00 às 22:00",
    )
  })

  it("nenhum dia aberto", () => {
    expect(resumoHorarios(semana("10:00", "22:00", [0, 1, 2, 3, 4, 5, 6]))).toBe(
      "Fechado temporariamente",
    )
  })

  it("caso geral lista os dias de segunda a domingo", () => {
    const h = semana("10:00", "22:00", [2, 3, 4, 5, 6])
    h[0] = { diaSemana: 0, aberto: true, abreAs: "11:00", fechaAs: "15:00" }
    expect(resumoHorarios(h)).toBe("Seg: 10:00 às 22:00 · Dom: 11:00 às 15:00")
  })
})
