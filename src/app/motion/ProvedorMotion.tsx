import { LazyMotion, MotionConfig } from "motion/react"
import type { ReactNode } from "react"

// As features de animação (inclusive layout) só baixam quando uma parte que anima abre.
const carregarRecursos = () => import("../motion-recursos").then((m) => m.default)

/**
 * Envolve só as telas e painéis que animam (todos carregados sob demanda), para o Motion
 * ficar fora do bundle inicial da loja. Respeita prefers-reduced-motion.
 */
export function ProvedorMotion({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={carregarRecursos}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  )
}
