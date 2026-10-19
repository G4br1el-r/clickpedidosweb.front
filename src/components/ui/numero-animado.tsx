import { animate } from "motion/react"
import { useEffect, useRef } from "react"
import { duracoes } from "@/lib/motion"
import { useMovimentoReduzido } from "@/lib/useMovimentoReduzido"

interface NumeroAnimadoProps {
  valor: number
  formatar?: (n: number) => string
  className?: string
}

/** Número que "conta" até o valor ao aparecer ou mudar. Sem animação com movimento reduzido. */
export function NumeroAnimado({
  valor,
  formatar = (n) => String(Math.round(n)),
  className,
}: NumeroAnimadoProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const anterior = useRef(0)
  const reduzido = useMovimentoReduzido()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reduzido) {
      el.textContent = formatar(valor)
      anterior.current = valor
      return
    }
    const controle = animate(anterior.current, valor, {
      duration: duracoes.enfase * 2,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (n) => {
        el.textContent = formatar(n)
      },
    })
    anterior.current = valor
    return () => controle.stop()
  }, [valor, formatar, reduzido])

  return (
    <span ref={ref} className={className}>
      {formatar(valor)}
    </span>
  )
}
