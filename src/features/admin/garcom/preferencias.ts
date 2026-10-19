import { create } from "zustand"
import { persist } from "zustand/middleware"

interface PreferenciaGarcom {
  garcomNome: string
  definirGarcomNome: (nome: string) => void
}

/** Nome do garçom lembrado no aparelho (cp_garcom_nome, como o Garcom/Index.cshtml). */
export const usePreferenciaGarcom = create<PreferenciaGarcom>()(
  persist(
    (set) => ({
      garcomNome: "",
      definirGarcomNome: (garcomNome) => set({ garcomNome }),
    }),
    { name: "cp_garcom_nome" },
  ),
)
