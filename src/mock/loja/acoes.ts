import { banco, simularLatencia } from "@/mock/banco"
import { cidadeAtendida } from "@/mock/regras/loja"
import { digitos, normalizar } from "@/mock/regras/texto"
import type { BairroEntrega } from "@/types/entidades"
import { CEPS } from "./ceps"

type BairroPublico = Pick<BairroEntrega, "id" | "cidade" | "nome" | "taxa">

export interface EnderecoCep {
  cep: string
  logradouro: string
  bairro: string
  cidade: string
  uf: string
  atendido: boolean
  bairroEncontrado: BairroPublico | null
  taxaEntrega: number
  bairros: BairroPublico[]
}

export type ResultadoCep = { ok: true; endereco: EnderecoCep } | { ok: false; erro: string }

const publico = (b: BairroEntrega): BairroPublico => ({
  id: b.id,
  cidade: b.cidade,
  nome: b.nome,
  taxa: b.taxa,
})

// Replica GET /api/cep/{cep}
export async function consultarCep(cep: string): Promise<ResultadoCep> {
  const numeros = digitos(cep)
  if (numeros.length !== 8) return { ok: false, erro: "Digite os 8 números do CEP." }
  await simularLatencia(250, 500)

  const achado = CEPS.find((c) => c.cep === numeros)
  if (!achado) return { ok: false, erro: "CEP não encontrado." }

  const dados = banco.ler()
  const ativos = dados.bairros.filter((b) => b.ativo).sort((a, b) => a.ordem - b.ordem)
  const normBairro = normalizar(achado.bairro)
  const normCidade = normalizar(achado.cidade)

  const encontrado = normBairro
    ? (ativos.find(
        (b) =>
          normalizar(b.nome) === normBairro && (!normCidade || normalizar(b.cidade) === normCidade),
      ) ?? ativos.find((b) => normalizar(b.nome) === normBairro))
    : undefined

  let daCidade = ativos.filter((b) => !normCidade || normalizar(b.cidade) === normCidade)
  if (daCidade.length === 0) daCidade = ativos

  return {
    ok: true,
    endereco: {
      cep: achado.cep,
      logradouro: achado.logradouro,
      bairro: achado.bairro,
      cidade: achado.cidade,
      uf: achado.uf,
      atendido: cidadeAtendida(dados.loja.cidadesAtendidas, achado.cidade),
      bairroEncontrado: encontrado ? publico(encontrado) : null,
      taxaEntrega: encontrado?.taxa ?? dados.loja.taxaEntrega,
      bairros: daCidade.map(publico),
    },
  }
}

// Replica GET /api/bairros
export async function listarBairros(cidade?: string): Promise<BairroPublico[]> {
  await simularLatencia(100, 250)
  const norm = normalizar(cidade)
  return banco
    .ler()
    .bairros.filter((b) => b.ativo && (!norm || normalizar(b.cidade) === norm))
    .sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome, "pt-BR"))
    .map(publico)
}
