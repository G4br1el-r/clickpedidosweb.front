import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { RouterProvider } from "react-router"
import { describe, expect, it } from "vitest"
import { Providers } from "@/app/Providers"
import { criarRoteador } from "@/app/rotas"
import { banco } from "@/mock/banco"
import { entrar } from "@/mock/conta/acoes"

function abrir(caminho: string) {
  const roteador = criarRoteador({ entradasIniciais: [caminho] })
  render(
    <Providers>
      <RouterProvider router={roteador} />
    </Providers>,
  )
  return roteador
}

describe("Login", () => {
  it("senha errada mostra o erro e não entra", async () => {
    abrir("/admin/login")
    await userEvent.type(await screen.findByLabelText("Login"), "admin")
    await userEvent.type(screen.getByLabelText("Senha"), "errada")
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("Login ou senha incorretos.")
  })

  it("não deixa o voltar levar para fora do admin", async () => {
    const roteador = abrir("/admin/login?voltar=https%3A%2F%2Fexemplo.com")
    await userEvent.type(await screen.findByLabelText("Login"), "admin")
    await userEvent.type(screen.getByLabelText("Senha"), "clickpedido")
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }))
    await screen.findByRole("heading", { name: "Fila de pedidos" })
    expect(roteador.state.location.pathname).toBe("/admin/fila")
  })
})

describe("Trocar senha", () => {
  async function preencher(atual: string, nova: string, confirmacao = nova) {
    await entrar("admin", "clickpedido")
    abrir("/admin/senha")
    await userEvent.type(await screen.findByLabelText("Senha atual"), atual)
    await userEvent.type(screen.getByLabelText("Nova senha"), nova)
    await userEvent.type(screen.getByLabelText("Confirme a nova senha"), confirmacao)
    await userEvent.click(screen.getByRole("button", { name: "Salvar nova senha" }))
  }

  it("confirmação diferente avisa antes de enviar", async () => {
    await preencher("clickpedido", "novasenha123", "outra-coisa")
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "A confirmação não bate com a nova senha.",
    )
  })

  it("senha atual errada", async () => {
    await preencher("errada", "novasenha123")
    expect(await screen.findByRole("alert")).toHaveTextContent("Senha atual incorreta.")
  })

  it("troca a senha", async () => {
    await preencher("clickpedido", "novasenha123")
    await screen.findByLabelText("Senha atual")
    await expect.poll(() => banco.ler().usuarios[0]?.senha).toBe("novasenha123")
  })
})
