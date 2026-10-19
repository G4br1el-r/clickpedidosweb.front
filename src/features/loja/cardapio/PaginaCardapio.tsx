import { useState } from "react"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { ModalProduto } from "@/features/loja/produto/ModalProduto"
import { BarraSacola } from "@/features/loja/sacola/BarraSacola"
import { PainelSacola } from "@/features/loja/sacola/PainelSacola"
import { useSacola } from "@/features/loja/sacola/sacola"
import { useLinhasSacola } from "@/features/loja/sacola/useLinhasSacola"
import type { Produto } from "@/types/entidades"
import { AbasCategorias, idCategoria } from "./AbasCategorias"
import { CabecalhoLoja } from "./CabecalhoLoja"
import { ProdutoLinha } from "./ProdutoLinha"
import { RodapeLoja } from "./RodapeLoja"
import { useCardapio } from "./useCardapio"

interface PaginaCardapioProps {
  /** Cardápio digital (QR Code, TV): só consulta, sem sacola. */
  somenteConsulta?: boolean
}

export function PaginaCardapio({ somenteConsulta = false }: PaginaCardapioProps) {
  const { data, isError, refetch } = useCardapio()
  const [aberto, setAberto] = useState<Produto | null>(null)
  const [sacolaAberta, setSacolaAberta] = useState(false)
  const { resumo } = useLinhasSacola()

  if (isError)
    return (
      <main className="mx-auto flex min-h-svh max-w-md flex-col items-center justify-center gap-3 p-6 text-center">
        <h1 className="font-bold text-2xl">Não conseguimos carregar o cardápio</h1>
        <button
          type="button"
          className="font-semibold text-primary underline"
          onClick={() => refetch()}
        >
          Tentar de novo
        </button>
      </main>
    )

  if (!data) return <EsqueletoCardapio />

  const podePedir = !somenteConsulta && data.loja.lojaAberta

  return (
    <>
      <main className="mx-auto min-h-svh max-w-3xl pb-32">
        <CabecalhoLoja loja={data.loja} />
        <AbasCategorias categorias={data.categorias} />
        {data.categorias.map((c) => (
          <section
            key={c.id}
            id={idCategoria(c.id)}
            data-categoria={c.id}
            aria-labelledby={`${idCategoria(c.id)}-titulo`}
            className="scroll-mt-20 px-2 pt-7"
          >
            <h2
              id={`${idCategoria(c.id)}-titulo`}
              className="px-3 pb-2 font-extrabold text-2xl tracking-[-0.01em]"
            >
              {c.nome}
            </h2>
            <div className="flex flex-col divide-y divide-border/70">
              {c.produtos.map((p) => (
                <ProdutoLinha
                  key={p.id}
                  produto={p}
                  {...(somenteConsulta ? {} : { aoAbrir: setAberto, bloqueado: !podePedir })}
                />
              ))}
            </div>
          </section>
        ))}
        <RodapeLoja loja={data.loja} />
      </main>

      {!somenteConsulta && (
        <>
          <ModalProduto
            produto={aberto}
            aberto={aberto !== null}
            aoFechar={() => setAberto(null)}
            aoAdicionar={(item) => {
              useSacola.getState().adicionar(item)
              setAberto(null)
              toast.success("Adicionado à sacola", {
                action: { label: "Abrir sacola", onClick: () => setSacolaAberta(true) },
              })
            }}
          />
          <BarraSacola
            quantidade={resumo.quantidade}
            subtotal={resumo.subtotal}
            aoAbrir={() => setSacolaAberta(true)}
          />
          <PainelSacola aberto={sacolaAberta} aoMudar={setSacolaAberta} />
        </>
      )}
    </>
  )
}

export function PaginaCardapioDigital() {
  return <PaginaCardapio somenteConsulta />
}

function EsqueletoCardapio() {
  return (
    <main aria-busy className="mx-auto flex max-w-3xl flex-col gap-4 p-5">
      <Skeleton className="h-36 w-full rounded-2xl" />
      <Skeleton className="h-8 w-2/3" />
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex gap-4">
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/4" />
          </div>
          <Skeleton className="size-24 rounded-xl" />
        </div>
      ))}
    </main>
  )
}
