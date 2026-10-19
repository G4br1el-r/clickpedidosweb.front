import { banco, simularLatencia } from "@/mock/banco"

// Sem impressora de verdade: o agente e o spooler do Windows são simulados. A impressão do
// cupom no mock é sempre pelo diálogo do navegador (iframe com o cupom de 80 mm).

export interface StatusAgente {
  conectado: boolean
  impressora: string
  ultimoContato: string
}

// Replica GET /api/agente/status
export async function obterStatusAgente(): Promise<StatusAgente> {
  await simularLatencia(80, 160)
  return {
    conectado: true,
    impressora: banco.ler().loja.nomeImpressoraTermica ?? "POS-80",
    ultimoContato: new Date().toISOString(),
  }
}

// Replica GET /api/admin/impressoras
export async function listarImpressoras(): Promise<{ impressoras: string[]; padrao: string }> {
  await simularLatencia(150, 300)
  return { impressoras: ["POS-80", "Microsoft Print to PDF", "OneNote"], padrao: "POS-80" }
}

// Replica POST /api/admin/impressoras/teste e POST /api/agente/imprimir-teste
export async function imprimirTeste(nome?: string | null): Promise<{ ok: true; mensagem: string }> {
  await simularLatencia(400, 800)
  return { ok: true, mensagem: `Teste enviado para ${nome || "POS-80"} (simulado).` }
}
