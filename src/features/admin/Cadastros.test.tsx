import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { RouterProvider } from "react-router"
import { describe, expect, it } from "vitest"
import { Providers } from "@/app/Providers"
import { criarRoteador } from "@/app/rotas"
import { banco } from "@/mock/banco"
import { entrar } from "@/mock/conta/acoes"

async function abrir(caminho: string) {
  await entrar("admin", "clickpedido")
  const roteador = criarRoteador({ entradasIniciais: [caminho] })
  render(
    <Providers>
      <RouterProvider router={roteador} />
    </Providers>,
  )
  return roteador
}

const produto = (nome: string) => banco.ler().produtos.find((p) => p.nome === nome)

describe("Produtos", () => {
  it("lista por categoria e marca um item como esgotado", async () => {
    await abrir("/admin/produtos")
    const pasteis = await screen.findByRole("region", { name: /Pastéis/ })
    const nome = within(pasteis).getAllByRole("row")[1]?.textContent ?? ""
    const alvo = banco.ler().produtos.find((p) => nome.startsWith(p.nome))
    expect(alvo?.disponivel).toBe(true)
    await userEvent.click(
      within(pasteis).getByRole("switch", { name: `${alvo?.nome} disponível para pedir` }),
    )
    await waitFor(() => expect(produto(alvo?.nome ?? "")?.disponivel).toBe(false))
  })

  it("cadastra um produto novo e volta para a lista", async () => {
    const roteador = await abrir("/admin/produtos/novo?categoria=1")
    await userEvent.type(await screen.findByLabelText("Nome"), "Pastel de Teste")
    await userEvent.type(screen.getByLabelText("Preço (R$)"), "abc")
    await userEvent.click(screen.getByRole("button", { name: "Salvar produto" }))
    expect(
      await screen.findByText("Informe um preço válido, por exemplo 12,50."),
    ).toBeInTheDocument()

    await userEvent.clear(screen.getByLabelText("Preço (R$)"))
    await userEvent.type(screen.getByLabelText("Preço (R$)"), "13,9")
    await userEvent.click(screen.getByRole("button", { name: "Salvar produto" }))
    await waitFor(() => expect(roteador.state.location.pathname).toBe("/admin/produtos"))
    expect(produto("Pastel de Teste")).toMatchObject({ preco: 13.9, categoriaId: 1 })
  })

  it("recusa foto em formato não aceito", async () => {
    await abrir("/admin/produtos/novo")
    const entrada = await screen.findByLabelText("Foto")
    const gif = new File(["x"], "foto.gif", { type: "image/gif" })
    await userEvent.upload(entrada, gif, { applyAccept: false })
    expect(await screen.findByText("Envie a foto em JPG, PNG ou WEBP.")).toBeInTheDocument()
  })

  it("exclui com confirmação", async () => {
    const alvo = banco.ler().produtos[0]
    await abrir("/admin/produtos")
    await userEvent.click(await screen.findByRole("button", { name: `Excluir ${alvo?.nome}` }))
    const dialogo = await screen.findByRole("alertdialog")
    await userEvent.click(within(dialogo).getByRole("button", { name: "Excluir" }))
    await waitFor(() => expect(banco.ler().produtos.some((p) => p.id === alvo?.id)).toBe(false))
  })
})

describe("Categorias", () => {
  it("cria uma categoria com a próxima ordem", async () => {
    await abrir("/admin/categorias")
    await screen.findByRole("table")
    await userEvent.type(screen.getByLabelText("Nome"), "Sobremesas")
    await userEvent.click(screen.getByRole("button", { name: "Criar" }))
    await waitFor(() =>
      expect(banco.ler().categorias.find((c) => c.nome === "Sobremesas")?.ordem).toBe(8),
    )
  })

  it("não deixa excluir categoria com produtos", async () => {
    await abrir("/admin/categorias")
    const excluir = await screen.findByRole("button", { name: "Excluir Pastéis" })
    expect(excluir).toHaveAttribute("aria-disabled", "true")
    await userEvent.click(excluir)
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
  })

  it("edita no painel", async () => {
    await abrir("/admin/categorias")
    await userEvent.click(await screen.findByRole("button", { name: "Editar Pastéis" }))
    const painel = await screen.findByRole("dialog")
    const nome = within(painel).getByLabelText("Nome")
    await userEvent.clear(nome)
    await userEvent.type(nome, "Pastéis da casa")
    await userEvent.click(within(painel).getByRole("button", { name: "Salvar categoria" }))
    await waitFor(() =>
      expect(banco.ler().categorias.some((c) => c.nome === "Pastéis da casa")).toBe(true),
    )
  })
})

describe("Bairros", () => {
  it("cadastra, busca e desativa", { timeout: 15_000 }, async () => {
    await abrir("/admin/bairros")
    await screen.findByRole("table")
    await userEvent.type(screen.getByLabelText("Nome do bairro"), "Jardim Teste")
    await userEvent.type(screen.getByLabelText("Taxa (R$)"), "6,5")
    await userEvent.click(screen.getByRole("button", { name: "Adicionar bairro" }))
    await waitFor(() =>
      expect(banco.ler().bairros.find((b) => b.nome === "Jardim Teste")?.taxa).toBe(6.5),
    )

    await userEvent.type(screen.getByRole("searchbox", { name: "Buscar bairro" }), "jardim teste")
    await waitFor(() =>
      expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(2),
    )
    await userEvent.click(screen.getByRole("switch", { name: "Bairro Jardim Teste ativo" }))
    await waitFor(() =>
      expect(banco.ler().bairros.find((b) => b.nome === "Jardim Teste")?.ativo).toBe(false),
    )
  })

  it("mostra o erro de taxa inválida", async () => {
    await abrir("/admin/bairros")
    await userEvent.type(await screen.findByLabelText("Nome do bairro"), "Centro Novo")
    await userEvent.type(screen.getByLabelText("Taxa (R$)"), "xx")
    await userEvent.click(screen.getByRole("button", { name: "Adicionar bairro" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("Taxa de entrega inválida.")
  })
})

describe("Motoboys", () => {
  it("adiciona e remove com confirmação", async () => {
    await abrir("/admin/motoboys")
    await screen.findByRole("table")
    await userEvent.type(screen.getByLabelText("Nome"), "Zé")
    await userEvent.type(screen.getByLabelText("WhatsApp"), "12999990000")
    await userEvent.click(screen.getByRole("button", { name: "Adicionar" }))
    await waitFor(() =>
      expect(banco.ler().motoboys.find((m) => m.nome === "Zé")?.telefone).toBe("12999990000"),
    )

    await userEvent.click(await screen.findByRole("button", { name: "Remover Zé" }))
    const dialogo = await screen.findByRole("alertdialog")
    await userEvent.click(within(dialogo).getByRole("button", { name: "Remover" }))
    await waitFor(() => expect(banco.ler().motoboys.some((m) => m.nome === "Zé")).toBe(false))
  })
})

describe("Configurações", () => {
  it("desliga o Pix e salva", async () => {
    await abrir("/admin/configuracoes")
    await userEvent.click(await screen.findByRole("switch", { name: "Pix" }))
    await userEvent.click(screen.getByRole("button", { name: "Salvar configurações" }))
    await waitFor(() => expect(banco.ler().loja.aceitaPix).toBe(false))
  })

  it("aponta a taxa inválida no campo", async () => {
    await abrir("/admin/configuracoes")
    const taxa = await screen.findByLabelText("Taxa de entrega padrão (R$)")
    await userEvent.clear(taxa)
    await userEvent.type(taxa, "abc")
    await userEvent.click(screen.getByRole("button", { name: "Salvar configurações" }))
    expect(await screen.findByText("Taxa de entrega inválida.")).toBeInTheDocument()
    expect(taxa).toHaveAttribute("aria-invalid", "true")
  })

  it("copia o horário de um dia para todos", async () => {
    await abrir("/admin/configuracoes")
    const abre = await screen.findByLabelText("Terça: abre às")
    await userEvent.clear(abre)
    await userEvent.type(abre, "09:30")
    const terca = abre.closest("li") as HTMLElement
    await userEvent.click(within(terca).getByRole("button", { name: "Copiar para todos" }))
    expect(screen.getByLabelText("Sábado: abre às")).toHaveValue("09:30")
    await userEvent.click(screen.getByRole("button", { name: "Salvar configurações" }))
    await waitFor(() =>
      expect(banco.ler().horarios.find((h) => h.diaSemana === 6)?.abreAs).toBe("09:30"),
    )
  })
})

describe("Edições nos painéis", () => {
  it("produto: troca a foto por PNG e depois remove", async () => {
    const roteador = await abrir("/admin/produtos/1")
    const entrada = await screen.findByLabelText("Foto")
    const png = new File([new Uint8Array([137, 80, 78, 71])], "foto.png", { type: "image/png" })
    await userEvent.upload(entrada, png)
    await waitFor(() =>
      expect(screen.getByRole("img", { name: "Pastel de Carne" })).toHaveAttribute(
        "src",
        expect.stringMatching(/^data:image\/png;base64,/),
      ),
    )
    await userEvent.click(screen.getByRole("button", { name: "Salvar produto" }))
    await waitFor(() => expect(roteador.state.location.pathname).toBe("/admin/produtos"))
    expect(produto("Pastel de Carne")?.imagemUrl).toMatch(/^data:image\/png/)

    await roteador.navigate("/admin/produtos/1")
    await userEvent.click(await screen.findByRole("button", { name: "Remover foto" }))
    expect(screen.getByText(/A foto atual será removida ao salvar/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Salvar produto" }))
    await waitFor(() => expect(produto("Pastel de Carne")?.imagemUrl).toBeNull())
  })

  it("produto inexistente mostra o aviso e o caminho de volta", async () => {
    await abrir("/admin/produtos/9999")
    expect(
      await screen.findByRole("heading", { name: "Produto não encontrado" }),
    ).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Voltar ao cardápio" })).toHaveAttribute(
      "href",
      "/admin/produtos",
    )
  })

  it("categoria: nome vazio aponta o erro e categoria sem produtos é excluída", async () => {
    await abrir("/admin/categorias")
    await screen.findByRole("table")
    await userEvent.click(screen.getByRole("button", { name: "Criar" }))
    expect(await screen.findByText("Informe o nome da categoria.")).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText("Nome"), "Temporária")
    await userEvent.click(screen.getByRole("button", { name: "Criar" }))
    await userEvent.click(await screen.findByRole("button", { name: "Excluir Temporária" }))
    const dialogo = await screen.findByRole("alertdialog")
    await userEvent.click(within(dialogo).getByRole("button", { name: "Excluir" }))
    await waitFor(() =>
      expect(banco.ler().categorias.some((c) => c.nome === "Temporária")).toBe(false),
    )
  })

  it("bairro: muda a taxa no painel e exclui com confirmação", async () => {
    await abrir("/admin/bairros")
    await userEvent.click(await screen.findByRole("button", { name: "Editar Centro" }))
    const painel = await screen.findByRole("dialog")
    const taxa = within(painel).getByLabelText("Taxa de entrega (R$)")
    await userEvent.clear(taxa)
    await userEvent.type(taxa, "7,25")
    await userEvent.click(within(painel).getByRole("button", { name: "Salvar bairro" }))
    await waitFor(() =>
      expect(banco.ler().bairros.find((b) => b.nome === "Centro")?.taxa).toBe(7.25),
    )

    await userEvent.click(screen.getByRole("button", { name: "Excluir Centro" }))
    const dialogo = await screen.findByRole("alertdialog")
    await userEvent.click(within(dialogo).getByRole("button", { name: "Excluir" }))
    await waitFor(() => expect(banco.ler().bairros.some((b) => b.nome === "Centro")).toBe(false))
  })

  it("motoboy: telefone curto dá erro e desativar tira da fila", async () => {
    await abrir("/admin/motoboys")
    await userEvent.click(await screen.findByRole("button", { name: "Editar Diego" }))
    const painel = await screen.findByRole("dialog")
    const telefone = within(painel).getByLabelText("WhatsApp")
    await userEvent.clear(telefone)
    await userEvent.type(telefone, "1299")
    await userEvent.click(within(painel).getByRole("button", { name: "Salvar motoboy" }))
    expect(
      await within(painel).findByText("Informe o nome e o WhatsApp do motoboy com DDD."),
    ).toBeInTheDocument()

    await userEvent.clear(telefone)
    await userEvent.type(telefone, "12988887777")
    await userEvent.click(within(painel).getByRole("switch", { name: /Ativo/ }))
    await userEvent.click(within(painel).getByRole("button", { name: "Salvar motoboy" }))
    await waitFor(() =>
      expect(banco.ler().motoboys.find((m) => m.nome === "Diego")).toMatchObject({
        ativo: false,
        telefone: "12988887777",
      }),
    )
  })

  it("configurações: controle automático trava o manual e o token pode ser mostrado", async () => {
    await abrir("/admin/configuracoes")
    const manual = await screen.findByRole("switch", {
      name: "Loja aberta agora (controle manual)",
    })
    const automatico = screen.getByRole("switch", { name: /Abrir e fechar automaticamente/ })
    if (automatico.getAttribute("aria-checked") === "false") await userEvent.click(automatico)
    expect(manual).toBeDisabled()

    const token = screen.getByLabelText("Access Token (produção ou teste)")
    expect(token).toHaveAttribute("type", "password")
    await userEvent.click(
      screen.getByRole("button", { name: "Mostrar Access Token (produção ou teste)" }),
    )
    expect(token).toHaveAttribute("type", "text")

    await userEvent.click(screen.getByRole("switch", { name: "Abre domingo" }))
    expect(screen.queryByLabelText("Domingo: abre às")).not.toBeInTheDocument()
  })

  it("configurações: escolher a impressora preenche o nome", async () => {
    await abrir("/admin/configuracoes")
    await userEvent.click(await screen.findByRole("combobox", { name: "Impressoras encontradas" }))
    await userEvent.click(await screen.findByRole("option", { name: "Microsoft Print to PDF" }))
    expect(screen.getByLabelText("Nome exato da impressora")).toHaveValue("Microsoft Print to PDF")
  })
})
