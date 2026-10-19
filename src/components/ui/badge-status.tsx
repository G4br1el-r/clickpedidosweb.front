import { cn } from "cn"
import { rotuloStatus } from "@/mock/regras/rotulos"
import type { StatusPedido, TipoEntrega } from "@/types/entidades"

// Mesma cor e mesmo rótulo em toda parte: fila, cozinha, pedidos e acompanhamento.
const cores: Record<StatusPedido, string> = {
  AguardandoPagamento: "bg-status-aguardando text-status-aguardando-foreground",
  Recebido: "bg-status-recebido text-status-recebido-foreground",
  EmPreparo: "bg-status-preparo text-status-preparo-foreground",
  Pronto: "bg-status-pronto text-status-pronto-foreground",
  SaiuParaEntrega: "bg-status-rota text-status-rota-foreground",
  Concluido: "bg-status-concluido text-status-concluido-foreground",
  Cancelado: "bg-status-cancelado text-status-cancelado-foreground",
}

export const corDoStatus = (status: StatusPedido) => cores[status]

interface BadgeStatusProps {
  status: StatusPedido
  tipo: TipoEntrega
  tamanho?: "sm" | "md"
  className?: string
}

export function BadgeStatus({ status, tipo, tamanho = "md", className }: BadgeStatusProps) {
  return (
    <span
      data-slot="badge-status"
      data-status={status}
      className={cn(
        "inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full font-semibold",
        tamanho === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-[0.8125rem]",
        cores[status],
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {rotuloStatus(status, tipo)}
    </span>
  )
}
