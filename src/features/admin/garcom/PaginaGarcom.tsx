import { useMutation, useQuery } from "@tanstack/react-query"
import { SearchIcon, SendIcon, Trash2Icon, XIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { useSearchParams } from "react-router"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PainelResponsivo } from "@/components/ui/painel-responsivo"
import { SeletorQuantidade } from "@/components/ui/seletor-quantidade"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ProdutoLinha } from "@/features/loja/cardapio/ProdutoLinha"
import { type ItemEscolhido, ModalProduto } from "@/features/loja/produto/ModalProduto"
import { avisar } from "@/lib/avisos"
import { formatarMoeda } from "@/lib/moeda"
import { cn } from "@/lib/utils"
import { lancarNaMesa, obterCardapioGarcom } from "@/mock/garcom/acoes"
import { arredondar, calcularItem } from "@/mock/regras/preco"
import { normalizar } from "@/mock/regras/texto"
import type { Produto } from "@/types/entidades"
import { usePreferenciaGarcom } from "./preferencias"

interface ItemLancado extends ItemEscolhido {
  chave: string
  nome: string
  precoUnitario: number
  resumo: string | null
}

export function PaginaGarcom() {
  const [parametros, setParametros] = useSearchParams()
  const mesaId = Number(parametros.get("mesa") ?? 0) || null
  const { garcomNome, definirGarcomNome } = usePreferenciaGarcom()
  const [clienteNome, setClienteNome] = useState("")
  const [busca, setBusca] = useState("")
  const [itens, setItens] = useState<ItemLancado[]>([])
  const [aberto, setAberto] = useState<Produto | null>(null)
  const [verItens, setVerItens] = useState(false)

  const consulta = useQuery({ queryKey: ["garcom"], queryFn: obterCardapioGarcom })
  const mesas = consulta.data?.mesas ?? []
  const mesa = mesas.find((m) => m.id === mesaId)

  const categorias = useMemo(() => {
    const termo = normalizar(busca)
    return (consulta.data?.categorias ?? [])
      .map((c) => ({
        ...c,
        produtos: termo
          ? c.produtos.filter(
              (p) => normalizar(p.nome).includes(termo) || normalizar(p.descricao).includes(termo),
            )
          : c.produtos,
      }))
      .filter((c) => c.produtos.length > 0)
  }, [consulta.data, busca])

  const quantidade = itens.reduce((s, i) => s + i.quantidade, 0)
  const subtotal = arredondar(itens.reduce((s, i) => s + i.precoUnitario * i.quantidade, 0))

  const envio = useMutation({
    mutationFn: () =>
      lancarNaMesa({
        mesaId,
        garcomNome,
        clienteNome,
        itens: itens.map(({ produtoId, quantidade, opcoes, observacao }) => ({
          produtoId,
          quantidade,
          opcoes,
          observacao,
        })),
      }),
    onSuccess: (r) => {
      if (!r.ok) return avisar.erro(r.erro)
      avisar.sucesso(r.mensagem)
      setItens([])
      setClienteNome("")
      setVerItens(false)
    },
  })

  function escolherMesa(valor: string) {
    const novo = new URLSearchParams(parametros)
    if (valor) novo.set("mesa", valor)
    else novo.delete("mesa")
    setParametros(novo, { replace: true })
  }

  function adicionar(produto: Produto, item: ItemEscolhido) {
    const { precoUnitario, resumo } = calcularItem(produto, item.opcoes)
    setItens((atual) => [
      ...atual,
      { ...item, chave: crypto.randomUUID(), nome: produto.nome, precoUnitario, resumo },
    ])
    setAberto(null)
    avisar(`${item.quantidade}× ${produto.nome} na lista`)
  }

  function enviar() {
    if (!mesaId) return avisar.erro("Escolha a mesa antes de enviar.")
    envio.mutate()
  }

  return (
    <div className="flex flex-col gap-5 pb-28">
      <header className="flex flex-col gap-1">
        <h1 className="font-extrabold text-3xl tracking-[-0.02em]">Modo garçom</h1>
        <p className="text-muted-foreground">
          {mesa
            ? mesa.status === "Livre"
              ? `${mesa.nome} livre: o primeiro envio abre a comanda.`
              : `${mesa.nome} ocupada: os itens entram na comanda aberta.`
            : "Escolha a mesa e lance os itens."}
        </p>
      </header>

      <section
        aria-label="Mesa e atendimento"
        className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-elevado"
      >
        {!consulta.data ? (
          <Skeleton className="h-24" />
        ) : (
          <div className="flex flex-col gap-2">
            <span id="rotulo-mesa" className="font-medium text-sm">
              Mesa
            </span>
            <ToggleGroup
              type="single"
              variant="outline"
              aria-labelledby="rotulo-mesa"
              value={mesaId ? String(mesaId) : ""}
              onValueChange={escolherMesa}
              className="grid w-full grid-cols-[repeat(auto-fill,minmax(4.25rem,1fr))] gap-2"
            >
              {mesas.map((m) => (
                <ToggleGroupItem
                  key={m.id}
                  value={String(m.id)}
                  aria-label={`${m.nome}, ${m.status === "Livre" ? "livre" : "ocupada"}`}
                  className="relative h-14 rounded-xl! font-bold text-lg"
                >
                  <span className="numeros">{String(m.numero).padStart(2, "0")}</span>
                  <span
                    aria-hidden
                    className={cn(
                      "absolute top-1.5 right-1.5 size-2 rounded-full",
                      m.status === "Livre" ? "bg-status-pronto" : "bg-primary",
                    )}
                  />
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        )}
        <FieldGroup className="grid gap-3 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="garcom-nome">Garçom</FieldLabel>
            <Input
              id="garcom-nome"
              autoComplete="off"
              placeholder="Seu nome"
              value={garcomNome}
              onChange={(e) => definirGarcomNome(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="garcom-cliente">Cliente (opcional)</FieldLabel>
            <Input
              id="garcom-cliente"
              autoComplete="off"
              placeholder={mesa?.clienteNome ?? "Nome ou identificação"}
              value={clienteNome}
              onChange={(e) => setClienteNome(e.target.value)}
            />
          </Field>
        </FieldGroup>
      </section>

      <div className="relative">
        <SearchIcon
          aria-hidden
          className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-5 text-muted-foreground"
        />
        <Input
          type="search"
          aria-label="Buscar no cardápio"
          placeholder="Buscar no cardápio"
          className="h-12 pl-10 text-base"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        {busca && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="-translate-y-1/2 absolute top-1/2 right-2"
            aria-label="Limpar busca"
            onClick={() => setBusca("")}
          >
            <XIcon />
          </Button>
        )}
      </div>

      {!consulta.data ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : categorias.length === 0 ? (
        <p className="rounded-2xl border bg-card px-5 py-10 text-center text-muted-foreground">
          Nenhum produto com "{busca}".
        </p>
      ) : (
        categorias.map((c) => (
          <section
            key={c.id}
            aria-labelledby={`garcom-cat-${c.id}`}
            className="rounded-2xl border bg-card p-2 shadow-elevado"
          >
            <h2
              id={`garcom-cat-${c.id}`}
              className="flex items-baseline justify-between px-3 pt-2 pb-1 font-bold text-lg"
            >
              {c.nome}
              <span className="numeros font-normal text-muted-foreground text-sm">
                {c.produtos.length} {c.produtos.length === 1 ? "item" : "itens"}
              </span>
            </h2>
            <div className="grid divide-y md:grid-cols-2 md:divide-y-0">
              {c.produtos.map((p) => (
                <ProdutoLinha key={p.id} produto={p} aoAbrir={setAberto} modoSalao />
              ))}
            </div>
          </section>
        ))
      )}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:left-[264px]">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <button
            type="button"
            onClick={() => setVerItens(true)}
            disabled={itens.length === 0}
            aria-label="Ver itens a lançar"
            className="flex min-w-0 flex-1 flex-col items-start rounded-xl px-2 py-1 text-left disabled:opacity-60"
          >
            <span className="numeros font-semibold text-muted-foreground text-sm">
              {quantidade} {quantidade === 1 ? "item" : "itens"}
            </span>
            <span className="numeros font-bold text-xl">{formatarMoeda(subtotal)}</span>
          </button>
          <Button size="xl" disabled={itens.length === 0 || envio.isPending} onClick={enviar}>
            {envio.isPending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <SendIcon data-icon="inline-start" />
            )}
            Enviar para a cozinha
          </Button>
        </div>
      </div>

      <ModalProduto
        produto={aberto}
        aberto={!!aberto}
        aoFechar={() => setAberto(null)}
        aoAdicionar={(item) => aberto && adicionar(aberto, item)}
        verbo="Lançar"
      />

      <PainelResponsivo
        aberto={verItens}
        aoMudar={setVerItens}
        titulo={mesa ? `Itens para a ${mesa.nome}` : "Itens a lançar"}
        rodape={
          <Button
            size="lg"
            className="w-full"
            disabled={itens.length === 0 || envio.isPending}
            onClick={enviar}
          >
            {envio.isPending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <SendIcon data-icon="inline-start" />
            )}
            Enviar para a cozinha · {formatarMoeda(subtotal)}
          </Button>
        }
      >
        {itens.length === 0 ? (
          <p className="py-6 text-center text-muted-foreground">Nenhum item na lista.</p>
        ) : (
          <ul className="flex flex-col divide-y">
            {itens.map((i) => (
              <li key={i.chave} className="flex items-start gap-3 py-3">
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="font-semibold">{i.nome}</span>
                  {i.resumo && <span className="text-muted-foreground text-sm">{i.resumo}</span>}
                  {i.observacao && (
                    <span className="font-medium text-primary text-sm">{i.observacao}</span>
                  )}
                  <span className="numeros text-sm">
                    {formatarMoeda(arredondar(i.precoUnitario * i.quantidade))}
                  </span>
                </div>
                <SeletorQuantidade
                  valor={i.quantidade}
                  rotulo={i.nome}
                  tamanho="sm"
                  aoMudar={(q) =>
                    setItens((atual) =>
                      atual.map((x) => (x.chave === i.chave ? { ...x, quantidade: q } : x)),
                    )
                  }
                />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Tirar ${i.nome} da lista`}
                  onClick={() => setItens((atual) => atual.filter((x) => x.chave !== i.chave))}
                >
                  <Trash2Icon />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </PainelResponsivo>
    </div>
  )
}
