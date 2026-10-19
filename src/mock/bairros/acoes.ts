import { banco, simularLatencia } from "@/mock/banco"
import { lerDecimal } from "@/mock/regras/texto"
import type { BairroEntrega } from "@/types/entidades"

type Resultado = { ok: true; mensagem: string } | { ok: false; erro: string }
const CIDADE_PADRAO = "Cachoeira Paulista"

// Replica BairrosController.Index
export async function listarBairrosAdmin(filtro: {
  cidade?: string
  busca?: string
}): Promise<{ bairros: BairroEntrega[]; cidades: string[] }> {
  await simularLatencia()
  const todos = banco.ler().bairros
  const termo = filtro.busca?.trim().toLowerCase()
  const bairros = todos
    .filter((b) => !filtro.cidade || b.cidade === filtro.cidade)
    .filter(
      (b) =>
        !termo || b.nome.toLowerCase().includes(termo) || b.cidade.toLowerCase().includes(termo),
    )
    .sort(
      (a, b) =>
        a.cidade.localeCompare(b.cidade, "pt-BR") ||
        a.ordem - b.ordem ||
        a.nome.localeCompare(b.nome, "pt-BR"),
    )
  const cidades = [...new Set(todos.map((b) => b.cidade))].sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  )
  return { bairros, cidades }
}

// Replica BairrosController.Criar
export async function criarBairro(
  cidade: string,
  nome: string,
  taxaTexto: string,
): Promise<Resultado> {
  await simularLatencia()
  if (!nome.trim()) return { ok: false, erro: "O nome do bairro é obrigatório." }
  const taxa = lerDecimal(taxaTexto)
  if (taxa === null || taxa < 0) return { ok: false, erro: "Taxa de entrega inválida." }
  banco.atualizar((d) => {
    d.bairros.push({
      id: d.proximosIds.bairro++,
      cidade: cidade.trim() || CIDADE_PADRAO,
      nome: nome.trim(),
      taxa,
      ativo: true,
      ordem: 0,
    })
  })
  return { ok: true, mensagem: `Bairro '${nome.trim()}' cadastrado com sucesso.` }
}

// Replica BairrosController.Editar
export async function editarBairro(
  id: number,
  cidade: string,
  nome: string,
  taxaTexto: string,
  ativo: boolean,
): Promise<Resultado> {
  await simularLatencia()
  if (!nome.trim()) return { ok: false, erro: "O nome do bairro não pode ficar vazio." }
  const taxa = lerDecimal(taxaTexto)
  if (taxa === null || taxa < 0) return { ok: false, erro: "Taxa de entrega inválida." }
  let achou = false
  banco.atualizar((d) => {
    const b = d.bairros.find((x) => x.id === id)
    if (!b) return
    achou = true
    b.cidade = cidade.trim() || CIDADE_PADRAO
    b.nome = nome.trim()
    b.taxa = taxa
    b.ativo = ativo
  })
  return achou
    ? { ok: true, mensagem: `Bairro '${nome.trim()}' atualizado com sucesso.` }
    : { ok: false, erro: "Bairro não encontrado." }
}

// Replica BairrosController.Alternar
export async function alternarBairro(id: number): Promise<Resultado> {
  await simularLatencia(80, 200)
  let resultado: Resultado = { ok: false, erro: "Bairro não encontrado." }
  banco.atualizar((d) => {
    const b = d.bairros.find((x) => x.id === id)
    if (!b) return
    b.ativo = !b.ativo
    resultado = {
      ok: true,
      mensagem: `Bairro '${b.nome}' agora está ${b.ativo ? "ativo" : "inativo"}.`,
    }
  })
  return resultado
}

// Replica BairrosController.Excluir
export async function excluirBairro(id: number): Promise<Resultado> {
  await simularLatencia()
  const b = banco.ler().bairros.find((x) => x.id === id)
  if (!b) return { ok: false, erro: "Bairro não encontrado." }
  banco.atualizar((d) => {
    d.bairros = d.bairros.filter((x) => x.id !== id)
  })
  return { ok: true, mensagem: `Bairro '${b.nome}' excluído com sucesso.` }
}
