import { useMemo } from "react"
import { Preco } from "@/components/ui/preco"
import { Skeleton } from "@/components/ui/skeleton"
import { TicketCozinha } from "@/features/admin/cozinha/TicketCozinha"
import { CartaoPedido } from "@/features/admin/fila/CartaoPedido"
import { COLUNAS_FILA, ColunaFila } from "@/features/admin/fila/ColunaFila"
import { CabecalhoLoja } from "@/features/loja/cardapio/CabecalhoLoja"
import { ProdutoLinha } from "@/features/loja/cardapio/ProdutoLinha"
import { useCardapio } from "@/features/loja/cardapio/useCardapio"
import { produtosIniciais } from "@/mock/cardapio/dados"
import { pedidosDeExemplo } from "@/mock/pedidos/exemplos"
import type { StatusPedido } from "@/types/entidades"

function usePedidosDeExemplo() {
  return useMemo(() => {
    const agora = new Date()
    return { agora, pedidos: pedidosDeExemplo(produtosIniciais, agora) }
  }, [])
}

export function CardapioCelular() {
  const { data } = useCardapio()
  return (
    <section
      aria-label="Cardápio no celular"
      className="mx-auto w-full max-w-[390px] overflow-hidden rounded-[2.25rem] border-8 border-foreground/90 bg-background text-foreground shadow-flutuante"
    >
      <div className="h-[720px] overflow-y-auto">
        {data ? (
          <>
            <CabecalhoLoja loja={data.loja} nivelTitulo={2} />
            <nav
              aria-label="Categorias"
              className="sem-barra sticky top-0 z-10 flex gap-2 overflow-x-auto border-b bg-background/95 px-4 py-3 backdrop-blur"
            >
              {data.categorias.map((c, i) => (
                <span
                  key={c.id}
                  className={
                    i === 0
                      ? "shrink-0 rounded-full bg-foreground px-3.5 py-1.5 font-semibold text-background text-sm"
                      : "shrink-0 rounded-full bg-muted px-3.5 py-1.5 font-medium text-sm"
                  }
                >
                  {c.nome}
                </span>
              ))}
            </nav>
            {data.categorias.slice(0, 3).map((c) => (
              <div key={c.id} className="px-2 pt-5">
                <h3 className="px-3 pb-1 font-bold text-xl">{c.nome}</h3>
                {c.produtos.slice(0, 3).map((p) => (
                  <ProdutoLinha key={p.id} produto={p} aoAbrir={() => {}} />
                ))}
              </div>
            ))}
            <div className="sticky bottom-0 p-3">
              <div className="flex items-center justify-between rounded-2xl bg-primary px-5 py-4 text-primary-foreground shadow-flutuante">
                <span className="flex items-center gap-2 font-semibold">
                  <span className="numeros grid size-6 place-items-center rounded-full bg-primary-foreground font-bold text-primary text-xs">
                    3
                  </span>
                  Ver sacola
                </span>
                <Preco valor={42} className="text-primary-foreground" />
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-3 p-5">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}
      </div>
    </section>
  )
}

export function FilaBalcao() {
  const { agora, pedidos } = usePedidosDeExemplo()
  return (
    <section aria-label="Fila do balcão" className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {COLUNAS_FILA.map((coluna) => {
        const daColuna = pedidos.filter((p) =>
          (coluna.status as readonly StatusPedido[]).includes(p.status),
        )
        return (
          <ColunaFila
            key={coluna.id}
            titulo={coluna.titulo}
            quantidade={daColuna.length}
            cor={coluna.cor}
            vazio={coluna.vazio}
          >
            {daColuna.map((p) => (
              <CartaoPedido key={p.id} pedido={p} agora={agora} aoAvancar={() => {}} />
            ))}
          </ColunaFila>
        )
      })}
    </section>
  )
}

export function CozinhaKds() {
  const { agora, pedidos } = usePedidosDeExemplo()
  const naCozinha = pedidos.filter((p) => p.status === "Recebido" || p.status === "EmPreparo")
  return (
    <section
      aria-label="Cozinha"
      className="dark grid gap-4 rounded-3xl bg-background p-4 text-foreground sm:grid-cols-2 xl:grid-cols-4"
    >
      {naCozinha.map((p) => (
        <TicketCozinha key={p.id} pedido={p} agora={agora} aoAvancar={() => {}} />
      ))}
    </section>
  )
}
