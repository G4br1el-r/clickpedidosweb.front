# ClickPedido Front

Novo front do ClickPedido (Quiosque do Mineiro): a mesma loja, admin, salão e cozinha de hoje, com UI e UX repaginadas e só com dados mockados. Ficha completa: `docs/PROJECT.md`. Plano e fases: `docs/plano-v1.md`. Decisões: `docs/adr/`. Glossário: `GLOSSARY.md`.

## Stack
- Vite + React 19 + TypeScript strict, React Router
- Tailwind CSS v4 + shadcn/ui, lucide, sonner, Motion (`motion/react`)
- TanStack Query, TanStack Table, React Hook Form + Zod, Zustand
- Sem backend: dados e ações em `src/mock/`
- Vitest + Testing Library, Playwright, Biome, Husky + lint-staged

## Comandos
- `pnpm dev`: servidor de desenvolvimento (porta 5173)
- `pnpm build`: checagem de tipos e build de produção
- `pnpm lint` e `pnpm format`: Biome
- `pnpm typecheck`: TypeScript
- `pnpm test` e `pnpm test:coverage`: Vitest
- `pnpm test:e2e`: Playwright
- Pacotes: só pnpm. Nunca npm, npx, yarn ou bun.

## Estrutura de pastas
- Código de tela entra em `src/features/<area>/<feature>/` (`area` é `loja` ou `admin`), com componentes, hooks e testes da feature juntos.
- Dados e ações mockadas entram em `src/mock/<seção>/`: `dados.ts` (dados iniciais) e `acoes.ts` (funções `async`). Estado compartilhado em `src/mock/banco/`; regras usadas por mais de uma seção em `src/mock/regras/`.
- Telas nunca leem `src/mock/banco` direto: chamam as funções de `acoes.ts` pelo TanStack Query.
- Componente base do design system entra em `src/components/ui/` e é registrado em `docs/components/`.
- Tipos das entidades em `src/types/`; utilitários sem regra de negócio em `src/lib/`.
- Rotas, providers e layouts em `src/app/`. Testes E2E em `e2e/`.

## Convenções
- Tudo em pt-BR: nomes no código, interface e textos.
- Nomes de entidades, campos e status seguem o backend (`Models/Entidades.cs`) e o `GLOSSARY.md`.
- Comentários só para o porquê não óbvio. Toda função de `acoes.ts` diz qual endpoint ou ação do backend replica (ex.: `// Replica POST /api/pedidos`).
- Regras portadas do backend citam a origem (ex.: `PedidoService.CriarAsync`) e devem dar o mesmo resultado que ele.
- Telas montadas só com componentes de `src/components/ui/`; cores, espaçamentos e durações só pelos tokens.
- Animação: só `transform` e `opacity`, durações dos tokens, sempre respeitando `prefers-reduced-motion`.
- Commits: conventional commits em pt-BR, direto na branch `main`.
- **Commit e push liberados pelo usuário:** commit ao fim de cada tarefa e, obrigatoriamente, commit + `git push origin main` ao fim de cada fase, sem pedir confirmação. Nunca force push, apagar branch remota ou reescrever histórico (os guardrails bloqueiam).
- Segredos só em variáveis de ambiente; `.env.example` lista os nomes.

## Como trabalhar
- Antes de implementar algo com vários passos, planeje (skill `core:writing-plans`).
- Implemente com TDD (seção abaixo) e feche com "finaliza" (`/core:finish`).
- Uma fase do `docs/plano-v1.md` por vez; cada fase só começa quando o usuário mandar.
- Instale o que está na ficha sem pedir ok; pergunte antes de pacote fora da ficha ou de mudança grande.
- O backend atual em `../betaup.clickpedidoweb/` é só referência de leitura.
- Ao fim de cada fase, revise com as skills de design, acessibilidade, UX copy, animação e performance listadas no plano.

## Não fazer
- Não chamar API nem interceptar requisições: esta versão é só mock em código.
- Não alterar nada em `../betaup.clickpedidoweb/`.
- Não instalar pacote fora da ficha sem perguntar.
- Não criar componente que já existe em `docs/components/`; estenda com prop opcional.
- Não baixar fotos: use URLs do Unsplash com crédito.
- Não estourar o orçamento de performance da loja (JS inicial ≤ ~150 KB gzip).

## Testes e TDD
Este projeto segue TDD. Vale para todo código novo e todo bugfix, sem exceção implícita.

- **Ciclo:** use a skill `tdd:tdd`. Um teste falhando (red) → o mínimo de código para passar (green) → repete. Refatoração só com tudo verde.
- **Uma fatia por vez:** um comportamento, um teste, uma implementação. Nunca escreva todos os testes antes do código.
- **Bug:** primeiro um teste que reproduz o bug e falha; só depois a correção.
- **O que testar:** comportamento pela interface pública. Nas telas, o que o usuário vê e faz (Testing Library, queries por role e label). No mock, a entrada e a saída das funções de `acoes.ts` e `regras/`, com o resultado esperado tirado do backend atual.
- **Mocks de teste:** só nas fronteiras externas (tempo, aleatoriedade, `localStorage`, áudio, impressão). Nunca mocke a própria lógica testada.
- **Proibido:** alterar um teste só para ele passar, pular ou desativar teste, atualizar snapshot sem revisar, teste que recalcula o esperado do mesmo jeito que o código.
- **Fluxos críticos** (pedido completo loja → fila → cozinha, fechamento de mesa) também têm teste E2E com Playwright em `e2e/`, nos projetos `desktop` e `celular`.
- **Onde fica o teste:** ao lado do código (`moeda.ts` → `moeda.test.ts`).
- **Antes de dizer que terminou:** rode os testes e mostre a saída (skill `core:verification-before-completion`).
- **Cobertura:** os `thresholds` do `vite.config.ts` nunca baixam; suba-os quando a cobertura medida subir.
- **Fora do TDD:** só ajuste puramente visual (cor, espaçamento, tipografia) e as direções de estudo da página `/_design`.

Comandos: `pnpm test` · `pnpm test:watch` · `pnpm test:coverage` · `pnpm test:e2e`
