import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

interface PreferenciasFila {
  som: boolean
  autoImprimir: boolean
  definirSom: (v: boolean) => void
  definirAutoImprimir: (v: boolean) => void
}

/** Por computador (como cp_som e cp_autoprint do fila.js): imprimir novos em um PC só. */
export const usePreferenciasFila = create<PreferenciasFila>()(
  persist(
    (set) => ({
      som: false,
      autoImprimir: false,
      definirSom: (som) => set({ som }),
      definirAutoImprimir: (autoImprimir) => set({ autoImprimir }),
    }),
    {
      name: "cp_fila",
      storage: createJSONStorage(() => window.localStorage),
      partialize: (s) => ({ som: s.som, autoImprimir: s.autoImprimir }),
    },
  ),
)
