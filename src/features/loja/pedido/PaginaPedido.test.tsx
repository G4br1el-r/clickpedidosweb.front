import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { RouterProvider } from "react-router"
import { describe, expect, it } from "vitest"
import { Providers } from "@/app/Providers"
import { criarRoteador } from "@/app/rotas"
import { criarPedido } from "@/mock/pedidos/acoes"

async function pedido(campos: Partial<Parameters<typeof criarPedido>[0]> = {}) {
  const r = await criarPedido({
    nome: "Maria",
    telefone: "12991234567",
    tipo: "Retirada",
    pagamento: "Dinheiro",
    itens: [{ produtoId: 1, quantidade: 2 }],
    ...campos,
  })
  if (!r.ok) throw new Error(r.erro)
  return r
}

function abrir(token: string) {
  render(
    <Providers>
      <RouterProvider router={criarRoteador({ entradasIniciais: [`/pedido/${token}`] })} />
    </Providers>,
  )
}

describe("PaginaPedido (acompanhamento)", () => {
  it("mostra número, status e a linha do tempo com a etapa atual", async () => {
    const r = await pedido()
    abrir(r.token)
    expect(await screen.findByRole("heading", { name: `Pedido #${r.numero}` })).toBeInTheDocument()
    const etapas = screen.getByRole("list", { name: "Andamento do pedido" })
    expect(
      within(etapas)
        .getAllByRole("listitem")
        .map((e) => e.textContent),
    ).toEqual([
      expect.stringContaining("Pedido recebido"),
      expect.stringContaining("Em preparo"),
      expect.stringContaining("Pronto para retirada"),
      expect.stringContaining("Retirado"),
    ])
    expect(within(etapas).getByText("Pedido recebido").closest("li")).toHaveAttribute(
      "aria-current",
      "step",
    )
  })

  it("lista itens e total do pedido", async () => {
    const r = await pedido()
    abrir(r.token)
    const resumo = await screen.findByRole("region", { name: "Itens do pedido" })
    expect(resumo).toHaveTextContent("2× Pastel de Carne")
    expect(resumo).toHaveTextContent(/Total\s*R\$\s18,00/)
  })

  it("Pix aguardando: mostra QR e copia e cola; ao pagar, segue para a fila", async () => {
    const r = await pedido({ pagamento: "Pix", cpf: "529.982.247-25" })
    abrir(r.token)
    const pix = await screen.findByRole("region", { name: "Pagamento com Pix" })
    const codigo = within(pix).getByLabelText<HTMLInputElement>("Código Pix copia e cola")
    expect(codigo.value).toContain("br.gov.bcb.pix")
    expect(within(pix).getByRole("img", { name: "QR Code do Pix" })).toBeInTheDocument()
    await userEvent.click(within(pix).getByRole("button", { name: /Simular pagamento/ }))
    expect(await screen.findByText("Pagamento confirmado")).toBeInTheDocument()
    expect(screen.queryByRole("region", { name: "Pagamento com Pix" })).not.toBeInTheDocument()
  })

  it("cartão online aguardando oferece pagar", async () => {
    const r = await pedido({ pagamento: "CartaoOnline" })
    abrir(r.token)
    expect(await screen.findByRole("button", { name: /Pagar com cartão/ })).toBeInTheDocument()
  })

  it("link inválido explica o que fazer", async () => {
    abrir("nao-existe")
    expect(
      await screen.findByText("Não encontramos esse pedido. Confira o link que você recebeu."),
    ).toBeInTheDocument()
  })
})
