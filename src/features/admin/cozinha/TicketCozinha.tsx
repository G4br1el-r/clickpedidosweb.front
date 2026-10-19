import { cn } from "cn"
import { MessageSquareTextIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { minutosDesde, tempoDecorrido } from "@/lib/datas"
import { rotuloAcao, rotuloStatus } from "@/mock/regras/rotulos"
import type { Pedido } from "@/types/entidades"
import { iconeTipo, origemDoPedido } from "../pedidos/rotulos-ui"

export type Urgencia = "normal" | "atencao" | "atrasado"

export function urgenciaDoPedido(criadoEm: string, agora?: Date): Urgencia {
  const minutos = minutosDesde(criadoEm, agora)
  if (minutos >= 30) return "atrasado"
  if (minutos >= 15) return "atencao"
  return "normal"
}

const corUrgencia: Record<Urgencia, string> = {
  normal: "bg-muted text-muted-foreground",
  atencao: "bg-aviso text-aviso-foreground",
  atrasado: "bg-destructive text-white",
}

interface TicketCozinhaProps {
  pedido: Pedido
  agora?: Date
  aoAvancar?: (pedido: Pedido) => void
  avancando?: boolean
  className?: string
}

export function TicketCozinha({
  pedido,
  agora,
  aoAvancar,
  avancando,
  className,
}: TicketCozinhaProps) {
  const Icone = iconeTipo[pedido.tipo]
  const urgencia = urgenciaDoPedido(pedido.criadoEm, agora)
  const acao = rotuloAcao(pedido.status, pedido.tipo)

  return (
    <article
      aria-label={`Pedido #${pedido.id}`}
      data-urgencia={urgencia}
      data-status={pedido.status}
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-elevado",
        urgencia === "atrasado" && "border-destructive",
        className,
      )}
    >
      <header
        className={cn(
          "flex items-center justify-between gap-3 px-4 py-3",
          pedido.status === "EmPreparo"
            ? "bg-status-preparo"
            : pedido.status === "Pronto"
              ? "bg-status-pronto"
              : "bg-status-recebido",
        )}
      >
        <div className="flex min-w-0 flex-col">
          <span className="numeros font-black font-heading text-3xl leading-none">
            #{pedido.id}
          </span>
          <span className="mt-1 flex items-center gap-1.5 truncate font-semibold text-sm">
            <Icone aria-hidden className="size-4 shrink-0" />
            {origemDoPedido(pedido)}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className={cn(
              "numeros rounded-full px-2.5 py-1 font-bold text-sm",
              corUrgencia[urgencia],
            )}
          >
            {tempoDecorrido(pedido.criadoEm, agora)}
          </span>
          <span className="font-medium text-xs">{rotuloStatus(pedido.status, pedido.tipo)}</span>
        </div>
      </header>

      <ul className="flex flex-1 flex-col divide-y px-4">
        {pedido.itens.map((item) => (
          <li key={item.id} className="flex gap-3 py-3">
            <span className="numeros min-w-8 font-black font-heading text-2xl leading-tight">
              {item.quantidade}×
            </span>
            <div className="flex min-w-0 flex-col gap-1">
              <span className="font-semibold text-lg leading-tight">{item.nomeProduto}</span>
              {item.opcoesResumo && (
                <span className="text-muted-foreground">{item.opcoesResumo}</span>
              )}
              {item.observacao && (
                <span className="flex w-fit items-center gap-1.5 rounded-md bg-gema px-2 py-1 font-semibold text-gema-foreground">
                  <MessageSquareTextIcon aria-hidden className="size-4" />
                  {item.observacao}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>

      {pedido.observacao && (
        <p className="mx-4 mb-3 rounded-md bg-gema px-3 py-2 font-semibold text-gema-foreground">
          {pedido.observacao}
        </p>
      )}

      {acao && aoAvancar && (
        <div className="border-t p-3">
          <Button
            size="xl"
            className="w-full"
            variant={pedido.status === "EmPreparo" ? "sucesso" : "default"}
            disabled={avancando}
            onClick={() => aoAvancar(pedido)}
          >
            {acao}
          </Button>
        </div>
      )}
    </article>
  )
}
