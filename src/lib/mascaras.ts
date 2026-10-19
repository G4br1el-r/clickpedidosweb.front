const so = (valor: string) => valor.replace(/\D/g, "")

export function mascararTelefone(valor: string): string {
  const d = so(valor).slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ""
  const ddd = d.slice(0, 2)
  const resto = d.slice(2)
  if (resto.length <= 4) return `(${ddd}) ${resto}`
  const meio = d.length === 11 ? resto.slice(0, 5) : resto.slice(0, 4)
  const fim = d.length === 11 ? resto.slice(5) : resto.slice(4)
  return fim ? `(${ddd}) ${meio}-${fim}` : `(${ddd}) ${meio}`
}

export function mascararCep(valor: string): string {
  const d = so(valor).slice(0, 8)
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d
}

export function mascararCpf(valor: string): string {
  const d = so(valor).slice(0, 11)
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2")
}

/** Valor em reais digitado à mão: só dígitos e uma vírgula, com até 2 casas. */
export function mascararMoeda(valor: string): string {
  const limpo = valor.replace(/\./g, "").replace(/[^\d,]/g, "")
  const [inteiro = "", ...resto] = limpo.split(",")
  if (resto.length === 0) return inteiro
  return `${inteiro},${resto.join("").slice(0, 2)}`
}
