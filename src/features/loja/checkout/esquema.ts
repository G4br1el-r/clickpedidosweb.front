import { z } from "zod"
import { cpfValido, digitos, lerDecimal } from "@/mock/regras/texto"

// Mesmas mensagens do PedidoService, mostradas já no campo antes de enviar.
export const esquemaCheckout = z
  .object({
    tipo: z.enum(["Entrega", "Retirada"]),
    nome: z.string(),
    telefone: z.string(),
    cep: z.string(),
    logradouro: z.string(),
    numero: z.string(),
    complemento: z.string(),
    bairro: z.string(),
    cidade: z.string(),
    uf: z.string(),
    referencia: z.string(),
    pagamento: z.enum(["Pix", "CartaoOnline", "Dinheiro", "CartaoNaEntrega"]),
    cpf: z.string(),
    troco: z.string(),
    observacao: z.string(),
  })
  .superRefine((v, ctx) => {
    const erro = (path: string, message: string) =>
      ctx.addIssue({ code: "custom", path: [path], message })
    if (!v.nome.trim()) erro("nome", "Informe seu nome.")
    const tel = digitos(v.telefone).length
    if (tel < 10 || tel > 11) erro("telefone", "Informe seu WhatsApp com DDD.")
    if (v.tipo === "Entrega") {
      if (digitos(v.cep).length !== 8) erro("cep", "Digite os 8 números do CEP.")
      if (!v.logradouro.trim()) erro("logradouro", "Informe a rua.")
      if (!v.numero.trim()) erro("numero", "Informe o número (ou s/n).")
      if (!v.bairro.trim()) erro("bairro", "Informe o bairro.")
      if (!v.cidade.trim()) erro("cidade", "Informe a cidade.")
    }
    if (v.pagamento === "Pix" && !cpfValido(v.cpf))
      erro("cpf", "Informe um CPF válido para gerar o Pix.")
    if (v.pagamento === "Dinheiro" && v.troco.trim() && lerDecimal(v.troco) === null)
      erro("troco", "Digite um valor, por exemplo 50,00.")
  })

export type DadosCheckout = z.infer<typeof esquemaCheckout>
