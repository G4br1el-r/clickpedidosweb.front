import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterEach, beforeEach } from "vitest"
import { banco } from "@/mock/banco"
import { configurarLatencia } from "@/mock/banco/latencia"

// APIs do navegador que o jsdom não implementa e os componentes do Radix usam.
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}
if (typeof Element.prototype.scrollIntoView !== "function") {
  Element.prototype.scrollIntoView = () => {}
}
if (typeof Element.prototype.hasPointerCapture !== "function") {
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.setPointerCapture = () => {}
  Element.prototype.releasePointerCapture = () => {}
}

beforeEach(() => {
  configurarLatencia(0, 0)
  window.localStorage.clear()
  banco.resetar()
})

// Sem globals do Vitest, a Testing Library não limpa o DOM sozinha entre os testes.
afterEach(() => {
  cleanup()
})
