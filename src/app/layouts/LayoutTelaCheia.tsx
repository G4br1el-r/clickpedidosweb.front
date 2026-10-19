import { Outlet, ScrollRestoration } from "react-router"

/** Telas sem menu: cozinha (KDS), impressão de cupom e a página /_design. */
export function LayoutTelaCheia() {
  return (
    <div className="min-h-svh bg-background">
      <ScrollRestoration />
      <Outlet />
    </div>
  )
}
