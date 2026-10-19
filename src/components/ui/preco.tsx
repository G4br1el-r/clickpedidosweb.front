import type * as React from "react"
import { formatarMoeda } from "@/lib/moeda"
import { cn } from "@/lib/utils"

interface PrecoProps extends React.ComponentProps<"span"> {
  valor: number
  /** Produto com opção paga obrigatória: o preço base é só o mínimo. */
  aPartirDe?: boolean
  valorAntigo?: number
}

export function Preco({ valor, aPartirDe, valorAntigo, className, ...props }: PrecoProps) {
  return (
    <span
      data-slot="preco"
      className={cn("numeros inline-flex items-baseline gap-1.5 font-semibold", className)}
      {...props}
    >
      {aPartirDe && <span className="font-normal text-muted-foreground text-xs">A partir de</span>}
      {valorAntigo !== undefined && (
        <s className="font-normal text-muted-foreground text-xs">
          <span className="sr-only">De </span>
          {formatarMoeda(valorAntigo)}
          <span className="sr-only"> por</span>
        </s>
      )}
      <span>{formatarMoeda(valor)}</span>
    </span>
  )
}
