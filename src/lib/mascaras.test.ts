import { describe, expect, it } from "vitest"
import { mascararCep, mascararCpf, mascararMoeda, mascararTelefone } from "./mascaras"

describe("máscaras de campo", () => {
  it("telefone com 10 e 11 dígitos", () => {
    expect(mascararTelefone("12997")).toBe("(12) 997")
    expect(mascararTelefone("12997073047")).toBe("(12) 99707-3047")
    expect(mascararTelefone("1231234567")).toBe("(12) 3123-4567")
    expect(mascararTelefone("129970730479999")).toBe("(12) 99707-3047")
  })

  it("CEP", () => {
    expect(mascararCep("12630")).toBe("12630")
    expect(mascararCep("12630000")).toBe("12630-000")
  })

  it("CPF", () => {
    expect(mascararCpf("52998224725")).toBe("529.982.247-25")
    expect(mascararCpf("5299")).toBe("529.9")
  })

  it("moeda aceita vírgula e só dígitos", () => {
    expect(mascararMoeda("50")).toBe("50")
    expect(mascararMoeda("50,5a")).toBe("50,5")
    expect(mascararMoeda("1.234,567")).toBe("1234,56")
  })
})
