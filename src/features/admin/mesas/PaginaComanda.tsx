import { useMutation, useQuery } from "@tanstack/react-query"
import { ArrowLeftIcon, PlusIcon, PrinterIcon, ReceiptTextIcon } from "lucide-react"
import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { BadgeStatus } from "@/components/ui/badge-status"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { avisar } from "@/lib/avisos"
import { formatarHora } from "@/lib/datas"
import { formatarMoeda } from "@/lib/moeda"
import { liberarMesa, obterMesa } from "@/mock/mesas/acoes"
import { CabecalhoPagina } from "../componentes/CabecalhoPagina"
import { ConfirmarExclusao } from "../componentes/ConfirmarExclusao"
import { imprimirCupom } from "../impressao/impressao"
import { FecharConta } from "./FecharConta"

export function PaginaComanda() {
  const id = Number(useParams()["id"])
  const navegar = useNavigate()
  const consulta = useQuery({ queryKey: ["mesa", id], queryFn: () => obterMesa(id) })
  const [fechando, setFechando] = useState(false)
  const liberacao = useMutation({
    mutationFn: () => liberarMesa(id),
    onSuccess: (r) => {
      if (!r.ok) return avisar.erro(r.erro)
      avisar.sucesso(r.mensagem)
      navegar("/admin/mesas")
    },
  })

  if (consulta.data === undefined) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    )
  }
  const m = consulta.data
  if (!m) {
    return (
      <div className="flex flex-col items-start gap-4">
        <CabecalhoPagina titulo="Mesa não encontrada" descricao="Ela pode ter sido excluída." />
        <Button variant="outline" asChild>
          <Link to="/admin/mesas">Ver todas as mesas</Link>
        </Button>
      </div>
    )
  }
  const p = m.pedido

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          to="/admin/mesas"
          className="flex w-fit items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
        >
          <ArrowLeftIcon aria-hidden className="size-4" />
          Todas as mesas
        </Link>
        <CabecalhoPagina
          titulo={`Comanda · ${m.nome}`}
          descricao={
            m.status === "Livre"
              ? "Mesa livre"
              : `${m.clienteNome?.trim() || "Cliente no local"}${m.ocupadaEm ? ` · desde ${formatarHora(m.ocupadaEm)}` : ""}`
          }
          acoes={
            <>
              <Button variant="outline" asChild>
                <Link to={`/admin/garcom?mesa=${m.id}`}>
                  <PlusIcon data-icon="inline-start" />
                  Lançar itens
                </Link>
              </Button>
              {p && (
                <>
                  <Button variant="outline" onClick={() => imprimirCupom(p.id)}>
                    <PrinterIcon data-icon="inline-start" />
                    Imprimir conta
                  </Button>
                  <Button variant="sucesso" onClick={() => setFechando(true)}>
                    Fechar conta
                  </Button>
                </>
              )}
            </>
          }
        />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_20rem]">
        <section
          aria-labelledby="titulo-itens"
          className="overflow-hidden rounded-2xl border bg-card shadow-elevado"
        >
          <h2 id="titulo-itens" className="border-b px-5 py-3 font-bold text-lg">
            Itens da comanda
          </h2>
          {p && p.itens.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                  <TableHead className="text-right">Unitário</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {p.itens.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="whitespace-normal">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold">{i.nomeProduto}</span>
                        {i.opcoesResumo && (
                          <span className="text-muted-foreground text-sm">{i.opcoesResumo}</span>
                        )}
                        {i.observacao && (
                          <span className="font-medium text-primary text-sm">{i.observacao}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="numeros text-right">{i.quantidade}</TableCell>
                    <TableCell className="numeros text-right text-muted-foreground">
                      {formatarMoeda(i.precoUnitario)}
                    </TableCell>
                    <TableCell className="numeros text-right font-semibold">
                      {formatarMoeda(i.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className="font-semibold">
                    Total da comanda
                  </TableCell>
                  <TableCell className="numeros text-right font-bold text-lg">
                    {formatarMoeda(p.total)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          ) : (
            <Empty className="py-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ReceiptTextIcon />
                </EmptyMedia>
                <EmptyTitle>Nenhum item lançado</EmptyTitle>
                <EmptyDescription>
                  Use "Lançar itens" para abrir a comanda desta mesa.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </section>

        <aside className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-elevado">
          <h2 className="font-bold text-lg">Dados da mesa</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Número</dt>
            <dd className="numeros">{m.numero}</dd>
            <dt className="text-muted-foreground">Situação</dt>
            <dd>{m.status === "Livre" ? "Livre" : "Ocupada"}</dd>
            {p && (
              <>
                <dt className="text-muted-foreground">Pedido</dt>
                <dd className="numeros">#{p.id}</dd>
                <dt className="text-muted-foreground">Cozinha</dt>
                <dd>
                  <BadgeStatus status={p.status} tipo={p.tipo} tamanho="sm" />
                </dd>
                {p.garcomNome && (
                  <>
                    <dt className="text-muted-foreground">Garçom</dt>
                    <dd>{p.garcomNome}</dd>
                  </>
                )}
                {p.observacao && (
                  <>
                    <dt className="text-muted-foreground">Observação</dt>
                    <dd>{p.observacao}</dd>
                  </>
                )}
              </>
            )}
          </dl>
          {m.status !== "Livre" && (
            <ConfirmarExclusao
              titulo={`Liberar a ${m.nome} sem fechar a conta?`}
              descricao="A mesa fica livre, mas a comanda não é marcada como paga. Para receber, use Fechar conta."
              rotuloAcao="Liberar mesa"
              onConfirmar={() => liberacao.mutate()}
            >
              <Button variant="outline" className="mt-2">
                Liberar mesa manualmente
              </Button>
            </ConfirmarExclusao>
          )}
        </aside>
      </div>

      {fechando && (
        <FecharConta
          mesa={m}
          aberto
          aoFechar={() => setFechando(false)}
          aoConcluir={() => navegar("/admin/mesas")}
        />
      )}
    </div>
  )
}
