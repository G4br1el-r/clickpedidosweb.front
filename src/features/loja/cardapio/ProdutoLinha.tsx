import { cn } from "cn"
import { FotoProduto } from "@/components/ui/foto-produto"
import { Preco } from "@/components/ui/preco"
import { temPrecoAPartirDe } from "@/mock/regras/preco"
import type { Produto } from "@/types/entidades"

interface ProdutoLinhaProps {
  produto: Produto
  /** Sem esta função a linha é só de consulta (cardápio digital). */
  aoAbrir?: (produto: Produto) => void
  /** Loja fechada: mostra o produto, mas não deixa pedir. */
  bloqueado?: boolean
}

export function ProdutoLinha({ produto, aoAbrir, bloqueado }: ProdutoLinhaProps) {
  const esgotado = !produto.disponivel
  const conteudo = (
    <>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3 className="font-heading font-semibold text-[1.0625rem] leading-snug">{produto.nome}</h3>
        {produto.descricao && (
          <p className="line-clamp-2 text-muted-foreground text-sm leading-relaxed">
            {produto.descricao}
          </p>
        )}
        <div className="mt-auto flex items-center gap-2 pt-1.5">
          {esgotado ? (
            <span className="rounded-full bg-muted px-2 py-0.5 font-semibold text-muted-foreground text-xs">
              Esgotado
            </span>
          ) : (
            <Preco valor={produto.preco} aPartirDe={temPrecoAPartirDe(produto)} />
          )}
        </div>
      </div>
      <FotoProduto produto={produto} tamanho="md" className={cn(esgotado && "grayscale")} />
    </>
  )

  const classe = cn("flex w-full gap-4 rounded-xl px-3 py-3.5 text-left", esgotado && "opacity-60")

  if (!aoAbrir) return <div className={classe}>{conteudo}</div>

  return (
    <button
      type="button"
      disabled={esgotado || bloqueado}
      onClick={() => aoAbrir(produto)}
      className={cn(
        classe,
        "transition-[background-color,transform] duration-(--duracao-rapida) ease-(--curva-saida) hover:bg-muted/60 active:scale-[0.985] disabled:cursor-not-allowed disabled:active:scale-100",
      )}
    >
      {conteudo}
    </button>
  )
}
