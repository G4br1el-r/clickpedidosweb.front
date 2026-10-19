import { banco, simularLatencia } from "@/mock/banco"
import { resumoHorarios } from "@/mock/regras/loja"
import { digitos, lerDecimal } from "@/mock/regras/texto"
import type { ConfiguracaoLoja, HorarioFuncionamento } from "@/types/entidades"

export interface Configuracoes {
  loja: ConfiguracaoLoja
  /** Segunda a domingo, como a tela atual. */
  horarios: HorarioFuncionamento[]
  taxaEntregaTexto: string
  pedidoMinimoTexto: string
}

type Erros = Partial<Record<"taxaEntregaTexto" | "pedidoMinimoTexto" | "nomeLoja", string>>

const emReais = (v: number) => v.toFixed(2).replace(".", ",")
const segundaPrimeiro = (a: HorarioFuncionamento, b: HorarioFuncionamento) =>
  (a.diaSemana === 0 ? 7 : a.diaSemana) - (b.diaSemana === 0 ? 7 : b.diaSemana)

// Replica ConfiguracoesController.Index (GET)
export async function obterConfiguracoes(): Promise<Configuracoes> {
  await simularLatencia()
  const d = banco.ler()
  return {
    loja: d.loja,
    horarios: [...d.horarios].sort(segundaPrimeiro),
    taxaEntregaTexto: emReais(d.loja.taxaEntrega),
    pedidoMinimoTexto: emReais(d.loja.pedidoMinimo),
  }
}

// Replica ConfiguracoesController.Index (POST)
export async function salvarConfiguracoes(
  c: Configuracoes,
): Promise<{ ok: true; mensagem: string } | { ok: false; erros: Erros }> {
  await simularLatencia()
  const erros: Erros = {}
  const taxa = c.taxaEntregaTexto.trim() ? lerDecimal(c.taxaEntregaTexto) : 0
  const minimo = c.pedidoMinimoTexto.trim() ? lerDecimal(c.pedidoMinimoTexto) : 0
  if (taxa === null || taxa < 0) erros.taxaEntregaTexto = "Taxa de entrega inválida."
  if (minimo === null || minimo < 0) erros.pedidoMinimoTexto = "Pedido mínimo inválido."
  if (!c.loja.nomeLoja.trim()) erros.nomeLoja = "Informe o nome da loja."
  if (Object.keys(erros).length > 0 || taxa === null || minimo === null) return { ok: false, erros }

  banco.atualizar((d) => {
    d.loja = {
      ...c.loja,
      nomeLoja: c.loja.nomeLoja.trim(),
      whatsApp: digitos(c.loja.whatsApp),
      taxaEntrega: taxa,
      pedidoMinimo: minimo,
    }
    d.horarios = c.horarios.map((h) => ({
      ...h,
      abreAs: h.abreAs.trim() || "10:00",
      fechaAs: h.fechaAs.trim() || "22:00",
    }))
    if (!d.loja.horario?.trim()) d.loja.horario = resumoHorarios(d.horarios)
  })
  return { ok: true, mensagem: "Configurações e horários de funcionamento salvos com sucesso." }
}
