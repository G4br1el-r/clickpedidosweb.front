import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { afterEach, describe, expect, it, vi } from "vitest"
import { Providers } from "@/app/Providers"
import { PaginaDesign } from "./PaginaDesign"

function simularMovimentoReduzido(reduzido: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((consulta: string) => ({
      matches: consulta.includes("reduced-motion") ? reduzido : false,
      media: consulta,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
    })),
  )
}

const abrir = () =>
  render(
    <Providers>
      <MemoryRouter>
        <PaginaDesign />
      </MemoryRouter>
    </Providers>,
  )

describe("PaginaDesign", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("mostra as três direções para escolher, com a Feira marcada como adotada", () => {
    abrir()
    for (const nome of ["Feira", "Ladrilho", "Balcão"])
      expect(screen.getByRole("radio", { name: new RegExp(nome) })).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: /Feira/ })).toHaveAttribute("data-state", "on")
    expect(screen.getByText("Adotada")).toBeInTheDocument()
  })

  it("escolher Ladrilho aplica data-direcao e salva a escolha", async () => {
    abrir()
    await userEvent.click(screen.getByRole("radio", { name: /Ladrilho/ }))
    expect(document.querySelector("[data-direcao]")).toHaveAttribute("data-direcao", "ladrilho")
    expect(window.localStorage.getItem("cp_direcao")).toBe("ladrilho")
  })

  it("o cardápio no celular lista as categorias do mock", async () => {
    abrir()
    const cardapio = screen.getByRole("region", { name: "Cardápio no celular" })
    expect(await within(cardapio).findByRole("heading", { name: "Pastéis" })).toBeInTheDocument()
  })

  it("a fila mostra as colunas Novos, Em preparo, Prontos e Em rota", () => {
    abrir()
    const fila = screen.getByRole("region", { name: "Fila do balcão" })
    for (const coluna of ["Novos", "Em preparo", "Prontos", "Em rota"])
      expect(
        within(fila).getByRole("heading", { name: new RegExp(`^${coluna}`) }),
      ).toBeInTheDocument()
  })

  it("a cozinha mostra os pedidos em preparo com a ação certa", () => {
    abrir()
    const cozinha = screen.getByRole("region", { name: "Cozinha" })
    expect(
      within(cozinha).getAllByRole("button", { name: "Marcar como pronto" }).length,
    ).toBeGreaterThan(0)
  })

  it("com movimento reduzido, avisa que as animações viram trocas instantâneas", () => {
    simularMovimentoReduzido(true)
    abrir()
    expect(screen.getByText(/Movimento reduzido ativo/)).toBeInTheDocument()
  })
})
