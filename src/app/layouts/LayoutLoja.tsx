import { Outlet, ScrollRestoration } from "react-router"

export function LayoutLoja() {
  return (
    <div className="min-h-svh bg-background">
      <ScrollRestoration />
      <Outlet />
    </div>
  )
}
