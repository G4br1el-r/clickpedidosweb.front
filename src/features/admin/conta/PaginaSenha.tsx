import { useMutation } from "@tanstack/react-query"
import { type FormEvent, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { avisar } from "@/lib/avisos"
import { trocarSenha } from "@/mock/conta/acoes"
import { CabecalhoPagina } from "../componentes/CabecalhoPagina"

export function PaginaSenha() {
  const [atual, setAtual] = useState("")
  const [nova, setNova] = useState("")
  const [confirmacao, setConfirmacao] = useState("")
  const [erro, setErro] = useState<string | null>(null)

  const envio = useMutation({
    mutationFn: () => trocarSenha(atual, nova),
    onSuccess: (r) => {
      if (!r.ok) return setErro(r.erro)
      setAtual("")
      setNova("")
      setConfirmacao("")
      avisar.sucesso("Senha alterada.")
    },
  })

  function enviar(e: FormEvent) {
    e.preventDefault()
    setErro(null)
    if (nova !== confirmacao) return setErro("A confirmação não bate com a nova senha.")
    envio.mutate()
  }

  return (
    <div className="flex max-w-lg flex-col gap-6">
      <CabecalhoPagina
        titulo="Trocar senha"
        descricao="Use uma senha que só a equipe da loja saiba."
      />
      <form
        onSubmit={enviar}
        className="flex flex-col gap-5 rounded-2xl border bg-card p-6 shadow-elevado"
      >
        {erro && (
          <Alert variant="destructive" role="alert">
            <AlertDescription>{erro}</AlertDescription>
          </Alert>
        )}
        <FieldGroup className="gap-4">
          <Field>
            <FieldLabel htmlFor="senha-atual">Senha atual</FieldLabel>
            <Input
              id="senha-atual"
              type="password"
              autoComplete="current-password"
              value={atual}
              onChange={(e) => setAtual(e.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="senha-nova">Nova senha</FieldLabel>
            <Input
              id="senha-nova"
              type="password"
              autoComplete="new-password"
              value={nova}
              onChange={(e) => setNova(e.target.value)}
              required
            />
            <FieldDescription>Pelo menos 8 caracteres.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="senha-confirmacao">Confirme a nova senha</FieldLabel>
            <Input
              id="senha-confirmacao"
              type="password"
              autoComplete="new-password"
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
              required
            />
          </Field>
        </FieldGroup>
        <Button type="submit" className="w-fit" disabled={envio.isPending}>
          {envio.isPending && <Spinner data-icon="inline-start" />}
          Salvar nova senha
        </Button>
      </form>
    </div>
  )
}
