# Mock em código, sem API e sem interceptação

Nesta versão as telas chamam funções `async` de `src/mock/<seção>/acoes.ts`, que replicam os endpoints e ações do backend sobre dados em memória salvos no `localStorage`. Não há `fetch`, proxy nem MSW. Escolhemos o mais simples, porque o objetivo é validar a nova UI e UX, não a integração. Para facilitar a troca depois, cada função cita o endpoint que replica e as telas só falam com o mock pelo TanStack Query.

## Considered Options
- **MSW** (interceptar `fetch` nos caminhos `/api/...` reais): deixaria a troca pelo backend quase automática, mas foi descartado nesta etapa por adicionar uma camada que o teste não precisa.

## Consequences
Ligar no backend vai exigir trocar o corpo de cada função de `acoes.ts` por chamadas HTTP. Também vai exigir criar no .NET os endpoints JSON que hoje são formulários Razor (a lista está em `docs/plano-v1.md`).
