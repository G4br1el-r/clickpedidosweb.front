// Espelho em segundos dos tokens --duracao-* e --curva-* do index.css, para o Motion.

export const duracoes = { rapida: 0.15, base: 0.22, enfase: 0.32 } as const

export const curvas = {
  saida: [0.22, 1, 0.36, 1],
  entradaSaida: [0.65, 0, 0.35, 1],
} as const satisfies Record<string, readonly [number, number, number, number]>

export function transicao(
  tipo: keyof typeof duracoes,
  curva: keyof typeof curvas = "saida",
): { duration: number; ease: readonly [number, number, number, number] } {
  return { duration: duracoes[tipo], ease: curvas[curva] }
}

/** Mola curta para elementos que "assentam" (contador da sacola, card que muda de coluna). */
export const molaSuave = { type: "spring", stiffness: 520, damping: 38, mass: 0.9 } as const
