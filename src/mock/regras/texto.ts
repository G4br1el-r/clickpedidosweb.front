// Porta de Infra/Texto.cs.

export const digitos = (s: string | null | undefined) => (s ?? "").replace(/\D/g, "")

export function limitar(s: string | null | undefined, max: number): string | null {
  const t = s?.trim()
  if (!t) return null
  return t.length <= max ? t : t.slice(0, max)
}

/** Minúsculas e sem acento, para comparar nomes de cidade e bairro. */
export function normalizar(s: string | null | undefined): string {
  if (!s?.trim()) return ""
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "")
    .normalize("NFC")
}

export function cpfValido(cpf: string | null | undefined): boolean {
  const d = digitos(cpf)
  if (d.length !== 11 || new Set(d).size === 1) return false
  const digito = (n: number) => {
    let soma = 0
    for (let i = 0; i < n; i++) soma += Number(d[i]) * (n + 1 - i)
    const resto = soma % 11
    return resto < 2 ? 0 : 11 - resto
  }
  return digito(9) === Number(d[9]) && digito(10) === Number(d[10])
}

export function formatarTelefone(telefone: string | null | undefined): string {
  const d = digitos(telefone)
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return telefone ?? ""
}

export function formatarCep(cep: string | null | undefined): string {
  const d = digitos(cep)
  return d.length === 8 ? `${d.slice(0, 5)}-${d.slice(5)}` : (cep ?? "")
}

/** Link wa.me com mensagem pronta. Aceita telefone com ou sem 55. */
export function linkWhatsApp(telefone: string | null | undefined, mensagem: string): string {
  let d = digitos(telefone)
  if (d.length === 10 || d.length === 11) d = `55${d}`
  return `https://wa.me/${d}?text=${encodeURIComponent(mensagem)}`
}

/** Aceita "24,90", "24.90", "1.234,50" e "R$ 24,90". */
export function lerDecimal(s: string | null | undefined): number | null {
  if (!s?.trim()) return null
  let t = s.replace("R$", "").replace(/\s/g, "").trim()
  if (t.includes(",")) t = t.replace(/\./g, "").replace(",", ".")
  if (!/^-?\d+(\.\d+)?$/.test(t)) return null
  return Number(t)
}

export const primeiroNome = (nome: string | null | undefined) => nome?.trim().split(/\s+/)[0] ?? ""
