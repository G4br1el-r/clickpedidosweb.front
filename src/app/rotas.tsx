import { createBrowserRouter, createMemoryRouter, type RouteObject } from "react-router"
import { LayoutLoja } from "./layouts/LayoutLoja"
import { LayoutTelaCheia } from "./layouts/LayoutTelaCheia"
import { PaginaNaoEncontrada } from "./PaginaNaoEncontrada"

// A loja carrega junto com o app; admin, salão, cozinha e /_design só quando abertos.
const rotas: RouteObject[] = [
  {
    element: <LayoutLoja />,
    children: [
      {
        index: true,
        lazy: async () => ({
          Component: (await import("@/features/loja/cardapio/PaginaCardapio")).PaginaCardapio,
        }),
      },
      {
        path: "cardapio",
        lazy: async () => ({
          Component: (await import("@/features/loja/cardapio/PaginaCardapio"))
            .PaginaCardapioDigital,
        }),
      },
      {
        path: "checkout",
        lazy: async () => ({
          Component: (await import("@/features/loja/checkout/PaginaCheckout")).PaginaCheckout,
        }),
      },
      {
        path: "pedido/:token",
        lazy: async () => ({
          Component: (await import("@/features/loja/pedido/PaginaPedido")).PaginaPedido,
        }),
      },
    ],
  },
  {
    element: <LayoutTelaCheia />,
    children: [
      {
        path: "_design",
        lazy: async () => ({
          Component: (await import("@/features/design/PaginaDesign")).PaginaDesign,
        }),
      },
      {
        path: "admin/login",
        lazy: async () => ({
          Component: (await import("@/features/admin/conta/PaginaLogin")).PaginaLogin,
        }),
      },
      {
        path: "admin/cozinha",
        lazy: async () => ({
          Component: (await import("@/features/admin/cozinha/PaginaCozinha")).PaginaCozinha,
        }),
      },
      {
        path: "admin/pedidos/:id/imprimir",
        lazy: async () => ({
          Component: (await import("@/features/admin/impressao/PaginaCupom")).PaginaCupom,
        }),
      },
    ],
  },
  {
    path: "admin",
    lazy: async () => ({ Component: (await import("./layouts/LayoutAdmin")).LayoutAdmin }),
    children: rotasAdmin(),
  },
  { path: "*", element: <PaginaNaoEncontrada /> },
]

function rotasAdmin(): RouteObject[] {
  return [
    {
      index: true,
      lazy: async () => ({
        Component: (await import("@/features/admin/dashboard/PaginaDashboard")).PaginaDashboard,
      }),
    },
    {
      path: "fila",
      lazy: async () => ({
        Component: (await import("@/features/admin/fila/PaginaFila")).PaginaFila,
      }),
    },
    {
      path: "pedidos",
      lazy: async () => ({
        Component: (await import("@/features/admin/pedidos/PaginaPedidos")).PaginaPedidos,
      }),
    },
    {
      path: "pedidos/:id",
      lazy: async () => ({
        Component: (await import("@/features/admin/pedidos/PaginaPedidoDetalhe"))
          .PaginaPedidoDetalhe,
      }),
    },
    {
      path: "senha",
      lazy: async () => ({
        Component: (await import("@/features/admin/conta/PaginaSenha")).PaginaSenha,
      }),
    },
    {
      path: "produtos",
      lazy: async () => ({
        Component: (await import("@/features/admin/produtos/PaginaProdutos")).PaginaProdutos,
      }),
    },
    {
      path: "produtos/novo",
      lazy: async () => ({
        Component: (await import("@/features/admin/produtos/PaginaProdutoForm")).PaginaProdutoForm,
      }),
    },
    {
      path: "produtos/:id",
      lazy: async () => ({
        Component: (await import("@/features/admin/produtos/PaginaProdutoForm")).PaginaProdutoForm,
      }),
    },
    {
      path: "categorias",
      lazy: async () => ({
        Component: (await import("@/features/admin/categorias/PaginaCategorias")).PaginaCategorias,
      }),
    },
    {
      path: "bairros",
      lazy: async () => ({
        Component: (await import("@/features/admin/bairros/PaginaBairros")).PaginaBairros,
      }),
    },
    {
      path: "motoboys",
      lazy: async () => ({
        Component: (await import("@/features/admin/motoboys/PaginaMotoboys")).PaginaMotoboys,
      }),
    },
    {
      path: "configuracoes",
      lazy: async () => ({
        Component: (await import("@/features/admin/configuracoes/PaginaConfiguracoes"))
          .PaginaConfiguracoes,
      }),
    },
    {
      path: "mesas",
      lazy: async () => ({
        Component: (await import("@/features/admin/mesas/PaginaMesas")).PaginaMesas,
      }),
    },
    {
      path: "mesas/:id",
      lazy: async () => ({
        Component: (await import("@/features/admin/mesas/PaginaComanda")).PaginaComanda,
      }),
    },
    {
      path: "garcom",
      lazy: async () => ({
        Component: (await import("@/features/admin/garcom/PaginaGarcom")).PaginaGarcom,
      }),
    },
  ]
}

export function criarRoteador(opcoes?: { entradasIniciais?: string[] }) {
  return opcoes?.entradasIniciais
    ? createMemoryRouter(rotas, { initialEntries: opcoes.entradasIniciais })
    : createBrowserRouter(rotas)
}
