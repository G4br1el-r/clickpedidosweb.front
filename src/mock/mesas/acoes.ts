import { banco, simularLatencia } from "@/mock/banco"
import type { BancoDados } from "@/mock/banco/esquema"
import type { FormaPagamento, Mesa, Pedido } from "@/types/entidades"

export type MesaComComanda = Mesa & { pedido: Pedido | null }
type Resultado = { ok: true; mensagem: string } | { ok: false; erro: string }

const comComanda = (d: BancoDados, m: Mesa): MesaComComanda => ({
  ...m,
  pedido: d.pedidos.find((p) => p.id === m.pedidoAtivoId) ?? null,
})

function soltar(m: Mesa) {
  m.status = "Livre"
  m.pedidoAtivoId = null
  m.clienteNome = null
  m.ocupadaEm = null
}

// Replica MesasController.Index
export async function listarMesas(): Promise<MesaComComanda[]> {
  await simularLatencia(80, 200)
  const d = banco.ler()
  return [...d.mesas].sort((a, b) => a.numero - b.numero).map((m) => comComanda(d, m))
}

// Replica MesasController.Detalhes
export async function obterMesa(id: number): Promise<MesaComComanda | null> {
  await simularLatencia(80, 200)
  const d = banco.ler()
  const m = d.mesas.find((x) => x.id === id)
  return m ? comComanda(d, m) : null
}

// Replica MesasController.Criar
export async function criarMesa(numero: number, nome: string): Promise<Resultado> {
  await simularLatencia()
  if (!Number.isInteger(numero) || numero <= 0)
    return { ok: false, erro: "Informe um número válido para a mesa." }
  if (banco.ler().mesas.some((m) => m.numero === numero))
    return { ok: false, erro: `Já existe uma mesa com o número ${numero}.` }
  banco.atualizar((d) => {
    d.mesas.push({
      id: d.proximosIds.mesa++,
      numero,
      nome: nome.trim() || `Mesa ${String(numero).padStart(2, "0")}`,
      status: "Livre",
      pedidoAtivoId: null,
      clienteNome: null,
      ocupadaEm: null,
      ativa: true,
    })
  })
  return { ok: true, mensagem: `Mesa ${numero} cadastrada.` }
}

// Replica MesasController.Excluir
export async function excluirMesa(id: number): Promise<Resultado> {
  await simularLatencia()
  const m = banco.ler().mesas.find((x) => x.id === id)
  if (!m) return { ok: false, erro: "Mesa não encontrada." }
  if (m.status !== "Livre")
    return {
      ok: false,
      erro: `A mesa ${m.numero} está ocupada. Finalize a comanda antes de excluir.`,
    }
  banco.atualizar((d) => {
    d.mesas = d.mesas.filter((x) => x.id !== id)
  })
  return { ok: true, mensagem: `Mesa ${m.numero} excluída.` }
}

// Replica MesasController.Fechar
export async function fecharConta(
  id: number,
  pagamento: FormaPagamento,
  agora: Date = new Date(),
): Promise<Resultado> {
  await simularLatencia()
  let resultado: Resultado = { ok: false, erro: "Mesa não encontrada." }
  banco.atualizar((d) => {
    const m = d.mesas.find((x) => x.id === id)
    if (!m) return
    const p = d.pedidos.find((x) => x.id === m.pedidoAtivoId)
    if (p) {
      const quando = agora.toISOString()
      p.status = "Concluido"
      p.statusPagamento = "Pago"
      p.pagamento = pagamento
      p.pagoEm = quando
      p.atualizadoEm = quando
    }
    soltar(m)
    resultado = { ok: true, mensagem: `Mesa ${m.numero} finalizada e liberada com sucesso.` }
  })
  return resultado
}

// Replica MesasController.Liberar (não mexe na comanda)
export async function liberarMesa(id: number): Promise<Resultado> {
  await simularLatencia()
  let resultado: Resultado = { ok: false, erro: "Mesa não encontrada." }
  banco.atualizar((d) => {
    const m = d.mesas.find((x) => x.id === id)
    if (!m) return
    soltar(m)
    resultado = { ok: true, mensagem: `Mesa ${m.numero} liberada.` }
  })
  return resultado
}
