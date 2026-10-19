import { HammerIcon } from "lucide-react"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

export function EmConstrucao() {
  return (
    <Empty className="py-20">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HammerIcon />
        </EmptyMedia>
        <EmptyTitle>Em construção</EmptyTitle>
        <EmptyDescription>Esta tela chega numa das próximas fases.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
