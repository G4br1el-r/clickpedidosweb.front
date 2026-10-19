import { describe, expect, it } from "vitest"
import { contraste, nivelContraste } from "./cor"

describe("contraste (WCAG 2.x)", () => {
  it("preto no branco é 21:1", () => {
    expect(contraste("#000000", "#ffffff")).toBeCloseTo(21, 1)
  })

  it("aceita rgb() como o getComputedStyle devolve", () => {
    expect(contraste("rgb(0, 0, 0)", "rgb(255, 255, 255)")).toBeCloseTo(21, 1)
  })

  it("cinza #777 no branco fica em 4.48:1", () => {
    expect(contraste("#777777", "#ffffff")).toBeCloseTo(4.48, 2)
  })

  it("cor inválida devolve null", () => {
    expect(contraste("azul", "#fff")).toBeNull()
  })
})

describe("nivelContraste", () => {
  it.each([
    [7.2, "AAA"],
    [4.6, "AA"],
    [3.2, "AA grande"],
    [2.1, "Insuficiente"],
  ] as const)("%s → %s", (razao, nivel) => {
    expect(nivelContraste(razao)).toBe(nivel)
  })
})
