import { MinusIcon, PlusIcon } from "lucide-react"
import { AnimatePresence, m } from "motion/react"
import { Button } from "@/components/ui/button"
import { transicao } from "@/lib/motion"
import { cn } from "@/lib/utils"

interface SeletorQuantidadeProps {
  valor: number
  aoMudar: (valor: number) => void
  /** Nome do que está sendo contado, para os botões terem nome acessível. */
  rotulo: string
  min?: number
  max?: number
  tamanho?: "sm" | "md"
  className?: string
}

export function SeletorQuantidade({
  valor,
  aoMudar,
  rotulo,
  min = 1,
  max = 50,
  tamanho = "md",
  className,
}: SeletorQuantidadeProps) {
  const tamanhoBotao = tamanho === "sm" ? "icon-sm" : "icon"
  return (
    <div
      data-slot="seletor-quantidade"
      className={cn(
        "inline-flex items-center gap-1 rounded-full border bg-card p-0.5 shadow-elevado",
        className,
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size={tamanhoBotao}
        className="rounded-full"
        disabled={valor <= min}
        onClick={() => aoMudar(valor - 1)}
        aria-label={`Diminuir quantidade de ${rotulo}`}
      >
        <MinusIcon />
      </Button>
      <span
        role="status"
        aria-live="polite"
        className={cn(
          "numeros relative grid min-w-7 place-items-center overflow-hidden text-center font-semibold",
          tamanho === "sm" ? "h-8 text-sm" : "h-10",
        )}
      >
        <AnimatePresence initial={false} mode="popLayout">
          <m.span
            key={valor}
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={transicao("rapida")}
          >
            {valor}
          </m.span>
        </AnimatePresence>
      </span>
      <Button
        type="button"
        variant="ghost"
        size={tamanhoBotao}
        className="rounded-full"
        disabled={valor >= max}
        onClick={() => aoMudar(valor + 1)}
        aria-label={`Aumentar quantidade de ${rotulo}`}
      >
        <PlusIcon />
      </Button>
    </div>
  )
}
