import type {
  BairroEntrega,
  Categoria,
  ConfiguracaoLoja,
  HorarioFuncionamento,
  Mesa,
  Motoboy,
  Pedido,
  Produto,
  Usuario,
} from "@/types/entidades"

export const VERSAO_BANCO = 1

export interface BancoDados {
  versao: typeof VERSAO_BANCO
  loja: ConfiguracaoLoja
  horarios: HorarioFuncionamento[]
  categorias: Categoria[]
  produtos: Produto[]
  bairros: BairroEntrega[]
  pedidos: Pedido[]
  mesas: Mesa[]
  motoboys: Motoboy[]
  usuarios: Usuario[]
  /** Próximo id de cada coleção, como o autoincremento do SQLite. */
  proximosIds: Record<
    | "categoria"
    | "produto"
    | "grupo"
    | "item"
    | "bairro"
    | "pedido"
    | "pedidoItem"
    | "mesa"
    | "motoboy",
    number
  >
}
