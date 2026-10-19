import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterEach, beforeEach } from "vitest"
import { banco } from "@/mock/banco"
import { configurarLatencia } from "@/mock/banco/latencia"

beforeEach(() => {
  configurarLatencia(0, 0)
  window.localStorage.clear()
  banco.resetar()
})

// Sem globals do Vitest, a Testing Library não limpa o DOM sozinha entre os testes.
afterEach(() => {
  cleanup()
})
