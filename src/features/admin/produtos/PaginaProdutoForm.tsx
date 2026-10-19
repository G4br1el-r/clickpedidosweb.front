import { useMutation, useQuery } from "@tanstack/react-query"
import { ArrowLeftIcon, ImageUpIcon, XIcon } from "lucide-react"
import { type ChangeEvent, type FormEvent, useRef, useState } from "react"
import { Link, useNavigate, useParams, useSearchParams } from "react-router"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { FotoProduto } from "@/components/ui/foto-produto"
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
import { listarCategoriasAdmin } from "@/mock/categorias/acoes"
import {
  obterProduto,
  type ProdutoForm,
  salvarProduto,
  TAMANHO_MAXIMO_FOTO,
} from "@/mock/produtos/acoes"
import type { Produto } from "@/types/entidades"
import { CabecalhoPagina } from "../componentes/CabecalhoPagina"

type Erros = Partial<Record<"nome" | "preco" | "categoriaId" | "imagem", string>>

const emReais = (v: number) => v.toFixed(2).replace(".", ",")

function formDe(p: Produto | null, categoriaId: number): ProdutoForm {
  return {
    id: p?.id ?? 0,
    categoriaId: p?.categoriaId ?? categoriaId,
    nome: p?.nome ?? "",
    descricao: p?.descricao ?? "",
    preco: p ? emReais(p.preco) : "",
    ordem: p?.ordem ?? 0,
    ativo: p?.ativo ?? true,
    disponivel: p?.disponivel ?? true,
    imagem: null,
    removerImagem: false,
  }
}

export function PaginaProdutoForm() {
  const id = Number(useParams()["id"] ?? 0)
  const [parametros] = useSearchParams()
  const produto = useQuery({
    queryKey: ["produto", id],
    queryFn: () => obterProduto(id),
    enabled: id > 0,
  })
  const categorias = useQuery({ queryKey: ["categorias-admin"], queryFn: listarCategoriasAdmin })

  const carregando = !categorias.data || (id > 0 && produto.data === undefined)
  if (carregando) {
    return (
      <div className="flex max-w-2xl flex-col gap-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[480px] rounded-2xl" />
      </div>
    )
  }
  if (id > 0 && !produto.data) {
    return (
      <div className="flex flex-col items-start gap-4">
        <CabecalhoPagina titulo="Produto não encontrado" descricao="Ele pode ter sido excluído." />
        <Button variant="outline" asChild>
          <Link to="/admin/produtos">Voltar ao cardápio</Link>
        </Button>
      </div>
    )
  }
  return (
    <Formulario
      key={id}
      inicial={formDe(produto.data ?? null, Number(parametros.get("categoria") ?? 0))}
      fotoAtual={produto.data?.imagemUrl ?? null}
      categorias={categorias.data}
    />
  )
}

function Formulario({
  inicial,
  fotoAtual,
  categorias,
}: {
  inicial: ProdutoForm
  fotoAtual: string | null
  categorias: Array<{ id: number; nome: string }>
}) {
  const navegar = useNavigate()
  const [form, setForm] = useState(inicial)
  const [erros, setErros] = useState<Erros>({})
  const novo = inicial.id === 0
  const campo = <K extends keyof ProdutoForm>(chave: K, valor: ProdutoForm[K]) =>
    setForm((f) => ({ ...f, [chave]: valor }))

  const envio = useMutation({
    mutationFn: () => salvarProduto(form),
    onSuccess: (r) => {
      if (!r.ok) return setErros(r.erros)
      avisar.sucesso(r.mensagem)
      navegar("/admin/produtos")
    },
  })

  function enviar(e: FormEvent) {
    e.preventDefault()
    setErros({})
    envio.mutate()
  }

  const previa = form.imagem ?? (form.removerImagem ? null : fotoAtual)

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          to="/admin/produtos"
          className="flex w-fit items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
        >
          <ArrowLeftIcon aria-hidden className="size-4" />
          Cardápio
        </Link>
        <CabecalhoPagina titulo={novo ? "Novo produto" : `Editar ${inicial.nome}`} />
      </div>

      <form
        onSubmit={enviar}
        noValidate
        className="flex flex-col gap-6 rounded-2xl border bg-card p-6 shadow-elevado"
      >
        <FieldGroup className="gap-5">
          <Field data-invalid={erros.categoriaId ? true : undefined}>
            <FieldLabel htmlFor="produto-categoria">Categoria</FieldLabel>
            <Select
              value={form.categoriaId ? String(form.categoriaId) : ""}
              onValueChange={(v) => campo("categoriaId", Number(v))}
            >
              <SelectTrigger
                id="produto-categoria"
                className="w-full"
                aria-invalid={erros.categoriaId ? true : undefined}
              >
                <SelectValue placeholder="Escolha…" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {categorias.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {erros.categoriaId && <FieldError>{erros.categoriaId}</FieldError>}
          </Field>

          <Field data-invalid={erros.nome ? true : undefined}>
            <FieldLabel htmlFor="produto-nome">Nome</FieldLabel>
            <Input
              id="produto-nome"
              maxLength={80}
              value={form.nome}
              onChange={(e) => campo("nome", e.target.value)}
              aria-invalid={erros.nome ? true : undefined}
            />
            {erros.nome && <FieldError>{erros.nome}</FieldError>}
          </Field>

          <Field>
            <FieldLabel htmlFor="produto-descricao">Descrição</FieldLabel>
            <Textarea
              id="produto-descricao"
              rows={3}
              maxLength={300}
              placeholder="Ingredientes, tamanho, o que acompanha"
              value={form.descricao}
              onChange={(e) => campo("descricao", e.target.value)}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field data-invalid={erros.preco ? true : undefined}>
              <FieldLabel htmlFor="produto-preco">Preço (R$)</FieldLabel>
              <Input
                id="produto-preco"
                inputMode="decimal"
                placeholder="12,50"
                className="numeros"
                value={form.preco}
                onChange={(e) => campo("preco", e.target.value)}
                aria-invalid={erros.preco ? true : undefined}
              />
              {erros.preco && <FieldError>{erros.preco}</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor="produto-ordem">Ordem no cardápio</FieldLabel>
              <Input
                id="produto-ordem"
                type="number"
                min={0}
                step={1}
                className="numeros"
                value={form.ordem}
                onChange={(e) => campo("ordem", Math.max(0, Number(e.target.value) || 0))}
              />
              <FieldDescription>Menor aparece primeiro.</FieldDescription>
            </Field>
          </div>

          <CampoFoto
            nome={form.nome || "Produto"}
            previa={previa}
            temFotoSalva={!!fotoAtual}
            erro={erros.imagem}
            onEscolher={(dataUrl) => {
              setErros(({ imagem: _, ...resto }) => resto)
              setForm((f) => ({ ...f, imagem: dataUrl, removerImagem: false }))
            }}
            onErro={(mensagem) => setErros((e) => ({ ...e, imagem: mensagem }))}
            onRemover={() => setForm((f) => ({ ...f, imagem: null, removerImagem: !!fotoAtual }))}
          />

          <div className="flex flex-col gap-3 rounded-xl bg-muted/50 p-4">
            <Field orientation="horizontal">
              <Switch
                id="produto-disponivel"
                checked={form.disponivel}
                onCheckedChange={(v) => campo("disponivel", v)}
              />
              <FieldLabel htmlFor="produto-disponivel" className="font-normal">
                Disponível para pedir (desligue quando esgotar)
              </FieldLabel>
            </Field>
            <Field orientation="horizontal">
              <Switch
                id="produto-ativo"
                checked={form.ativo}
                onCheckedChange={(v) => campo("ativo", v)}
              />
              <FieldLabel htmlFor="produto-ativo" className="font-normal">
                Visível no cardápio
              </FieldLabel>
            </Field>
          </div>
        </FieldGroup>

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={envio.isPending}>
            {envio.isPending && <Spinner data-icon="inline-start" />}
            Salvar produto
          </Button>
          <Button type="button" variant="ghost" asChild>
            <Link to="/admin/produtos">Cancelar</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}

const TIPOS_ACEITOS = ["image/jpeg", "image/png", "image/webp"]

function CampoFoto({
  nome,
  previa,
  temFotoSalva,
  erro,
  onEscolher,
  onErro,
  onRemover,
}: {
  nome: string
  previa: string | null
  temFotoSalva: boolean
  erro: string | undefined
  onEscolher: (dataUrl: string) => void
  onErro: (mensagem: string) => void
  onRemover: () => void
}) {
  // Sem backend, a foto vira data URL e fica no banco mockado (localStorage).
  function escolher(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    e.target.value = ""
    if (!arquivo) return
    if (!TIPOS_ACEITOS.includes(arquivo.type)) return onErro("Envie a foto em JPG, PNG ou WEBP.")
    if (arquivo.size > TAMANHO_MAXIMO_FOTO) return onErro("A foto deve ter até 3 MB.")
    const leitor = new FileReader()
    leitor.onload = () => typeof leitor.result === "string" && onEscolher(leitor.result)
    leitor.readAsDataURL(arquivo)
  }

  const entrada = useRef<HTMLInputElement>(null)

  return (
    <Field data-invalid={erro ? true : undefined}>
      <FieldLabel htmlFor="produto-foto">Foto</FieldLabel>
      <div className="flex items-center gap-4">
        <FotoProduto produto={{ id: 0, nome, imagemUrl: previa }} tamanho="md" />
        <div className="flex flex-col items-start gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => entrada.current?.click()}
          >
            <ImageUpIcon data-icon="inline-start" />
            {previa ? "Trocar foto" : "Escolher foto"}
          </Button>
          <input
            ref={entrada}
            id="produto-foto"
            type="file"
            tabIndex={-1}
            accept={TIPOS_ACEITOS.join(",")}
            onChange={escolher}
            className="sr-only"
            aria-invalid={erro ? true : undefined}
          />
          {previa && (
            <Button type="button" variant="ghost" size="sm" onClick={onRemover}>
              <XIcon data-icon="inline-start" />
              Remover foto
            </Button>
          )}
        </div>
      </div>
      <FieldDescription>
        JPG, PNG ou WEBP, até 3 MB.
        {temFotoSalva && !previa && " A foto atual será removida ao salvar."}
      </FieldDescription>
      {erro && <FieldError>{erro}</FieldError>}
    </Field>
  )
}
