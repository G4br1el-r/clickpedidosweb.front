import "@testing-library/jest-dom/vitest"
import { cleanup, configure } from "@testing-library/react"
import { afterEach, beforeEach } from "vitest"
import { banco } from "@/mock/banco"
import { configurarLatencia } from "@/mock/banco/latencia"

// Telas e painéis carregados sob demanda podem levar mais de 1 s com a suíte inteira rodando.
configure({ asyncUtilTimeout: 4000 })

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
