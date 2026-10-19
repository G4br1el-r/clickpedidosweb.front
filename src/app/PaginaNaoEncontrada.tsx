import { Link } from "react-router"
import { Button } from "@/components/ui/button"

export function PaginaNaoEncontrada() {
  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col items-center justify-center gap-5 p-6 text-center">
      <img
        src="/img/logo-quadrado.jpg"
        alt=""
        width={72}
        height={72}
        className="size-18 rounded-2xl shadow-elevado"
      />
      <div className="flex flex-col gap-2">
        <h1 className="font-bold text-3xl">Página não encontrada</h1>
        <p className="text-muted-foreground">
          O endereço pode ter mudado ou o link está incompleto. Confira o link que você recebeu.
        </p>
      </div>
      <Button asChild size="lg">
        <Link to="/">Voltar ao cardápio</Link>
      </Button>
    </main>
  )
}
