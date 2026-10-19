import { cn } from "cn"
import { BanknoteIcon, ClockIcon } from "lucide-react"
import type { ReactNode } from "react"
import { BadgeStatus } from "@/components/ui/badge-status"
import { Button } from "@/components/ui/button"
import { tempoDecorrido } from "@/lib/datas"
import { formatarMoeda } from "@/lib/moeda"
import { rotuloAcao } from "@/mock/regras/rotulos"
import type { Pedido } from "@/types/entidades"
import { iconeTipo, origemDoPedido, resumoPagamento, textoTroco } from "../pedidos/rotulos-ui"

interface CartaoPedidoProps {
  pedido: Pedido
  agora?: Date
  aoAvancar?: (pedido: Pedido) => void
  avancando?: boolean
  /** Ações secundárias (imprimir, chamar motoboy, cancelar). */
  acoes?: ReactNode
  destaque?: boolean
  className?: string
}

export function CartaoPedido({
  pedido,
  agora,
  aoAvancar,
  avancando,
  acoes,
  destaque,
  className,
}: CartaoPedidoProps) {
  const Icone = iconeTipo[pedido.tipo]
  const acao = rotuloAcao(pedido.status, pedido.tipo)
  const troco = textoTroco(pedido)

  return (
    <article
      aria-label={`Pedido #${pedido.id}`}
      data-status={pedido.status}
      className={cn(
        "flex flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground shadow-elevado",
        destaque && "ring-2 ring-marca",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="flex items-baseline gap-2">
            <span className="numeros font-bold font-heading text-xl">#{pedido.id}</span>
            <span className="flex items-center gap-1 truncate text-muted-foreground text-sm">
              <Icone aria-hidden className="size-3.5 shrink-0" />
              {origemDoPedido(pedido)}
            </span>
          </div>
          <p className="truncate font-medium">{pedido.clienteNome}</p>
        </div>
        <span className="flex shrink-0 items-center gap-1 text-muted-foreground text-xs">
          <ClockIcon aria-hidden className="size-3.5" />
          {tempoDecorrido(pedido.criadoEm, agora)}
        </span>
      </header>

      <ul className="flex flex-col gap-1 text-sm">
        {pedido.itens.map((item) => (
          <li key={item.id} className="flex flex-col">
            <span>
              <span className="numeros font-semibold">{item.quantidade}×</span> {item.nomeProduto}
            </span>
            {item.opcoesResumo && (
              <span className="text-muted-foreground text-xs">{item.opcoesResumo}</span>
            )}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
        <BadgeStatus status={pedido.status} tipo={pedido.tipo} tamanho="sm" />
        <div className="flex flex-col items-end">
          <span className="numeros font-bold">{formatarMoeda(pedido.total)}</span>
          <span className="text-muted-foreground text-xs">{resumoPagamento(pedido)}</span>
        </div>
      </div>

      {troco && (
        <p className="flex items-center gap-1.5 rounded-lg bg-status-aguardando px-2.5 py-1.5 font-medium text-status-aguardando-foreground text-xs">
          <BanknoteIcon aria-hidden className="size-3.5" />
          {troco}
        </p>
      )}

      {(acao && aoAvancar) || acoes ? (
        <div className="flex items-center gap-2">
          {acao && aoAvancar && (
            <Button
              className="flex-1"
              variant={pedido.status === "EmPreparo" ? "sucesso" : "default"}
              disabled={avancando}
              onClick={() => aoAvancar(pedido)}
            >
              {acao}
            </Button>
          )}
          {acoes}
        </div>
      ) : null}
    </article>
  )
}
