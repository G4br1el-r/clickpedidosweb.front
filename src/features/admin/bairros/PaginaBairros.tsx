import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import { MapPinnedIcon, PencilIcon, PlusIcon, SearchIcon, Trash2Icon } from "lucide-react"
import { type FormEvent, useDeferredValue, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PainelResponsivo } from "@/components/ui/painel-responsivo"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { TabelaDados } from "@/components/ui/tabela-dados"
import { avisar } from "@/lib/avisos"
import { formatarMoeda } from "@/lib/moeda"
import {
  alternarBairro,
  criarBairro,
  editarBairro,
  excluirBairro,
  listarBairrosAdmin,
} from "@/mock/bairros/acoes"
import type { BairroEntrega } from "@/types/entidades"
import { CabecalhoPagina } from "../componentes/CabecalhoPagina"
import { ConfirmarExclusao } from "../componentes/ConfirmarExclusao"

const TODAS = "__todas"
const emReais = (v: number) => v.toFixed(2).replace(".", ",")

export function PaginaBairros() {
  const [cidade, setCidade] = useState(TODAS)
  const [busca, setBusca] = useState("")
  const buscaAdiada = useDeferredValue(busca)
  const [editando, setEditando] = useState<BairroEntrega | null>(null)

  const filtro = {
    ...(cidade !== TODAS && { cidade }),
    ...(buscaAdiada.trim() && { busca: buscaAdiada }),
  }
  const consulta = useQuery({
    queryKey: ["bairros-admin", filtro],
    queryFn: () => listarBairrosAdmin(filtro),
    placeholderData: keepPreviousData,
  })
  const todos = useQuery({
    queryKey: ["bairros-admin", {}],
    queryFn: () => listarBairrosAdmin({}),
  })
  const bairros = consulta.data?.bairros
  const cidades = todos.data?.cidades ?? []
  const ativos = todos.data?.bairros.filter((b) => b.ativo).length ?? 0
  const filtrando = cidade !== TODAS || busca.trim() !== ""

  const colunas: ColumnDef<BairroEntrega>[] = [
    { accessorKey: "cidade", header: "Cidade" },
    {
      accessorKey: "nome",
      header: "Bairro",
      cell: ({ row }) => <span className="font-semibold">{row.original.nome}</span>,
    },
    {
      accessorKey: "taxa",
      header: "Taxa de entrega",
      meta: { direita: true },
      cell: ({ row }) => (
        <span className="numeros font-semibold">
          {row.original.taxa === 0 ? "Grátis" : formatarMoeda(row.original.taxa)}
        </span>
      ),
    },
    {
      accessorKey: "ativo",
      header: "Ativo",
      enableSorting: false,
      cell: ({ row }) => <AlternarAtivo bairro={row.original} />,
    },
    {
      id: "acoes",
      header: () => <span className="sr-only">Ações</span>,
      enableSorting: false,
      cell: ({ row }) => <Acoes bairro={row.original} aoEditar={setEditando} />,
    },
  ]

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <CabecalhoPagina
        titulo="Taxas de entrega por bairro"
        descricao="No checkout do cliente ou do garçom, a taxa do bairro é aplicada automaticamente."
        acoes={
          todos.data && (
            <Badge variant="outline" className="numeros h-8 px-3 text-sm">
              {ativos} {ativos === 1 ? "bairro ativo" : "bairros ativos"}
            </Badge>
          )
        }
      />

      <NovoBairro cidades={cidades} />

      <section
        aria-labelledby="titulo-bairros"
        className="overflow-hidden rounded-2xl border bg-card shadow-elevado"
      >
        <header className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3">
          <h2 id="titulo-bairros" className="font-bold text-lg">
            Bairros cadastrados
            {bairros && <span className="numeros text-muted-foreground"> ({bairros.length})</span>}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            {cidades.length > 1 && (
              <Select value={cidade} onValueChange={setCidade}>
                <SelectTrigger className="w-48" aria-label="Filtrar por cidade">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value={TODAS}>Todas as cidades</SelectItem>
                    {cidades.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
            <div className="relative">
              <SearchIcon
                aria-hidden
                className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground"
              />
              <Input
                type="search"
                placeholder="Buscar bairro"
                aria-label="Buscar bairro"
                className="w-56 pl-9"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            {filtrando && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCidade(TODAS)
                  setBusca("")
                }}
              >
                Limpar
              </Button>
            )}
          </div>
        </header>

        {!bairros ? (
          <div className="flex flex-col gap-2 p-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        ) : bairros.length === 0 ? (
          <Empty className="py-12">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MapPinnedIcon />
              </EmptyMedia>
              <EmptyTitle>
                {filtrando ? "Nenhum bairro com esses filtros" : "Nenhum bairro cadastrado"}
              </EmptyTitle>
              <EmptyDescription>
                {filtrando
                  ? "Mude a busca ou limpe os filtros."
                  : "Cadastre acima os bairros que a loja atende."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <TabelaDados
            dados={bairros}
            colunas={colunas}
            idLinha={(b) => String(b.id)}
            classeLinha={(b) => (b.ativo ? undefined : "text-muted-foreground")}
          />
        )}
      </section>

      {editando && (
        <EditarBairro
          key={editando.id}
          bairro={editando}
          cidades={cidades}
          aoFechar={() => setEditando(null)}
        />
      )}
    </div>
  )
}

function ListaCidades({ id, cidades }: { id: string; cidades: string[] }) {
  return (
    <datalist id={id}>
      {cidades.map((c) => (
        <option key={c} value={c} />
      ))}
    </datalist>
  )
}

function NovoBairro({ cidades }: { cidades: string[] }) {
  const [cidade, setCidade] = useState("Cachoeira Paulista")
  const [nome, setNome] = useState("")
  const [taxa, setTaxa] = useState("")
  const [erro, setErro] = useState<string | null>(null)
  const criacao = useMutation({
    mutationFn: () => criarBairro(cidade, nome, taxa),
    onSuccess: (r) => {
      if (!r.ok) return setErro(r.erro)
      setNome("")
      setTaxa("")
      avisar.sucesso(r.mensagem)
    },
  })

  function enviar(e: FormEvent) {
    e.preventDefault()
    setErro(null)
    criacao.mutate()
  }

  return (
    <form
      onSubmit={enviar}
      aria-labelledby="titulo-novo-bairro"
      className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-elevado"
    >
      <h2 id="titulo-novo-bairro" className="font-bold text-lg">
        Cadastrar novo bairro
      </h2>
      <div className="flex flex-wrap items-start gap-3">
        <Field className="w-52">
          <FieldLabel htmlFor="novo-bairro-cidade">Cidade</FieldLabel>
          <Input
            id="novo-bairro-cidade"
            list="cidades-novo-bairro"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
          />
          <ListaCidades id="cidades-novo-bairro" cidades={cidades} />
        </Field>
        <Field className="min-w-48 flex-1">
          <FieldLabel htmlFor="novo-bairro-nome">Nome do bairro</FieldLabel>
          <Input id="novo-bairro-nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        </Field>
        <Field className="w-36">
          <FieldLabel htmlFor="novo-bairro-taxa">Taxa (R$)</FieldLabel>
          <Input
            id="novo-bairro-taxa"
            inputMode="decimal"
            placeholder="5,00"
            className="numeros"
            value={taxa}
            onChange={(e) => setTaxa(e.target.value)}
          />
        </Field>
        <Button type="submit" className="mt-6" disabled={criacao.isPending}>
          {criacao.isPending ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <PlusIcon data-icon="inline-start" />
          )}
          Adicionar bairro
        </Button>
      </div>
      {erro && (
        <p role="alert" className="text-destructive text-sm">
          {erro}
        </p>
      )}
    </form>
  )
}

function AlternarAtivo({ bairro: b }: { bairro: BairroEntrega }) {
  const troca = useMutation({ mutationFn: () => alternarBairro(b.id) })
  return (
    <Switch
      size="sm"
      checked={b.ativo}
      onCheckedChange={() => troca.mutate()}
      aria-label={`Bairro ${b.nome} ativo`}
    />
  )
}

function Acoes({
  bairro: b,
  aoEditar,
}: {
  bairro: BairroEntrega
  aoEditar: (b: BairroEntrega) => void
}) {
  const exclusao = useMutation({
    mutationFn: () => excluirBairro(b.id),
    onSuccess: (r) => (r.ok ? avisar.sucesso(r.mensagem) : avisar.erro(r.erro)),
  })
  return (
    <div className="flex justify-end gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Editar ${b.nome}`}
        onClick={() => aoEditar(b)}
      >
        <PencilIcon />
      </Button>
      <ConfirmarExclusao
        titulo={`Excluir o bairro ${b.nome}?`}
        descricao="Ele some da lista do checkout. Para pausar a entrega lá, desative em vez de excluir."
        onConfirmar={() => exclusao.mutate()}
      >
        <Button variant="ghost" size="icon-sm" aria-label={`Excluir ${b.nome}`}>
          <Trash2Icon />
        </Button>
      </ConfirmarExclusao>
    </div>
  )
}

function EditarBairro({
  bairro,
  cidades,
  aoFechar,
}: {
  bairro: BairroEntrega
  cidades: string[]
  aoFechar: () => void
}) {
  const [cidade, setCidade] = useState(bairro.cidade)
  const [nome, setNome] = useState(bairro.nome)
  const [taxa, setTaxa] = useState(emReais(bairro.taxa))
  const [ativo, setAtivo] = useState(bairro.ativo)
  const [erro, setErro] = useState<string | null>(null)
  const envio = useMutation({
    mutationFn: () => editarBairro(bairro.id, cidade, nome, taxa, ativo),
    onSuccess: (r) => {
      if (!r.ok) return setErro(r.erro)
      avisar.sucesso(r.mensagem)
      aoFechar()
    },
  })

  return (
    <PainelResponsivo
      aberto
      aoMudar={(aberto) => !aberto && aoFechar()}
      titulo={`Editar ${bairro.nome}`}
      rodape={
        <>
          <Button type="button" variant="ghost" onClick={aoFechar}>
            Cancelar
          </Button>
          <Button type="submit" form="form-bairro" disabled={envio.isPending}>
            {envio.isPending && <Spinner data-icon="inline-start" />}
            Salvar bairro
          </Button>
        </>
      }
    >
      <form
        id="form-bairro"
        onSubmit={(e) => {
          e.preventDefault()
          setErro(null)
          envio.mutate()
        }}
      >
        <FieldGroup className="gap-4">
          {erro && (
            <p role="alert" className="text-destructive text-sm">
              {erro}
            </p>
          )}
          <Field>
            <FieldLabel htmlFor="bairro-cidade">Cidade</FieldLabel>
            <Input
              id="bairro-cidade"
              list="cidades-editar-bairro"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
            />
            <ListaCidades id="cidades-editar-bairro" cidades={cidades} />
          </Field>
          <Field>
            <FieldLabel htmlFor="bairro-nome">Nome do bairro</FieldLabel>
            <Input id="bairro-nome" value={nome} onChange={(e) => setNome(e.target.value)} />
          </Field>
          <Field>
            <FieldLabel htmlFor="bairro-taxa">Taxa de entrega (R$)</FieldLabel>
            <Input
              id="bairro-taxa"
              inputMode="decimal"
              className="numeros"
              value={taxa}
              onChange={(e) => setTaxa(e.target.value)}
            />
          </Field>
          <Field orientation="horizontal">
            <Switch id="bairro-ativo" checked={ativo} onCheckedChange={setAtivo} />
            <FieldLabel htmlFor="bairro-ativo" className="font-normal">
              Ativo (aparece no checkout)
            </FieldLabel>
          </Field>
        </FieldGroup>
      </form>
    </PainelResponsivo>
  )
}
