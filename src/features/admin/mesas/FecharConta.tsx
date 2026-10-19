import { useMutation } from "@tanstack/react-query"
import { PrinterIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PainelResponsivo } from "@/components/ui/painel-responsivo"
import { Spinner } from "@/components/ui/spinner"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { avisar } from "@/lib/avisos"
import { formatarMoeda } from "@/lib/moeda"
import { fecharConta, type MesaComComanda } from "@/mock/mesas/acoes"
import type { FormaPagamento } from "@/types/entidades"
import { imprimirCupom } from "../impressao/impressao"

const FORMAS: Array<{ valor: FormaPagamento; rotulo: string }> = [
  { valor: "Dinheiro", rotulo: "Dinheiro" },
  { valor: "Pix", rotulo: "Pix" },
  { valor: "CartaoNaEntrega", rotulo: "Cartão na maquininha" },
  { valor: "CartaoOnline", rotulo: "Cartão online" },
]

/** Fechar a conta da mesa: forma recebida, imprimir a conta e liberar. */
export function FecharConta({
  mesa,
  aberto,
  aoFechar,
  aoConcluir,
}: {
  mesa: MesaComComanda
  aberto: boolean
  aoFechar: () => void
  aoConcluir?: () => void
}) {
  const [forma, setForma] = useState<FormaPagamento>("Dinheiro")
  const envio = useMutation({
    mutationFn: () => fecharConta(mesa.id, forma),
    onSuccess: (r) => {
      if (!r.ok) return avisar.erro(r.erro)
      avisar.sucesso(r.mensagem)
      aoFechar()
      aoConcluir?.()
    },
  })
  const pedido = mesa.pedido

  return (
    <PainelResponsivo
      aberto={aberto}
      aoMudar={(v) => !v && aoFechar()}
      titulo={`Fechar conta · ${mesa.nome}`}
      descricao="Escolha como o cliente pagou. A mesa fica livre na hora."
      mostrarDescricao
      rodape={
        <>
          {pedido && (
            <Button type="button" variant="outline" onClick={() => imprimirCupom(pedido.id)}>
              <PrinterIcon data-icon="inline-start" />
              Imprimir conta
            </Button>
          )}
          <Button
            type="button"
            variant="sucesso"
            disabled={envio.isPending}
            onClick={() => envio.mutate()}
          >
            {envio.isPending && <Spinner data-icon="inline-start" />}
            Confirmar pagamento e liberar
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-baseline justify-between rounded-xl bg-muted/60 px-4 py-3">
          <span className="text-muted-foreground">Total a pagar</span>
          <span className="numeros font-bold font-heading text-3xl">
            {formatarMoeda(pedido?.total ?? 0)}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <span id="rotulo-forma" className="font-medium text-sm">
            Forma de pagamento
          </span>
          <ToggleGroup
            type="single"
            variant="outline"
            aria-labelledby="rotulo-forma"
            value={forma}
            onValueChange={(v) => v && setForma(v as FormaPagamento)}
            className="grid w-full grid-cols-2"
          >
            {FORMAS.map((f) => (
              <ToggleGroupItem key={f.valor} value={f.valor} className="h-12">
                {f.rotulo}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>
    </PainelResponsivo>
  )
}
