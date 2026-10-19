import { CheckIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { AnimatePresence, m } from "motion/react"
import { type RefObject, useEffect, useState } from "react"
import { BadgeStatus } from "@/components/ui/badge-status"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { contraste, nivelContraste } from "@/lib/cor"
import { molaSuave, transicao } from "@/lib/motion"
import { useMovimentoReduzido } from "@/lib/useMovimentoReduzido"
import { STATUS_PEDIDO } from "@/types/entidades"
import type { IdDirecao } from "../direcoes"

const PARES: Array<{ nome: string; fundo: string; texto: string }> = [
  { nome: "Texto no fundo", fundo: "--background", texto: "--foreground" },
  { nome: "Texto no cartão", fundo: "--card", texto: "--card-foreground" },
  { nome: "Texto secundário", fundo: "--background", texto: "--muted-foreground" },
  { nome: "Botão principal", fundo: "--primary", texto: "--primary-foreground" },
  { nome: "Destaque suave", fundo: "--accent", texto: "--accent-foreground" },
  { nome: "Sucesso", fundo: "--sucesso", texto: "--sucesso-foreground" },
  { nome: "Aviso", fundo: "--aviso", texto: "--aviso-foreground" },
  { nome: "Status: recebido", fundo: "--status-recebido", texto: "--status-recebido-foreground" },
  { nome: "Status: em preparo", fundo: "--status-preparo", texto: "--status-preparo-foreground" },
  { nome: "Status: pronto", fundo: "--status-pronto", texto: "--status-pronto-foreground" },
  {
    nome: "Status: cancelado",
    fundo: "--status-cancelado",
    texto: "--status-cancelado-foreground",
  },
]

export function SecaoCores({
  raiz,
  direcao,
  tema,
}: {
  raiz: RefObject<HTMLElement | null>
  direcao: IdDirecao
  tema: string
}) {
  const [valores, setValores] = useState<Record<string, string>>({})

  // Lê os tokens já resolvidos pelo CSS da direção ativa, para o contraste ser o real.
  // biome-ignore lint/correctness/useExhaustiveDependencies: recalcula quando direção ou tema mudam
  useEffect(() => {
    const el = raiz.current
    if (!el) return
    const estilo = getComputedStyle(el)
    const lidos: Record<string, string> = {}
    for (const par of PARES) {
      lidos[par.fundo] = estilo.getPropertyValue(par.fundo).trim()
      lidos[par.texto] = estilo.getPropertyValue(par.texto).trim()
    }
    setValores(lidos)
  }, [raiz, direcao, tema])

  return (
    <SecaoDesign
      titulo="Cores e contraste"
      descricao="Cada par mostra o contraste real calculado na tela (WCAG 2.2)."
    >
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PARES.map((par) => {
          const razao = contraste(valores[par.fundo] ?? "", valores[par.texto] ?? "")
          return (
            <li
              key={par.nome}
              className="flex items-center justify-between gap-3 rounded-xl border p-3"
              style={{ background: `var(${par.fundo})`, color: `var(${par.texto})` }}
            >
              <span className="font-semibold">{par.nome}</span>
              <span className="numeros rounded-md bg-background/80 px-2 py-0.5 font-semibold text-foreground text-xs">
                {razao ? `${razao.toFixed(1)}:1 ${nivelContraste(razao)}` : "—"}
              </span>
            </li>
          )
        })}
      </ul>
    </SecaoDesign>
  )
}

export function SecaoTipografia() {
  return (
    <SecaoDesign
      titulo="Tipografia"
      descricao="Títulos com personalidade, texto feito para ler rápido no celular."
    >
      <div className="flex flex-col gap-4">
        <p className="font-extrabold font-heading text-5xl leading-none tracking-[-0.03em]">
          Pastel saindo agora
        </p>
        <p className="font-bold font-heading text-3xl">Açaí Gourmet</p>
        <p className="font-semibold font-heading text-xl">Escolha o tamanho</p>
        <p className="max-w-prose text-base leading-relaxed">
          Massa fininha, recheio generoso e fritura na hora. O pedido chega quentinho em 40 a 60
          minutos, ou fica pronto para retirar em 20.
        </p>
        <p className="text-muted-foreground text-sm">
          Texto de apoio: pedido mínimo, horário e observações.
        </p>
        <p className="numeros font-bold font-heading text-4xl">R$ 1.234,90 · #128</p>
      </div>
    </SecaoDesign>
  )
}

export function SecaoBotoes() {
  return (
    <SecaoDesign
      titulo="Botões e ações"
      descricao="Uma ação principal por tela ou card. Destrutiva pede confirmação; reversível oferece desfazer."
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Adicionar à sacola</Button>
          <Button variant="sucesso">
            <CheckIcon data-icon="inline-start" />
            Marcar como pronto
          </Button>
          <Button variant="secondary">Ver detalhes</Button>
          <Button variant="outline">Imprimir</Button>
          <Button variant="ghost">Cancelar</Button>
          <Button variant="destructive">
            <Trash2Icon data-icon="inline-start" />
            Excluir produto
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Pequeno</Button>
          <Button>Padrão</Button>
          <Button size="lg">Grande</Button>
          <Button size="xl">Cozinha e garçom</Button>
          <Button size="icon" aria-label="Adicionar">
            <PlusIcon />
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button disabled>
            <Spinner data-icon="inline-start" />
            Enviando pedido
          </Button>
          <Button disabled variant="secondary">
            Desabilitado
          </Button>
        </div>
      </div>
    </SecaoDesign>
  )
}

export function SecaoStatus() {
  return (
    <SecaoDesign
      titulo="Status do pedido"
      descricao="Mesma cor e mesmo rótulo na fila, na cozinha, nos pedidos e no acompanhamento."
    >
      <div className="flex flex-wrap gap-2">
        {STATUS_PEDIDO.map((s) => (
          <BadgeStatus key={s} status={s} tipo="Entrega" />
        ))}
        <BadgeStatus status="Pronto" tipo="Retirada" />
        <BadgeStatus status="Pronto" tipo="Mesa" />
      </div>
    </SecaoDesign>
  )
}

export function SecaoMotion() {
  const reduzido = useMovimentoReduzido()
  const [itens, setItens] = useState(2)
  const [pronto, setPronto] = useState(false)

  return (
    <SecaoDesign
      titulo="Movimento"
      descricao="Só para mostrar o que mudou: nada decorativo atrasa a operação. Durações de 150, 220 e 320 ms."
    >
      {reduzido && (
        <p className="mb-4 rounded-lg bg-muted px-3 py-2 text-sm">
          Movimento reduzido ativo: as animações viram trocas instantâneas.
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex items-center justify-between rounded-2xl border p-4">
          <Button onClick={() => setItens((n) => n + 1)}>Adicionar à sacola</Button>
          <span className="relative flex items-center gap-2 font-semibold">
            Sacola
            <AnimatePresence initial={false} mode="popLayout">
              <m.span
                key={itens}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={molaSuave}
                className="numeros grid size-7 place-items-center rounded-full bg-primary font-bold text-primary-foreground text-sm"
              >
                {itens}
              </m.span>
            </AnimatePresence>
          </span>
        </div>
        <div className="flex flex-col gap-3 rounded-2xl border p-4">
          <div className="grid grid-cols-2 gap-3">
            {(["Em preparo", "Prontos"] as const).map((coluna, i) => (
              <div key={coluna} className="flex min-h-24 flex-col gap-2 rounded-xl bg-muted/60 p-2">
                <span className="font-semibold text-xs">{coluna}</span>
                {pronto === (i === 1) && (
                  <m.div
                    layoutId="cartao-demo"
                    transition={transicao("enfase")}
                    className="rounded-lg bg-card p-2 font-semibold text-sm shadow-elevado"
                  >
                    #12 · Mesa 4
                  </m.div>
                )}
              </div>
            ))}
          </div>
          <Button variant={pronto ? "outline" : "sucesso"} onClick={() => setPronto((v) => !v)}>
            {pronto ? "Voltar para o preparo" : "Marcar como pronto"}
          </Button>
        </div>
      </div>
    </SecaoDesign>
  )
}

export function SecaoDesign({
  titulo,
  descricao,
  children,
}: {
  titulo: string
  descricao?: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-4 rounded-3xl border bg-card p-5 text-card-foreground sm:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-bold text-2xl">{titulo}</h2>
        {descricao && <p className="max-w-prose text-muted-foreground">{descricao}</p>}
      </div>
      {children}
    </section>
  )
}
