import { ShoppingBagIcon, Trash2Icon } from "lucide-react"
import { AnimatePresence, m } from "motion/react"
import { useNavigate } from "react-router"
import { ProvedorMotion } from "@/app/motion/ProvedorMotion"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { FotoProduto } from "@/components/ui/foto-produto"
import { PainelResponsivo } from "@/components/ui/painel-responsivo"
import { Preco } from "@/components/ui/preco"
import { Progress } from "@/components/ui/progress"
import { SeletorQuantidade } from "@/components/ui/seletor-quantidade"
import { avisar } from "@/lib/avisos"
import { formatarMoeda } from "@/lib/moeda"
import { transicao } from "@/lib/motion"
import { useSacola } from "./sacola"
import { useLinhasSacola } from "./useLinhasSacola"

export function PainelSacola({
  aberto,
  aoMudar,
}: {
  aberto: boolean
  aoMudar: (v: boolean) => void
}) {
  const { linhas, resumo, loja } = useLinhasSacola()
  const { alterarQuantidade, remover, restaurar } = useSacola.getState()
  const navegar = useNavigate()

  const minimo = loja?.pedidoMinimo ?? 0
  const falta = Math.max(0, minimo - resumo.subtotal)
  const podeContinuar = resumo.quantidade > 0 && falta === 0 && !resumo.temIndisponivel

  function tirar(chave: string, nome: string) {
    const posicao = useSacola.getState().itens.findIndex((i) => i.chave === chave)
    const removido = remover(chave)
    if (!removido) return
    avisar(`${nome} saiu da sacola`, {
      action: { label: "Desfazer", onClick: () => restaurar(removido, posicao) },
    })
  }

  return (
    <ProvedorMotion>
      <PainelResponsivo
        aberto={aberto}
        aoMudar={aoMudar}
        titulo="Sua sacola"
        descricao="Revise os itens antes de finalizar"
      >
        {linhas.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ShoppingBagIcon />
              </EmptyMedia>
              <EmptyTitle>Sua sacola está vazia</EmptyTitle>
              <EmptyDescription>
                Escolha um pastel, um lanche ou um açaí no cardápio.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="flex flex-col gap-5">
            <ul className="flex flex-col divide-y">
              <AnimatePresence initial={false}>
                {linhas.map((l) => (
                  <m.li
                    key={l.chave}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={transicao("base")}
                    className="flex gap-3 py-3"
                  >
                    {l.produto && <FotoProduto produto={l.produto} tamanho="sm" />}
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold leading-snug">{l.nome}</span>
                        {l.indisponivel ? (
                          <span className="text-destructive text-sm">Indisponível</span>
                        ) : (
                          <Preco valor={l.total} />
                        )}
                      </div>
                      {l.resumo && (
                        <span className="text-muted-foreground text-xs">{l.resumo}</span>
                      )}
                      {l.observacao && (
                        <span className="text-muted-foreground text-xs italic">
                          “{l.observacao}”
                        </span>
                      )}
                      <div className="mt-1 flex items-center justify-between gap-2">
                        {l.indisponivel ? (
                          <span className="text-muted-foreground text-xs">
                            Saiu do cardápio ou esgotou.
                          </span>
                        ) : (
                          <SeletorQuantidade
                            tamanho="sm"
                            valor={l.quantidade}
                            aoMudar={(q) => alterarQuantidade(l.chave, q)}
                            rotulo={l.nome}
                          />
                        )}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Tirar ${l.nome} da sacola`}
                          onClick={() => tirar(l.chave, l.nome)}
                        >
                          <Trash2Icon />
                        </Button>
                      </div>
                    </div>
                  </m.li>
                ))}
              </AnimatePresence>
            </ul>

            {minimo > 0 && (
              <div className="flex flex-col gap-2 rounded-xl bg-muted/70 p-3">
                <Progress
                  value={Math.min(100, (resumo.subtotal / minimo) * 100)}
                  aria-label="Pedido mínimo"
                />
                <p className="text-sm">
                  {falta > 0 ? (
                    <>
                      Faltam <strong className="numeros">{formatarMoeda(falta)}</strong> para o
                      pedido mínimo de {formatarMoeda(minimo)}.
                    </>
                  ) : (
                    <>Pedido mínimo atingido.</>
                  )}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between border-t pt-4">
              <span className="text-muted-foreground">Subtotal</span>
              <Preco valor={resumo.subtotal} className="text-xl" />
            </div>
            <Button
              size="lg"
              disabled={!podeContinuar}
              onClick={() => {
                aoMudar(false)
                navegar("/checkout")
              }}
            >
              Continuar
            </Button>
            {resumo.temIndisponivel && (
              <p className="text-center text-destructive text-sm">
                Tire os itens indisponíveis para continuar.
              </p>
            )}
          </div>
        )}
      </PainelResponsivo>
    </ProvedorMotion>
  )
}
