import { useQuery } from "@tanstack/react-query"
import { PrinterIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { obterStatusAgente } from "@/mock/impressao/acoes"

/** Badge do agente de impressão (impressora-web.js consulta a cada 3 s). */
export function StatusAgente() {
  const { data } = useQuery({
    queryKey: ["agente"],
    queryFn: obterStatusAgente,
    refetchInterval: 3000,
  })
  const conectado = data?.conectado ?? false
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold text-xs",
            conectado
              ? "bg-status-pronto text-status-pronto-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          <PrinterIcon aria-hidden className="size-3.5" />
          {conectado ? `${data?.impressora} conectada` : "Agente desconectado"}
        </span>
      </TooltipTrigger>
      <TooltipContent>Agente de impressão (simulado nesta versão de teste)</TooltipContent>
    </Tooltip>
  )
}
