import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { LazyMotion, MotionConfig } from "motion/react"
import { type ReactNode, useEffect, useState } from "react"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { banco } from "@/mock/banco"
import { ProvedorTema } from "./tema/ProvedorTema"

// As features de animação (inclusive layout) só baixam depois da primeira pintura.
const carregarRecursosMotion = () => import("./motion-recursos").then((m) => m.default)

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
        <LazyMotion features={carregarRecursosMotion}>
          <MotionConfig reducedMotion="user">
            <TooltipProvider delayDuration={300}>
              {children}
              <Toaster position="top-center" richColors closeButton />
            </TooltipProvider>
          </MotionConfig>
        </LazyMotion>
      </ProvedorTema>
    </QueryClientProvider>
  )
}
