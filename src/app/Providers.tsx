import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { lazy, type ReactNode, Suspense, useEffect, useState } from "react"
import { banco } from "@/mock/banco"
import { ProvedorTema } from "./tema/ProvedorTema"

// O Toaster (sonner) baixa logo depois da primeira pintura; os avisos usam src/lib/avisos.ts.
const Toaster = lazy(() => import("@/components/ui/sonner").then((m) => ({ default: m.Toaster })))

function criarClienteQuery() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: false, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  })
}

export function Providers({ children }: { children: ReactNode }) {
  const [clienteQuery] = useState(criarClienteQuery)

  // Qualquer gravação no banco mockado (nesta aba ou em outra) atualiza as telas abertas.
  useEffect(() => banco.inscrever(() => void clienteQuery.invalidateQueries()), [clienteQuery])

  return (
    <QueryClientProvider client={clienteQuery}>
      <ProvedorTema>
        {children}
        <Suspense fallback={null}>
          <Toaster position="top-center" richColors closeButton />
        </Suspense>
      </ProvedorTema>
    </QueryClientProvider>
  )
}
