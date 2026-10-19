import { describe, expect, it } from "vitest"
import { curvas, duracoes, transicao } from "./motion"

describe("tokens de motion", () => {
  it("durações em segundos, iguais às do CSS", () => {
    expect(duracoes).toEqual({ rapida: 0.15, base: 0.22, enfase: 0.32 })
  })

  it("transicao('base') usa 0.22 s e a curva de saída", () => {
    expect(transicao("base")).toEqual({ duration: 0.22, ease: [0.22, 1, 0.36, 1] })
  })

  it("transicao aceita outra curva", () => {
    expect(transicao("rapida", "entradaSaida")).toEqual({
      duration: 0.15,
      ease: curvas.entradaSaida,
    })
  })
})
