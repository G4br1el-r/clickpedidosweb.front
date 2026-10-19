import type { ExternalToast } from "sonner"

// O sonner sai do bundle inicial: o módulo baixa logo depois da primeira pintura e os
// avisos esperam por ele. É o mesmo módulo que o <Toaster> usa, então a fila é a mesma.
let modulo: Promise<typeof import("sonner")> | null = null
export const carregarSonner = () => {
  modulo ??= import("sonner")
  return modulo
}

type Tipo = "message" | "success" | "error" | "info" | "warning"

function emitir(tipo: Tipo, mensagem: string, opcoes?: ExternalToast) {
  void carregarSonner().then(({ toast }) => {
    if (tipo === "message") toast(mensagem, opcoes)
    else toast[tipo](mensagem, opcoes)
  })
}

export const avisar = Object.assign(
  (mensagem: string, opcoes?: ExternalToast) => emitir("message", mensagem, opcoes),
  {
    sucesso: (mensagem: string, opcoes?: ExternalToast) => emitir("success", mensagem, opcoes),
    erro: (mensagem: string, opcoes?: ExternalToast) => emitir("error", mensagem, opcoes),
    info: (mensagem: string, opcoes?: ExternalToast) => emitir("info", mensagem, opcoes),
    aviso: (mensagem: string, opcoes?: ExternalToast) => emitir("warning", mensagem, opcoes),
  },
)
