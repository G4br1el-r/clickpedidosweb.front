import { ShoppingBagIcon } from "lucide-react"
import { Preco } from "@/components/ui/preco"

interface BarraSacolaProps {
  quantidade: number
  subtotal: number
  aoAbrir: () => void
}

/**
 * Botão fixo com o total sempre à vista no celular. Anima só com CSS (sem Motion) para
 * não pesar o carregamento inicial do cardápio.
 */
export function BarraSacola({ quantidade, subtotal, aoAbrir }: BarraSacolaProps) {
  if (quantidade === 0) return null
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] animate-in fade-in slide-in-from-bottom-6 duration-(--duracao-base) ease-(--curva-saida)">
      <button
        type="button"
        onClick={aoAbrir}
        className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 rounded-2xl bg-primary px-5 py-4 text-primary-foreground shadow-flutuante transition-transform duration-(--duracao-rapida) active:scale-[0.98]"
      >
        <span className="flex items-center gap-3 font-semibold">
          <span className="relative">
            <ShoppingBagIcon aria-hidden className="size-6" />
            <span
              key={quantidade}
              className="numeros absolute -top-2 -right-2.5 grid size-5 place-items-center rounded-full bg-gema font-bold text-[0.7rem] text-gema-foreground animate-in zoom-in-50 duration-(--duracao-base) ease-(--curva-saida)"
            >
              {quantidade}
            </span>
          </span>
          Ver sacola
        </span>
        <Preco valor={subtotal} className="text-lg" />
      </button>
    </div>
  )
}
