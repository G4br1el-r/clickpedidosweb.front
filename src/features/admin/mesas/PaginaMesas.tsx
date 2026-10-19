import { useMutation, useQuery } from "@tanstack/react-query"
import {
  ChefHatIcon,
  ClockIcon,
  PlusIcon,
  ReceiptTextIcon,
  SmartphoneIcon,
  Trash2Icon,
  UserRoundIcon,
} from "lucide-react"
import { type FormEvent, useState } from "react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PainelResponsivo } from "@/components/ui/painel-responsivo"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { avisar } from "@/lib/avisos"
import { minutosDesde } from "@/lib/datas"
import { formatarMoeda } from "@/lib/moeda"
import { cn } from "@/lib/utils"
import { criarMesa, excluirMesa, listarMesas, type MesaComComanda } from "@/mock/mesas/acoes"
import { CabecalhoPagina } from "../componentes/CabecalhoPagina"
import { ConfirmarExclusao } from "../componentes/ConfirmarExclusao"
import { FecharConta } from "./FecharConta"

export function PaginaMesas() {
  // A cada 30 s só para o "ocupada há X min" andar; mudanças no banco já atualizam na hora.
  const consulta = useQuery({
    queryKey: ["mesas"],
    queryFn: listarMesas,
    refetchInterval: 30_000,
  })
  const [nova, setNova] = useState(false)
  const [fechando, setFechando] = useState<MesaComComanda | null>(null)
  const mesas = consulta.data
  const ocupadas = mesas?.filter((m) => m.status !== "Livre").length ?? 0

  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina
        titulo="Mesas do salão"
        descricao={
          mesas
            ? `${mesas.length} mesas · ${ocupadas} ${ocupadas === 1 ? "ocupada" : "ocupadas"} · ${mesas.length - ocupadas} livres`
            : "Carregando…"
        }
        acoes={
          <>
            <Button variant="outline" asChild>
              <Link to="/admin/garcom">
                <SmartphoneIcon data-icon="inline-start" />
                Modo garçom
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/cozinha">
                <ChefHatIcon data-icon="inline-start" />
                Cozinha
              </Link>
            </Button>
            <Button onClick={() => setNova(true)} disabled={!mesas}>
              <PlusIcon data-icon="inline-start" />
              Nova mesa
            </Button>
          </>
        }
      />

      {!mesas ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      ) : mesas.length === 0 ? (
        <Empty className="rounded-2xl border bg-card py-14">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ReceiptTextIcon />
            </EmptyMedia>
            <EmptyTitle>Nenhuma mesa cadastrada</EmptyTitle>
            <EmptyDescription>Use "Nova mesa" para começar a atender no salão.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-4">
          {mesas.map((m) => (
            <li key={m.id}>
              <CartaoMesa mesa={m} aoFecharConta={() => setFechando(m)} />
            </li>
          ))}
        </ul>
      )}

      {nova && mesas && (
        <NovaMesa
          sugestao={Math.max(0, ...mesas.map((m) => m.numero)) + 1}
          aoFechar={() => setNova(false)}
        />
      )}
      {fechando && (
        <FecharConta key={fechando.id} mesa={fechando} aberto aoFechar={() => setFechando(null)} />
      )}
    </div>
  )
}

function CartaoMesa({
  mesa: m,
  aoFecharConta,
}: {
  mesa: MesaComComanda
  aoFecharConta: () => void
}) {
  const ocupada = m.status !== "Livre"
  const p = m.pedido
  const exclusao = useMutation({
    mutationFn: () => excluirMesa(m.id),
    onSuccess: (r) => (r.ok ? avisar.sucesso(r.mensagem) : avisar.erro(r.erro)),
  })

  return (
    <article
      aria-label={m.nome}
      data-status={m.status}
      className={cn(
        "flex h-full min-h-52 flex-col gap-4 rounded-2xl border-2 bg-card p-4 shadow-elevado",
        ocupada ? "border-primary/60" : "border-transparent",
      )}
    >
      <header className="flex items-start justify-between gap-2">
        <h2 className="font-bold font-heading text-xl">{m.nome}</h2>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 font-semibold text-xs",
            m.status === "Livre"
              ? "bg-status-pronto text-status-pronto-foreground"
              : m.status === "ContaPedida"
                ? "bg-aviso text-aviso-foreground"
                : "bg-primary text-primary-foreground",
          )}
        >
          {m.status === "Livre" ? "Livre" : m.status === "ContaPedida" ? "Conta pedida" : "Ocupada"}
        </span>
      </header>

      {ocupada && p ? (
        <>
          <div className="flex flex-col gap-1.5 text-sm">
            <span className="flex items-center gap-1.5 font-semibold">
              <UserRoundIcon aria-hidden className="size-4 text-muted-foreground" />
              {m.clienteNome?.trim() || "Cliente no local"}
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <ClockIcon aria-hidden className="size-4" />
              <span className="numeros">
                Há {m.ocupadaEm ? minutosDesde(m.ocupadaEm) : 0} min · Pedido #{p.id}
              </span>
            </span>
            {p.garcomNome && <span className="text-muted-foreground">Garçom: {p.garcomNome}</span>}
          </div>
          <div className="mt-auto flex items-baseline justify-between border-t pt-3">
            <span className="text-muted-foreground text-sm">
              {p.itens.length} {p.itens.length === 1 ? "item" : "itens"}
            </span>
            <span className="numeros font-bold text-xl">{formatarMoeda(p.total)}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/admin/garcom?mesa=${m.id}`}>
                <PlusIcon data-icon="inline-start" />
                Pedido
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/admin/mesas/${m.id}`}>Ver comanda</Link>
            </Button>
            <Button variant="sucesso" size="sm" className="col-span-2" onClick={aoFecharConta}>
              Fechar conta
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="text-muted-foreground text-sm">
            {ocupada ? "Mesa ocupada sem comanda." : "Mesa pronta para atendimento."}
          </p>
          <div className="mt-auto flex gap-2">
            <Button className="flex-1" asChild>
              <Link to={`/admin/garcom?mesa=${m.id}`}>Abrir comanda</Link>
            </Button>
            {!ocupada && (
              <ConfirmarExclusao
                titulo={`Excluir a ${m.nome}?`}
                descricao="Ela some do salão e do modo garçom."
                onConfirmar={() => exclusao.mutate()}
              >
                <Button variant="ghost" size="icon" aria-label={`Excluir ${m.nome}`}>
                  <Trash2Icon />
                </Button>
              </ConfirmarExclusao>
            )}
          </div>
        </>
      )}
    </article>
  )
}

function NovaMesa({ sugestao, aoFechar }: { sugestao: number; aoFechar: () => void }) {
  const [numero, setNumero] = useState(String(sugestao))
  const [nome, setNome] = useState("")
  const [erro, setErro] = useState<string | null>(null)
  const envio = useMutation({
    mutationFn: () => criarMesa(Number(numero), nome),
    onSuccess: (r) => {
      if (!r.ok) return setErro(r.erro)
      avisar.sucesso(r.mensagem)
      aoFechar()
    },
  })

  function enviar(e: FormEvent) {
    e.preventDefault()
    setErro(null)
    envio.mutate()
  }

  return (
    <PainelResponsivo
      aberto
      aoMudar={(v) => !v && aoFechar()}
      titulo="Nova mesa"
      rodape={
        <>
          <Button type="button" variant="ghost" onClick={aoFechar}>
            Cancelar
          </Button>
          <Button type="submit" form="form-mesa" disabled={envio.isPending}>
            {envio.isPending && <Spinner data-icon="inline-start" />}
            Cadastrar mesa
          </Button>
        </>
      }
    >
      <form id="form-mesa" onSubmit={enviar}>
        <FieldGroup className="gap-4">
          <Field data-invalid={erro ? true : undefined}>
            <FieldLabel htmlFor="mesa-numero">Número da mesa</FieldLabel>
            <Input
              id="mesa-numero"
              type="number"
              min={1}
              className="numeros"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              aria-invalid={erro ? true : undefined}
            />
            {erro && <FieldError>{erro}</FieldError>}
          </Field>
          <Field>
            <FieldLabel htmlFor="mesa-nome">Identificação (opcional)</FieldLabel>
            <Input
              id="mesa-nome"
              placeholder={`Mesa ${numero.padStart(2, "0")}`}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </Field>
        </FieldGroup>
      </form>
    </PainelResponsivo>
  )
}
