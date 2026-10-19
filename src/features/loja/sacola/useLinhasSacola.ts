import { useMemo } from "react"
import { useCardapio } from "@/features/loja/cardapio/useCardapio"
import { linhasDaSacola, resumoSacola, useSacola } from "./sacola"

/** Sacola com preços conferidos no cardápio atual. */
export function useLinhasSacola() {
  const itens = useSacola((s) => s.itens)
  const { data } = useCardapio()
  const produtos = useMemo(() => data?.categorias.flatMap((c) => c.produtos) ?? [], [data])
  const linhas = useMemo(() => linhasDaSacola(itens, produtos), [itens, produtos])
  return { linhas, resumo: resumoSacola(linhas), loja: data?.loja, carregando: !data }
}
