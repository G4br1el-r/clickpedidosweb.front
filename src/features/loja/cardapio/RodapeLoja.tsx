import { MapPinIcon, MessageCircleIcon } from "lucide-react"
import { creditosFotos } from "@/mock/cardapio/fotos"
import type { LojaPublica } from "@/mock/loja/publica"
import { formatarTelefone, linkWhatsApp } from "@/mock/regras/texto"

export function RodapeLoja({ loja }: { loja: LojaPublica }) {
  const autores = [...new Set(Object.values(creditosFotos).map((c) => c.autor))]
  return (
    <footer className="mt-12 flex flex-col gap-4 border-t px-5 pt-8 text-muted-foreground text-sm">
      <div className="flex flex-col gap-2">
        <p className="font-bold font-heading text-foreground text-lg">{loja.nomeLoja}</p>
        {loja.endereco && (
          <p className="flex items-center gap-2">
            <MapPinIcon aria-hidden className="size-4" />
            {loja.endereco}
          </p>
        )}
        {loja.whatsApp && (
          <a
            href={linkWhatsApp(loja.whatsApp, `Olá! Vim pelo cardápio do ${loja.nomeLoja}.`)}
            target="_blank"
            rel="noreferrer"
            className="flex w-fit items-center gap-2 font-semibold text-foreground underline-offset-4 hover:underline"
          >
            <MessageCircleIcon aria-hidden className="size-4" />
            {formatarTelefone(loja.telefone ?? loja.whatsApp)}
          </a>
        )}
      </div>
      <p className="text-xs">
        Fotos ilustrativas do{" "}
        <a
          href="https://unsplash.com/?utm_source=clickpedido&utm_medium=referral"
          className="underline"
        >
          Unsplash
        </a>
        : {autores.join(", ")}.
      </p>
    </footer>
  )
}
