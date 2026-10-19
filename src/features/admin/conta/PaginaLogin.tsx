import { useMutation } from "@tanstack/react-query"
import { LockKeyholeIcon } from "lucide-react"
import { type FormEvent, useState } from "react"
import { Navigate, useNavigate, useSearchParams } from "react-router"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { entrar } from "@/mock/conta/acoes"
import { useSessao } from "./useSessao"

/** Só aceita voltar para dentro do admin (como o Url.IsLocalUrl do backend). */
function destinoSeguro(voltar: string | null): string {
  return voltar?.startsWith("/admin") && !voltar.startsWith("//") ? voltar : "/admin/fila"
}

export function PaginaLogin() {
  const sessao = useSessao()
  const [parametros] = useSearchParams()
  const navegar = useNavigate()
  const [login, setLogin] = useState("")
  const [senha, setSenha] = useState("")
  const destino = destinoSeguro(parametros.get("voltar"))

  const envio = useMutation({
    mutationFn: () => entrar(login, senha),
    onSuccess: (r) => {
      if (r.ok) navegar(destino, { replace: true })
    },
  })

  if (sessao) return <Navigate to={destino} replace />

  function enviar(e: FormEvent) {
    e.preventDefault()
    envio.mutate()
  }

  const erro = envio.data && !envio.data.ok ? envio.data.erro : null

  return (
    <main className="grid min-h-svh place-items-center bg-muted/40 p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-3xl border bg-card shadow-flutuante">
        <div aria-hidden className="toldo h-10" />
        <div aria-hidden className="toldo-franja" />
        <form onSubmit={enviar} className="flex flex-col gap-6 p-7 pt-5">
          <div className="flex items-center gap-3">
            <img
              src="/img/logo-quadrado.jpg"
              alt=""
              width={48}
              height={48}
              className="size-12 rounded-xl"
            />
            <div>
              <h1 className="font-extrabold text-2xl leading-tight">Entrar no admin</h1>
              <p className="text-muted-foreground text-sm">Quiosque do Mineiro</p>
            </div>
          </div>

          {erro && (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{erro}</AlertDescription>
            </Alert>
          )}

          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor="login">Login</FieldLabel>
              <Input
                id="login"
                autoComplete="username"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="senha">Senha</FieldLabel>
              <Input
                id="senha"
                type="password"
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </Field>
          </FieldGroup>

          <Button type="submit" size="lg" disabled={envio.isPending}>
            {envio.isPending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <LockKeyholeIcon data-icon="inline-start" />
            )}
            Entrar
          </Button>
          <p className="text-center text-muted-foreground text-xs">
            Versão de teste: login <strong>admin</strong>, senha <strong>clickpedido</strong>.
          </p>
        </form>
      </div>
    </main>
  )
}
