import { banco, simularLatencia } from "@/mock/banco"

// No backend é um cookie de 12 h com renovação (Program.cs). Aqui, uma sessão no navegador.
const CHAVE = "cp_sessao"
const DURACAO_MS = 12 * 60 * 60 * 1000

export interface Sessao {
  usuarioId: number
  nome: string
  expiraEm: string
}

function ler(): Sessao | null {
  try {
    const bruto = window.localStorage.getItem(CHAVE)
    return bruto ? (JSON.parse(bruto) as Sessao) : null
  } catch {
    return null
  }
}

function gravar(sessao: Sessao | null) {
  try {
    if (sessao) window.localStorage.setItem(CHAVE, JSON.stringify(sessao))
    else window.localStorage.removeItem(CHAVE)
  } catch {
    // segue sem sessão persistida
  }
}

/** Sessão válida, com renovação a cada uso (SlidingExpiration). */
export function obterSessao(agora: Date = new Date()): Sessao | null {
  const s = ler()
  if (!s || new Date(s.expiraEm) <= agora) return null
  const renovada = { ...s, expiraEm: new Date(agora.getTime() + DURACAO_MS).toISOString() }
  gravar(renovada)
  return renovada
}

// Replica POST /Admin/Conta/Login
export async function entrar(
  login: string,
  senha: string,
): Promise<{ ok: true; nome: string } | { ok: false; erro: string }> {
  await simularLatencia(250, 500)
  const usuario = banco.ler().usuarios.find((u) => u.login === login.trim())
  if (!usuario || usuario.senha !== senha) return { ok: false, erro: "Login ou senha incorretos." }
  gravar({
    usuarioId: usuario.id,
    nome: usuario.nome,
    expiraEm: new Date(Date.now() + DURACAO_MS).toISOString(),
  })
  return { ok: true, nome: usuario.nome }
}

// Replica POST /Admin/Conta/Sair
export function sair() {
  gravar(null)
}

// Replica POST /Admin/Conta/Senha
export async function trocarSenha(
  atual: string,
  nova: string,
): Promise<{ ok: true } | { ok: false; erro: string }> {
  await simularLatencia()
  const sessao = obterSessao()
  if (!sessao) return { ok: false, erro: "Sua sessão terminou. Entre de novo." }
  if (nova.length < 8)
    return { ok: false, erro: "A nova senha precisa ter pelo menos 8 caracteres." }
  let resultado: { ok: true } | { ok: false; erro: string } = { ok: true }
  banco.atualizar((d) => {
    const u = d.usuarios.find((x) => x.id === sessao.usuarioId)
    if (!u || u.senha !== atual) {
      resultado = { ok: false, erro: "Senha atual incorreta." }
      return
    }
    u.senha = nova
  })
  return resultado
}
