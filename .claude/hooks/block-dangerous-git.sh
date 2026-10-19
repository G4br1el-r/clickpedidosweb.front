#!/bin/bash
# Bloqueia comandos git destrutivos antes de o Claude executá-los.
# Lê o JSON com node em vez de jq: o jq não vem no Git Bash do Windows e,
# sem ele, o comando lido ficava vazio e o hook deixava tudo passar.

INPUT=$(cat)
COMMAND=$(printf '%s' "$INPUT" | node -e '
let dados = ""
process.stdin.on("data", (parte) => (dados += parte))
process.stdin.on("end", () => {
  try {
    process.stdout.write(JSON.parse(dados)?.tool_input?.command ?? "")
  } catch {
    process.exit(3)
  }
})')

if [ $? -ne 0 ]; then
  echo "BLOCKED: não foi possível ler o comando para checar os git guardrails." >&2
  exit 2
fi

# "git push" normal é liberado pelo usuário (commit e push ao fim de cada fase).
# Continua bloqueado o push que reescreve ou apaga histórico no remoto.
DANGEROUS_PATTERNS=(
  "push .*(-f|--force|--force-with-lease|--force-if-includes)( |$)"
  "push .*--(delete|mirror|prune)"
  "push .* :[^ ]"
  "push .*\+[^ ]"
  "git reset --hard"
  "git clean -fd"
  "git clean -f"
  "git branch -D"
  "git checkout \."
  "git restore \."
  "push --force"
  "reset --hard"
)

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if printf '%s' "$COMMAND" | grep -qE "$pattern"; then
    echo "BLOCKED: '$COMMAND' matches dangerous pattern '$pattern'. The user has prevented you from doing this." >&2
    exit 2
  fi
done

exit 0
