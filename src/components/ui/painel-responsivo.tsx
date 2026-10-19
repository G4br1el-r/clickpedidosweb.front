import type { ReactNode } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { useEhCelular } from "@/lib/useEhCelular"
import { cn } from "@/lib/utils"

interface PainelResponsivoProps {
  aberto: boolean
  aoMudar: (aberto: boolean) => void
  titulo: ReactNode
  /** Descrição para leitor de tela; visível só quando `mostrarDescricao`. */
  descricao?: ReactNode
  mostrarDescricao?: boolean
  /** Acima do título (ex.: foto do produto). */
  topo?: ReactNode
  rodape?: ReactNode
  children: ReactNode
  className?: string
}

/** Gaveta inferior no celular, modal central no desktop. */
export function PainelResponsivo({
  aberto,
  aoMudar,
  titulo,
  descricao,
  mostrarDescricao,
  topo,
  rodape,
  children,
  className,
}: PainelResponsivoProps) {
  const celular = useEhCelular()

  if (celular) {
    return (
      <Drawer open={aberto} onOpenChange={aoMudar}>
        <DrawerContent className={cn("max-h-[92svh]", className)}>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            {topo}
            <DrawerHeader className="text-left group-data-[vaul-drawer-direction=bottom]/drawer-content:text-left">
              <DrawerTitle className="font-bold font-heading text-2xl">{titulo}</DrawerTitle>
              <DrawerDescription className={cn(!mostrarDescricao && "sr-only")}>
                {descricao ?? titulo}
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-4">{children}</div>
          </div>
          {rodape && <DrawerFooter className="border-t bg-popover pt-3">{rodape}</DrawerFooter>}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={aberto} onOpenChange={aoMudar}>
      <DialogContent
        className={cn(
          "flex max-h-[90svh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg",
          className,
        )}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {topo}
          <DialogHeader className="px-6 pt-6 text-left">
            <DialogTitle className="font-bold font-heading text-2xl">{titulo}</DialogTitle>
            <DialogDescription className={cn(!mostrarDescricao && "sr-only")}>
              {descricao ?? titulo}
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 py-4">{children}</div>
        </div>
        {rodape && <DialogFooter className="border-t bg-popover px-6 py-4">{rodape}</DialogFooter>}
      </DialogContent>
    </Dialog>
  )
}
