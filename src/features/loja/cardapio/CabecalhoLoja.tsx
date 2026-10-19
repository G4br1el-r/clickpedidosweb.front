import { cn } from "cn"
import { BikeIcon, ShoppingBagIcon, WalletIcon } from "lucide-react"
import { formatarMoeda } from "@/lib/moeda"
import type { LojaPublica } from "@/mock/loja/publica"

interface CabecalhoLojaProps {
  loja: LojaPublica
  /** Na /_design o cabeçalho aparece dentro de uma moldura e não pode ser o h1 da página. */
  nivelTitulo?: 1 | 2
  className?: string
}

export function CabecalhoLoja({ loja, nivelTitulo = 1, className }: CabecalhoLojaProps) {
  const Titulo = nivelTitulo === 1 ? "h1" : "h2"
  return (
    <header className={cn("relative", className)}>
      <div aria-hidden className="toldo h-14" />
      <div aria-hidden className="toldo-franja" />
      <div className="-mt-9 flex flex-col gap-4 px-5 pb-5">
        <div className="flex items-end gap-4">
          <img
            src="/img/logo-quadrado.jpg"
            alt=""
            width={84}
            height={84}
            className="size-21 shrink-0 rounded-2xl border-4 border-background shadow-flutuante"
          />
          <div className="flex min-w-0 flex-col gap-1 pb-1">
            <EstadoLoja aberta={loja.lojaAberta} horario={loja.horario} />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Titulo className="font-extrabold text-[1.9rem] leading-[1.05] tracking-[-0.02em]">
            {loja.nomeLoja}
          </Titulo>
          {loja.slogan && <p className="text-muted-foreground">{loja.slogan}</p>}
        </div>
        <dl className="grid grid-cols-3 gap-2 text-sm">
          {loja.aceitaEntrega && (
            <Info icone={<BikeIcon />} termo="Entrega">
              {loja.tempoEntrega}
            </Info>
          )}
          {loja.aceitaRetirada && (
            <Info icone={<ShoppingBagIcon />} termo="Retirada">
              {loja.tempoRetirada}
            </Info>
          )}
          <Info icone={<WalletIcon />} termo="Pedido mínimo">
            {formatarMoeda(loja.pedidoMinimo)}
          </Info>
        </dl>
        {!loja.lojaAberta && (
          <p className="rounded-xl bg-status-aguardando px-4 py-3 font-medium text-status-aguardando-foreground text-sm">
            {loja.mensagemFechada ??
              "Estamos fechados agora. Dá para olhar o cardápio e pedir no nosso horário."}
          </p>
        )}
      </div>
    </header>
  )
}

function EstadoLoja({ aberta, horario }: { aberta: boolean; horario: string | null }) {
  return (
    <span className="flex flex-wrap items-center gap-2 text-sm">
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold",
          aberta ? "bg-toldo text-toldo-foreground" : "bg-muted text-muted-foreground",
        )}
      >
        <span aria-hidden className="size-1.5 rounded-full bg-current" />
        {aberta ? "Aberto agora" : "Fechado"}
      </span>
      {horario && <span className="text-muted-foreground">{horario}</span>}
    </span>
  )
}

function Info({
  icone,
  termo,
  children,
}: {
  icone: React.ReactNode
  termo: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl bg-muted/70 px-3 py-2.5 [&_svg]:size-4 [&_svg]:text-marca-forte">
      <dt className="flex items-center gap-1.5 text-muted-foreground text-xs">
        {icone}
        {termo}
      </dt>
      <dd className="numeros font-semibold">{children}</dd>
    </div>
  )
}
