import { cn } from "cn"
import { MinusIcon, PlusIcon } from "lucide-react"
import { useId, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { FotoProduto } from "@/components/ui/foto-produto"
import { PainelResponsivo } from "@/components/ui/painel-responsivo"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { SeletorQuantidade } from "@/components/ui/seletor-quantidade"
import { Textarea } from "@/components/ui/textarea"
import { formatarMoeda } from "@/lib/moeda"
import { arredondar, calcularItem, type OpcaoSelecionada, validarOpcoes } from "@/mock/regras/preco"
import type { Produto, ProdutoOpcaoGrupo } from "@/types/entidades"
import {
  alterarItem,
  escolherUnico,
  paraOpcoes,
  regraDoGrupo,
  type Selecao,
  selecaoInicial,
  totalDoGrupo,
} from "./selecao"

export interface ItemEscolhido {
  produtoId: number
  quantidade: number
  observacao: string
  opcoes: OpcaoSelecionada[]
}

interface ModalProdutoProps {
  produto: Produto | null
  aberto: boolean
  aoFechar: () => void
  aoAdicionar: (item: ItemEscolhido) => void
  /** Texto do botão: "Adicionar" na loja, "Lançar" no garçom. */
  verbo?: string
}

const LIMITE_OBSERVACAO = 140

export function ModalProduto({
  produto,
  aberto,
  aoFechar,
  aoAdicionar,
  verbo = "Adicionar",
}: ModalProdutoProps) {
  if (!produto) return null
  return (
    <PainelResponsivo
      aberto={aberto}
      aoMudar={(v) => !v && aoFechar()}
      titulo={produto.nome}
      descricao={produto.descricao ?? `Monte o seu ${produto.nome}`}
      topo={
        produto.imagemUrl ? (
          <FotoProduto produto={produto} tamanho="lg" prioridade className="rounded-none" />
        ) : undefined
      }
      rodape={null}
    >
      {/* key: reinicia escolhas a cada produto aberto */}
      <ConteudoProduto key={produto.id} produto={produto} aoAdicionar={aoAdicionar} verbo={verbo} />
    </PainelResponsivo>
  )
}

function ConteudoProduto({
  produto,
  aoAdicionar,
  verbo,
}: {
  produto: Produto
  aoAdicionar: (item: ItemEscolhido) => void
  verbo: string
}) {
  const [selecao, setSelecao] = useState<Selecao>(() => selecaoInicial(produto))
  const [quantidade, setQuantidade] = useState(1)
  const [observacao, setObservacao] = useState("")
  const idObservacao = useId()

  const opcoes = useMemo(() => paraOpcoes(produto, selecao), [produto, selecao])
  const erro = validarOpcoes(produto, opcoes)
  const { precoUnitario } = calcularItem(produto, opcoes)
  const total = arredondar(precoUnitario * quantidade)

  return (
    <div className="flex flex-col gap-6">
      {produto.descricao && (
        <p className="text-muted-foreground leading-relaxed">{produto.descricao}</p>
      )}

      {produto.gruposOpcoes.map((g) => (
        <GrupoOpcoes
          key={g.id}
          grupo={g}
          selecao={selecao}
          aoEscolher={(itemId) => setSelecao((s) => escolherUnico(s, g.id, itemId))}
          aoAlterar={(itemId, delta) => setSelecao((s) => alterarItem(s, g, itemId, delta))}
        />
      ))}

      <div className="flex flex-col gap-2">
        <label htmlFor={idObservacao} className="font-semibold text-sm">
          Alguma observação? <span className="font-normal text-muted-foreground">(opcional)</span>
        </label>
        <Textarea
          id={idObservacao}
          value={observacao}
          maxLength={LIMITE_OBSERVACAO}
          onChange={(e) => setObservacao(e.target.value)}
          placeholder="Ex.: sem cebola, bem passado"
          rows={2}
        />
        <span className="self-end text-muted-foreground text-xs numeros">
          {observacao.length}/{LIMITE_OBSERVACAO}
        </span>
      </div>

      <div className="sticky bottom-0 -mx-6 -mb-4 flex flex-col gap-2 border-t bg-popover px-6 py-4 max-md:-mx-4 max-md:px-4">
        {erro && (
          <p role="status" className="text-center font-medium text-destructive text-sm">
            {erro}
          </p>
        )}
        <div className="flex items-center gap-3">
          <SeletorQuantidade valor={quantidade} aoMudar={setQuantidade} rotulo={produto.nome} />
          <Button
            size="lg"
            className="flex-1"
            disabled={Boolean(erro)}
            onClick={() =>
              aoAdicionar({
                produtoId: produto.id,
                quantidade,
                observacao: observacao.trim(),
                opcoes,
              })
            }
          >
            {verbo} · <span className="numeros">{formatarMoeda(total)}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

function GrupoOpcoes({
  grupo,
  selecao,
  aoEscolher,
  aoAlterar,
}: {
  grupo: ProdutoOpcaoGrupo
  selecao: Selecao
  aoEscolher: (itemId: number) => void
  aoAlterar: (itemId: number, delta: number) => void
}) {
  const total = totalDoGrupo(selecao, grupo.id)
  const faltando = grupo.minimo > 0 && total < grupo.minimo
  const cabecalho = (
    <div className="flex items-start justify-between gap-3">
      <div className="flex flex-col">
        <span className="font-bold font-heading text-lg">{grupo.nome}</span>
        <span className="text-muted-foreground text-sm">{regraDoGrupo(grupo, total)}</span>
      </div>
      {grupo.minimo > 0 && (
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 font-semibold text-xs",
            faltando
              ? "bg-foreground text-background"
              : "bg-status-pronto text-status-pronto-foreground",
          )}
        >
          {faltando ? "Obrigatório" : "Pronto"}
        </span>
      )}
    </div>
  )

  const precoItem = (preco: number, escolhido: boolean) => {
    if (grupo.gratisAte > 0 && total < grupo.gratisAte && !escolhido) return "Incluso"
    return preco > 0 ? `+ ${formatarMoeda(preco)}` : "Incluso"
  }

  if (grupo.maximo === 1) {
    const escolhido = Object.keys(selecao[grupo.id] ?? {})[0] ?? ""
    return (
      <section className="flex flex-col gap-3">
        {cabecalho}
        <RadioGroup
          aria-label={grupo.nome}
          value={escolhido}
          onValueChange={(v) => aoEscolher(Number(v))}
          className="gap-0 overflow-hidden rounded-xl border"
        >
          {grupo.itens.map((item) => {
            const id = `opcao-${grupo.id}-${item.id}`
            return (
              <label
                key={item.id}
                htmlFor={id}
                className="flex min-h-14 cursor-pointer items-center gap-3 border-b px-4 py-3 last:border-b-0 has-data-[state=checked]:bg-accent/60"
              >
                <RadioGroupItem id={id} value={String(item.id)} aria-label={item.nome} />
                <span className="flex-1 font-medium">{item.nome}</span>
                <span className="numeros text-muted-foreground text-sm">
                  {precoItem(item.precoAdicional, String(item.id) === escolhido)}
                </span>
              </label>
            )
          })}
        </RadioGroup>
      </section>
    )
  }

  const cheio = grupo.maximo > 0 && total >= grupo.maximo
  return (
    <section className="flex flex-col gap-3" aria-label={grupo.nome}>
      {cabecalho}
      <ul className="overflow-hidden rounded-xl border">
        {grupo.itens.map((item) => {
          const qtd = selecao[grupo.id]?.[item.id] ?? 0
          return (
            <li
              key={item.id}
              className={cn(
                "flex min-h-14 items-center gap-3 border-b px-4 py-2 last:border-b-0",
                qtd > 0 && "bg-accent/60",
              )}
            >
              <div className="flex flex-1 flex-col">
                <span className="font-medium">{item.nome}</span>
                <span className="numeros text-muted-foreground text-sm">
                  {precoItem(item.precoAdicional, qtd > 0)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {qtd > 0 && (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="rounded-full"
                      aria-label={`Remover ${item.nome}`}
                      onClick={() => aoAlterar(item.id, -1)}
                    >
                      <MinusIcon />
                    </Button>
                    <span className="numeros w-5 text-center font-semibold">{qtd}</span>
                  </>
                )}
                <Button
                  type="button"
                  variant={qtd > 0 ? "ghost" : "outline"}
                  size="icon-sm"
                  className="rounded-full"
                  aria-label={`Adicionar ${item.nome}`}
                  disabled={cheio}
                  onClick={() => aoAlterar(item.id, 1)}
                >
                  <PlusIcon />
                </Button>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
