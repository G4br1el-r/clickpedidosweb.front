import { useQueryClient } from "@tanstack/react-query"
import {
  BikeIcon,
  ChefHatIcon,
  ClipboardListIcon,
  ExternalLinkIcon,
  HandPlatterIcon,
  KeyRoundIcon,
  LayoutDashboardIcon,
  ListOrderedIcon,
  LogOutIcon,
  MapPinnedIcon,
  MenuIcon,
  MoonIcon,
  RotateCcwIcon,
  SettingsIcon,
  SunIcon,
  TagsIcon,
  UtensilsCrossedIcon,
  UtensilsIcon,
} from "lucide-react"
import { useState } from "react"
import { Link, NavLink, Outlet, ScrollRestoration, useNavigate } from "react-router"
import { ProvedorMotion } from "@/app/motion/ProvedorMotion"
import { useTema } from "@/app/tema/useTema"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { TooltipProvider } from "@/components/ui/tooltip"
import { RotaProtegida } from "@/features/admin/conta/RotaProtegida"
import { useSessao } from "@/features/admin/conta/useSessao"
import { avisar } from "@/lib/avisos"
import { cn } from "@/lib/utils"
import { sair } from "@/mock/conta/acoes"
import { resetarDadosDeTeste } from "@/mock/simulador/acoes"

// Mesmos itens e ordem do _AdminLayout.cshtml, agrupados por uso.
const GRUPOS = [
  {
    titulo: "Operação",
    itens: [
      { para: "/admin", rotulo: "Visão geral", icone: LayoutDashboardIcon, fim: true },
      { para: "/admin/fila", rotulo: "Fila de pedidos", icone: ListOrderedIcon },
      { para: "/admin/pedidos", rotulo: "Pedidos", icone: ClipboardListIcon },
      { para: "/admin/cozinha", rotulo: "Cozinha (KDS)", icone: ChefHatIcon },
    ],
  },
  {
    titulo: "Salão",
    itens: [
      { para: "/admin/mesas", rotulo: "Mesas do Salão", icone: UtensilsIcon },
      { para: "/admin/garcom", rotulo: "Modo Garçom", icone: HandPlatterIcon },
    ],
  },
  {
    titulo: "Cardápio e entrega",
    itens: [
      { para: "/admin/produtos", rotulo: "Cardápio", icone: UtensilsCrossedIcon },
      { para: "/admin/categorias", rotulo: "Categorias", icone: TagsIcon },
      { para: "/admin/bairros", rotulo: "Bairros e Taxas", icone: MapPinnedIcon },
      { para: "/admin/motoboys", rotulo: "Motoboys", icone: BikeIcon },
    ],
  },
  {
    titulo: "Loja",
    itens: [
      { para: "/admin/configuracoes", rotulo: "Configurações", icone: SettingsIcon },
      { para: "/admin/senha", rotulo: "Trocar senha", icone: KeyRoundIcon },
    ],
  },
] as const

export function LayoutAdmin() {
  return (
    <RotaProtegida>
      <ProvedorMotion>
        <TooltipProvider delayDuration={300}>
          <div className="min-h-svh bg-muted/40 lg:grid lg:grid-cols-[264px_1fr]">
            <ScrollRestoration />
            <aside className="sticky top-0 hidden h-svh flex-col border-r bg-sidebar lg:flex">
              <Menu />
            </aside>
            <div className="flex min-w-0 flex-col">
              <BarraTopoCelular />
              <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
                <Outlet />
              </main>
            </div>
          </div>
        </TooltipProvider>
      </ProvedorMotion>
    </RotaProtegida>
  )
}

function BarraTopoCelular() {
  const [aberto, setAberto] = useState(false)
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b bg-background/95 px-4 py-2 backdrop-blur lg:hidden">
      <Sheet open={aberto} onOpenChange={setAberto}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Abrir menu">
            <MenuIcon />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 bg-sidebar p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Menu do admin</SheetTitle>
            <SheetDescription>Navegue pelas telas do admin</SheetDescription>
          </SheetHeader>
          <Menu aoNavegar={() => setAberto(false)} />
        </SheetContent>
      </Sheet>
      <img
        src="/img/logo-quadrado.jpg"
        alt=""
        width={32}
        height={32}
        className="size-8 rounded-lg"
      />
      <span className="font-bold font-heading">Quiosque do Mineiro</span>
    </header>
  )
}

function Menu({ aoNavegar }: { aoNavegar?: () => void }) {
  const sessao = useSessao()
  const navegar = useNavigate()
  const { temaEfetivo, definirTema } = useTema()
  const cliente = useQueryClient()

  return (
    <div className="flex h-full flex-col">
      <div className="relative">
        <div aria-hidden className="toldo h-3" />
        <Link to="/admin" onClick={aoNavegar} className="flex items-center gap-3 px-5 pt-4 pb-3">
          <img
            src="/img/logo-quadrado.jpg"
            alt=""
            width={40}
            height={40}
            className="size-10 rounded-xl"
          />
          <span className="flex flex-col leading-tight">
            <span className="font-bold font-heading">Quiosque do Mineiro</span>
            <span className="text-muted-foreground text-xs">Olá, {sessao?.nome ?? "equipe"}</span>
          </span>
        </Link>
      </div>
      <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 pb-4">
        {GRUPOS.map((g) => (
          <div key={g.titulo} className="mt-4 first:mt-1">
            <p className="px-3 pb-1 font-semibold text-muted-foreground text-xs">{g.titulo}</p>
            <ul className="flex flex-col gap-0.5">
              {g.itens.map((item) => (
                <li key={item.para}>
                  <NavLink
                    to={item.para}
                    end={"fim" in item}
                    onClick={aoNavegar}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-sm transition-colors duration-(--duracao-rapida)",
                        isActive
                          ? "bg-foreground text-background"
                          : "text-sidebar-foreground hover:bg-sidebar-accent",
                      )
                    }
                  >
                    <item.icone aria-hidden className="size-4.5" />
                    {item.rotulo}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="flex flex-col gap-1 border-t p-3">
        <Button asChild variant="ghost" className="justify-start">
          <a href="/" target="_blank" rel="noreferrer">
            <ExternalLinkIcon data-icon="inline-start" />
            Ver loja
          </a>
        </Button>
        <Button
          variant="ghost"
          className="justify-start"
          onClick={() => definirTema(temaEfetivo === "escuro" ? "claro" : "escuro")}
        >
          {temaEfetivo === "escuro" ? (
            <SunIcon data-icon="inline-start" />
          ) : (
            <MoonIcon data-icon="inline-start" />
          )}
          {temaEfetivo === "escuro" ? "Tema claro" : "Tema escuro"}
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" className="justify-start">
              <RotateCcwIcon data-icon="inline-start" />
              Resetar dados de teste
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Resetar os dados de teste?</AlertDialogTitle>
              <AlertDialogDescription>
                Cardápio, pedidos, mesas e configurações voltam ao estado inicial neste navegador.
                Não dá para desfazer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  await resetarDadosDeTeste()
                  await cliente.invalidateQueries()
                  avisar.sucesso("Dados de teste resetados.")
                }}
              >
                Resetar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button
          variant="ghost"
          className="justify-start"
          onClick={() => {
            sair()
            navegar("/admin/login", { replace: true })
          }}
        >
          <LogOutIcon data-icon="inline-start" />
          Sair
        </Button>
      </div>
    </div>
  )
}
