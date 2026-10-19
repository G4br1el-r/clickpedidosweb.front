// Impressão do cupom pelo diálogo do navegador, como o fallback do fila.js: um iframe
// invisível abre o cupom de 80 mm e chama print(). Pedidos entram numa fila e saem um a um.
// Para imprimir sem a janela de confirmação, use o Chrome com --kiosk-printing.

const fila: number[] = []
let imprimindo = false

function iframe(): HTMLIFrameElement {
  let el = document.getElementById("cp-frame-impressao") as HTMLIFrameElement | null
  if (!el) {
    el = document.createElement("iframe")
    el.id = "cp-frame-impressao"
    el.title = "Impressão do pedido"
    el.tabIndex = -1
    el.setAttribute("aria-hidden", "true")
    el.style.cssText = "position:fixed;width:0;height:0;border:0;opacity:0;pointer-events:none;"
    document.body.appendChild(el)
  }
  return el
}

function proxima() {
  if (imprimindo) return
  const id = fila.shift()
  if (id === undefined) return
  imprimindo = true
  const frame = iframe()
  frame.onload = () => {
    try {
      frame.contentWindow?.focus()
      frame.contentWindow?.print()
    } catch {
      // o diálogo foi bloqueado: o cupom continua disponível pelo botão Imprimir
    }
    setTimeout(() => {
      imprimindo = false
      proxima()
    }, 1500)
  }
  frame.src = `/admin/pedidos/${id}/imprimir?embutido=1&t=${Date.now()}`
}

export function imprimirCupom(pedidoId: number) {
  if (!fila.includes(pedidoId)) fila.push(pedidoId)
  proxima()
}

/** Abre o cupom numa aba (para imprimir ou conferir). */
export function abrirCupom(pedidoId: number) {
  window.open(`/admin/pedidos/${pedidoId}/imprimir`, "_blank", "noopener")
}
