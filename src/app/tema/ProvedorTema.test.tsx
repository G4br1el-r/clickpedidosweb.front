import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { ProvedorTema } from "./ProvedorTema"
import { useTema } from "./useTema"

type Ouvinte = (e: MediaQueryListEvent) => void

// matchMedia é fronteira do navegador: o jsdom não implementa.
function simularSistema(escuro: boolean) {
  const ouvintes = new Set<Ouvinte>()
  const consulta = {
    matches: escuro,
    media: "(prefers-color-scheme: dark)",
    addEventListener: (_: string, f: Ouvinte) => ouvintes.add(f),
    removeEventListener: (_: string, f: Ouvinte) => ouvintes.delete(f),
  }
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => consulta),
  )
  return {
    mudar(novo: boolean) {
      consulta.matches = novo
      for (const f of ouvintes) f({ matches: novo } as MediaQueryListEvent)
    },
  }
}

function Painel() {
  const { tema, temaEfetivo, definirTema } = useTema()
  return (
    <div>
      <p>
        {tema}/{temaEfetivo}
      </p>
      <button type="button" onClick={() => definirTema("escuro")}>
        Escuro
      </button>
    </div>
  )
}

const ehEscuro = () => document.documentElement.classList.contains("dark")

describe("ProvedorTema", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    document.documentElement.classList.remove("dark")
  })

  it("sem escolha salva e sistema escuro, aplica dark no html", () => {
    simularSistema(true)
    render(
      <ProvedorTema>
        <Painel />
      </ProvedorTema>,
    )
    expect(screen.getByText("sistema/escuro")).toBeInTheDocument()
    expect(ehEscuro()).toBe(true)
  })

  it("escolha salva vence o sistema", () => {
    simularSistema(true)
    window.localStorage.setItem("cp_tema", "claro")
    render(
      <ProvedorTema>
        <Painel />
      </ProvedorTema>,
    )
    expect(screen.getByText("claro/claro")).toBeInTheDocument()
    expect(ehEscuro()).toBe(false)
  })

  it("definirTema('escuro') aplica dark e salva", async () => {
    simularSistema(false)
    render(
      <ProvedorTema>
        <Painel />
      </ProvedorTema>,
    )
    await userEvent.click(screen.getByRole("button", { name: "Escuro" }))
    expect(ehEscuro()).toBe(true)
    expect(window.localStorage.getItem("cp_tema")).toBe("escuro")
  })

  it("no modo sistema, acompanha a troca do sistema", () => {
    const sistema = simularSistema(false)
    render(
      <ProvedorTema>
        <Painel />
      </ProvedorTema>,
    )
    expect(ehEscuro()).toBe(false)
    act(() => sistema.mudar(true))
    expect(ehEscuro()).toBe(true)
  })

  it("temaPadrao força o tema quando não há escolha salva", () => {
    simularSistema(false)
    render(
      <ProvedorTema temaPadrao="escuro">
        <Painel />
      </ProvedorTema>,
    )
    expect(ehEscuro()).toBe(true)
  })

  it("localStorage que lança exceção não quebra", () => {
    simularSistema(false)
    const getItem = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("modo privado")
    })
    expect(() =>
      render(
        <ProvedorTema>
          <Painel />
        </ProvedorTema>,
      ),
    ).not.toThrow()
    getItem.mockRestore()
  })
})
