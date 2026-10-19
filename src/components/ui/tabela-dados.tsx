import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react"
import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    /** Alinha cabeçalho e células à direita (valores e números). */
    direita?: boolean
  }
}

interface TabelaDadosProps<T> {
  dados: T[]
  // biome-ignore lint/suspicious/noExplicitAny: cada coluna tem o próprio tipo de valor
  colunas: ColumnDef<T, any>[]
  ordemInicial?: SortingState
  /** Torna a linha clicável e navegável por teclado. */
  aoAbrir?: (linha: T) => void
  rotuloLinha?: (linha: T) => string
  idLinha?: (linha: T) => string
  classeLinha?: (linha: T) => string | undefined
}

/**
 * Tabela padrão do admin sobre o TanStack Table v8: ordenação pelo cabeçalho com
 * aria-sort; colunas com `enableSorting: false` ficam fixas.
 */
export function TabelaDados<T>({
  dados,
  colunas,
  ordemInicial = [],
  aoAbrir,
  rotuloLinha,
  idLinha,
  classeLinha,
}: TabelaDadosProps<T>) {
  const [ordem, setOrdem] = useState<SortingState>(ordemInicial)
  const tabela = useReactTable({
    data: dados,
    columns: colunas,
    state: { sorting: ordem },
    onSortingChange: setOrdem,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...(idLinha && { getRowId: idLinha }),
  })

  return (
    <Table>
      <TableHeader>
        {tabela.getHeaderGroups().map((grupo) => (
          <TableRow key={grupo.id}>
            {grupo.headers.map((h) => {
              const sentido = h.column.getIsSorted()
              const direita = h.column.columnDef.meta?.direita
              const titulo = flexRender(h.column.columnDef.header, h.getContext())
              return (
                <TableHead
                  key={h.id}
                  className={cn(direita && "text-right")}
                  aria-sort={
                    sentido === "asc" ? "ascending" : sentido === "desc" ? "descending" : undefined
                  }
                >
                  {h.column.getCanSort() ? (
                    <button
                      type="button"
                      onClick={h.column.getToggleSortingHandler()}
                      className={cn(
                        "inline-flex w-full items-center gap-1 font-semibold",
                        direita && "justify-end",
                      )}
                    >
                      {titulo}
                      {sentido === "asc" && <ArrowUpIcon aria-hidden className="size-3.5" />}
                      {sentido === "desc" && <ArrowDownIcon aria-hidden className="size-3.5" />}
                    </button>
                  ) : (
                    titulo
                  )}
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
            className={cn(aoAbrir && "cursor-pointer", classeLinha?.(linha.original))}
            {...(aoAbrir && {
              tabIndex: 0,
              "aria-label": rotuloLinha?.(linha.original),
              onClick: () => aoAbrir(linha.original),
              onKeyDown: (e: React.KeyboardEvent) => {
                if (e.target !== e.currentTarget) return
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  aoAbrir(linha.original)
                }
              },
            })}
          >
            {linha.getVisibleCells().map((c) => (
              <TableCell
                key={c.id}
                className={cn(c.column.columnDef.meta?.direita && "text-right")}
              >
                {flexRender(c.column.columnDef.cell, c.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
