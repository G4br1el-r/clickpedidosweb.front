import { useMutation, useQuery } from "@tanstack/react-query"
import { ArrowLeftIcon, ChefHatIcon, MaximizeIcon, MinimizeIcon } from "lucide-react"
import { AnimatePresence, m } from "motion/react"
import { useEffect, useRef, useState } from "react"
import { Link } from "react-router"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { ProvedorMotion } from "@/app/motion/ProvedorMotion"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { RotaProtegida } from "@/features/admin/conta/RotaProtegida"
import { avisar } from "@/lib/avisos"
import { molaSuave, transicao } from "@/lib/motion"
import { tocarAlerta } from "@/lib/som"
import { avancarNaCozinha, obterCozinha } from "@/mock/cozinha/acoes"
import type { Pedido } from "@/types/entidades"
import { TicketCozinha } from "./TicketCozinha"

type Filtro = "todos" | "mesas" | "delivery"

const usePreferenciasCozinha = create<{ som: boolean; definirSom: (v: boolean) => void }>()(
  persist((set) => ({ som: true, definirSom: (som) => set({ som }) }), { name: "cp_cozinha" }),
)

const filtrar = (pedidos: Pedido[], filtro: Filtro) =>
  filtro === "mesas"
    ? pedidos.filter((p) => p.tipo === "Mesa")
    : filtro === "delivery"
      ? pedidos.filter((p) => p.tipo !== "Mesa")
      : pedidos

export function PaginaCozinha() {
  return (
    <RotaProtegida>
      <ProvedorMotion>
        <Cozinha />
      </ProvedorMotion>
    </RotaProtegida>
  )
}

function Cozinha() {
  const consulta = useQuery({
    queryKey: ["cozinha"],
    queryFn: obterCozinha,
    refetchInterval: 4000,
  })
  const [filtro, setFiltro] = useState<Filtro>("todos")
  const { som, definirSom } = usePreferenciasCozinha()
  const [telaCheia, setTelaCheia] = useState(false)
  const [agora, setAgora] = useState(() => new Date())
  const conhecidos = useRef<Set<number> | null>(null)

  const avanco = useMutation({
    mutationFn: (id: number) => avancarNaCozinha(id),
    onSuccess: (r) => {
      if (!r.ok) avisar.erro(r.erro)
    },
  })

  const pedidos = consulta.data?.pedidos
  useEffect(() => {
    if (!pedidos) return
    setAgora(new Date())
    const recebidos = pedidos.filter((p) => p.status === "Recebido")
    if (conhecidos.current && som && recebidos.some((p) => !conhecidos.current?.has(p.id)))
      tocarAlerta()
    conhecidos.current = new Set(pedidos.map((p) => p.id))
  }, [pedidos, som])

  useEffect(() => {
    const aoMudar = () => setTelaCheia(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", aoMudar)
    return () => document.removeEventListener("fullscreenchange", aoMudar)
  }, [])

  function alternarTelaCheia() {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {})
    else void document.documentElement.requestFullscreen?.().catch(() => {})
  }

  const lista = filtrar(pedidos ?? [], filtro)
  const total = pedidos?.length ?? 0

  return (
    // Cozinha sempre no escuro: contraste alto e menos brilho perto da chapa.
    <div className="dark min-h-svh bg-background text-foreground">
      <header className="sticky top-0 z-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-b bg-background/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin/mesas" aria-label="Voltar ao admin">
              <ArrowLeftIcon />
            </Link>
          </Button>
          <ChefHatIcon aria-hidden className="size-7 text-primary" />
          <div className="flex flex-col">
            <h1 className="font-extrabold font-heading text-2xl leading-tight">Cozinha</h1>
            <p className="numeros text-muted-foreground text-sm" aria-live="polite">
              {consulta.data
                ? `${total} ${total === 1 ? "pedido" : "pedidos"} no preparo`
                : "Carregando pedidos…"}
            </p>
          </div>
        </div>

        <ToggleGroup
          type="single"
          variant="outline"
          size="lg"
          value={filtro}
          onValueChange={(v) => v && setFiltro(v as Filtro)}
          aria-label="Filtrar pedidos"
        >
          <ToggleGroupItem value="todos">Todos</ToggleGroupItem>
          <ToggleGroupItem value="mesas">Mesas</ToggleGroupItem>
          <ToggleGroupItem value="delivery">Delivery e retirada</ToggleGroupItem>
        </ToggleGroup>

        <div className="ml-auto flex items-center gap-4">
          <label htmlFor="cozinha-som" className="flex items-center gap-2 text-sm">
            <Switch
              id="cozinha-som"
              checked={som}
              onCheckedChange={(v) => {
                definirSom(v)
                if (v) tocarAlerta()
              }}
            />
            Alerta sonoro
          </label>
          <Button variant="outline" onClick={alternarTelaCheia}>
            {telaCheia ? (
              <MinimizeIcon data-icon="inline-start" />
            ) : (
              <MaximizeIcon data-icon="inline-start" />
            )}
            {telaCheia ? "Sair da tela cheia" : "Tela cheia"}
          </Button>
        </div>
      </header>

      <main className="p-4 sm:p-6">
        {!consulta.data ? null : lista.length === 0 ? (
          <div className="grid min-h-[60svh] place-items-center text-center">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <ChefHatIcon aria-hidden className="size-14 opacity-40" />
              <p className="font-semibold text-foreground text-xl">
                {total === 0 ? "Nenhum pedido no preparo agora" : "Nada neste filtro"}
              </p>
              <p>Pedidos novos aparecem aqui sozinhos, com alerta sonoro.</p>
            </div>
          </div>
        ) : (
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(19rem,1fr))] items-start gap-4">
            <AnimatePresence initial={false} mode="popLayout">
              {lista.map((p) => (
                <m.li
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1, transition: transicao("base") }}
                  exit={{ opacity: 0, scale: 0.96, transition: transicao("rapida") }}
                  transition={molaSuave}
                >
                  <TicketCozinha
                    pedido={p}
                    agora={agora}
                    avancando={avanco.isPending && avanco.variables === p.id}
                    aoAvancar={(x) => avanco.mutate(x.id)}
                  />
                </m.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </main>
    </div>
  )
}
