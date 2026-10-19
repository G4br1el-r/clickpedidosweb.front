import "./direcoes.css"
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react"
import { useRef, useState } from "react"
import { Link } from "react-router"
import { ProvedorMotion } from "@/app/motion/ProvedorMotion"
import type { Tema } from "@/app/tema/contexto"
import { useTema } from "@/app/tema/useTema"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { DIRECOES, type IdDirecao, lerDirecaoSalva, salvarDirecao } from "./direcoes"
import {
  SecaoBotoes,
  SecaoCores,
  SecaoDesign,
  SecaoMotion,
  SecaoStatus,
  SecaoTipografia,
} from "./secoes/Fundamentos"
import { CardapioCelular, CozinhaKds, FilaBalcao } from "./telas/TelasChave"

export function PaginaDesign() {
  const [direcao, setDirecao] = useState<IdDirecao>(lerDirecaoSalva)
  const { tema, definirTema } = useTema()
  const raiz = useRef<HTMLDivElement>(null)
  const ativa = DIRECOES.find((d) => d.id === direcao) ?? DIRECOES[0]

  function escolher(id: string) {
    if (!id) return
    setDirecao(id as IdDirecao)
    salvarDirecao(id as IdDirecao)
  }

  return (
    <ProvedorMotion>
      <div
        ref={raiz}
        data-direcao={direcao}
        className="min-h-svh bg-background font-sans text-foreground"
      >
        <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <Link to="/" aria-label="Voltar para a loja">
                <img
                  src="/img/logo-quadrado.jpg"
                  alt=""
                  width={36}
                  height={36}
                  className="size-9 rounded-lg"
                />
              </Link>
              <h1 className="font-bold text-xl">Direções visuais</h1>
            </div>
            <ToggleGroup
              type="single"
              variant="outline"
              value={direcao}
              onValueChange={escolher}
              aria-label="Direção visual"
            >
              {DIRECOES.map((d) => (
                <ToggleGroupItem key={d.id} value={d.id} className="px-3">
                  {d.nome}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <ToggleGroup
              type="single"
              value={tema}
              onValueChange={(v) => v && definirTema(v as Tema)}
              aria-label="Tema"
              className="sm:ml-auto"
            >
              <ToggleGroupItem value="claro" aria-label="Tema claro">
                <SunIcon />
              </ToggleGroupItem>
              <ToggleGroupItem value="escuro" aria-label="Tema escuro">
                <MoonIcon />
              </ToggleGroupItem>
              <ToggleGroupItem value="sistema" aria-label="Seguir o sistema">
                <MonitorIcon />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </header>

        <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6">
          <section className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-extrabold text-4xl tracking-[-0.02em]">{ativa?.nome}</h2>
              {ativa?.adotada && (
                <span className="rounded-full bg-toldo px-3 py-1 font-semibold text-sm text-toldo-foreground">
                  Adotada
                </span>
              )}
            </div>
            <p className="max-w-2xl text-lg text-muted-foreground">{ativa?.resumo}</p>
          </section>

          <div className="grid items-start gap-6 lg:grid-cols-[420px_1fr]">
            <CardapioCelular />
            <div className="flex flex-col gap-6">
              <SecaoDesign
                titulo="Fila do balcão"
                descricao="Do pedido novo até a entrega, com a próxima ação sempre à mão."
              >
                <FilaBalcao />
              </SecaoDesign>
            </div>
          </div>

          <SecaoDesign
            titulo="Cozinha"
            descricao="Tela cheia e escura, legível de longe. O tempo de espera muda de cor aos 15 e aos 30 minutos."
          >
            <CozinhaKds />
          </SecaoDesign>

          <div className="grid gap-6 lg:grid-cols-2">
            <SecaoTipografia />
            <SecaoBotoes />
          </div>
          <SecaoStatus />
          <SecaoMotion />
          <SecaoCores raiz={raiz} direcao={direcao} tema={tema} />
        </main>
      </div>
    </ProvedorMotion>
  )
}
