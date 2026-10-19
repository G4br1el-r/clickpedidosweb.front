// Atraso artificial para os estados de carregamento aparecerem como numa API de verdade.
export function simularLatencia(min = 200, max = 600, aleatorio = Math.random): Promise<void> {
  const espera = Math.round(min + (max - min) * aleatorio())
  return new Promise((resolver) => setTimeout(resolver, espera))
}
