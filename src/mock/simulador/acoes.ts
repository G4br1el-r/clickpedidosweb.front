import { banco, simularLatencia } from "@/mock/banco"

/** Só no mock: volta todo o banco (cardápio, pedidos, mesas, configurações) ao estado inicial. */
export async function resetarDadosDeTeste(): Promise<void> {
  await simularLatencia(200, 400)
  banco.resetar()
}
