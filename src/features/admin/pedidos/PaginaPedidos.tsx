import { useQuery } from "@tanstack/react-query"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowDownIcon, ArrowUpIcon, ClipboardListIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { BadgeStatus } from "@/components/ui/badge-status"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { diaLocal, formatarHora } from "@/lib/datas"
import { formatarMoeda } from "@/lib/moeda"
import { cn } from "@/lib/utils"
import { listarPedidos } from "@/mock/pedidos/admin"
import { rotuloPagamento, rotuloStatus, rotuloTipo } from "@/mock/regras/rotulos"
import { type Pedido, STATUS_PEDIDO, type StatusPedido } from "@/types/entidades"
import { CabecalhoPagina } from "../componentes/CabecalhoPagina"
import { iconeTipo } from "./rotulos-ui"

const colunas: ColumnDef<Pedido>[] = [
  {
    accessorKey: "id",
    header: "Nº",
    cell: ({ row }) => <span className="numeros font-bold">#{row.original.id}</span>,
  },
  {
    accessorKey: "criadoEm",
    header: "Hora",
    cell: ({ row }) => (
      <span className="numeros text-muted-foreground">{formatarHora(row.original.criadoEm)}</span>
    ),
  },
  { accessorKey: "clienteNome", header: "Cliente" },
  {
    accessorKey: "tipo",
    header: "Tipo",
    cell: ({ row }) => {
      const Icone = iconeTipo[row.original.tipo]
      return (
        <span className="flex items-center gap-1.5">
          <Icone aria-hidden className="size-4 text-muted-foreground" />
          {rotuloTipo(row.original.tipo)}
        </span>
      )
    },
  },
  {
    accessorKey: "pagamento",
    header: "Pagamento",
    cell: ({ row }) => (
      <span className="flex flex-col">
        {rotuloPagamento(row.original.pagamento)}
        <span className="text-muted-foreground text-xs">
          {row.original.statusPagamento === "Pago"
            ? "pago"
            : row.original.statusPagamento === "NaEntrega"
              ? "a cobrar"
              : row.original.statusPagamento === "Pendente"
                ? "aguardando"
                : "cancelado"}
        </span>
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <BadgeStatus status={row.original.status} tipo={row.original.tipo} tamanho="sm" />
    ),
  },
  {
    accessorKey: "total",
    header: () => <span className="block text-right">Total</span>,
    cell: ({ row }) => (
      <span className="numeros block text-right font-semibold">
        {formatarMoeda(row.original.total)}
      </span>
    ),
  },
]

export function PaginaPedidos() {
  const [parametros, setParametros] = useSearchParams()
  const navegar = useNavigate()
  const data = parametros.get("data") ?? diaLocal(new Date())
  const status = (parametros.get("status") as StatusPedido | null) ?? undefined
  const [ordem, setOrdem] = useState<SortingState>([{ id: "criadoEm", desc: true }])

  const consulta = useQuery({
    queryKey: ["pedidos", data, status],
    queryFn: () => listarPedidos(status ? { data, status } : { data }),
  })
  const pedidos = useMemo(() => consulta.data ?? [], [consulta.data])
  const total = pedidos
    .filter((p) => p.status !== "Cancelado" && p.status !== "AguardandoPagamento")
    .reduce((s, p) => s + p.total, 0)

  const tabela = useReactTable({
    data: pedidos,
    columns: colunas,
    state: { sorting: ordem },
    onSortingChange: setOrdem,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  function filtrar(chave: "data" | "status", valor: string | null) {
    const novo = new URLSearchParams(parametros)
    if (valor) novo.set(chave, valor)
    else novo.delete(chave)
    setParametros(novo, { replace: true })
  }

  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina
        titulo="Pedidos do dia"
        descricao={
          consulta.data
            ? `${pedidos.length} pedidos · ${formatarMoeda(total)} em vendas válidas`
            : "Carregando…"
        }
        acoes={
          <div className="flex items-center gap-2 text-sm">
            <label htmlFor="filtro-dia" className="font-medium">
              Dia
            </label>
            <Input
              id="filtro-dia"
              type="date"
              value={data}
              onChange={(e) => filtrar("data", e.target.value)}
              className="w-auto"
            />
          </div>
        }
      />

      <ToggleGroup
        type="single"
        variant="outline"
        value={status ?? "todos"}
        onValueChange={(v) => v && filtrar("status", v === "todos" ? null : v)}
        aria-label="Filtrar por status"
        className="flex-wrap"
      >
        <ToggleGroupItem value="todos">Todos</ToggleGroupItem>
        {STATUS_PEDIDO.map((s) => (
          <ToggleGroupItem key={s} value={s}>
            {rotuloStatus(s, "Entrega")}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-elevado">
        {!consulta.data ? (
          <div className="flex flex-col gap-2 p-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        ) : pedidos.length === 0 ? (
          <Empty className="py-14">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ClipboardListIcon />
              </EmptyMedia>
              <EmptyTitle>Nenhum pedido neste dia</EmptyTitle>
              <EmptyDescription>Escolha outro dia ou tire o filtro de status.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              {tabela.getHeaderGroups().map((grupo) => (
                <TableRow key={grupo.id}>
                  {grupo.headers.map((h) => {
                    const sentido = h.column.getIsSorted()
                    return (
                      <TableHead
                        key={h.id}
                        aria-sort={
                          sentido === "asc"
                            ? "ascending"
                            : sentido === "desc"
                              ? "descending"
                              : undefined
                        }
                      >
                        <button
                          type="button"
                          onClick={h.column.getToggleSortingHandler()}
                          className={cn(
                            "inline-flex w-full items-center gap-1 font-semibold",
                            h.column.id === "total" && "justify-end",
                          )}
                        >
                          {flexRender(h.column.columnDef.header, h.getContext())}
                          {sentido === "asc" && <ArrowUpIcon aria-hidden className="size-3.5" />}
                          {sentido === "desc" && <ArrowDownIcon aria-hidden className="size-3.5" />}
                        </button>
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {tabela.getRowModel().rows.map((linha) => (
                <TableRow
                  key={linha.id}
                  className="cursor-pointer"
                  tabIndex={0}
                  aria-label={`Abrir pedido #${linha.original.id}`}
                  onClick={() => navegar(`/admin/pedidos/${linha.original.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      navegar(`/admin/pedidos/${linha.original.id}`)
                    }
                  }}
                >
                  {linha.getVisibleCells().map((c) => (
                    <TableCell key={c.id}>
                      {flexRender(c.column.columnDef.cell, c.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
