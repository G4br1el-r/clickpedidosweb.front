import { render, screen } from "@testing-library/react"
import { RouterProvider } from "react-router"
import { describe, expect, it } from "vitest"
import { Providers } from "./Providers"
import { criarRoteador } from "./rotas"

function abrir(caminho: string) {
  return render(
    <Providers>
      <RouterProvider router={criarRoteador({ entradasIniciais: [caminho] })} />
    </Providers>,
  )
}

describe("rotas", () => {
  it("/ mostra o nome e o slogan da loja", async () => {
    abrir("/")
    expect(
      await screen.findByRole("heading", { level: 1, name: "Quiosque do Mineiro" }),
    ).toBeInTheDocument()
    expect(screen.getByText("O Ponto do Pastel · Lanches e Açaí")).toBeInTheDocument()
  })

  it("/_design carrega sob demanda e mostra o título", async () => {
    abrir("/_design")
    expect(await screen.findByRole("heading", { name: "Direções visuais" })).toBeInTheDocument()
  })

  it("rota desconhecida mostra 'Página não encontrada' com link para o início", async () => {
    abrir("/nao-existe")
    expect(
      await screen.findByRole("heading", { name: "Página não encontrada" }),
    ).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Voltar ao cardápio" })).toHaveAttribute("href", "/")
  })
})
