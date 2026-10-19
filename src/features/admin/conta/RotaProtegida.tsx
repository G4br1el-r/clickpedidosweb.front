import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router"
import { useSessao } from "./useSessao"

/** Sem sessão, vai para o login e volta para cá depois (como o [Authorize] do admin). */
export function RotaProtegida({ children }: { children: ReactNode }) {
  const sessao = useSessao()
  const local = useLocation()
  if (!sessao) {
    const voltar = encodeURIComponent(local.pathname + local.search)
    return <Navigate to={`/admin/login?voltar=${voltar}`} replace />
  }
  return children
}
