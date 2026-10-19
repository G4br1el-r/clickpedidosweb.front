import { useQuery } from "@tanstack/react-query"
import {
  AlertCircleIcon,
  ArrowRightIcon,
  BanIcon,
  ClockIcon,
  ReceiptIcon,
  TrendingUpIcon,
  WalletIcon,
} from "lucide-react"
import type { ReactNode } from "react"
import { Link } from "react-router"
import { BadgeStatus } from "@/components/ui/badge-status"
import { Button } from "@/components/ui/button"
import { NumeroAnimado } from "@/components/ui/numero-animado"
import { Skeleton } from "@/components/ui/skeleton"
import { formatarData, formatarHora } from "@/lib/datas"
import { formatarMoeda } from "@/lib/moeda"
import { obterDashboard } from "@/mock/dashboard/acoes"
import { CabecalhoPagina } from "../componentes/CabecalhoPagina"

export function PaginaDashboard() {
  const { data } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => obterDashboard(),
    refetchInterval: 15_000,
  })

  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina
        titulo="Hoje"
        descricao={formatarData(new Date().toISOString())}
        acoes={
          <Button asChild>
            <Link to="/admin/fila">
              Abrir fila de pedidos
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </Button>
        }
      />

      {!data ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          <section
            aria-label="Indicadores do dia"
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          >
            <Indicador icone={<ReceiptIcon />} rotulo="Pedidos" destaque>
              <NumeroAnimado valor={data.pedidos} />
            </Indicador>
            <Indicador icone={<WalletIcon />} rotulo="Faturamento" destaque>
              <NumeroAnimado valor={data.faturamento} formatar={formatarMoeda} />
            </Indicador>
            <Indicador icone={<TrendingUpIcon />} rotulo="Ticket médio">
              <NumeroAnimado valor={data.ticketMedio} formatar={formatarMoeda} />
            </Indicador>
            <Indicador icone={<ClockIcon />} rotulo="Em andamento">
              <NumeroAnimado valor={data.emAndamento} />
            </Indicador>
            <Indicador icone={<AlertCircleIcon />} rotulo="Aguardando pagamento">
              <NumeroAnimado valor={data.aguardandoPagamento} />
            </Indicador>
            <Indicador icone={<BanIcon />} rotulo="Cancelados">
              <NumeroAnimado valor={data.cancelados} />
            </Indicador>
          </section>

          <div className="grid gap-6 xl:grid-cols-[2fr_3fr]">
            <section className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-elevado">
              <h2 className="font-bold text-xl">Mais vendidos hoje</h2>
              {data.topProdutos.length === 0 ? (
                <p className="text-muted-foreground">Nenhuma venda ainda hoje.</p>
              ) : (
                <ol className="flex flex-col gap-3">
                  {data.topProdutos.map((p, i) => {
                    const maior = data.topProdutos[0]?.quantidade || 1
                    return (
                      <li key={p.nome} className="flex flex-col gap-1.5">
                        <div className="flex items-baseline justify-between gap-3 text-sm">
                          <span className="font-medium">
                            <span className="numeros mr-2 text-muted-foreground">{i + 1}.</span>
                            {p.nome}
                          </span>
                          <span className="numeros shrink-0 text-muted-foreground">
                            {p.quantidade} un · {formatarMoeda(p.total)}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full origin-left rounded-full bg-marca animate-in slide-in-from-left duration-500"
                            style={{ width: `${(p.quantidade / maior) * 100}%` }}
                          />
                        </div>
                      </li>
                    )
                  })}
                </ol>
              )}
            </section>

            <section className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-elevado">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-bold text-xl">Últimos pedidos</h2>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/admin/pedidos">Ver todos</Link>
                </Button>
              </div>
              <ul className="flex flex-col divide-y">
                {data.ultimos.map((p) => (
                  <li key={p.id}>
                    <Link
                      to={`/admin/pedidos/${p.id}`}
                      className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/60"
                    >
                      <span className="numeros w-10 font-bold font-heading">#{p.id}</span>
                      <span className="numeros w-12 text-muted-foreground text-sm">
                        {formatarHora(p.criadoEm)}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{p.clienteNome}</span>
                      <BadgeStatus
                        status={p.status}
                        tipo={p.tipo}
                        tamanho="sm"
                        className="max-sm:hidden"
                      />
                      <span className="numeros w-24 text-right font-semibold">
                        {formatarMoeda(p.total)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </>
      )}
    </div>
  )
}

function Indicador({
  icone,
  rotulo,
  destaque,
  children,
}: {
  icone: ReactNode
  rotulo: string
  destaque?: boolean
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border bg-card p-5 shadow-elevado">
      <span className="flex items-center gap-2 font-medium text-muted-foreground text-sm [&_svg]:size-4 [&_svg]:text-marca-forte">
        {icone}
        {rotulo}
      </span>
      <span
        className={
          destaque
            ? "numeros font-extrabold font-heading text-4xl"
            : "numeros font-bold font-heading text-3xl"
        }
      >
        {children}
      </span>
    </div>
  )
}
