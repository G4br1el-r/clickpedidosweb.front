import { banco, simularLatencia } from "@/mock/banco"
import { digitos, limitar } from "@/mock/regras/texto"
import type { Motoboy } from "@/types/entidades"

type Resultado = { ok: true; mensagem: string } | { ok: false; erro: string }

// Replica MotoboysController.Index (ativos primeiro)
export async function listarMotoboys(): Promise<Motoboy[]> {
  await simularLatencia()
  return [...banco.ler().motoboys].sort(
    (a, b) => Number(b.ativo) - Number(a.ativo) || a.nome.localeCompare(b.nome, "pt-BR"),
  )
}

// Replica MotoboysController.Salvar (id 0 = novo, sempre ativo)
export async function salvarMotoboy(
  id: number,
  nome: string,
  telefone: string,
  ativo: boolean,
): Promise<Resultado> {
  await simularLatencia()
  const limpo = limitar(nome, 60)
  const tel = digitos(telefone)
  if (!limpo || tel.length < 10 || tel.length > 13)
    return { ok: false, erro: "Informe o nome e o WhatsApp do motoboy com DDD." }
  let achou = id === 0
  banco.atualizar((d) => {
    if (id === 0) {
      d.motoboys.push({ id: d.proximosIds.motoboy++, nome: limpo, telefone: tel, ativo: true })
      return
    }
    const m = d.motoboys.find((x) => x.id === id)
    if (!m) return
    achou = true
    m.nome = limpo
    m.telefone = tel
    m.ativo = ativo
  })
  return achou
    ? { ok: true, mensagem: `Motoboy ${limpo} salvo.` }
    : { ok: false, erro: "Motoboy não encontrado." }
}

// Replica MotoboysController.Excluir
export async function excluirMotoboy(id: number): Promise<Resultado> {
  await simularLatencia()
  const m = banco.ler().motoboys.find((x) => x.id === id)
  if (!m) return { ok: false, erro: "Motoboy não encontrado." }
  banco.atualizar((d) => {
    d.motoboys = d.motoboys.filter((x) => x.id !== id)
  })
  return { ok: true, mensagem: `Motoboy ${m.nome} removido.` }
}
