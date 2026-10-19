import { describe, expect, it } from "vitest"
import { horariosIniciais, lojaInicial } from "./dados"

describe("dados iniciais da loja", () => {
  it("usa os dados do Seed.cs e do snapshot da loja", () => {
    expect(lojaInicial).toMatchObject({
      nomeLoja: "Quiosque do Mineiro",
      slogan: "O Ponto do Pastel · Lanches e Açaí",
      telefone: "(12) 99707-3047",
      whatsApp: "12997073047",
      taxaEntrega: 5,
      pedidoMinimo: 15,
      tempoEntrega: "40–60 min",
      tempoRetirada: "20–30 min",
      horario: "Todos os dias, das 10h às 22h",
      aceitaEntrega: true,
      aceitaRetirada: true,
      aceitaPix: true,
      aceitaCartaoOnline: true,
      aceitaDinheiro: true,
      aceitaCartaoNaEntrega: true,
    })
  })

  it("começa aberta e sem controle automático, para dar para testar a qualquer hora", () => {
    expect(lojaInicial.lojaAberta).toBe(true)
    expect(lojaInicial.controleHorarioAutomatico).toBe(false)
  })

  it("tem os 7 dias abertos das 10:00 às 22:00, começando no domingo", () => {
    expect(horariosIniciais).toHaveLength(7)
    expect(horariosIniciais[0]?.diaSemana).toBe(0)
    expect(
      horariosIniciais.every((h) => h.aberto && h.abreAs === "10:00" && h.fechaAs === "22:00"),
    ).toBe(true)
  })
})
