import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  ArrowLeftIcon,
  BanknoteIcon,
  CircleDollarSignIcon,
  MapIcon,
  MessageCircleIcon,
  PhoneIcon,
  PrinterIcon,
  XCircleIcon,
} from "lucide-react"
import { type ReactNode, useState } from "react"
import { Link, useParams } from "react-router"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { BadgeStatus } from "@/components/ui/badge-status"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { abrirCupom } from "@/features/admin/impressao/impressao"
import { avisar } from "@/lib/avisos"
import { formatarDataHora } from "@/lib/datas"
import { formatarMoeda } from "@/lib/moeda"
import { avancarPedido, definirMotoboy } from "@/mock/fila/acoes"
import { marcarPago, mudarStatus, obterPedidoAdmin } from "@/mock/pedidos/admin"
import { enderecoCompleto } from "@/mock/regras/acompanhamento"
import { linkMapa } from "@/mock/regras/mensagens"
import {
  rotuloAcao,
  rotuloPagamento,
  rotuloSituacaoPagamento,
  rotuloStatus,
} from "@/mock/regras/rotulos"
import { formatarCep, formatarTelefone } from "@/mock/regras/texto"
import { STATUS_PEDIDO, type StatusPedido } from "@/types/entidades"
import { iconeTipo, origemDoPedido, textoTroco } from "./rotulos-ui"

export function PaginaPedidoDetalhe() {
  const id = Number(useParams()["id"])
  const cliente = useQueryClient()
  const consulta = useQuery({ queryKey: ["pedido-admin", id], queryFn: () => obterPedidoAdmin(id) })
  const [statusEscolhido, setStatusEscolhido] = useState<StatusPedido | "">("")

  const aposAcao = (
    r: { ok: true; mensagem?: string } | { ok: false; erro: string },
    sucesso?: string,
  ) => {
    if (!r.ok) avisar.erro(r.erro)
    else avisar.sucesso(r.mensagem ?? sucesso ?? "Pedido atualizado.")
    void cliente.invalidateQueries()
  }

  const avanco = useMutation({
    mutationFn: () => avancarPedido(id),
    onSuccess: (r) => aposAcao(r, `Pedido #${id} atualizado.`),
  })
  const troca = useMutation({
    mutationFn: (s: StatusPedido) => mudarStatus(id, s),
    onSuccess: (r) => aposAcao(r),
  })
  const pagamento = useMutation({ mutationFn: () => marcarPago(id), onSuccess: (r) => aposAcao(r) })
  const motoboy = useMutation({
    mutationFn: (motoboyId: number) => definirMotoboy(id, motoboyId),
    onSuccess: (r) => {
      if (!r.ok) return avisar.erro(r.erro)
      window.open(r.whatsappUrl, "_blank", "noopener")
      void cliente.invalidateQueries()
    },
  })

  if (consulta.isPending)
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    )

  const d = consulta.data
  if (!d)
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Pedido não encontrado</EmptyTitle>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link to="/admin/pedidos">Voltar aos pedidos</Link>
          </Button>
        </EmptyContent>
      </Empty>
    )

  const p = d.pedido
  const Icone = iconeTipo[p.tipo]
  const acao = rotuloAcao(p.status, p.tipo)
  const troco = textoTroco(p)

  return (
    <div className="flex flex-col gap-6">
      <Button asChild variant="ghost" className="w-fit">
        <Link to="/admin/pedidos">
          <ArrowLeftIcon data-icon="inline-start" />
          Pedidos do dia
        </Link>
      </Button>

      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-extrabold text-3xl tracking-[-0.02em]">Pedido #{p.id}</h1>
            <BadgeStatus status={p.status} tipo={p.tipo} />
          </div>
          <p className="flex items-center gap-2 text-muted-foreground">
            <Icone aria-hidden className="size-4" />
            {origemDoPedido(p)} · {formatarDataHora(p.criadoEm)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => abrirCupom(p.id)}>
            <PrinterIcon data-icon="inline-start" />
            Imprimir
          </Button>
          {acao && (
            <Button
              variant={p.status === "EmPreparo" ? "sucesso" : "default"}
              disabled={avanco.isPending}
              onClick={() => avanco.mutate()}
            >
              {acao}
            </Button>
          )}
        </div>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[3fr_2fr]">
        <div className="flex flex-col gap-6">
          <Bloco titulo="Itens">
            <ul className="flex flex-col divide-y">
              {p.itens.map((i) => (
                <li key={i.id} className="flex justify-between gap-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-semibold">
                      <span className="numeros">{i.quantidade}×</span> {i.nomeProduto}
                    </span>
                    {i.opcoesResumo && (
                      <span className="text-muted-foreground text-sm">{i.opcoesResumo}</span>
                    )}
                    {i.observacao && (
                      <span className="mt-1 w-fit rounded-md bg-gema px-2 py-0.5 font-medium text-gema-foreground text-sm">
                        {i.observacao}
                      </span>
                    )}
                  </div>
                  <span className="numeros shrink-0 font-semibold">{formatarMoeda(i.total)}</span>
                </li>
              ))}
            </ul>
            <dl className="flex flex-col gap-1.5 border-t pt-3">
              <Linha termo="Subtotal">{formatarMoeda(p.subtotal)}</Linha>
              {p.taxaEntrega > 0 && <Linha termo="Entrega">{formatarMoeda(p.taxaEntrega)}</Linha>}
              <Linha termo="Total" forte>
                {formatarMoeda(p.total)}
              </Linha>
            </dl>
            {p.observacao && (
              <p className="rounded-lg bg-gema px-3 py-2 font-medium text-gema-foreground">
                Observação: {p.observacao}
              </p>
            )}
          </Bloco>

          <Bloco titulo="Ações">
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex min-w-56 flex-col gap-1.5">
                <span className="font-medium text-sm">Mudar status</span>
                <Select
                  value={statusEscolhido}
                  onValueChange={(v) => setStatusEscolhido(v as StatusPedido)}
                >
                  <SelectTrigger aria-label="Novo status" className="w-full">
                    <SelectValue placeholder="Escolha o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {STATUS_PEDIDO.filter((s) => s !== "Cancelado").map((s) => (
                        <SelectItem key={s} value={s}>
                          {rotuloStatus(s, p.tipo)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="secondary"
                disabled={!statusEscolhido || troca.isPending}
                onClick={() => statusEscolhido && troca.mutate(statusEscolhido)}
              >
                Mudar
              </Button>
              {p.statusPagamento !== "Pago" && p.status !== "Cancelado" && (
                <Button
                  variant="outline"
                  disabled={pagamento.isPending}
                  onClick={() => pagamento.mutate()}
                >
                  <CircleDollarSignIcon data-icon="inline-start" />
                  Marcar como pago
                </Button>
              )}
              {p.status !== "Cancelado" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <XCircleIcon data-icon="inline-start" />
                      Cancelar pedido
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancelar o pedido #{p.id}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        O cliente vê "Cancelado" no acompanhamento. Pagamento online já feito
                        precisa ser estornado no painel do Mercado Pago.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Voltar</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-white hover:bg-destructive/90"
                        onClick={() => troca.mutate("Cancelado")}
                      >
                        Cancelar pedido
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </Bloco>
        </div>

        <div className="flex flex-col gap-6">
          <Bloco titulo="Cliente">
            <p className="font-semibold text-lg">{p.clienteNome}</p>
            {p.clienteTelefone && (
              <p className="flex items-center gap-2 text-muted-foreground">
                <PhoneIcon aria-hidden className="size-4" />
                {formatarTelefone(p.clienteTelefone)}
              </p>
            )}
            {p.tipo === "Entrega" && (
              <div className="flex flex-col gap-1">
                <p>{enderecoCompleto(p)}</p>
                <p className="text-muted-foreground text-sm">CEP {formatarCep(p.cep)}</p>
                {p.referencia && (
                  <p className="text-muted-foreground text-sm">Referência: {p.referencia}</p>
                )}
              </div>
            )}
            <div className="flex flex-wrap gap-2 pt-1">
              <Button asChild variant="outline" size="sm">
                <a href={d.whatsappCliente} target="_blank" rel="noreferrer">
                  <MessageCircleIcon data-icon="inline-start" />
                  Avisar cliente no WhatsApp
                </a>
              </Button>
              {p.tipo === "Entrega" && (
                <Button asChild variant="outline" size="sm">
                  <a href={linkMapa(p)} target="_blank" rel="noreferrer">
                    <MapIcon data-icon="inline-start" />
                    Abrir no mapa
                  </a>
                </Button>
              )}
            </div>
          </Bloco>

          <Bloco titulo="Pagamento">
            <p className="flex items-center gap-2 font-semibold">
              <BanknoteIcon aria-hidden className="size-4 text-marca-forte" />
              {rotuloPagamento(p.pagamento)} · {rotuloSituacaoPagamento(p.statusPagamento)}
            </p>
            {troco && <p className="text-sm">{troco}</p>}
            {p.clienteCpf && (
              <p className="text-muted-foreground text-sm">
                CPF {p.clienteCpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4")}
              </p>
            )}
          </Bloco>

          {p.tipo === "Entrega" && (
            <Bloco titulo="Motoboy">
              {d.motoboy && <p className="font-semibold">{d.motoboy.nome}</p>}
              {d.motoboys.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Nenhum motoboy ativo.{" "}
                  <Link className="underline" to="/admin/motoboys">
                    Cadastrar
                  </Link>
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {d.motoboys.map((m) => (
                    <Button
                      key={m.id}
                      variant={d.motoboy?.id === m.id ? "default" : "outline"}
                      size="sm"
                      disabled={motoboy.isPending}
                      onClick={() => motoboy.mutate(m.id)}
                    >
                      <MessageCircleIcon data-icon="inline-start" />
                      Chamar {m.nome}
                    </Button>
                  ))}
                </div>
              )}
            </Bloco>
          )}
        </div>
      </div>
    </div>
  )
}

function Bloco({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-elevado">
      <h2 className="font-bold text-xl">{titulo}</h2>
      {children}
    </section>
  )
}

function Linha({
  termo,
  forte,
  children,
}: {
  termo: string
  forte?: boolean
  children: ReactNode
}) {
  return (
    <div
      className={forte ? "flex justify-between font-bold text-lg" : "flex justify-between text-sm"}
    >
      <dt className={forte ? undefined : "text-muted-foreground"}>{termo}</dt>
      <dd className="numeros">{children}</dd>
    </div>
  )
}
