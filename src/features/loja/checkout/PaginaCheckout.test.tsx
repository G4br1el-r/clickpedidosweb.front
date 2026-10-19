import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { RouterProvider } from "react-router"
import { beforeEach, describe, expect, it } from "vitest"
import { Providers } from "@/app/Providers"
import { criarRoteador } from "@/app/rotas"
import { useSacola } from "@/features/loja/sacola/sacola"
import { banco } from "@/mock/banco"

function abrir() {
  const roteador = criarRoteador({ entradasIniciais: ["/checkout"] })
  render(
    <Providers>
      <RouterProvider router={roteador} />
    </Providers>,
  )
  return roteador
}

async function preencherDados() {
  await userEvent.type(await screen.findByLabelText("Nome"), "Maria da Silva")
  await userEvent.type(screen.getByLabelText("WhatsApp"), "12991234567")
}

const botaoPedir = () => screen.getByRole("button", { name: /^Fazer pedido/ })

describe("PaginaCheckout", () => {
  beforeEach(() => {
    useSacola.getState().limpar()
    useSacola.getState().adicionar({ produtoId: 1, quantidade: 2 })
  })

  it("sacola vazia mostra o aviso com o caminho de volta", async () => {
    useSacola.getState().limpar()
    abrir()
    expect(await screen.findByText("Sua sacola está vazia")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Ver o cardápio" })).toHaveAttribute("href", "/")
  })

  it("retirada em dinheiro: envia, limpa a sacola e abre o acompanhamento", async () => {
    const roteador = abrir()
    await preencherDados()
    await userEvent.click(screen.getByRole("radio", { name: /Retirada/ }))
    await userEvent.click(screen.getByRole("radio", { name: /^Dinheiro/ }))
    expect(botaoPedir()).toHaveTextContent(/R\$\s18,00/)
    await userEvent.click(botaoPedir())
    await waitFor(() =>
      expect(roteador.state.location.pathname).toMatch(/^\/pedido\/[0-9a-f]{32}$/),
    )
    expect(useSacola.getState().itens).toHaveLength(0)
    const pedido = banco.ler().pedidos.at(-1)
    expect(pedido).toMatchObject({ clienteNome: "Maria da Silva", tipo: "Retirada", total: 18 })
  })

  it("entrega: o CEP preenche o endereço e a taxa do bairro entra no total", async () => {
    abrir()
    await preencherDados()
    await userEvent.click(screen.getByRole("radio", { name: /Entrega/ }))
    await userEvent.type(screen.getByLabelText("CEP"), "12630300")
    expect(await screen.findByDisplayValue("Estrada do Embaú")).toBeInTheDocument()
    expect(screen.getByLabelText("Bairro")).toHaveValue("Embaú")
    const resumo = screen.getByRole("region", { name: "Seu pedido" })
    await waitFor(() => expect(resumo).toHaveTextContent(/Entrega\s*R\$\s15,00/))
    expect(botaoPedir()).toHaveTextContent(/R\$\s33,00/)
  })

  it("cidade fora da área avisa e sugere retirar", async () => {
    abrir()
    await preencherDados()
    await userEvent.click(screen.getByRole("radio", { name: /Entrega/ }))
    await userEvent.type(screen.getByLabelText("CEP"), "12600000")
    expect(await screen.findByText(/Ainda não entregamos em Lorena\/SP/)).toBeInTheDocument()
  })

  it("Pix pede CPF e mostra o erro de CPF inválido", async () => {
    abrir()
    await preencherDados()
    await userEvent.click(screen.getByRole("radio", { name: /Retirada/ }))
    await userEvent.click(screen.getByRole("radio", { name: /^Pix/ }))
    await userEvent.type(screen.getByLabelText(/CPF/), "11111111111")
    await userEvent.click(botaoPedir())
    expect(await screen.findByText("Informe um CPF válido para gerar o Pix.")).toBeInTheDocument()
  })

  it("erro da loja (troco menor que o total) aparece no topo do formulário", async () => {
    abrir()
    await preencherDados()
    await userEvent.click(screen.getByRole("radio", { name: /Retirada/ }))
    await userEvent.click(screen.getByRole("radio", { name: /^Dinheiro/ }))
    await userEvent.type(screen.getByLabelText(/Troco para quanto/), "10")
    await userEvent.click(botaoPedir())
    const alerta = await screen.findByRole("alert")
    expect(
      within(alerta).getByText(/O troco precisa ser para um valor maior que o total/),
    ).toBeInTheDocument()
  })
})
