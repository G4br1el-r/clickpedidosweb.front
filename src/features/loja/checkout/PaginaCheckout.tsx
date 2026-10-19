import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import {
  ArrowLeftIcon,
  BanknoteIcon,
  BikeIcon,
  CreditCardIcon,
  QrCodeIcon,
  ShoppingBagIcon,
  SmartphoneNfcIcon,
} from "lucide-react"
import { type ReactNode, useEffect, useMemo, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { Link, useNavigate } from "react-router"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Preco } from "@/components/ui/preco"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { useSacola } from "@/features/loja/sacola/sacola"
import { useLinhasSacola } from "@/features/loja/sacola/useLinhasSacola"
import { mascararCep, mascararCpf, mascararMoeda, mascararTelefone } from "@/lib/mascaras"
import { formatarMoeda } from "@/lib/moeda"
import { cn } from "@/lib/utils"
import { consultarCep, type EnderecoCep, listarBairros } from "@/mock/loja/acoes"
import { criarPedido } from "@/mock/pedidos/acoes"
import { arredondar } from "@/mock/regras/preco"
import { digitos, lerDecimal, normalizar } from "@/mock/regras/texto"
import type { FormaPagamento } from "@/types/entidades"
import { lerClienteSalvo, salvarCliente } from "./cliente-salvo"
import { type DadosCheckout, esquemaCheckout } from "./esquema"

const FORMAS: Array<{ valor: FormaPagamento; titulo: string; detalhe: string; icone: ReactNode }> =
  [
    {
      valor: "Pix",
      titulo: "Pix",
      detalhe: "Pague agora pelo app do banco",
      icone: <QrCodeIcon />,
    },
    {
      valor: "CartaoOnline",
      titulo: "Cartão online",
      detalhe: "Crédito ou débito seguro",
      icone: <CreditCardIcon />,
    },
    { valor: "Dinheiro", titulo: "Dinheiro", detalhe: "Pague ao receber", icone: <BanknoteIcon /> },
    {
      valor: "CartaoNaEntrega",
      titulo: "Cartão na maquininha",
      detalhe: "Pague ao receber",
      icone: <SmartphoneNfcIcon />,
    },
  ]

export function PaginaCheckout() {
  const { linhas, resumo, loja, carregando } = useLinhasSacola()

  if (carregando || !loja)
    return (
      <main className="mx-auto flex max-w-2xl flex-col gap-4 p-5">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </main>
    )

  if (linhas.length === 0)
    return (
      <main className="mx-auto flex min-h-svh max-w-md items-center p-6">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ShoppingBagIcon />
            </EmptyMedia>
            <EmptyTitle>Sua sacola está vazia</EmptyTitle>
            <EmptyDescription>
              Escolha seus itens no cardápio para finalizar o pedido.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild size="lg">
              <Link to="/">Ver o cardápio</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </main>
    )

  return <FormularioCheckout linhas={linhas} subtotal={resumo.subtotal} loja={loja} />
}

type Linhas = ReturnType<typeof useLinhasSacola>["linhas"]
type Loja = NonNullable<ReturnType<typeof useLinhasSacola>["loja"]>

function FormularioCheckout({
  linhas,
  subtotal,
  loja,
}: {
  linhas: Linhas
  subtotal: number
  loja: Loja
}) {
  const navegar = useNavigate()
  const formas = FORMAS.filter((f) =>
    f.valor === "Pix"
      ? loja.aceitaPix
      : f.valor === "CartaoOnline"
        ? loja.aceitaCartaoOnline
        : f.valor === "Dinheiro"
          ? loja.aceitaDinheiro
          : loja.aceitaCartaoNaEntrega,
  )
  const salvo = useMemo(lerClienteSalvo, [])
  const tipoPadrao = loja.aceitaEntrega ? "Entrega" : "Retirada"

  const form = useForm<DadosCheckout>({
    resolver: zodResolver(esquemaCheckout),
    defaultValues: {
      tipo: tipoPadrao,
      nome: salvo.nome ?? "",
      telefone: salvo.telefone ?? "",
      cep: salvo.cep ?? "",
      logradouro: salvo.logradouro ?? "",
      numero: salvo.numero ?? "",
      complemento: salvo.complemento ?? "",
      bairro: salvo.bairro ?? "",
      cidade: salvo.cidade ?? "",
      uf: salvo.uf ?? "",
      referencia: salvo.referencia ?? "",
      pagamento: formas[0]?.valor ?? "Dinheiro",
      cpf: "",
      troco: "",
      observacao: "",
    },
  })
  const { register, control, handleSubmit, setValue, formState } = form
  const tipo = useWatch({ control, name: "tipo" })
  const pagamento = useWatch({ control, name: "pagamento" })
  const bairro = useWatch({ control, name: "bairro" })
  const cidade = useWatch({ control, name: "cidade" })
  const cep = useWatch({ control, name: "cep" })

  const bairros = useQuery({ queryKey: ["bairros"], queryFn: () => listarBairros() })
  const [infoCep, setInfoCep] = useState<{
    endereco?: EnderecoCep
    erro?: string
    buscando?: boolean
  }>({})
  const [erroEnvio, setErroEnvio] = useState<string | null>(null)

  // Consulta o CEP assim que os 8 números são digitados (porta do checkout.js).
  useEffect(() => {
    const numeros = digitos(cep)
    if (numeros.length !== 8 || tipo !== "Entrega") return
    let ativo = true
    setInfoCep({ buscando: true })
    consultarCep(numeros).then((r) => {
      if (!ativo) return
      if (!r.ok) return setInfoCep({ erro: r.erro })
      setInfoCep({ endereco: r.endereco })
      const opcoes = { shouldValidate: formState.isSubmitted }
      if (r.endereco.logradouro) setValue("logradouro", r.endereco.logradouro, opcoes)
      if (r.endereco.bairro) setValue("bairro", r.endereco.bairro, opcoes)
      setValue("cidade", r.endereco.cidade, opcoes)
      setValue("uf", r.endereco.uf, opcoes)
      document.getElementById(r.endereco.logradouro ? "numero" : "bairro")?.focus()
    })
    return () => {
      ativo = false
    }
  }, [cep, tipo, setValue, formState.isSubmitted])

  // Taxa pelo bairro digitado, igual à regra do servidor (sem acento e caixa).
  const taxa = useMemo(() => {
    if (tipo !== "Entrega") return 0
    const lista = bairros.data ?? []
    const nb = normalizar(bairro)
    const nc = normalizar(cidade)
    const achado =
      lista.find((b) => normalizar(b.nome) === nb && (!nc || normalizar(b.cidade) === nc)) ??
      lista.find((b) => normalizar(b.nome) === nb)
    return achado?.taxa ?? loja.taxaEntrega
  }, [tipo, bairro, cidade, bairros.data, loja.taxaEntrega])
  const total = arredondar(subtotal + taxa)

  const envio = useMutation({
    mutationFn: async (v: DadosCheckout) =>
      criarPedido({
        tipo: v.tipo,
        nome: v.nome,
        telefone: v.telefone,
        pagamento: v.pagamento,
        observacao: v.observacao,
        ...(v.tipo === "Entrega"
          ? {
              cep: v.cep,
              logradouro: v.logradouro,
              numero: v.numero,
              complemento: v.complemento,
              bairro: v.bairro,
              cidade: v.cidade,
              uf: v.uf,
              referencia: v.referencia,
            }
          : {}),
        ...(v.pagamento === "Pix" ? { cpf: v.cpf } : {}),
        ...(v.pagamento === "Dinheiro" ? { trocoPara: lerDecimal(v.troco) } : {}),
        itens: linhas
          .filter((l) => !l.indisponivel)
          .map((l) => ({
            produtoId: l.produtoId,
            quantidade: l.quantidade,
            observacao: l.observacao,
            opcoes: l.opcoes,
          })),
      }),
    onSuccess: (r, v) => {
      if (!r.ok) {
        setErroEnvio(r.erro)
        window.scrollTo?.({ top: 0, behavior: "smooth" })
        return
      }
      salvarCliente({
        nome: v.nome,
        telefone: v.telefone,
        cep: v.cep,
        logradouro: v.logradouro,
        numero: v.numero,
        complemento: v.complemento,
        bairro: v.bairro,
        cidade: v.cidade,
        uf: v.uf,
        referencia: v.referencia,
      })
      useSacola.getState().limpar()
      navegar(`/pedido/${r.token}`, { replace: true })
    },
  })

  const enviar = handleSubmit((v) => {
    setErroEnvio(null)
    envio.mutate(v)
  })

  return (
    <main className="mx-auto max-w-2xl px-4 pt-4 pb-40">
      <header className="flex items-center gap-3 py-2">
        <Button asChild variant="ghost" size="icon" aria-label="Voltar ao cardápio">
          <Link to="/">
            <ArrowLeftIcon />
          </Link>
        </Button>
        <h1 className="font-extrabold text-2xl tracking-[-0.01em]">Finalizar pedido</h1>
      </header>

      {!loja.lojaAberta && (
        <Alert className="mt-3">
          <AlertTitle>Loja fechada</AlertTitle>
          <AlertDescription>
            {loja.mensagemFechada ??
              "A loja está fechada agora. Os pedidos voltam assim que abrirmos."}
          </AlertDescription>
        </Alert>
      )}

      {erroEnvio && (
        <Alert variant="destructive" className="mt-3" role="alert">
          <AlertTitle>Não deu para enviar o pedido</AlertTitle>
          <AlertDescription>{erroEnvio}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={enviar} noValidate className="mt-4 flex flex-col gap-5">
        <Secao titulo="Como quer receber?">
          <Controller
            control={control}
            name="tipo"
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="grid grid-cols-2 gap-3"
              >
                {loja.aceitaEntrega && (
                  <CartaoOpcao
                    valor="Entrega"
                    titulo="Entrega"
                    detalhe={loja.tempoEntrega}
                    icone={<BikeIcon />}
                    marcado={field.value === "Entrega"}
                  />
                )}
                {loja.aceitaRetirada && (
                  <CartaoOpcao
                    valor="Retirada"
                    titulo="Retirada"
                    detalhe={`${loja.tempoRetirada}${loja.endereco ? ` · ${loja.endereco}` : ""}`}
                    icone={<ShoppingBagIcon />}
                    marcado={field.value === "Retirada"}
                  />
                )}
              </RadioGroup>
            )}
          />

          {tipo === "Entrega" && (
            <FieldGroup className="mt-5 gap-4">
              <Campo nome="cep" rotulo="CEP" erro={formState.errors.cep?.message}>
                <Input
                  id="cep"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  placeholder="00000-000"
                  {...register("cep", {
                    onChange: (e) => setValue("cep", mascararCep(e.target.value)),
                  })}
                />
              </Campo>
              <StatusCep info={infoCep} />
              <div className="grid grid-cols-[1fr_7rem] gap-3">
                <Campo nome="logradouro" rotulo="Rua" erro={formState.errors.logradouro?.message}>
                  <Input
                    id="logradouro"
                    autoComplete="address-line1"
                    maxLength={120}
                    {...register("logradouro")}
                  />
                </Campo>
                <Campo nome="numero" rotulo="Número" erro={formState.errors.numero?.message}>
                  <Input id="numero" inputMode="numeric" maxLength={20} {...register("numero")} />
                </Campo>
              </div>
              <Campo nome="complemento" rotulo="Complemento" opcional>
                <Input
                  id="complemento"
                  maxLength={60}
                  placeholder="Apto, bloco, casa 2"
                  {...register("complemento")}
                />
              </Campo>
              <Campo
                nome="bairro"
                rotulo="Bairro"
                erro={formState.errors.bairro?.message}
                descricao={
                  bairro.trim()
                    ? `Taxa de entrega para ${bairro.trim()}: ${formatarMoeda(taxa)}`
                    : undefined
                }
              >
                <Input
                  id="bairro"
                  list="lista-bairros"
                  maxLength={80}
                  placeholder="Selecione ou digite"
                  autoComplete="address-level3"
                  {...register("bairro")}
                />
                <datalist id="lista-bairros">
                  {(infoCep.endereco?.bairros ?? bairros.data ?? []).map((b) => (
                    <option key={b.id} value={b.nome} />
                  ))}
                </datalist>
              </Campo>
              <div className="grid grid-cols-[1fr_5rem] gap-3">
                <Campo nome="cidade" rotulo="Cidade" erro={formState.errors.cidade?.message}>
                  <Input
                    id="cidade"
                    maxLength={80}
                    autoComplete="address-level2"
                    {...register("cidade")}
                  />
                </Campo>
                <Campo nome="uf" rotulo="UF">
                  <Input id="uf" maxLength={2} className="uppercase" {...register("uf")} />
                </Campo>
              </div>
              <Campo nome="referencia" rotulo="Ponto de referência" opcional>
                <Input
                  id="referencia"
                  maxLength={120}
                  placeholder="Ex.: portão azul, perto da padaria"
                  {...register("referencia")}
                />
              </Campo>
            </FieldGroup>
          )}
        </Secao>

        <Secao titulo="Seus dados">
          <FieldGroup className="gap-4">
            <Campo nome="nome" rotulo="Nome" erro={formState.errors.nome?.message}>
              <Input id="nome" autoComplete="name" maxLength={80} {...register("nome")} />
            </Campo>
            <Campo
              nome="telefone"
              rotulo="WhatsApp"
              erro={formState.errors.telefone?.message}
              descricao="Avisamos por aqui quando o pedido sair."
            >
              <Input
                id="telefone"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="(12) 99999-9999"
                {...register("telefone", {
                  onChange: (e) => setValue("telefone", mascararTelefone(e.target.value)),
                })}
              />
            </Campo>
          </FieldGroup>
        </Secao>

        <Secao titulo="Pagamento">
          <Controller
            control={control}
            name="pagamento"
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="grid gap-3 sm:grid-cols-2"
              >
                {formas.map((f) => (
                  <CartaoOpcao
                    key={f.valor}
                    valor={f.valor}
                    titulo={f.titulo}
                    detalhe={f.detalhe}
                    icone={f.icone}
                    marcado={field.value === f.valor}
                  />
                ))}
              </RadioGroup>
            )}
          />
          {pagamento === "Pix" && (
            <FieldGroup className="mt-4">
              <Campo
                nome="cpf"
                rotulo="CPF (obrigatório para Pix)"
                erro={formState.errors.cpf?.message}
                descricao="O banco pede o CPF de quem paga para gerar o Pix."
              >
                <Input
                  id="cpf"
                  inputMode="numeric"
                  placeholder="000.000.000-00"
                  {...register("cpf", {
                    onChange: (e) => setValue("cpf", mascararCpf(e.target.value)),
                  })}
                />
              </Campo>
            </FieldGroup>
          )}
          {pagamento === "Dinheiro" && (
            <FieldGroup className="mt-4">
              <Campo
                nome="troco"
                rotulo="Troco para quanto?"
                opcional
                erro={formState.errors.troco?.message}
                descricao="Deixe em branco se não precisar."
              >
                <Input
                  id="troco"
                  inputMode="decimal"
                  placeholder="Ex.: 50,00"
                  maxLength={10}
                  {...register("troco", {
                    onChange: (e) => setValue("troco", mascararMoeda(e.target.value)),
                  })}
                />
              </Campo>
            </FieldGroup>
          )}
        </Secao>

        <Secao titulo="Observação do pedido">
          <Textarea
            aria-label="Observação do pedido"
            rows={2}
            maxLength={300}
            placeholder="Ex.: mandar guardanapo extra"
            {...register("observacao")}
          />
        </Secao>

        <section
          aria-label="Seu pedido"
          className="flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-elevado"
        >
          <h2 className="font-bold text-xl">Seu pedido</h2>
          <ul className="flex flex-col gap-2 text-sm">
            {linhas
              .filter((l) => !l.indisponivel)
              .map((l) => (
                <li key={l.chave} className="flex justify-between gap-3">
                  <span>
                    <span className="numeros font-semibold">{l.quantidade}×</span> {l.nome}
                    {l.resumo && (
                      <span className="block text-muted-foreground text-xs">{l.resumo}</span>
                    )}
                  </span>
                  <Preco valor={l.total} className="font-medium" />
                </li>
              ))}
          </ul>
          <dl className="flex flex-col gap-1.5 border-t pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="numeros">{formatarMoeda(subtotal)}</dd>
            </div>
            {tipo === "Entrega" && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Entrega</dt>
                <dd className="numeros">{formatarMoeda(taxa)}</dd>
              </div>
            )}
            <div className="flex justify-between font-bold text-base">
              <dt>Total</dt>
              <dd className="numeros">{formatarMoeda(total)}</dd>
            </div>
          </dl>
        </section>

        <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
          <Button
            type="submit"
            size="xl"
            className="mx-auto flex w-full max-w-2xl"
            disabled={envio.isPending || !loja.lojaAberta}
          >
            {envio.isPending ? (
              <>
                <Spinner data-icon="inline-start" />
                Enviando pedido
              </>
            ) : (
              <>
                Fazer pedido · <span className="numeros">{formatarMoeda(total)}</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </main>
  )
}

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-elevado">
      <h2 className="font-bold text-xl">{titulo}</h2>
      {children}
    </section>
  )
}

function Campo({
  nome,
  rotulo,
  erro,
  descricao,
  opcional,
  children,
}: {
  nome: string
  rotulo: string
  erro?: string | undefined
  descricao?: string | undefined
  opcional?: boolean
  children: ReactNode
}) {
  return (
    <Field data-invalid={erro ? true : undefined}>
      <FieldLabel htmlFor={nome}>
        {rotulo}
        {opcional && <span className="font-normal text-muted-foreground">(opcional)</span>}
      </FieldLabel>
      {children}
      {descricao && !erro && <p className="text-muted-foreground text-sm">{descricao}</p>}
      {erro && <FieldError>{erro}</FieldError>}
    </Field>
  )
}

function CartaoOpcao({
  valor,
  titulo,
  detalhe,
  icone,
  marcado,
}: {
  valor: string
  titulo: string
  detalhe: string
  icone: ReactNode
  marcado: boolean
}) {
  const id = `opcao-${valor}`
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-[border-color,background-color] duration-(--duracao-rapida) [&_svg]:size-5",
        marcado ? "border-primary bg-accent/50" : "border-border hover:border-input",
      )}
    >
      <RadioGroupItem
        id={id}
        value={valor}
        className="mt-0.5"
        aria-label={`${titulo}: ${detalhe}`}
      />
      <span className="flex flex-col gap-0.5">
        <span className="flex items-center gap-2 font-semibold [&_svg]:text-marca-forte">
          {icone}
          {titulo}
        </span>
        <span className="text-muted-foreground text-sm">{detalhe}</span>
      </span>
    </label>
  )
}

function StatusCep({
  info,
}: {
  info: { endereco?: EnderecoCep; erro?: string; buscando?: boolean }
}) {
  if (info.buscando)
    return (
      <p className="flex items-center gap-2 text-muted-foreground text-sm">
        <Spinner /> Buscando o endereço…
      </p>
    )
  if (info.erro) return <p className="text-destructive text-sm">{info.erro}</p>
  const e = info.endereco
  if (!e) return null
  if (!e.atendido)
    return (
      <p className="rounded-lg bg-status-aguardando px-3 py-2 font-medium text-sm text-status-aguardando-foreground">
        Ainda não entregamos em {e.cidade}/{e.uf}. Você pode escolher retirar no quiosque.
      </p>
    )
  return (
    <p className="text-muted-foreground text-sm">
      {e.bairroEncontrado
        ? `${e.cidade}/${e.uf} · Bairro ${e.bairroEncontrado.nome}, taxa de ${formatarMoeda(e.bairroEncontrado.taxa)}`
        : e.bairro
          ? `${e.cidade}/${e.uf}`
          : `${e.cidade}/${e.uf} (CEP geral). Escolha seu bairro abaixo para calcular a taxa.`}
    </p>
  )
}
