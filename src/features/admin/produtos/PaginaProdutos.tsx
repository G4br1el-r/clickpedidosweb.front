import { useMutation, useQuery } from "@tanstack/react-query"
import { FolderTreeIcon, PencilIcon, PlusIcon, Trash2Icon, UtensilsCrossedIcon } from "lucide-react"
import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { FotoProduto } from "@/components/ui/foto-produto"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { avisar } from "@/lib/avisos"
import { formatarMoeda } from "@/lib/moeda"
import { alternarProduto, excluirProduto, listarProdutosAdmin } from "@/mock/produtos/acoes"
import type { Produto } from "@/types/entidades"
import { CabecalhoPagina } from "../componentes/CabecalhoPagina"
import { ConfirmarExclusao } from "../componentes/ConfirmarExclusao"

export function PaginaProdutos() {
  const consulta = useQuery({ queryKey: ["produtos-admin"], queryFn: listarProdutosAdmin })
  const categorias = consulta.data

  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina
        titulo="Cardápio"
        descricao='"Esgotado" mantém o item no cardápio sem deixar pedir. "Oculto" tira o item do cardápio.'
        acoes={
          <>
            <Button variant="outline" asChild>
              <Link to="/admin/categorias">
                <FolderTreeIcon data-icon="inline-start" />
                Categorias
              </Link>
            </Button>
            {categorias && categorias.length > 0 && (
              <Button asChild>
                <Link to="/admin/produtos/novo">
                  <PlusIcon data-icon="inline-start" />
                  Novo produto
                </Link>
              </Button>
            )}
          </>
        }
      />

      {!categorias ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : categorias.length === 0 ? (
        <Empty className="rounded-2xl border bg-card py-14">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UtensilsCrossedIcon />
            </EmptyMedia>
            <EmptyTitle>Nenhuma categoria ainda</EmptyTitle>
            <EmptyDescription>Crie uma categoria antes de cadastrar produtos.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link to="/admin/categorias">Criar categoria</Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        categorias.map((c) => (
          <section
            key={c.id}
            aria-labelledby={`categoria-${c.id}`}
            className="overflow-hidden rounded-2xl border bg-card shadow-elevado"
          >
            <header className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3">
              <h2 id={`categoria-${c.id}`} className="flex items-center gap-2 font-bold text-lg">
                {c.nome}
                {!c.ativa && <Badge variant="secondary">Categoria oculta</Badge>}
              </h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to={`/admin/produtos/novo?categoria=${c.id}`}>
                  <PlusIcon data-icon="inline-start" />
                  Produto em {c.nome}
                </Link>
              </Button>
            </header>
            {c.produtos.length === 0 ? (
              <p className="px-5 py-6 text-muted-foreground text-sm">
                Nenhum produto nesta categoria.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Preço</TableHead>
                    <TableHead className="text-right">Ordem</TableHead>
                    <TableHead>Situação</TableHead>
                    <TableHead>
                      <span className="sr-only">Ações</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {c.produtos.map((p) => (
                    <LinhaProduto key={p.id} produto={p} />
                  ))}
                </TableBody>
              </Table>
            )}
          </section>
        ))
      )}
    </div>
  )
}

function LinhaProduto({ produto: p }: { produto: Produto }) {
  const alternar = useMutation({
    mutationFn: (campo: "disponivel" | "ativo") => alternarProduto(p.id, campo),
  })
  const exclusao = useMutation({
    mutationFn: () => excluirProduto(p.id),
    onSuccess: (r) => (r.ok ? avisar.sucesso(r.mensagem) : avisar.erro(r.erro)),
  })

  return (
    <TableRow data-inativo={!p.ativo || undefined} className="data-inativo:opacity-60">
      <TableCell>
        <div className="flex items-center gap-3">
          <FotoProduto produto={p} tamanho="sm" />
          <div className="flex min-w-0 flex-col">
            <span className="font-semibold">{p.nome}</span>
            {p.descricao && (
              <span className="line-clamp-1 max-w-md text-muted-foreground text-sm">
                {p.descricao}
              </span>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="numeros text-right font-semibold">{formatarMoeda(p.preco)}</TableCell>
      <TableCell className="numeros text-right text-muted-foreground">{p.ordem}</TableCell>
      <TableCell>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Switch
              id={`disponivel-${p.id}`}
              size="sm"
              checked={p.disponivel}
              onCheckedChange={() => alternar.mutate("disponivel")}
              aria-label={`${p.nome} disponível para pedir`}
            />
            <label htmlFor={`disponivel-${p.id}`} aria-hidden>
              {p.disponivel ? "Disponível" : "Esgotado"}
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id={`ativo-${p.id}`}
              size="sm"
              checked={p.ativo}
              onCheckedChange={() => alternar.mutate("ativo")}
              aria-label={`${p.nome} visível no cardápio`}
            />
            <label htmlFor={`ativo-${p.id}`} aria-hidden>
              {p.ativo ? "Visível" : "Oculto"}
            </label>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link to={`/admin/produtos/${p.id}`} aria-label={`Editar ${p.nome}`}>
              <PencilIcon />
            </Link>
          </Button>
          <ConfirmarExclusao
            titulo={`Excluir ${p.nome}?`}
            descricao="O produto sai do cardápio e do admin. Pedidos antigos continuam com o nome e o preço da época."
            onConfirmar={() => exclusao.mutate()}
          >
            <Button variant="ghost" size="icon-sm" aria-label={`Excluir ${p.nome}`}>
              <Trash2Icon />
            </Button>
          </ConfirmarExclusao>
        </div>
      </TableCell>
    </TableRow>
  )
}
