import { useMutation, useQuery } from "@tanstack/react-query"
import { cn } from "cn"
import {
  CheckIcon,
  CircleCheckBigIcon,
  ClockIcon,
  CopyIcon,
  CreditCardIcon,
  MapPinIcon,
  MessageCircleIcon,
  XCircleIcon,
} from "lucide-react"
import { m } from "motion/react"
import { QRCodeSVG } from "qrcode.react"
import { useState } from "react"
import { Link, useParams } from "react-router"
import { BadgeStatus } from "@/components/ui/badge-status"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { formatarHora } from "@/lib/datas"
import { formatarMoeda } from "@/lib/moeda"
import { transicao } from "@/lib/motion"
import { obterAcompanhamento, simularPagamento } from "@/mock/pedidos/acoes"
import type { Acompanhamento } from "@/mock/regras/acompanhamento"
import { linkWhatsApp } from "@/mock/regras/texto"

/** O acompanhamento se atualiza sozinho, como no pedido.js (a cada 5 s, até o status final). */
const INTERVALO_MS = 5000

export function PaginaPedido() {
  const { token = "" } = useParams()
  const consulta = useQuery({
    queryKey: ["acompanhamento", token],
    queryFn: () => obterAcompanhamento(token),
    refetchInterval: (q) => (q.state.data?.final || q.state.data === null ? false : INTERVALO_MS),
    staleTime: 0,
  })

  if (consulta.isPending)
    return (
      <main className="mx-auto flex max-w-xl flex-col gap-4 p-5">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-56 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </main>
    )

  const a = consulta.data
  if (!a)
    return (
      <main className="mx-auto flex min-h-svh max-w-md items-center p-6">
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Pedido não encontrado</EmptyTitle>
            <EmptyDescription>
              Não encontramos esse pedido. Confira o link que você recebeu.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link to="/">Ver o cardápio</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </main>
    )

  return <Acompanhar a={a} />
}

function Acompanhar({ a }: { a: Acompanhamento }) {
  const cancelado = a.status === "Cancelado"
  const aguardando = a.status === "AguardandoPagamento"

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-5 px-4 py-6">
      <header className="flex flex-col gap-3">
        <Link to="/" className="flex w-fit items-center gap-2 text-muted-foreground text-sm">
          <img
            src="/img/logo-quadrado.jpg"
            alt=""
            width={28}
            height={28}
            className="size-7 rounded-md"
          />
          {a.nomeLoja}
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-extrabold text-3xl tracking-[-0.02em]">Pedido #{a.numero}</h1>
          <BadgeStatus status={a.status} tipo={a.tipo} />
        </div>
        <p className="text-muted-foreground">
          Feito às {formatarHora(a.criadoEm)} por {a.clienteNome}
          {!a.final && !aguardando && (
            <>
              {" "}
              · previsão <strong className="text-foreground">{a.tempoEstimado}</strong>
            </>
          )}
        </p>
      </header>

      {a.pago && a.pagamento !== "Dinheiro" && a.pagamento !== "CartaoNaEntrega" && !cancelado && (
        <p className="flex items-center gap-2 rounded-xl bg-status-pronto px-4 py-3 font-semibold text-status-pronto-foreground">
          <CircleCheckBigIcon aria-hidden className="size-5" />
          Pagamento confirmado
        </p>
      )}

      {aguardando && a.pixCopiaECola && <BlocoPix a={a} />}
      {aguardando && a.aguardandoCartao && <BlocoCartao token={a.token} />}

      {cancelado ? (
        <section className="flex items-start gap-3 rounded-2xl border border-destructive/40 bg-status-cancelado p-5 text-status-cancelado-foreground">
          <XCircleIcon aria-hidden className="mt-0.5 size-6 shrink-0" />
          <div>
            <h2 className="font-bold text-lg">Pedido cancelado</h2>
            <p className="text-sm">
              Se o pagamento não foi concluído a tempo, o pedido é cancelado automaticamente. Fale
              com a loja se precisar de ajuda.
            </p>
          </div>
        </section>
      ) : (
        !aguardando && <LinhaDoTempo a={a} />
      )}

      <section
        aria-label="Itens do pedido"
        className="flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-elevado"
      >
        <h2 className="font-bold text-xl">Itens</h2>
        <ul className="flex flex-col gap-2 text-sm">
          {a.itens.map((i) => (
            <li key={i.id} className="flex justify-between gap-3">
              <span>
                {i.quantidade}× {i.nomeProduto}
                {i.opcoesResumo && (
                  <span className="block text-muted-foreground text-xs">{i.opcoesResumo}</span>
                )}
                {i.observacao && (
                  <span className="block text-muted-foreground text-xs italic">
                    “{i.observacao}”
                  </span>
                )}
              </span>
              <span className="numeros">{formatarMoeda(i.total)}</span>
            </li>
          ))}
        </ul>
        <dl className="flex flex-col gap-1.5 border-t pt-3 text-sm">
          <Linha termo="Subtotal" valor={formatarMoeda(a.subtotal)} />
          {a.tipo === "Entrega" && <Linha termo="Entrega" valor={formatarMoeda(a.taxaEntrega)} />}
          <Linha termo="Total" valor={formatarMoeda(a.total)} forte />
          <Linha termo="Pagamento" valor={a.pagamentoTexto} />
          {a.trocoPara && <Linha termo="Troco para" valor={formatarMoeda(a.trocoPara)} />}
        </dl>
        {a.endereco && (
          <p className="flex items-start gap-2 border-t pt-3 text-sm">
            <MapPinIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-marca-forte" />
            <span>
              {a.endereco}
              {a.referencia && <span className="block text-muted-foreground">{a.referencia}</span>}
            </span>
          </p>
        )}
      </section>

      {a.whatsAppLoja && (
        <Button asChild variant="outline" size="lg">
          <a
            href={linkWhatsApp(
              a.whatsAppLoja,
              `Olá! Sobre o meu pedido #${a.numero} no ${a.nomeLoja}.`,
            )}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircleIcon data-icon="inline-start" />
            Falar com a loja no WhatsApp
          </a>
        </Button>
      )}
    </main>
  )
}

function LinhaDoTempo({ a }: { a: Acompanhamento }) {
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-elevado">
      <h2 className="sr-only">Andamento</h2>
      <ol aria-label="Andamento do pedido" className="flex flex-col">
        {a.etapas.map((e, i) => (
          <li
            key={e.titulo}
            aria-current={e.atual ? "step" : undefined}
            className="relative flex gap-4 pb-6 last:pb-0"
          >
            {i < a.etapas.length - 1 && (
              <span aria-hidden className="absolute top-8 bottom-0 left-[15px] w-0.5 bg-border">
                <m.span
                  className="block h-full w-full origin-top bg-sucesso"
                  initial={false}
                  animate={{ scaleY: a.etapas[i + 1]?.feito ? 1 : 0 }}
                  transition={transicao("enfase")}
                />
              </span>
            )}
            <m.span
              initial={false}
              animate={{ scale: e.atual ? 1.08 : 1 }}
              transition={transicao("base")}
              className={cn(
                "relative grid size-8 shrink-0 place-items-center rounded-full border-2",
                e.feito
                  ? "border-sucesso bg-sucesso text-sucesso-foreground"
                  : "border-border bg-background",
                e.atual && "ring-4 ring-sucesso/20",
              )}
            >
              {e.feito ? (
                <CheckIcon aria-hidden className="size-4" />
              ) : (
                <span className="size-2 rounded-full bg-border" />
              )}
            </m.span>
            <div className="flex flex-col pt-1">
              <span className={cn("font-semibold", !e.feito && "text-muted-foreground")}>
                {e.titulo}
              </span>
              {e.atual && !a.final && (
                <span className="flex items-center gap-1 text-muted-foreground text-sm">
                  <ClockIcon aria-hidden className="size-3.5" />
                  Atualiza sozinho a cada 5 segundos
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

function BlocoPix({ a }: { a: Acompanhamento }) {
  const [copiado, setCopiado] = useState(false)
  const pagar = useMutation({ mutationFn: () => simularPagamento(a.token) })
  const codigo = a.pixCopiaECola ?? ""

  async function copiar() {
    try {
      await navigator.clipboard.writeText(codigo)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    } catch {
      document.getElementById("pix-codigo")?.focus()
    }
  }

  return (
    <section
      aria-label="Pagamento com Pix"
      className="flex flex-col items-center gap-4 rounded-2xl border-2 border-primary/30 bg-card p-5 text-center shadow-elevado"
    >
      <div className="flex flex-col gap-1">
        <h2 className="font-bold text-xl">Pague com Pix para confirmar</h2>
        {a.pixExpiraEm && (
          <p className="text-muted-foreground text-sm">
            O código vale até <strong className="text-foreground">{a.pixExpiraEm}</strong>.
          </p>
        )}
      </div>
      <div
        role="img"
        aria-label="QR Code do Pix"
        className="rounded-2xl bg-white p-4 shadow-elevado"
      >
        <QRCodeSVG value={codigo} size={196} level="M" />
      </div>
      <div className="flex w-full flex-col gap-2">
        <label htmlFor="pix-codigo" className="sr-only">
          Código Pix copia e cola
        </label>
        <Input
          id="pix-codigo"
          readOnly
          value={codigo}
          onFocus={(e) => e.currentTarget.select()}
          className="text-xs"
        />
        <Button size="lg" onClick={copiar}>
          {copiado ? <CheckIcon data-icon="inline-start" /> : <CopyIcon data-icon="inline-start" />}
          {copiado ? "Código copiado" : "Copiar código Pix"}
        </Button>
      </div>
      <p className="text-muted-foreground text-sm">
        Assim que o pagamento cair, o pedido vai para a cozinha. Não precisa recarregar a página.
      </p>
      <Button variant="ghost" size="sm" disabled={pagar.isPending} onClick={() => pagar.mutate()}>
        {pagar.isPending && <Spinner data-icon="inline-start" />}
        Simular pagamento (teste)
      </Button>
    </section>
  )
}

function BlocoCartao({ token }: { token: string }) {
  const pagar = useMutation({ mutationFn: () => simularPagamento(token) })
  return (
    <section className="flex flex-col gap-3 rounded-2xl border-2 border-primary/30 bg-card p-5 shadow-elevado">
      <h2 className="font-bold text-xl">Falta pagar com cartão</h2>
      <p className="text-muted-foreground text-sm">
        No sistema real, você vai para a página segura do pagamento. Nesta versão de teste, o
        pagamento é simulado.
      </p>
      <Button size="lg" disabled={pagar.isPending} onClick={() => pagar.mutate()}>
        {pagar.isPending ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <CreditCardIcon data-icon="inline-start" />
        )}
        Pagar com cartão (simulado)
      </Button>
    </section>
  )
}

function Linha({ termo, valor, forte }: { termo: string; valor: string; forte?: boolean }) {
  return (
    <div className={cn("flex justify-between", forte && "font-bold text-base")}>
      <dt className={cn(!forte && "text-muted-foreground")}>{termo}</dt>
      <dd className="numeros">{valor}</dd>
    </div>
  )
}
