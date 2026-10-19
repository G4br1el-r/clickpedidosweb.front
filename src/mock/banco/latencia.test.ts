import { afterEach, describe, expect, it, vi } from "vitest"
import { simularLatencia } from "./latencia"

describe("simularLatencia", () => {
  afterEach(() => {
    vi.useRealTimers()
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
