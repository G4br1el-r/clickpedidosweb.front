import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ColunaFilaProps {
  titulo: string
  quantidade: number
  /** Classe de cor do marcador da coluna (mesma família do status). */
  cor: string
  vazio: string
  children: ReactNode
  className?: string
}

export function ColunaFila({
  titulo,
  quantidade,
  cor,
  vazio,
  children,
  className,
}: ColunaFilaProps) {
  return (
    <section
      aria-label={titulo}
      className={cn("flex min-w-0 flex-col gap-3 rounded-2xl bg-muted/60 p-3", className)}
    >
      <h3 className="flex items-center gap-2 px-1 font-bold text-sm">
        <span aria-hidden className={cn("size-2.5 rounded-full", cor)} />
        {titulo}
        <span className="numeros ml-auto rounded-full bg-background px-2 py-0.5 font-semibold text-muted-foreground text-xs">
          {quantidade}
        </span>
      </h3>
      <div className="flex flex-col gap-3">
        {quantidade === 0 ? (
          <p className="rounded-xl border border-dashed px-3 py-6 text-center text-muted-foreground text-sm">
            {vazio}
          </p>
        ) : (
          children
        )}
      </div>
    </section>
  )
}

export const COLUNAS_FILA = [
  {
    id: "novos",
    titulo: "Novos",
    status: ["AguardandoPagamento", "Recebido"],
    cor: "bg-marca",
    vazio: "Nenhum pedido novo.",
  },
  {
    id: "preparo",
    titulo: "Em preparo",
    status: ["EmPreparo"],
    cor: "bg-status-preparo-foreground",
    vazio: "Nada na chapa agora.",
  },
  {
    id: "prontos",
    titulo: "Prontos",
    status: ["Pronto"],
    cor: "bg-sucesso",
    vazio: "Nenhum pedido esperando.",
  },
  {
    id: "rota",
    titulo: "Em rota",
    status: ["SaiuParaEntrega"],
    cor: "bg-status-rota-foreground",
    vazio: "Nenhuma entrega na rua.",
  },
] as const
