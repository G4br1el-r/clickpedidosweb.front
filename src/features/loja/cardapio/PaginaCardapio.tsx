import { useCardapio } from "./useCardapio"

export function PaginaCardapio() {
  const { data } = useCardapio()
  if (!data) return null
  return (
    <main className="p-6">
      <h1 className="font-bold text-3xl">{data.loja.nomeLoja}</h1>
      <p className="text-muted-foreground">{data.loja.slogan}</p>
    </main>
  )
}
