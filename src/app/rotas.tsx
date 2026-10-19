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
  const emConstrucao = async () => ({
    Component: (await import("@/features/admin/componentes/EmConstrucao")).EmConstrucao,
  })
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
    ...[
      "produtos",
      "produtos/novo",
      "produtos/:id",
      "categorias",
      "bairros",
      "motoboys",
      "configuracoes",
      "mesas",
      "mesas/:id",
      "garcom",
      "cozinha",
    ].map((path) => ({ path, lazy: emConstrucao })),
  ]
}

export function criarRoteador(opcoes?: { entradasIniciais?: string[] }) {
  return opcoes?.entradasIniciais
    ? createMemoryRouter(rotas, { initialEntries: opcoes.entradasIniciais })
    : createBrowserRouter(rotas)
}
