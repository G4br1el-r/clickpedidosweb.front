import type { Mesa, Motoboy, Usuario } from "@/types/entidades"
import { bairrosIniciais, categoriasIniciais, produtosIniciais } from "../cardapio/dados"
import { horariosIniciais, lojaInicial } from "../loja/dados"
import { pedidosDeExemplo } from "../pedidos/exemplos"
import { type BancoDados, VERSAO_BANCO } from "./esquema"

const maiorId = (lista: { id: number }[]) => lista.reduce((m, x) => Math.max(m, x.id), 0)

const motoboysIniciais: Motoboy[] = [
  { id: 1, nome: "Diego", telefone: "12991110001", ativo: true },
  { id: 2, nome: "Rodrigo", telefone: "12991110002", ativo: true },
  { id: 3, nome: "Tiago", telefone: "12991110003", ativo: false },
]

// Login de teste do admin mockado (também no README). Não é a senha do sistema real.
const usuariosIniciais: Usuario[] = [
  { id: 1, login: "admin", nome: "Administrador", senha: "clickpedido" },
]

export function dadosIniciais(agora: Date = new Date()): BancoDados {
  const grupos = produtosIniciais.flatMap((p) => p.gruposOpcoes)
  const pedidos = pedidosDeExemplo(produtosIniciais, agora)

  const mesas: Mesa[] = Array.from({ length: 10 }, (_, i) => {
    const numero = i + 1
    const ativo = pedidos.find(
      (p) => p.mesaNumero === numero && p.status !== "Concluido" && p.status !== "Cancelado",
    )
    return {
      id: numero,
      numero,
      nome: `Mesa ${String(numero).padStart(2, "0")}`,
      status: ativo ? "Ocupada" : "Livre",
      pedidoAtivoId: ativo?.id ?? null,
      clienteNome: null,
      ocupadaEm: ativo?.criadoEm ?? null,
      ativa: true,
    }
  })

  return structuredClone({
    versao: VERSAO_BANCO,
    loja: lojaInicial,
    horarios: horariosIniciais,
    categorias: categoriasIniciais,
    produtos: produtosIniciais,
    bairros: bairrosIniciais,
    pedidos,
    mesas,
    motoboys: motoboysIniciais,
    usuarios: usuariosIniciais,
    proximosIds: {
      categoria: maiorId(categoriasIniciais) + 1,
      produto: maiorId(produtosIniciais) + 1,
      grupo: maiorId(grupos) + 1,
      item: maiorId(grupos.flatMap((g) => g.itens)) + 1,
      bairro: maiorId(bairrosIniciais) + 1,
      pedido: maiorId(pedidos) + 1,
      pedidoItem: maiorId(pedidos.flatMap((p) => p.itens)) + 1,
      mesa: mesas.length + 1,
      motoboy: maiorId(motoboysIniciais) + 1,
    },
  })
}
