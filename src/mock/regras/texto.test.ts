import { describe, expect, it } from "vitest"
import {
  cpfValido,
  digitos,
  formatarCep,
  formatarTelefone,
  lerDecimal,
  limitar,
  linkWhatsApp,
  normalizar,
  primeiroNome,
} from "./texto"

describe("texto (porta de Infra/Texto.cs)", () => {
  it("digitos", () => {
    expect(digitos("(12) 99707-3047")).toBe("12997073047")
    expect(digitos(null)).toBe("")
  })

  it("limitar apara e corta; vazio vira null", () => {
    expect(limitar("  Sem cebola  ", 80)).toBe("Sem cebola")
    expect(limitar("abcdef", 3)).toBe("abc")
    expect(limitar("   ", 10)).toBeNull()
  })

  it("normalizar tira acento e caixa", () => {
    expect(normalizar("  Embaú ")).toBe("embau")
    expect(normalizar("CACHOEIRA Paulista")).toBe("cachoeira paulista")
  })

  it("cpfValido", () => {
    expect(cpfValido("529.982.247-25")).toBe(true)
    expect(cpfValido("111.111.111-11")).toBe(false)
    expect(cpfValido("529.982.247-24")).toBe(false)
    expect(cpfValido("123")).toBe(false)
  })

  it("formatarTelefone e formatarCep", () => {
    expect(formatarTelefone("12997073047")).toBe("(12) 99707-3047")
    expect(formatarTelefone("1231234567")).toBe("(12) 3123-4567")
    expect(formatarCep("12630000")).toBe("12630-000")
  })

  it("linkWhatsApp acrescenta o 55 e codifica a mensagem", () => {
    expect(linkWhatsApp("(12) 99707-3047", "Olá! Pedido #1")).toBe(
      "https://wa.me/5512997073047?text=Ol%C3%A1!%20Pedido%20%231",
    )
  })

  it("lerDecimal aceita formatos brasileiros", () => {
    expect(lerDecimal("24,90")).toBe(24.9)
    expect(lerDecimal("1.234,50")).toBe(1234.5)
    expect(lerDecimal("R$ 5,00")).toBe(5)
    expect(lerDecimal("24.90")).toBe(24.9)
    expect(lerDecimal("abc")).toBeNull()
  })

  it("primeiroNome", () => {
    expect(primeiroNome("  Ana Clara Ribeiro")).toBe("Ana")
  })
})
