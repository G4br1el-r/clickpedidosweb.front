import type { ReactNode } from "react"

/** Título de tela do admin com descrição e ações à direita. */
export function CabecalhoPagina({
  titulo,
  descricao,
  acoes,
}: {
  titulo: string
  descricao?: ReactNode
  acoes?: ReactNode
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="font-extrabold text-3xl tracking-[-0.02em]">{titulo}</h1>
        {descricao && <p className="text-muted-foreground">{descricao}</p>}
      </div>
      {acoes && <div className="flex flex-wrap items-center gap-2">{acoes}</div>}
    </header>
  )
}
