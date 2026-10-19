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
    ],
  },
  { path: "*", element: <PaginaNaoEncontrada /> },
]

export function criarRoteador(opcoes?: { entradasIniciais?: string[] }) {
  return opcoes?.entradasIniciais
    ? createMemoryRouter(rotas, { initialEntries: opcoes.entradasIniciais })
    : createBrowserRouter(rotas)
}
