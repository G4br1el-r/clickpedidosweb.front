import { afterEach, describe, expect, it, vi } from "vitest"
import { configurarLatencia, simularLatencia } from "./latencia"

describe("simularLatencia", () => {
  afterEach(() => {
    vi.useRealTimers()
    configurarLatencia(0, 0)
  })

  it("usa a faixa configurada quando não recebe mínimo e máximo", async () => {
    vi.useFakeTimers()
    configurarLatencia(100, 100)
    let resolvido = false
    const espera = simularLatencia().then(() => {
      resolvido = true
    })
    await vi.advanceTimersByTimeAsync(99)
    expect(resolvido).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    await espera
    expect(resolvido).toBe(true)
  })

  it("espera entre o mínimo e o máximo", async () => {
    vi.useFakeTimers()
    let resolvido = false
    const espera = simularLatencia(200, 600, () => 0.5).then(() => {
      resolvido = true
    })

    await vi.advanceTimersByTimeAsync(399)
    expect(resolvido).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    await espera
    expect(resolvido).toBe(true)
  })
})
