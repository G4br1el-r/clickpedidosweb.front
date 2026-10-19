import { useMutation, useQuery } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowLeftIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { type FormEvent, useState } from "react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PainelResponsivo } from "@/components/ui/painel-responsivo"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { TabelaDados } from "@/components/ui/tabela-dados"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { avisar } from "@/lib/avisos"
import {
  criarCategoria,
  excluirCategoria,
  listarCategoriasAdmin,
  salvarCategoria,
} from "@/mock/categorias/acoes"
import type { Categoria } from "@/types/entidades"
import { CabecalhoPagina } from "../componentes/CabecalhoPagina"
import { ConfirmarExclusao } from "../componentes/ConfirmarExclusao"

type CategoriaLinha = Categoria & { totalProdutos: number }

export function PaginaCategorias() {
  const consulta = useQuery({ queryKey: ["categorias-admin"], queryFn: listarCategoriasAdmin })
  const [editando, setEditando] = useState<CategoriaLinha | null>(null)
  const categorias = consulta.data
  const proximaOrdem = Math.max(0, ...(categorias ?? []).map((c) => c.ordem)) + 1

  const colunas: ColumnDef<CategoriaLinha>[] = [
    {
      accessorKey: "nome",
      header: "Nome",
      cell: ({ row }) => <span className="font-semibold">{row.original.nome}</span>,
    },
    {
      accessorKey: "ordem",
      header: "Ordem",
      meta: { direita: true },
      cell: ({ row }) => <span className="numeros">{row.original.ordem}</span>,
    },
    {
      accessorKey: "ativa",
      header: "Visível",
      enableSorting: false,
      cell: ({ row }) => <AlternarVisivel categoria={row.original} />,
    },
    {
      accessorKey: "totalProdutos",
      header: "Produtos",
      meta: { direita: true },
      cell: ({ row }) => <span className="numeros">{row.original.totalProdutos}</span>,
    },
    {
      id: "acoes",
      header: () => <span className="sr-only">Ações</span>,
      enableSorting: false,
      cell: ({ row }) => <Acoes categoria={row.original} aoEditar={setEditando} />,
    },
  ]

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          to="/admin/produtos"
          className="flex w-fit items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
        >
          <ArrowLeftIcon aria-hidden className="size-4" />
          Cardápio
        </Link>
        <CabecalhoPagina
          titulo="Categorias"
          descricao="A ordem define a sequência das abas no cardápio (menor primeiro)."
        />
      </div>

      {categorias && <NovaCategoria key={proximaOrdem} ordemSugerida={proximaOrdem} />}

      <div className="overflow-hidden rounded-2xl border bg-card shadow-elevado">
        {!categorias ? (
          <div className="flex flex-col gap-2 p-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        ) : categorias.length === 0 ? (
          <p className="px-5 py-8 text-center text-muted-foreground">
            Nenhuma categoria ainda. Crie a primeira acima.
          </p>
        ) : (
          <TabelaDados
            dados={categorias}
            colunas={colunas}
            ordemInicial={[{ id: "ordem", desc: false }]}
            idLinha={(c) => String(c.id)}
          />
        )}
      </div>

      {editando && (
        <EditarCategoria
          key={editando.id}
          categoria={editando}
          aoFechar={() => setEditando(null)}
        />
      )}
    </div>
  )
}

function NovaCategoria({ ordemSugerida }: { ordemSugerida: number }) {
  const [nome, setNome] = useState("")
  const [ordem, setOrdem] = useState(ordemSugerida)
  const [erro, setErro] = useState<string | null>(null)
  const criacao = useMutation({
    mutationFn: () => criarCategoria(nome, ordem),
    onSuccess: (r) => {
      if (!r.ok) return setErro(r.erro)
      setNome("")
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
      aria-labelledby="titulo-nova-categoria"
      className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-elevado"
    >
      <h2 id="titulo-nova-categoria" className="font-bold text-lg">
        Nova categoria
      </h2>
      <div className="flex flex-wrap items-start gap-3">
        <Field data-invalid={erro ? true : undefined} className="min-w-48 flex-1">
          <FieldLabel htmlFor="nova-categoria-nome">Nome</FieldLabel>
          <Input
            id="nova-categoria-nome"
            maxLength={60}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            aria-invalid={erro ? true : undefined}
          />
          {erro && <FieldError>{erro}</FieldError>}
        </Field>
        <Field className="w-24">
          <FieldLabel htmlFor="nova-categoria-ordem">Ordem</FieldLabel>
          <Input
            id="nova-categoria-ordem"
            type="number"
            min={0}
            className="numeros"
            value={ordem}
            onChange={(e) => setOrdem(Math.max(0, Number(e.target.value) || 0))}
          />
        </Field>
        <Button type="submit" className="mt-6" disabled={criacao.isPending}>
          {criacao.isPending ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <PlusIcon data-icon="inline-start" />
          )}
          Criar
        </Button>
      </div>
    </form>
  )
}

function AlternarVisivel({ categoria: c }: { categoria: CategoriaLinha }) {
  const troca = useMutation({
    mutationFn: (ativa: boolean) => salvarCategoria(c.id, c.nome, c.ordem, ativa),
  })
  return (
    <Switch
      size="sm"
      checked={c.ativa}
      onCheckedChange={(v) => troca.mutate(v)}
      aria-label={`${c.nome} visível no cardápio`}
    />
  )
}

function Acoes({
  categoria: c,
  aoEditar,
}: {
  categoria: CategoriaLinha
  aoEditar: (c: CategoriaLinha) => void
}) {
  const exclusao = useMutation({
    mutationFn: () => excluirCategoria(c.id),
    onSuccess: (r) => (r.ok ? avisar.sucesso(r.mensagem) : avisar.erro(r.erro)),
  })
  return (
    <div className="flex justify-end gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Editar ${c.nome}`}
        onClick={() => aoEditar(c)}
      >
        <PencilIcon />
      </Button>
      {c.totalProdutos > 0 ? (
        <Tooltip>
          <TooltipTrigger asChild>
            {/* aria-disabled em vez de disabled: o botão continua focável e explica o motivo. */}
            <Button
              variant="ghost"
              size="icon-sm"
              aria-disabled
              aria-label={`Excluir ${c.nome}`}
              className="opacity-40"
              onClick={() =>
                avisar.erro(`A categoria ${c.nome} tem produtos. Mova ou exclua os produtos antes.`)
              }
            >
              <Trash2Icon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Só dá para excluir categoria sem produtos</TooltipContent>
        </Tooltip>
      ) : (
        <ConfirmarExclusao
          titulo={`Excluir a categoria ${c.nome}?`}
          descricao="A aba some do cardápio. Esta ação não pode ser desfeita."
          onConfirmar={() => exclusao.mutate()}
        >
          <Button variant="ghost" size="icon-sm" aria-label={`Excluir ${c.nome}`}>
            <Trash2Icon />
          </Button>
        </ConfirmarExclusao>
      )}
    </div>
  )
}

function EditarCategoria({
  categoria,
  aoFechar,
}: {
  categoria: CategoriaLinha
  aoFechar: () => void
}) {
  const [nome, setNome] = useState(categoria.nome)
  const [ordem, setOrdem] = useState(categoria.ordem)
  const [ativa, setAtiva] = useState(categoria.ativa)
  const [erro, setErro] = useState<string | null>(null)
  const envio = useMutation({
    mutationFn: () => salvarCategoria(categoria.id, nome, ordem, ativa),
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
      titulo={`Editar ${categoria.nome}`}
      rodape={
        <>
          <Button type="button" variant="ghost" onClick={aoFechar}>
            Cancelar
          </Button>
          <Button type="submit" form="form-categoria" disabled={envio.isPending}>
            {envio.isPending && <Spinner data-icon="inline-start" />}
            Salvar categoria
          </Button>
        </>
      }
    >
      <form
        id="form-categoria"
        onSubmit={(e) => {
          e.preventDefault()
          setErro(null)
          envio.mutate()
        }}
      >
        <FieldGroup className="gap-4">
          <Field data-invalid={erro ? true : undefined}>
            <FieldLabel htmlFor="categoria-nome">Nome</FieldLabel>
            <Input
              id="categoria-nome"
              maxLength={60}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              aria-invalid={erro ? true : undefined}
            />
            {erro && <FieldError>{erro}</FieldError>}
          </Field>
          <Field>
            <FieldLabel htmlFor="categoria-ordem">Ordem</FieldLabel>
            <Input
              id="categoria-ordem"
              type="number"
              min={0}
              className="numeros"
              value={ordem}
              onChange={(e) => setOrdem(Math.max(0, Number(e.target.value) || 0))}
            />
          </Field>
          <Field orientation="horizontal">
            <Switch id="categoria-ativa" checked={ativa} onCheckedChange={setAtiva} />
            <FieldLabel htmlFor="categoria-ativa" className="font-normal">
              Visível no cardápio
            </FieldLabel>
          </Field>
        </FieldGroup>
      </form>
    </PainelResponsivo>
  )
}
