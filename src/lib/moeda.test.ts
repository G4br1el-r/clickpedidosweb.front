import { describe, expect, it } from "vitest"
import { formatarMoeda } from "./moeda"

describe("formatarMoeda", () => {
  it("formata em reais no padrão brasileiro, com centavos", () => {
    // O Intl separa "R$" do número com espaço não separável (U+00A0).
    expect(formatarMoeda(9)).toBe("R$ 9,00")
  })
})
