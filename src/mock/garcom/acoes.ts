import { banco, simularLatencia } from "@/mock/banco"
import { type CriarPedidoItemRequest, criarPedidoNosDados } from "@/mock/regras/criar-pedido"
import { arredondar, calcularItem } from "@/mock/regras/preco"
import { limitar } from "@/mock/regras/texto"
import type { Categoria, Mesa, Produto } from "@/types/entidades"

export interface CardapioGarcom {
  categorias: Array<Categoria & { produtos: Produto[] }>
  mesas: Mesa[]
}

export interface LancarRequest {
  mesaId: number | null
  garcomNome?: string | null
  clienteNome?: string | null
  itens: CriarPedidoItemRequest[]
}

type Resultado = { ok: true; mensagem: string; pedidoId: number } | { ok: false; erro: string }

const porOrdem = <T extends { ordem: number; nome: string }>(a: T, b: T) =>
  a.ordem - b.ordem || a.nome.localeCompare(b.nome, "pt-BR")

// Replica GarcomController.Index: categorias ativas com todos os produtos, inclusive os
// ocultos e esgotados online (o salão pode ter o que a loja não vende).
export async function obterCardapioGarcom(): Promise<CardapioGarcom> {
  await simularLatencia(120, 300)
  const d = banco.ler()
  return {
    categorias: d.categorias
      .filter((c) => c.ativa)
      .sort(porOrdem)
      .map((c) => ({
        ...c,
        produtos: d.produtos.filter((p) => p.categoriaId === c.id).sort(porOrdem),
      })),
    mesas: d.mesas.filter((m) => m.ativa).sort((a, b) => a.numero - b.numero),
  }
}

// Replica POST /Admin/Garcom/Lancar
export async function lancarNaMesa(
  req: LancarRequest,
  agora: Date = new Date(),
): Promise<Resultado> {
  await simularLatencia()
  if (!req.mesaId) return { ok: false, erro: "Selecione a mesa para lançar o pedido." }
  const dados = banco.ler()
  const mesa = dados.mesas.find((m) => m.id === req.mesaId)
  if (!mesa) return { ok: false, erro: "Mesa não encontrada." }
  if (req.itens.length === 0) return { ok: false, erro: "Nenhum item selecionado." }

  // A comanda vale enquanto a mesa aponta para ela. No backend, um pedido que a cozinha
  // concluiu abria comanda nova e "perdia" a anterior; aqui a mesma comanda segue até fechar a conta.
  const ativa = dados.pedidos.find((p) => p.id === mesa.pedidoAtivoId && p.status !== "Cancelado")

  let resultado: Resultado = { ok: false, erro: "Mesa não encontrada." }
  banco.atualizar((d) => {
    if (ativa) {
      const p = d.pedidos.find((x) => x.id === ativa.id)
      if (!p) return
      for (const i of req.itens) {
        const produto = d.produtos.find((x) => x.id === i.produtoId)
        if (!produto) continue
        const { precoUnitario, resumo } = calcularItem(produto, i.opcoes ?? [])
        p.itens.push({
          id: d.proximosIds.pedidoItem++,
          pedidoId: p.id,
          produtoId: produto.id,
          nomeProduto: produto.nome,
          precoUnitario,
          quantidade: i.quantidade,
          opcoesResumo: limitar(resumo, 500),
          observacao: limitar(i.observacao, 140),
          total: arredondar(precoUnitario * i.quantidade),
        })
      }
      p.subtotal = arredondar(p.itens.reduce((s, i) => s + i.total, 0))
      p.total = p.subtotal
      // Volta para a cozinha preparar a nova rodada.
      p.status = "Recebido"
      p.atualizadoEm = agora.toISOString()
      if (req.garcomNome?.trim()) p.garcomNome = limitar(req.garcomNome, 40)
      resultado = {
        ok: true,
        pedidoId: p.id,
        mensagem: `Itens adicionados à comanda da Mesa ${mesa.numero} e enviados para a cozinha!`,
      }
      return
    }

    const criado = criarPedidoNosDados(
      d,
      {
        tipo: "Mesa",
        mesaId: mesa.id,
        mesaNumero: mesa.numero,
        nome: req.clienteNome?.trim() || mesa.clienteNome || `Mesa ${mesa.numero}`,
        garcomNome: req.garcomNome?.trim() || "Garçom",
        pagamento: "Dinheiro",
        itens: req.itens,
      },
      agora,
    )
    resultado = criado.ok
      ? {
          ok: true,
          pedidoId: criado.pedido.id,
          mensagem: `Pedido da Mesa ${mesa.numero} enviado para a cozinha!`,
        }
      : criado
  })
  return resultado
}
