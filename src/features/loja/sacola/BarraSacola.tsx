import { ShoppingBagIcon } from "lucide-react"
import { AnimatePresence, m } from "motion/react"
import { Preco } from "@/components/ui/preco"
import { molaSuave, transicao } from "@/lib/motion"

interface BarraSacolaProps {
  quantidade: number
  subtotal: number
  aoAbrir: () => void
}

/** Botão fixo com o total sempre à vista no celular. */
export function BarraSacola({ quantidade, subtotal, aoAbrir }: BarraSacolaProps) {
  return (
    <AnimatePresence>
      {quantidade > 0 && (
        <m.div
          initial={{ y: 96, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 96, opacity: 0 }}
          transition={transicao("base")}
          className="fixed inset-x-0 bottom-0 z-30 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        >
          <button
            type="button"
            onClick={aoAbrir}
            className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 rounded-2xl bg-primary px-5 py-4 text-primary-foreground shadow-flutuante transition-transform duration-(--duracao-rapida) active:scale-[0.98]"
          >
            <span className="flex items-center gap-3 font-semibold">
              <span className="relative">
                <ShoppingBagIcon aria-hidden className="size-6" />
                <AnimatePresence initial={false} mode="popLayout">
                  <m.span
                    key={quantidade}
                    initial={{ scale: 0.4 }}
                    animate={{ scale: 1 }}
                    transition={molaSuave}
                    className="numeros absolute -top-2 -right-2.5 grid size-5 place-items-center rounded-full bg-gema font-bold text-[0.7rem] text-gema-foreground"
                  >
                    {quantidade}
                  </m.span>
                </AnimatePresence>
              </span>
              Ver sacola
            </span>
            <Preco valor={subtotal} className="text-lg" />
          </button>
        </m.div>
      )}
    </AnimatePresence>
  )
}
