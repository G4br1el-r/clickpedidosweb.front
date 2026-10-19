import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  BellIcon,
  BikeIcon,
  EllipsisVerticalIcon,
  ExternalLinkIcon,
  MessageCircleIcon,
  PrinterIcon,
  WifiOffIcon,
  XCircleIcon,
} from "lucide-react"
import { AnimatePresence, m } from "motion/react"
import { useEffect, useRef, useState } from "react"
import { Link } from "react-router"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { abrirCupom, imprimirCupom } from "@/features/admin/impressao/impressao"
import { avisar } from "@/lib/avisos"
import { transicao } from "@/lib/motion"
import { tocarAlerta } from "@/lib/som"
import { banco } from "@/mock/banco"
import {
  abrirFecharLoja,
  avancarPedido,
  cancelarPedido,
  definirMotoboy,
  type Fila,
  obterFila,
} from "@/mock/fila/acoes"
import { paraCliente } from "@/mock/regras/mensagens"
import { proximoStatus } from "@/mock/regras/status"
import { linkWhatsApp } from "@/mock/regras/texto"
import type { Pedido, StatusPedido } from "@/types/entidades"
import { CabecalhoPagina } from "../componentes/CabecalhoPagina"
import { StatusAgente } from "../impressao/StatusAgente"
import { CartaoPedido } from "./CartaoPedido"
import { COLUNAS_FILA, ColunaFila } from "./ColunaFila"
import { usePreferenciasFila } from "./preferencias"

const CHAVE = ["fila"] as const
/** Como o fila.js: atualiza a cada 5 s (e na hora, quando o banco muda). */
const INTERVALO_MS = 5000
const DESTAQUE_MS = 8000

export function PaginaFila() {
  const cliente = useQueryClient()
  const fila = useQuery({
    queryKey: CHAVE,
    queryFn: () => obterFila(),
    refetchInterval: INTERVALO_MS,
  })
  const { som, autoImprimir, definirSom, definirAutoImprimir } = usePreferenciasFila()
  const [destaques, setDestaques] = useState<Set<number>>(new Set())
  const [cancelando, setCancelando] = useState<Pedido | null>(null)
  const conhecidos = useRef<Set<number> | null>(null)
  const enfileirados = useRef(new Set<number>())
  const agora = useRelogio()

  // Pedido novo: alerta sonoro, destaque e impressão automática (porta de fila.js).
  useEffect(() => {
    const dados = fila.data
    if (!dados) return
    const novos = dados.pedidos.filter((p) => p.status === "Recebido")
    const chegaram = conhecidos.current ? novos.filter((p) => !conhecidos.current?.has(p.id)) : []
    if (chegaram.length > 0) {
      if (som) tocarAlerta()
      setDestaques((d) => new Set([...d, ...chegaram.map((p) => p.id)]))
      setTimeout(
        () =>
          setDestaques((d) => new Set([...d].filter((id) => !chegaram.some((p) => p.id === id)))),
        DESTAQUE_MS,
      )
    }
    conhecidos.current = new Set(dados.pedidos.map((p) => p.id))

    if (autoImprimir) {
      for (const p of novos) {
        if (p.impressoEm || enfileirados.current.has(p.id)) continue
        enfileirados.current.add(p.id)
        imprimirCupom(p.id)
      }
    }
  }, [fila.data, som, autoImprimir])

  // Atualização otimista: o card muda de coluna na hora; se falhar, volta.
  const avanco = useMutation({
    mutationFn: (p: Pedido) => avancarPedido(p.id),
    onMutate: async (p) => {
      await cliente.cancelQueries({ queryKey: CHAVE })
      const antes = cliente.getQueryData<Fila>(CHAVE)
      const proximo = proximoStatus(p)
      if (antes && proximo)
        cliente.setQueryData<Fila>(CHAVE, {
          ...antes,
          pedidos: antes.pedidos
            .map((x) => (x.id === p.id ? { ...x, status: proximo } : x))
            .filter((x) => x.status !== "Concluido"),
        })
      return { antes }
    },
    onSuccess: (r, p) => {
      if (!r.ok) avisar.erro(r.erro)
      else if (r.status === "Concluido") avisar.sucesso(`Pedido #${p.id} concluído.`)
    },
    onError: (_e, _p, ctx) => ctx?.antes && cliente.setQueryData(CHAVE, ctx.antes),
    onSettled: () => cliente.invalidateQueries({ queryKey: CHAVE }),
  })

  const cancelamento = useMutation({
    mutationFn: (p: Pedido) => cancelarPedido(p.id),
    onSuccess: (r, p) => (r.ok ? avisar(`Pedido #${p.id} cancelado.`) : avisar.erro(r.erro)),
    onSettled: () => cliente.invalidateQueries({ queryKey: CHAVE }),
  })

  const loja = useMutation({
    mutationFn: (aberta: boolean) => abrirFecharLoja(aberta),
    onSuccess: (r) =>
      avisar(
        r.lojaAberta ? "Loja aberta para pedidos." : "Loja fechada. O cardápio continua visível.",
      ),
    onSettled: () => cliente.invalidateQueries(),
  })

  const dados = fila.data
  const emAndamento = dados?.pedidos.length ?? 0

  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina
        titulo="Fila de pedidos"
        descricao={
          dados
            ? `${emAndamento} em andamento · ${dados.concluidosHoje} concluídos hoje · ${dados.aguardandoPagamento} aguardando pagamento`
            : "Carregando…"
        }
        acoes={
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border bg-card px-4 py-2.5 shadow-elevado">
            <Chave
              rotulo="Loja aberta"
              marcado={dados?.lojaAberta ?? false}
              desabilitado={!dados || loja.isPending}
              aoMudar={(v) => loja.mutate(v)}
            />
            <Chave
              rotulo="Alerta sonoro"
              marcado={som}
              aoMudar={(v) => {
                definirSom(v)
                if (v) tocarAlerta()
              }}
            />
            <Chave
              rotulo="Imprimir novos pedidos"
              marcado={autoImprimir}
              aoMudar={definirAutoImprimir}
            />
            <StatusAgente />
          </div>
        }
      />

      {autoImprimir && (
        <p className="flex items-center gap-2 rounded-xl bg-status-aguardando px-4 py-2.5 text-sm text-status-aguardando-foreground">
          <PrinterIcon aria-hidden className="size-4" />
          Deixe "Imprimir novos pedidos" ligado em <strong>um computador só</strong>, senão o cupom
          sai em dobro.
        </p>
      )}

      {fila.isError && (
        <p className="flex items-center gap-2 rounded-xl bg-status-cancelado px-4 py-2.5 text-sm text-status-cancelado-foreground">
          <WifiOffIcon aria-hidden className="size-4" />
          Sem conexão com o servidor. Tentando de novo…
        </p>
      )}

      {!dados ? (
        <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-96 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid items-start gap-3 md:grid-cols-2 2xl:grid-cols-4">
          {COLUNAS_FILA.map((coluna) => {
            const daColuna = dados.pedidos.filter((p) =>
              (coluna.status as readonly StatusPedido[]).includes(p.status),
            )
            return (
              <ColunaFila
                key={coluna.id}
                titulo={coluna.titulo}
                quantidade={daColuna.length}
                cor={coluna.cor}
                vazio={coluna.vazio}
              >
                <AnimatePresence initial={false} mode="popLayout">
                  {daColuna.map((p) => (
                    <m.div
                      key={p.id}
                      layout
                      layoutId={`fila-${p.id}`}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={transicao("enfase")}
                    >
                      <CartaoPedido
                        pedido={p}
                        agora={agora}
                        destaque={destaques.has(p.id)}
                        aoAvancar={(x) => avanco.mutate(x)}
                        acoes={
                          <AcoesDoPedido
                            pedido={p}
                            motoboys={dados.motoboys}
                            aoCancelar={() => setCancelando(p)}
                          />
                        }
                      />
                    </m.div>
                  ))}
                </AnimatePresence>
              </ColunaFila>
            )
          })}
        </div>
      )}

      <AlertDialog open={cancelando !== null} onOpenChange={(v) => !v && setCancelando(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar o pedido #{cancelando?.id}?</AlertDialogTitle>
            <AlertDialogDescription>
              O pedido sai da fila e o cliente vê "Cancelado" no acompanhamento. Pagamento online já
              feito precisa ser estornado no painel do Mercado Pago.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                if (cancelando) cancelamento.mutate(cancelando)
                setCancelando(null)
              }}
            >
              Cancelar pedido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function AcoesDoPedido({
  pedido,
  motoboys,
  aoCancelar,
}: {
  pedido: Pedido
  motoboys: Fila["motoboys"]
  aoCancelar: () => void
}) {
  const precisaMotoboy =
    pedido.tipo === "Entrega" && (pedido.status === "Pronto" || pedido.status === "SaiuParaEntrega")

  async function chamar(motoboyId: number) {
    const r = await definirMotoboy(pedido.id, motoboyId)
    if (!r.ok) return avisar.erro(r.erro)
    window.open(r.whatsappUrl, "_blank", "noopener")
  }

  function avisarCliente() {
    const d = banco.ler()
    const link = `${window.location.origin}/pedido/${pedido.token}`
    window.open(
      linkWhatsApp(pedido.clienteTelefone, paraCliente(pedido, d.loja, link)),
      "_blank",
      "noopener",
    )
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            aria-label={`Imprimir pedido #${pedido.id}`}
            onClick={() => imprimirCupom(pedido.id)}
          >
            <PrinterIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{pedido.impressoEm ? "Imprimir de novo" : "Imprimir cupom"}</TooltipContent>
      </Tooltip>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label={`Mais ações do pedido #${pedido.id}`}>
            <EllipsisVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {precisaMotoboy && motoboys.length > 0 && (
            <>
              <DropdownMenuGroup>
                <DropdownMenuLabel>Chamar motoboy</DropdownMenuLabel>
                {motoboys.map((mb) => (
                  <DropdownMenuItem key={mb.id} onSelect={() => void chamar(mb.id)}>
                    <BikeIcon />
                    {mb.nome}
                    {pedido.motoboyId === mb.id && (
                      <span className="ml-auto text-muted-foreground text-xs">atual</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link to={`/admin/pedidos/${pedido.id}`}>
                <ExternalLinkIcon />
                Ver detalhes
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={avisarCliente}>
              <MessageCircleIcon />
              Avisar cliente no WhatsApp
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => abrirCupom(pedido.id)}>
              <BellIcon />
              Ver cupom
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem variant="destructive" onSelect={aoCancelar}>
              <XCircleIcon />
              Cancelar pedido
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

function Chave({
  rotulo,
  marcado,
  desabilitado,
  aoMudar,
}: {
  rotulo: string
  marcado: boolean
  desabilitado?: boolean
  aoMudar: (v: boolean) => void
}) {
  const id = `chave-${rotulo.toLowerCase().replace(/\s+/g, "-")}`
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2 font-medium text-sm">
      <Switch
        id={id}
        checked={marcado}
        disabled={desabilitado}
        onCheckedChange={aoMudar}
        aria-label={rotulo}
      />
      {rotulo}
    </label>
  )
}

/** Relógio de 30 s para o "há X min" dos cards andar sem depender da busca. */
function useRelogio() {
  const [agora, setAgora] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setAgora(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])
  return agora
}
