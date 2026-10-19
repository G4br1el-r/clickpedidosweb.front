import { cn } from "cn"
import type { Produto } from "@/types/entidades"

const tamanhos = {
  sm: { px: 56, classe: "size-14 rounded-lg text-lg" },
  md: { px: 96, classe: "size-24 rounded-xl text-2xl" },
  lg: { px: 640, classe: "aspect-[4/3] w-full rounded-2xl text-5xl" },
} as const

// Tons quentes para o placeholder: variam por produto, sempre da mesma família da marca.
const tons = [
  "bg-accent text-accent-foreground",
  "bg-status-aguardando text-status-aguardando-foreground",
  "bg-status-pronto text-status-pronto-foreground",
  "bg-secondary text-secondary-foreground",
]

interface FotoProdutoProps {
  produto: Pick<Produto, "id" | "nome" | "imagemUrl">
  tamanho: keyof typeof tamanhos
  className?: string
  /** Foto acima da dobra (ex.: modal aberto): carrega já, sem esperar rolar. */
  prioridade?: boolean
}

export function FotoProduto({ produto, tamanho, className, prioridade }: FotoProdutoProps) {
  const { px, classe } = tamanhos[tamanho]

  if (!produto.imagemUrl) {
    return (
      <div
        data-slot="foto-produto"
        aria-hidden
        className={cn(
          "grid shrink-0 select-none place-items-center font-heading font-bold",
          classe,
          tons[produto.id % tons.length],
          className,
        )}
      >
        {produto.nome.charAt(0).toLocaleUpperCase("pt-BR")}
      </div>
    )
  }

  const altura = tamanho === "lg" ? Math.round((px * 3) / 4) : px
  return (
    <img
      data-slot="foto-produto"
      src={produto.imagemUrl}
      alt={produto.nome}
      width={px}
      height={altura}
      loading={prioridade ? "eager" : "lazy"}
      decoding="async"
      className={cn("shrink-0 bg-muted object-cover", classe, className)}
    />
  )
}
