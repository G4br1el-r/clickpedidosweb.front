import { useMutation, useQuery } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import { BikeIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { type FormEvent, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PainelResponsivo } from "@/components/ui/painel-responsivo"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { TabelaDados } from "@/components/ui/tabela-dados"
import { avisar } from "@/lib/avisos"
import { mascararTelefone } from "@/lib/mascaras"
import { excluirMotoboy, listarMotoboys, salvarMotoboy } from "@/mock/motoboys/acoes"
import { formatarTelefone } from "@/mock/regras/texto"
import type { Motoboy } from "@/types/entidades"
import { CabecalhoPagina } from "../componentes/CabecalhoPagina"
import { ConfirmarExclusao } from "../componentes/ConfirmarExclusao"

export function PaginaMotoboys() {
  const consulta = useQuery({ queryKey: ["motoboys"], queryFn: listarMotoboys })
  const [editando, setEditando] = useState<Motoboy | null>(null)
  const motoboys = consulta.data

  const colunas: ColumnDef<Motoboy>[] = [
    {
      accessorKey: "nome",
      header: "Nome",
      cell: ({ row }) => <span className="font-semibold">{row.original.nome}</span>,
    },
    {
      accessorKey: "telefone",
      header: "WhatsApp",
      enableSorting: false,
      cell: ({ row }) => <span className="numeros">{formatarTelefone(row.original.telefone)}</span>,
    },
    {
      accessorKey: "ativo",
      header: "Situação",
      cell: ({ row }) =>
        row.original.ativo ? (
          <Badge variant="outline">Ativo</Badge>
        ) : (
          <Badge variant="secondary">Inativo</Badge>
        ),
    },
    {
      id: "acoes",
      header: () => <span className="sr-only">Ações</span>,
      enableSorting: false,
      cell: ({ row }) => <Acoes motoboy={row.original} aoEditar={setEditando} />,
    },
  ]

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <CabecalhoPagina
        titulo="Motoboys"
        descricao="Ao chamar um motoboy na fila, o WhatsApp abre com o endereço, o valor a cobrar e o link do mapa."
      />

      <NovoMotoboy />

      <div className="overflow-hidden rounded-2xl border bg-card shadow-elevado">
        {!motoboys ? (
          <div className="flex flex-col gap-2 p-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        ) : motoboys.length === 0 ? (
          <Empty className="py-12">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BikeIcon />
              </EmptyMedia>
              <EmptyTitle>Nenhum motoboy cadastrado</EmptyTitle>
              <EmptyDescription>Cadastre acima para chamar pelo WhatsApp na fila.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <TabelaDados
            dados={motoboys}
            colunas={colunas}
            idLinha={(m) => String(m.id)}
            classeLinha={(m) => (m.ativo ? undefined : "text-muted-foreground")}
          />
        )}
      </div>

      {editando && (
        <EditarMotoboy key={editando.id} motoboy={editando} aoFechar={() => setEditando(null)} />
      )}
    </div>
  )
}

function NovoMotoboy() {
  const [nome, setNome] = useState("")
  const [telefone, setTelefone] = useState("")
  const [erro, setErro] = useState<string | null>(null)
  const criacao = useMutation({
    mutationFn: () => salvarMotoboy(0, nome, telefone, true),
    onSuccess: (r) => {
      if (!r.ok) return setErro(r.erro)
      setNome("")
      setTelefone("")
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
      aria-labelledby="titulo-novo-motoboy"
      className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-elevado"
    >
      <h2 id="titulo-novo-motoboy" className="font-bold text-lg">
        Novo motoboy
      </h2>
      <div className="flex flex-wrap items-start gap-3">
        <Field className="min-w-48 flex-1">
          <FieldLabel htmlFor="novo-motoboy-nome">Nome</FieldLabel>
          <Input
            id="novo-motoboy-nome"
            maxLength={60}
            autoComplete="off"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </Field>
        <Field className="w-48">
          <FieldLabel htmlFor="novo-motoboy-telefone">WhatsApp</FieldLabel>
          <Input
            id="novo-motoboy-telefone"
            inputMode="tel"
            placeholder="(12) 99999-0000"
            className="numeros"
            value={telefone}
            onChange={(e) => setTelefone(mascararTelefone(e.target.value))}
          />
        </Field>
        <Button type="submit" className="mt-6" disabled={criacao.isPending}>
          {criacao.isPending ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <PlusIcon data-icon="inline-start" />
          )}
          Adicionar
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

function Acoes({ motoboy: m, aoEditar }: { motoboy: Motoboy; aoEditar: (m: Motoboy) => void }) {
  const exclusao = useMutation({
    mutationFn: () => excluirMotoboy(m.id),
    onSuccess: (r) => (r.ok ? avisar.sucesso(r.mensagem) : avisar.erro(r.erro)),
  })
  return (
    <div className="flex justify-end gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Editar ${m.nome}`}
        onClick={() => aoEditar(m)}
      >
        <PencilIcon />
      </Button>
      <ConfirmarExclusao
        titulo={`Remover ${m.nome}?`}
        descricao="Pedidos já entregues continuam com o nome dele. Para só tirar da lista da fila, desative em vez de remover."
        rotuloAcao="Remover"
        onConfirmar={() => exclusao.mutate()}
      >
        <Button variant="ghost" size="icon-sm" aria-label={`Remover ${m.nome}`}>
          <Trash2Icon />
        </Button>
      </ConfirmarExclusao>
    </div>
  )
}

function EditarMotoboy({ motoboy, aoFechar }: { motoboy: Motoboy; aoFechar: () => void }) {
  const [nome, setNome] = useState(motoboy.nome)
  const [telefone, setTelefone] = useState(mascararTelefone(motoboy.telefone))
  const [ativo, setAtivo] = useState(motoboy.ativo)
  const [erro, setErro] = useState<string | null>(null)
  const envio = useMutation({
    mutationFn: () => salvarMotoboy(motoboy.id, nome, telefone, ativo),
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
      titulo={`Editar ${motoboy.nome}`}
      rodape={
        <>
          <Button type="button" variant="ghost" onClick={aoFechar}>
            Cancelar
          </Button>
          <Button type="submit" form="form-motoboy" disabled={envio.isPending}>
            {envio.isPending && <Spinner data-icon="inline-start" />}
            Salvar motoboy
          </Button>
        </>
      }
    >
      <form
        id="form-motoboy"
        onSubmit={(e) => {
          e.preventDefault()
          setErro(null)
          envio.mutate()
        }}
      >
        <FieldGroup className="gap-4">
          <Field>
            <FieldLabel htmlFor="motoboy-nome">Nome</FieldLabel>
            <Input
              id="motoboy-nome"
              maxLength={60}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </Field>
          <Field data-invalid={erro ? true : undefined}>
            <FieldLabel htmlFor="motoboy-telefone">WhatsApp</FieldLabel>
            <Input
              id="motoboy-telefone"
              inputMode="tel"
              className="numeros"
              value={telefone}
              onChange={(e) => setTelefone(mascararTelefone(e.target.value))}
              aria-invalid={erro ? true : undefined}
            />
            {erro && <FieldError>{erro}</FieldError>}
          </Field>
          <Field orientation="horizontal">
            <Switch id="motoboy-ativo" checked={ativo} onCheckedChange={setAtivo} />
            <FieldLabel htmlFor="motoboy-ativo" className="font-normal">
              Ativo (aparece para chamar na fila)
            </FieldLabel>
          </Field>
        </FieldGroup>
      </form>
    </PainelResponsivo>
  )
}
