import { useMutation, useQuery } from "@tanstack/react-query"
import {
  CopyIcon,
  DownloadIcon,
  EyeIcon,
  EyeOffIcon,
  PrinterIcon,
  RefreshCwIcon,
} from "lucide-react"
import { type FormEvent, type ReactNode, useState } from "react"
import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
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
import { Textarea } from "@/components/ui/textarea"
import { avisar } from "@/lib/avisos"
import { mascararTelefone } from "@/lib/mascaras"
import { cn } from "@/lib/utils"
import {
  type Configuracoes,
  obterConfiguracoes,
  salvarConfiguracoes,
} from "@/mock/configuracoes/acoes"
import { imprimirTeste, listarImpressoras } from "@/mock/impressao/acoes"
import { NOMES_DIAS, resumoHorarios } from "@/mock/regras/loja"
import type { ConfiguracaoLoja, HorarioFuncionamento } from "@/types/entidades"
import { CabecalhoPagina } from "../componentes/CabecalhoPagina"
import { StatusAgente } from "../impressao/StatusAgente"

type Erros = Partial<Record<"taxaEntregaTexto" | "pedidoMinimoTexto" | "nomeLoja", string>>

export function PaginaConfiguracoes() {
  const consulta = useQuery({
    queryKey: ["configuracoes"],
    queryFn: obterConfiguracoes,
    // O formulário é a fonte enquanto está aberto: refazer a busca apagaria o que foi digitado.
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
  })
  if (!consulta.data) {
    return (
      <div className="flex max-w-3xl flex-col gap-4">
        <Skeleton className="h-10 w-72" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64 rounded-2xl" />
        ))}
      </div>
    )
  }
  return <Formulario inicial={consulta.data} />
}

function Formulario({ inicial }: { inicial: Configuracoes }) {
  const [c, setC] = useState(inicial)
  const [erros, setErros] = useState<Erros>({})
  const loja = <K extends keyof ConfiguracaoLoja>(chave: K, valor: ConfiguracaoLoja[K]) =>
    setC((atual) => ({ ...atual, loja: { ...atual.loja, [chave]: valor } }))
  const horario = (dia: number, mudanca: Partial<HorarioFuncionamento>) =>
    setC((atual) => ({
      ...atual,
      horarios: atual.horarios.map((h) => (h.diaSemana === dia ? { ...h, ...mudanca } : h)),
    }))

  const envio = useMutation({
    mutationFn: () => salvarConfiguracoes(c),
    onSuccess: (r) => {
      if (!r.ok) {
        setErros(r.erros)
        avisar.erro("Confira os campos destacados.")
        return
      }
      avisar.sucesso(r.mensagem)
    },
  })

  function enviar(e: FormEvent) {
    e.preventDefault()
    setErros({})
    envio.mutate()
  }

  const l = c.loja

  return (
    <form onSubmit={enviar} noValidate className="flex max-w-3xl flex-col gap-6">
      <CabecalhoPagina
        titulo="Configurações da loja"
        descricao="O que muda aqui aparece na loja assim que você salvar."
      />

      <Secao titulo="Loja" id="loja">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field data-invalid={erros.nomeLoja ? true : undefined}>
            <FieldLabel htmlFor="cfg-nome">Nome da loja</FieldLabel>
            <Input
              id="cfg-nome"
              value={l.nomeLoja}
              onChange={(e) => loja("nomeLoja", e.target.value)}
              aria-invalid={erros.nomeLoja ? true : undefined}
            />
            {erros.nomeLoja && <FieldError>{erros.nomeLoja}</FieldError>}
          </Field>
          <Field>
            <FieldLabel htmlFor="cfg-slogan">Frase abaixo do nome</FieldLabel>
            <Input
              id="cfg-slogan"
              value={l.slogan ?? ""}
              onChange={(e) => loja("slogan", e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="cfg-telefone">Telefone exibido</FieldLabel>
            <Input
              id="cfg-telefone"
              inputMode="tel"
              className="numeros"
              value={l.telefone ?? ""}
              onChange={(e) => loja("telefone", mascararTelefone(e.target.value))}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="cfg-whatsapp">WhatsApp da loja</FieldLabel>
            <Input
              id="cfg-whatsapp"
              inputMode="tel"
              className="numeros"
              value={mascararTelefone(l.whatsApp ?? "")}
              onChange={(e) => loja("whatsApp", e.target.value)}
            />
            <FieldDescription>Com DDD. Recebe os avisos do cliente.</FieldDescription>
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="cfg-endereco">Endereço ou local de retirada</FieldLabel>
          <Input
            id="cfg-endereco"
            value={l.endereco ?? ""}
            onChange={(e) => loja("endereco", e.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="cfg-horario">Texto do horário no topo da loja</FieldLabel>
          <Input
            id="cfg-horario"
            placeholder={resumoHorarios(c.horarios)}
            value={l.horario ?? ""}
            onChange={(e) => loja("horario", e.target.value)}
          />
          <FieldDescription>
            Em branco, o texto sai da tabela de horários: "{resumoHorarios(c.horarios)}".
          </FieldDescription>
        </Field>
      </Secao>

      <Secao
        titulo="Horários de funcionamento"
        id="horarios"
        descricao="Com o controle automático ligado, a loja abre e fecha sozinha nesses horários."
      >
        <div className="flex flex-col gap-3 rounded-xl bg-muted/50 p-4">
          <Field orientation="horizontal">
            <Switch
              id="cfg-automatico"
              checked={l.controleHorarioAutomatico}
              onCheckedChange={(v) => loja("controleHorarioAutomatico", v)}
            />
            <FieldLabel htmlFor="cfg-automatico" className="font-normal">
              Abrir e fechar automaticamente pelos horários abaixo
            </FieldLabel>
          </Field>
          <Field orientation="horizontal" data-disabled={l.controleHorarioAutomatico || undefined}>
            <Switch
              id="cfg-aberta"
              checked={l.lojaAberta}
              disabled={l.controleHorarioAutomatico}
              onCheckedChange={(v) => loja("lojaAberta", v)}
            />
            <FieldLabel htmlFor="cfg-aberta" className="font-normal">
              Loja aberta agora (controle manual)
            </FieldLabel>
          </Field>
        </div>

        <TabelaHorarios
          horarios={c.horarios}
          aoMudar={horario}
          aoCopiar={(origem) =>
            setC((atual) => ({
              ...atual,
              horarios: atual.horarios.map((h) => ({
                ...h,
                abreAs: origem.abreAs,
                fechaAs: origem.fechaAs,
              })),
            }))
          }
        />

        <Field>
          <FieldLabel htmlFor="cfg-mensagem-fechada">
            Mensagem quando a loja está fechada
          </FieldLabel>
          <Textarea
            id="cfg-mensagem-fechada"
            rows={2}
            value={l.mensagemFechada ?? ""}
            onChange={(e) => loja("mensagemFechada", e.target.value)}
          />
        </Field>
      </Secao>

      <Secao titulo="Entrega e retirada" id="entrega">
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          <Interruptor
            id="cfg-entrega"
            rotulo="Faz entrega"
            valor={l.aceitaEntrega}
            aoMudar={(v) => loja("aceitaEntrega", v)}
          />
          <Interruptor
            id="cfg-retirada"
            rotulo="Aceita retirada no quiosque"
            valor={l.aceitaRetirada}
            aoMudar={(v) => loja("aceitaRetirada", v)}
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field data-invalid={erros.taxaEntregaTexto ? true : undefined}>
            <FieldLabel htmlFor="cfg-taxa">Taxa de entrega padrão (R$)</FieldLabel>
            <Input
              id="cfg-taxa"
              inputMode="decimal"
              className="numeros"
              value={c.taxaEntregaTexto}
              onChange={(e) => setC({ ...c, taxaEntregaTexto: e.target.value })}
              aria-invalid={erros.taxaEntregaTexto ? true : undefined}
            />
            {erros.taxaEntregaTexto ? (
              <FieldError>{erros.taxaEntregaTexto}</FieldError>
            ) : (
              <FieldDescription>
                Para valores por bairro, use{" "}
                <Link to="/admin/bairros" className="underline underline-offset-2">
                  Bairros e taxas
                </Link>
                .
              </FieldDescription>
            )}
          </Field>
          <Field data-invalid={erros.pedidoMinimoTexto ? true : undefined}>
            <FieldLabel htmlFor="cfg-minimo">Pedido mínimo (R$)</FieldLabel>
            <Input
              id="cfg-minimo"
              inputMode="decimal"
              className="numeros"
              value={c.pedidoMinimoTexto}
              onChange={(e) => setC({ ...c, pedidoMinimoTexto: e.target.value })}
              aria-invalid={erros.pedidoMinimoTexto ? true : undefined}
            />
            {erros.pedidoMinimoTexto ? (
              <FieldError>{erros.pedidoMinimoTexto}</FieldError>
            ) : (
              <FieldDescription>0 = sem mínimo.</FieldDescription>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="cfg-tempo-entrega">Tempo de entrega</FieldLabel>
            <Input
              id="cfg-tempo-entrega"
              placeholder="40 a 60 min"
              value={l.tempoEntrega}
              onChange={(e) => loja("tempoEntrega", e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="cfg-tempo-retirada">Tempo para retirada</FieldLabel>
            <Input
              id="cfg-tempo-retirada"
              placeholder="15 a 20 min"
              value={l.tempoRetirada}
              onChange={(e) => loja("tempoRetirada", e.target.value)}
            />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="cfg-cidades">Cidades atendidas</FieldLabel>
          <Input
            id="cfg-cidades"
            placeholder="Cachoeira Paulista, Canas"
            value={l.cidadesAtendidas ?? ""}
            onChange={(e) => loja("cidadesAtendidas", e.target.value)}
          />
          <FieldDescription>
            Separadas por vírgula. Em branco, entrega em qualquer cidade.
          </FieldDescription>
        </Field>
      </Secao>

      <Secao
        titulo="Formas de pagamento"
        id="pagamentos"
        descricao="Só as formas ligadas aparecem para o cliente no checkout."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Interruptor
            id="cfg-pix"
            rotulo="Pix"
            valor={l.aceitaPix}
            aoMudar={(v) => loja("aceitaPix", v)}
          />
          <Interruptor
            id="cfg-cartao-online"
            rotulo="Cartão online (crédito ou débito)"
            valor={l.aceitaCartaoOnline}
            aoMudar={(v) => loja("aceitaCartaoOnline", v)}
          />
          <Interruptor
            id="cfg-dinheiro"
            rotulo="Dinheiro na entrega ou retirada"
            valor={l.aceitaDinheiro}
            aoMudar={(v) => loja("aceitaDinheiro", v)}
          />
          <Interruptor
            id="cfg-maquininha"
            rotulo="Cartão na maquininha"
            valor={l.aceitaCartaoNaEntrega}
            aoMudar={(v) => loja("aceitaCartaoNaEntrega", v)}
          />
        </div>
      </Secao>

      <Secao
        titulo="Mercado Pago"
        id="mercado-pago"
        descricao="Pix dinâmico e cartão com aprovação automática."
        extra={
          l.mercadoPagoAccessToken?.trim() ? (
            <Badge className="bg-status-pronto text-status-pronto-foreground">Ativo</Badge>
          ) : (
            <Badge variant="secondary">Aguardando credenciais</Badge>
          )
        }
      >
        <FieldGroup className="gap-5">
          <CampoSegredo
            id="cfg-mp-token"
            rotulo="Access Token (produção ou teste)"
            descricao="Chave principal: gera o QR Code do Pix e processa o cartão."
            valor={l.mercadoPagoAccessToken ?? ""}
            aoMudar={(v) => loja("mercadoPagoAccessToken", v)}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="cfg-mp-public">Public Key</FieldLabel>
              <Input
                id="cfg-mp-public"
                autoComplete="off"
                spellCheck={false}
                value={l.mercadoPagoPublicKey ?? ""}
                onChange={(e) => loja("mercadoPagoPublicKey", e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="cfg-mp-client-id">Client ID</FieldLabel>
              <Input
                id="cfg-mp-client-id"
                autoComplete="off"
                spellCheck={false}
                value={l.mercadoPagoClientId ?? ""}
                onChange={(e) => loja("mercadoPagoClientId", e.target.value)}
              />
            </Field>
          </div>
          <CampoSegredo
            id="cfg-mp-secret"
            rotulo="Client Secret"
            valor={l.mercadoPagoClientSecret ?? ""}
            aoMudar={(v) => loja("mercadoPagoClientSecret", v)}
          />
        </FieldGroup>
        <p className="rounded-xl bg-muted/50 p-4 text-muted-foreground text-sm">
          Nesta versão de teste nada é enviado ao Mercado Pago: o Pix e o cartão são simulados. Com
          o servidor, a URL de notificação a cadastrar no painel do Mercado Pago é{" "}
          <code className="break-all font-mono text-foreground">
            https://quiosque-mineiro.clickpedidoweb.com.br/api/mercadopago/webhook
          </code>
          .
        </p>
      </Secao>

      <SecaoImpressao loja={l} aoMudar={loja} />

      <div className="sticky bottom-4 z-10 flex justify-end rounded-2xl border bg-background/90 p-3 shadow-elevado backdrop-blur">
        <Button type="submit" size="lg" disabled={envio.isPending}>
          {envio.isPending && <Spinner data-icon="inline-start" />}
          Salvar configurações
        </Button>
      </div>
    </form>
  )
}

function Secao({
  titulo,
  id,
  descricao,
  extra,
  children,
}: {
  titulo: string
  id: string
  descricao?: string
  extra?: ReactNode
  children: ReactNode
}) {
  return (
    <section
      aria-labelledby={`secao-${id}`}
      className="flex flex-col gap-5 rounded-2xl border bg-card p-6 shadow-elevado"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 id={`secao-${id}`} className="font-bold text-xl">
            {titulo}
          </h2>
          {descricao && <p className="text-muted-foreground text-sm">{descricao}</p>}
        </div>
        {extra}
      </header>
      {children}
    </section>
  )
}

function Interruptor({
  id,
  rotulo,
  valor,
  aoMudar,
}: {
  id: string
  rotulo: string
  valor: boolean
  aoMudar: (v: boolean) => void
}) {
  return (
    <Field orientation="horizontal" className="w-auto">
      <Switch id={id} checked={valor} onCheckedChange={aoMudar} />
      <FieldLabel htmlFor={id} className="font-normal">
        {rotulo}
      </FieldLabel>
    </Field>
  )
}

function CampoSegredo({
  id,
  rotulo,
  descricao,
  valor,
  aoMudar,
}: {
  id: string
  rotulo: string
  descricao?: string
  valor: string
  aoMudar: (v: string) => void
}) {
  const [visivel, setVisivel] = useState(false)
  return (
    <Field>
      <FieldLabel htmlFor={id}>{rotulo}</FieldLabel>
      <div className="flex gap-2">
        <Input
          id={id}
          type={visivel ? "text" : "password"}
          autoComplete="off"
          spellCheck={false}
          className="font-mono"
          value={valor}
          onChange={(e) => aoMudar(e.target.value)}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={visivel ? `Ocultar ${rotulo}` : `Mostrar ${rotulo}`}
          aria-pressed={visivel}
          onClick={() => setVisivel(!visivel)}
        >
          {visivel ? <EyeOffIcon /> : <EyeIcon />}
        </Button>
      </div>
      {descricao && <FieldDescription>{descricao}</FieldDescription>}
    </Field>
  )
}

const ORDEM_TELA = [1, 2, 3, 4, 5, 6, 0]

function TabelaHorarios({
  horarios,
  aoMudar,
  aoCopiar,
}: {
  horarios: HorarioFuncionamento[]
  aoMudar: (dia: number, mudanca: Partial<HorarioFuncionamento>) => void
  aoCopiar: (origem: HorarioFuncionamento) => void
}) {
  const porDia = ORDEM_TELA.map((d) => horarios.find((h) => h.diaSemana === d)).filter(
    (h): h is HorarioFuncionamento => !!h,
  )
  return (
    <ul className="flex flex-col divide-y rounded-xl border">
      {porDia.map((h) => {
        const nome = NOMES_DIAS[h.diaSemana] ?? ""
        return (
          <li
            key={h.diaSemana}
            className={cn(
              "flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3",
              !h.aberto && "bg-muted/40",
            )}
          >
            <div className="flex w-40 items-center gap-3">
              <Switch
                checked={h.aberto}
                onCheckedChange={(v) => aoMudar(h.diaSemana, { aberto: v })}
                aria-label={`Abre ${nome.toLowerCase()}`}
              />
              <span className={cn("font-semibold", !h.aberto && "text-muted-foreground")}>
                {nome}
              </span>
            </div>
            {h.aberto ? (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <Input
                    type="time"
                    aria-label={`${nome}: abre às`}
                    className="numeros w-28"
                    value={h.abreAs}
                    onChange={(e) => aoMudar(h.diaSemana, { abreAs: e.target.value })}
                  />
                  <span className="text-muted-foreground">às</span>
                  <Input
                    type="time"
                    aria-label={`${nome}: fecha às`}
                    className="numeros w-28"
                    value={h.fechaAs}
                    onChange={(e) => aoMudar(h.diaSemana, { fechaAs: e.target.value })}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  onClick={() => {
                    aoCopiar(h)
                    avisar(`Horário de ${nome.toLowerCase()} copiado para todos os dias.`)
                  }}
                >
                  <CopyIcon data-icon="inline-start" />
                  Copiar para todos
                </Button>
              </>
            ) : (
              <span className="text-muted-foreground text-sm">Fechado</span>
            )}
          </li>
        )
      })}
    </ul>
  )
}

function SecaoImpressao({
  loja: l,
  aoMudar,
}: {
  loja: ConfiguracaoLoja
  aoMudar: <K extends keyof ConfiguracaoLoja>(chave: K, valor: ConfiguracaoLoja[K]) => void
}) {
  const impressoras = useQuery({ queryKey: ["impressoras"], queryFn: listarImpressoras })
  const teste = useMutation({
    mutationFn: (nome: string | null) => imprimirTeste(nome),
    onSuccess: (r) => avisar.sucesso(r.mensagem),
  })
  const PADRAO = "__padrao"

  return (
    <Secao
      titulo="Impressão"
      id="impressao"
      descricao="O agente roda no computador do caixa e imprime direto na POS-80, sem abrir janela."
      extra={<StatusAgente />}
    >
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            avisar.info(
              "O instalador do agente vem com o servidor. Nesta versão de teste, ele é simulado.",
            )
          }
        >
          <DownloadIcon data-icon="inline-start" />
          Baixar agente de impressão
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={teste.isPending}
          onClick={() => teste.mutate(l.nomeImpressoraTermica)}
        >
          {teste.isPending ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <PrinterIcon data-icon="inline-start" />
          )}
          Imprimir cupom de teste
        </Button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="cfg-impressoras">Impressoras encontradas</FieldLabel>
          <div className="flex gap-2">
            <Select
              value={
                l.nomeImpressoraTermica &&
                impressoras.data?.impressoras.includes(l.nomeImpressoraTermica)
                  ? l.nomeImpressoraTermica
                  : PADRAO
              }
              onValueChange={(v) => aoMudar("nomeImpressoraTermica", v === PADRAO ? null : v)}
            >
              <SelectTrigger id="cfg-impressoras" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value={PADRAO}>
                    Usar a padrão ({impressoras.data?.padrao ?? "…"})
                  </SelectItem>
                  {impressoras.data?.impressoras.map((i) => (
                    <SelectItem key={i} value={i}>
                      {i}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Procurar impressoras de novo"
              disabled={impressoras.isFetching}
              onClick={() => impressoras.refetch()}
            >
              <RefreshCwIcon className={cn(impressoras.isFetching && "animate-spin")} />
            </Button>
          </div>
        </Field>
        <Field>
          <FieldLabel htmlFor="cfg-impressora-nome">Nome exato da impressora</FieldLabel>
          <Input
            id="cfg-impressora-nome"
            placeholder="POS-80"
            value={l.nomeImpressoraTermica ?? ""}
            onChange={(e) => aoMudar("nomeImpressoraTermica", e.target.value || null)}
          />
          <FieldDescription>Escolha na lista ou digite como aparece no Windows.</FieldDescription>
        </Field>
      </div>

      <div className="flex flex-col gap-3 rounded-xl bg-muted/50 p-4">
        <Interruptor
          id="cfg-impressao-automatica"
          rotulo="Imprimir pedidos automaticamente ao receber"
          valor={l.impressaoAutomatica}
          aoMudar={(v) => aoMudar("impressaoAutomatica", v)}
        />
        <Interruptor
          id="cfg-cortar"
          rotulo="Cortar o papel depois do cupom"
          valor={l.cortarPapelImpressora}
          aoMudar={(v) => aoMudar("cortarPapelImpressora", v)}
        />
      </div>
    </Secao>
  )
}
