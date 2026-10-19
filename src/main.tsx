import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "react-router"
import "./index.css"
import { Providers } from "./app/Providers"
import { criarRoteador } from "./app/rotas"

const raiz = document.getElementById("root")
if (!raiz) throw new Error("Elemento #root não encontrado no index.html")

const roteador = criarRoteador()

createRoot(raiz).render(
  <StrictMode>
    <Providers>
      <RouterProvider router={roteador} />
    </Providers>
  </StrictMode>,
)
