import { cn } from "cn"
import { useEffect, useRef, useState } from "react"
import type { CategoriaCardapio } from "@/mock/cardapio/acoes"

export const idCategoria = (id: number) => `categoria-${id}`

/** Abas fixas no topo que acompanham a rolagem (porta do scroll-spy do cardapio.js). */
export function AbasCategorias({ categorias }: { categorias: CategoriaCardapio[] }) {
  const [ativa, setAtiva] = useState(categorias[0]?.id ?? 0)
  const lista = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return
    const observador = new IntersectionObserver(
      (entradas) => {
        const visivel = entradas
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        const id = visivel?.target.getAttribute("data-categoria")
        if (id) setAtiva(Number(id))
      },
      { rootMargin: "-120px 0px -60% 0px" },
    )
    for (const c of categorias) {
      const el = document.getElementById(idCategoria(c.id))
      if (el) observador.observe(el)
    }
    return () => observador.disconnect()
  }, [categorias])

  // Mantém a aba ativa à vista na faixa rolável.
  useEffect(() => {
    const aba = lista.current?.querySelector<HTMLElement>(`[data-aba="${ativa}"]`)
    aba?.scrollIntoView?.({ block: "nearest", inline: "center", behavior: "smooth" })
  }, [ativa])

  return (
    <nav
      aria-label="Categorias"
      className="sticky top-0 z-20 border-b bg-background/92 backdrop-blur supports-backdrop-filter:bg-background/80"
    >
      <div ref={lista} className="sem-barra mx-auto flex max-w-3xl gap-2 overflow-x-auto px-4 py-3">
        {categorias.map((c) => (
          <a
            key={c.id}
            href={`#${idCategoria(c.id)}`}
            data-aba={c.id}
            aria-current={ativa === c.id ? "true" : undefined}
            onClick={() => setAtiva(c.id)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 font-semibold text-sm transition-[background-color,color] duration-(--duracao-rapida)",
              ativa === c.id
                ? "bg-foreground text-background"
                : "bg-muted text-foreground hover:bg-muted/70",
            )}
          >
            {c.nome}
          </a>
        ))}
      </div>
    </nav>
  )
}
