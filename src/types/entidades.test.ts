import { describe, expect, it } from "vitest"
import { FORMAS_PAGAMENTO, STATUS_PEDIDO, TIPOS_ENTREGA } from "./entidades"

describe("enums das entidades", () => {
  it("STATUS_PEDIDO segue a ordem do enum do backend", () => {
    expect(STATUS_PEDIDO).toEqual([
      "AguardandoPagamento",
      "Recebido",
      "EmPreparo",
      "Pronto",
      "SaiuParaEntrega",
      "Concluido",
      "Cancelado",
    ])
  })

  it("FORMAS_PAGAMENTO tem as quatro formas", () => {
    expect(FORMAS_PAGAMENTO).toEqual(["Pix", "CartaoOnline", "Dinheiro", "CartaoNaEntrega"])
  })

  it("TIPOS_ENTREGA tem entrega, retirada e mesa", () => {
    expect(TIPOS_ENTREGA).toEqual(["Entrega", "Retirada", "Mesa"])
  })
})
