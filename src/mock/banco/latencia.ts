// Atraso artificial para os estados de carregamento aparecerem como numa API de verdade.
// Os testes zeram a faixa no vitest.setup.ts.
let faixa = { min: 200, max: 600 }

export function configurarLatencia(min: number, max: number) {
  faixa = { min, max }
}

export function simularLatencia(
  min = faixa.min,
  max = faixa.max,
  aleatorio = Math.random,
): Promise<void> {
  const espera = Math.round(min + (max - min) * aleatorio())
  return new Promise((resolver) => setTimeout(resolver, espera))
}
