import { useQuery } from "@tanstack/react-query"
import { obterCardapio } from "@/mock/cardapio/acoes"

export const chaveCardapio = ["cardapio"] as const

export function useCardapio() {
  return useQuery({ queryKey: chaveCardapio, queryFn: obterCardapio })
}
