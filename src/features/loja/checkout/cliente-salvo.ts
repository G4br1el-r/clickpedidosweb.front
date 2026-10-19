// Dados do último pedido, para o cliente não digitar tudo de novo (só neste navegador).
const CHAVE = "cp_cliente"

export interface ClienteSalvo {
  nome: string
  telefone: string
  cep: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  uf: string
  referencia: string
}

export function lerClienteSalvo(): Partial<ClienteSalvo> {
  try {
    const bruto = window.localStorage.getItem(CHAVE)
    return bruto ? (JSON.parse(bruto) as Partial<ClienteSalvo>) : {}
  } catch {
    return {}
  }
}

export function salvarCliente(cliente: Partial<ClienteSalvo>) {
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(cliente))
  } catch {
    // segue sem salvar
  }
}
