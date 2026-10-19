# Fase 0 + base técnica: direção visual — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagents (um por tarefa) (recommended) or execução do plano tarefa a tarefa to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deixar pronta a fundação do novo front (tipos, banco mockado, cardápio, regras, tema, rotas, componentes base) e a página `/_design` com 3 direções visuais aplicadas ao cardápio no celular, à fila e à cozinha, terminando no ponto em que o usuário escolhe a direção.

**Architecture:** As telas chamam funções `async` de `src/mock/<seção>/acoes.ts` pelo TanStack Query. As funções leem e gravam um banco em memória persistido no `localStorage`. As regras do backend são portadas para `src/mock/regras/` com testes que usam os valores do .NET. O design system usa os tokens do shadcn (`src/index.css`); cada direção visual sobrescreve esses tokens sob `[data-direcao="..."]`, e o motion usa tokens espelhados em `src/lib/motion.ts`.

**Tech Stack:** Vite 8, React 19, TypeScript 6 strict, React Router 8, TanStack Query 5, Tailwind 4, shadcn (base Radix, estilo nova), Motion 14, Zustand 5, sonner, lucide, Vitest 5 + Testing Library, Playwright, Biome.

**Spec:** `docs/plano-v1.md` (fases 0 e 1) e `docs/PROJECT.md`. Regras de origem em `../betaup.clickpedidoweb/ClickPedido.Web/`. Cardápio real em `docs/referencias/cardapio-api.json` (snapshot de `GET /api/cardapio` de 18/10/2026).

## Global Constraints

- Só pnpm. Nunca npm, npx, yarn ou bun.
- Tudo em pt-BR: nomes no código, interface e textos. Nomes de entidades e status iguais a `Models/Entidades.cs` e ao `GLOSSARY.md`.
- Sem `fetch`, proxy ou interceptação: dados só por `src/mock/`. Telas nunca importam `src/mock/banco` direto.
- Toda função de `acoes.ts` começa com o comentário `// Replica <MÉTODO> <rota>` (ou `// Replica <Controller>.<Ação>`).
- Regra portada cita a origem no comentário (ex.: `// Porta de PedidoService.CriarAsync`) e dá o mesmo resultado que o .NET.
- Cores, espaçamentos, raios e durações só por tokens; componentes de `src/components/ui/`. Nada de cor crua (`bg-orange-500`) nem `dark:` manual.
- Animação só com `transform` e `opacity`, durações de `src/lib/motion.ts`; com `prefers-reduced-motion`, sem deslocamento.
- Contraste WCAG 2.2 AA em toda combinação de texto das três direções.
- JS inicial da rota `/` ≤ ~150 KB gzip; `/_design` e `/admin` carregados sob demanda.
- Fotos só por URL do Unsplash, com crédito; nenhum arquivo baixado.
- Pacote fora da ficha (ex.: fontes `@fontsource-variable/*`): perguntar ao usuário antes de instalar.
- TDD em todo código novo, exceto ajuste puramente visual e as direções de estudo da `/_design`.
- Cada tarefa termina com commit na `main` (conventional commits em pt-BR). Ao fim da fase (Task 13, depois da escolha), commit + `git push origin main` obrigatórios, sem pedir confirmação.

## Review Focus

1. `localStorage` indisponível (modo privado lança exceção) ou com JSON corrompido: o app abre com os dados iniciais, sem tela branca. Testes na Task 2.
2. Opções grátis com preços diferentes (`GratisAte`): os itens mais baratos saem de graça e os mais caros são cobrados, igual ao .NET. Teste na Task 4.
3. Categoria sem nenhum produto ativo: não aparece no cardápio, como no Razor (`HomeController.MontarCardapioAsync`). Teste na Task 6.
4. Sistema em modo escuro sem escolha salva: o app abre escuro; uma escolha salva vence a do sistema. Testes na Task 8.
5. `prefers-reduced-motion: reduce`: a troca de direção e as animações da `/_design` não deslocam elementos. Teste na Task 12.

---

### Task 1: Tipos das entidades

**Files:**
- Create: `src/types/entidades.ts`
- Test: `src/types/entidades.test.ts`

**Interfaces:**
- Produces: enums como uniões de string, iguais aos nomes do .NET (o `JsonStringEnumConverter` serializa assim): `StatusPedido = "AguardandoPagamento" | "Recebido" | "EmPreparo" | "Pronto" | "SaiuParaEntrega" | "Concluido" | "Cancelado"`, `TipoEntrega = "Entrega" | "Retirada" | "Mesa"`, `StatusMesa = "Livre" | "Ocupada" | "ContaPedida"`, `FormaPagamento = "Pix" | "CartaoOnline" | "Dinheiro" | "CartaoNaEntrega"`, `SituacaoPagamento = "Pendente" | "Pago" | "NaEntrega" | "Cancelado"`. Tipos `Categoria`, `Produto`, `ProdutoOpcaoGrupo`, `ProdutoOpcaoItem`, `BairroEntrega`, `ConfiguracaoLoja`, `HorarioFuncionamento`, `Pedido`, `PedidoItem`, `Mesa`, `Motoboy`, com os campos de `Models/Entidades.cs` em camelCase (datas como string ISO, `decimal` como `number`). Arrays exportados: `STATUS_PEDIDO`, `TIPOS_ENTREGA`, `FORMAS_PAGAMENTO`, na ordem dos valores do enum.

- [ ] **Step 1: Write the failing test** — `"STATUS_PEDIDO segue a ordem do enum do backend"`: `expect(STATUS_PEDIDO).toEqual(["AguardandoPagamento","Recebido","EmPreparo","Pronto","SaiuParaEntrega","Concluido","Cancelado"])`; e `"FORMAS_PAGAMENTO tem as quatro formas"`: `toEqual(["Pix","CartaoOnline","Dinheiro","CartaoNaEntrega"])`.
- [ ] **Step 2: Run** `pnpm test src/types` — Expected: FAIL, módulo não encontrado.
- [ ] **Step 3: Implement** os tipos e os arrays (`as const`, com as uniões derivadas deles).
- [ ] **Step 4: Run** `pnpm test src/types && pnpm typecheck` — Expected: PASS.
- [ ] **Step 5: Commit** `feat(tipos): adiciona tipos das entidades espelhando o backend`.

### Task 2: Banco mockado

**Files:**
- Create: `src/mock/banco/banco.ts`, `src/mock/banco/latencia.ts`
- Test: `src/mock/banco/banco.test.ts`, `src/mock/banco/latencia.test.ts`

**Interfaces:**
- Consumes: tipos da Task 1.
- Produces:
  - `type BancoDados = { versao: 1; loja: ConfiguracaoLoja; horarios: HorarioFuncionamento[]; categorias: Categoria[]; produtos: Produto[]; bairros: BairroEntrega[] }` (as fases seguintes acrescentam coleções e sobem `versao`).
  - `criarBanco(opcoes: { chave: string; armazenamento: Pick<Storage, "getItem" | "setItem" | "removeItem"> | null; dadosIniciais: () => BancoDados }): Banco`, com `Banco = { ler(): BancoDados; atualizar(alterar: (dados: BancoDados) => void): BancoDados; resetar(): BancoDados }`.
  - `simularLatencia(min = 200, max = 600, aleatorio = Math.random): Promise<void>`.
  - `storageSeguro(): Storage | null`, que devolve `null` se o acesso ao `localStorage` lançar exceção. A instância do app nasce na Task 3, junto com os dados iniciais.

- [ ] **Step 1: Write the failing tests** (um ciclo por teste, com um `Storage` fake em memória):
  - `"sem nada salvo, lê os dados iniciais"`.
  - `"atualizar persiste e a próxima instância lê o valor salvo"`: muda `loja.nomeLoja` para `"Teste"`, cria outra instância com o mesmo armazenamento e espera `"Teste"`.
  - `"JSON corrompido volta aos dados iniciais"`: `getItem` devolve `"{quebrado"`.
  - `"versão diferente volta aos dados iniciais"`: salvo com `versao: 0`.
  - `"armazenamento que lança exceção não quebra: funciona só em memória"`: `setItem` lança; `atualizar` não lança e `ler()` traz o valor novo.
  - `"resetar apaga o salvo e volta aos dados iniciais"`.
  - `"ler devolve cópia: alterar o retorno não muda o banco"`.
  - Latência: `"simularLatencia espera entre min e max"`, com `vi.useFakeTimers()` e `aleatorio = () => 0.5` → resolve após 400 ms e não antes.
- [ ] **Step 2: Run** `pnpm test src/mock/banco` — Expected: FAIL.
- [ ] **Step 3: Implement** `criarBanco` (`structuredClone` nas leituras; `try/catch` em todo acesso ao armazenamento) e `simularLatencia`.
- [ ] **Step 4: Run** `pnpm test src/mock/banco` — Expected: PASS.
- [ ] **Step 5: Commit** `feat(mock): adiciona banco em memória persistido no localStorage`.

### Task 3: Dados iniciais do cardápio, da loja e dos bairros

**Files:**
- Create: `src/mock/cardapio/cardapio-inicial.json` (cópia de `docs/referencias/cardapio-api.json`), `src/mock/cardapio/dados.ts`, `src/mock/cardapio/fotos.ts`, `src/mock/loja/dados.ts`, `src/mock/banco/dados-iniciais.ts`, `src/mock/banco/index.ts` (`export const banco = criarBanco({ chave: "cp_mock_db", armazenamento: storageSeguro(), dadosIniciais })`)
- Test: `src/mock/cardapio/dados.test.ts`, `src/mock/loja/dados.test.ts`

**Interfaces:**
- Consumes: `BancoDados` (Task 2).
- Produces: `dadosIniciais(): BancoDados`; `categoriasIniciais`, `produtosIniciais`, `bairrosIniciais`, `lojaInicial`, `horariosIniciais`; `creditosFotos: Record<number, { autor: string; link: string }>` (chave = id do produto).

- [ ] **Step 1: Write the failing tests**, com valores do snapshot:
  - `"traz as 7 categorias na ordem da loja"`: nomes `["Pastéis","Lanches","Açaí","Porções","Bebidas","Combos","Açaí Gourmet"]`.
  - `"traz os 42 produtos"`; `"Pastel de Carne custa 9"`; `"Açaí Paçoca tem 'Escolha o tamanho' (1 a 1, 5 itens) e 'Adicionais (todos pagos)' (0 a 30, 21 itens)"`.
  - `"traz os 28 bairros, todos com cidade e taxa"`.
  - Loja (valores de `Seed.cs` e do snapshot): `nomeLoja` `"Quiosque do Mineiro"`, `slogan` `"O Ponto do Pastel · Lanches e Açaí"`, `taxaEntrega` 5, `pedidoMinimo` 15, `tempoEntrega` `"40–60 min"`, `tempoRetirada` `"20–30 min"`, `horario` `"Todos os dias, das 10h às 22h"`, todas as flags `aceita*` `true`, `controleHorarioAutomatico` `true`, e 7 horários das 10:00 às 22:00.
  - `"todo produto com foto tem crédito"`: cada `imagemUrl` começa com `https://images.unsplash.com/` e o id está em `creditosFotos`.
- [ ] **Step 2: Run** `pnpm test src/mock/cardapio src/mock/loja` — Expected: FAIL.
- [ ] **Step 3: Implement** `dados.ts`, que lê o JSON e converte para os tipos da Task 1 (acrescenta `categoriaId`, `ativo: true` e `ordem` pela posição). Campos da loja que o snapshot não traz vêm de `Seed.cs` (linhas ~155-190).
- [ ] **Step 4: Escolher fotos** com o MCP do Unsplash (`search_photos`): pelo menos 1 por categoria e 12 no total (pastéis, lanches, açaí, porções, bebidas, combos). URL no formato `https://images.unsplash.com/photo-...?w=640&q=70&auto=format&fit=crop`, com autor e link em `fotos.ts`. Os demais produtos ficam sem foto, para o placeholder também ser desenhado.
- [ ] **Step 5: Run** `pnpm test src/mock && pnpm typecheck` — Expected: PASS.
- [ ] **Step 6: Commit** `feat(mock): adiciona cardápio real, loja e bairros como dados iniciais`.

### Task 4: Regra de preço e validação das opções

**Files:**
- Create: `src/mock/regras/preco.ts`
- Test: `src/mock/regras/preco.test.ts`

**Interfaces:**
- Consumes: `Produto`, `ProdutoOpcaoGrupo` (Task 1).
- Produces: `type OpcaoSelecionada = { grupoId: number; itemId: number; quantidade: number }`; `validarOpcoes(produto: Produto, opcoes: OpcaoSelecionada[]): string | null`; `calcularItem(produto: Produto, opcoes: OpcaoSelecionada[]): { precoUnitario: number; resumo: string | null }`. Porta de `PedidoService.CriarAsync`, linhas 151-200.

- [ ] **Step 1: Write the failing tests** (um ciclo por teste; produtos montados no próprio teste):
  - `"sem opções, o preço é o do produto"`: 9 → `{ precoUnitario: 9, resumo: null }`.
  - `"soma o adicional de cada unidade escolhida"`: base 12, item de 2,50 com quantidade 2 → 17.
  - `"GratisAte cobra só o que passa do limite, a partir dos mais baratos"`: grupo `GratisAte` 2, itens 1,00, 3,50 e 4,50 → base + 4,50.
  - `"resumo segue o formato do backend"`: `"Escolha o tamanho: 500 ml | Adicionais: 2x Granola, Banana"`.
  - `"abaixo do mínimo devolve a mensagem do backend"`: `"Escolha ao menos 1 opção em 'Escolha o tamanho'."`.
  - `"acima do máximo devolve a mensagem do backend"`: `"Máximo de 2 opções permitidas em 'Adicionais Grátis (escolha até 2)'."`.
  - `"item inativo é ignorado no preço"`.
- [ ] **Step 2: Run** `pnpm test src/mock/regras/preco` — Expected: FAIL.
- [ ] **Step 3: Implement** seguindo a ordem do .NET: valida mínimo e máximo por grupo ativo; preços unitários por unidade; com `gratisAte > 0`, ordena crescente e soma depois dos `gratisAte` primeiros; resumo `"<Grupo>: <itens>"`, unido por `" | "`, com `"<n>x <Nome>"` quando a quantidade é maior que 1.
- [ ] **Step 4: Run** — Expected: PASS.
- [ ] **Step 5: Commit** `feat(regras): porta o cálculo de preço e a validação das opções`.

### Task 5: Rótulos de status, ação e pagamento

**Files:**
- Create: `src/mock/regras/rotulos.ts`
- Test: `src/mock/regras/rotulos.test.ts`

**Interfaces:**
- Produces: `rotuloStatus(status: StatusPedido, tipo: TipoEntrega): string`, `rotuloAcao(status: StatusPedido, tipo: TipoEntrega): string` (string vazia quando não há próxima etapa), `rotuloPagamento(forma: FormaPagamento): string`, `rotuloSituacaoPagamento(s: SituacaoPagamento): string`, `rotuloTipo(t: TipoEntrega): string`. Porta de `Infra/Rotulos.cs`.

- [ ] **Step 1: Write the failing tests** (`it.each` com os literais de `Rotulos.cs`):
  - Status: `Pronto` → `"Pronto para retirada"` (Retirada), `"Pronto para servir"` (Mesa), `"Pronto"` (Entrega); `Concluido` → `"Retirado"`, `"Servido / Finalizado"`, `"Entregue"`.
  - Ação: `Recebido` → `"Iniciar preparo"`; `EmPreparo` → `"Marcar como pronto"`; `Pronto` → `"Servir na mesa"`, `"Saiu para entrega"` e `"Cliente retirou"`; `SaiuParaEntrega` → `"Confirmar entrega"`; `Concluido` → `""`.
  - Pagamento: `CartaoNaEntrega` → `"Cartão na maquininha"`. Situação: `NaEntrega` → `"A cobrar"`, `Pendente` → `"Aguardando"`.
- [ ] **Step 2: Run** — Expected: FAIL. **Step 3: Implement.** **Step 4: Run** — Expected: PASS.
- [ ] **Step 5: Commit** `feat(regras): porta os rótulos de status, ação e pagamento`.

### Task 6: Ação `obterCardapio`

**Files:**
- Create: `src/mock/cardapio/acoes.ts`
- Test: `src/mock/cardapio/acoes.test.ts`

**Interfaces:**
- Consumes: `banco` (Task 2), `simularLatencia`.
- Produces: `obterCardapio(): Promise<Cardapio>`, com `Cardapio = { loja: { nomeLoja; slogan; lojaAberta; taxaEntrega; pedidoMinimo; tempoEntrega; tempoRetirada; horario }; categorias: Array<Categoria & { produtos: Produto[] }> }`. Só categorias ativas com pelo menos 1 produto ativo, ordenadas por `ordem` e depois `nome`; produtos ativos (os esgotados entram com `disponivel: false`); grupos e itens ativos, ordenados por `ordem`.

- [ ] **Step 1: Write the failing tests**, com o banco criado sobre um `Storage` fake e a latência zerada (`vi.mock` só de `latencia.ts`, que é a fronteira de tempo):
  - `"devolve as categorias com seus produtos ativos"`.
  - `"categoria sem produto ativo não aparece"`: inativa todos os produtos de "Bebidas".
  - `"produto esgotado aparece com disponivel false"`.
  - `"produto inativo não aparece"`.
- [ ] **Step 2: Run** — Expected: FAIL. **Step 3: Implement**, com o comentário `// Replica GET /api/cardapio (+ filtro de categorias vazias de HomeController.MontarCardapioAsync)`. **Step 4: Run** — Expected: PASS.
- [ ] **Step 5: Commit** `feat(mock): adiciona a ação obterCardapio`.

### Task 7: Tokens de motion

**Files:**
- Create: `src/lib/motion.ts`
- Modify: `src/index.css` (adicionar `--duracao-rapida: 150ms; --duracao-base: 220ms; --duracao-enfase: 320ms; --curva-saida: cubic-bezier(0.22, 1, 0.36, 1); --curva-entrada-saida: cubic-bezier(0.65, 0, 0.35, 1);` em `:root`, mais `@media (prefers-reduced-motion: reduce)` zerando as durações)
- Test: `src/lib/motion.test.ts`

**Interfaces:**
- Produces: `duracoes = { rapida: 0.15, base: 0.22, enfase: 0.32 }` (segundos, para o Motion); `curvas = { saida: [0.22, 1, 0.36, 1], entradaSaida: [0.65, 0, 0.35, 1] }`; `transicao(tipo: keyof typeof duracoes, curva?: keyof typeof curvas)` no formato de `transition` do Motion.

- [ ] **Step 1: Write the failing test** — `"transicao('base') usa 0.22 s e a curva de saída"`: `toEqual({ duration: 0.22, ease: [0.22, 1, 0.36, 1] })`.
- [ ] **Step 2: Run** — Expected: FAIL. **Step 3: Implement** (valores iguais aos do CSS). **Step 4: Run** — Expected: PASS.
- [ ] **Step 5: Commit** `feat(design): adiciona tokens de motion`.

### Task 8: Tema claro e escuro

**Files:**
- Create: `src/app/tema/ProvedorTema.tsx`, `src/app/tema/useTema.ts`
- Test: `src/app/tema/ProvedorTema.test.tsx`

**Interfaces:**
- Produces: `<ProvedorTema temaPadrao?: Tema>`; `useTema(): { tema: Tema; temaEfetivo: "claro" | "escuro"; definirTema(t: Tema): void }`, com `Tema = "claro" | "escuro" | "sistema"`. Salva em `localStorage["cp_tema"]` e aplica a classe `dark` no `<html>` quando o tema efetivo é escuro.

- [ ] **Step 1: Write the failing tests** (`matchMedia` falso no próprio teste: é a fronteira do navegador):
  - `"sem escolha salva e sistema escuro, aplica dark no html"`.
  - `"escolha salva vence o sistema"`: salvo `"claro"` com sistema escuro → sem `dark`.
  - `"definirTema('escuro') aplica dark e salva"`.
  - `"no modo sistema, acompanha a troca do sistema"`: dispara o evento `change` do `matchMedia`.
  - `"localStorage que lança exceção não quebra"`.
- [ ] **Step 2: Run** — Expected: FAIL. **Step 3: Implement.** **Step 4: Run** — Expected: PASS.
- [ ] **Step 5: Commit** `feat(app): adiciona tema claro e escuro`.

### Task 9: Providers, rotas e layouts

**Files:**
- Create: `src/app/Providers.tsx` (QueryClient, `ProvedorTema`, `LazyMotion` com `domAnimation`, `MotionConfig reducedMotion="user"`, `<Toaster />` do sonner), `src/app/rotas.tsx`, `src/app/layouts/LayoutLoja.tsx`, `src/app/layouts/LayoutAdmin.tsx`, `src/app/layouts/LayoutTelaCheia.tsx`, `src/features/loja/inicio/PaginaInicio.tsx` (provisória: logo, nome e slogan vindos de `obterCardapio`), `src/features/design/PaginaDesign.tsx` (esqueleto só com o título "Direções visuais", preenchido na Task 12)
- Modify: `src/main.tsx` (`RouterProvider`), `e2e/inicio.spec.ts`
- Delete: `src/App.tsx`
- Test: `src/app/rotas.test.tsx`

**Interfaces:**
- Consumes: `obterCardapio` (Task 6), `ProvedorTema` (Task 8).
- Produces: `criarRoteador(opcoes?: { entradasIniciais?: string[] })` (memória nos testes, browser no app); rotas `/` (LayoutLoja › PaginaInicio), `/_design` (lazy, LayoutTelaCheia) e `/admin` (lazy, LayoutAdmin, placeholder "Em breve"); 404 com link para `/`. Hook `useCardapio()` em `src/features/loja/cardapio/useCardapio.ts` (`queryKey: ["cardapio"]`).

- [ ] **Step 1: Write the failing tests**:
  - `"/ mostra o nome e o slogan da loja"`: `findByRole("heading", { name: "Quiosque do Mineiro" })` e o texto do slogan.
  - `"/_design carrega sob demanda e mostra o título"`: `findByRole("heading", { name: "Direções visuais" })`.
  - `"rota desconhecida mostra 'Página não encontrada' com link para o início"`.
- [ ] **Step 2: Run** — Expected: FAIL. **Step 3: Implement.** **Step 4: Run** `pnpm test && pnpm test:e2e` — Expected: PASS (o E2E de início continua passando no desktop e no celular).
- [ ] **Step 5: Commit** `feat(app): adiciona providers, rotas e layouts`.

### Task 10: Componentes base do shadcn

**Files:**
- Create (via CLI): `src/components/ui/` com `button`, `badge`, `card`, `dialog`, `alert-dialog`, `sheet`, `drawer`, `skeleton`, `empty`, `sonner`, `spinner`, `tabs`, `toggle-group`, `separator`, `input`, `field`, `tooltip`

- [ ] **Step 1:** Rode `pnpm dlx shadcn@latest docs button drawer empty spinner field` e leia as URLs. Depois rode `pnpm dlx shadcn@latest add button badge card dialog alert-dialog sheet drawer skeleton empty sonner spinner tabs toggle-group separator input field tooltip`.
- [ ] **Step 2:** Revise os arquivos gerados contra as regras da skill `frontend:shadcn` (Title em overlays, `data-icon`, `gap-*`, sem cor crua). O Button continua sem prop de carregamento: o padrão é `Spinner` + `disabled`, documentado na Task 11.
- [ ] **Step 3: Run** `pnpm lint && pnpm typecheck && pnpm build` — Expected: PASS, e o chunk da rota `/` dentro do orçamento (`vite build` mostra o tamanho gzip).
- [ ] **Step 4: Commit** `feat(ui): adiciona componentes base do shadcn`.

### Task 11: Componentes de domínio do design system

**Files:**
- Create: `src/components/ui/preco.tsx`, `src/components/ui/seletor-quantidade.tsx`, `src/components/ui/badge-status.tsx`, `src/components/ui/foto-produto.tsx`
- Modify: `src/index.css` (tokens de status: `--status-aguardando`, `--status-recebido`, `--status-preparo`, `--status-pronto`, `--status-rota`, `--status-concluido`, `--status-cancelado`, cada um com `-foreground`, em claro e escuro)
- Test: um `*.test.tsx` ao lado de cada componente

**Interfaces:**
- Consumes: `formatarMoeda` (`src/lib/moeda.ts`), `rotuloStatus` (Task 5), `creditosFotos` (Task 3).
- Produces:
  - `<Preco valor: number; aPartirDe?: boolean />`.
  - `<SeletorQuantidade valor: number; aoMudar(n: number): void; min?: number (1); max?: number (50); rotulo: string />`.
  - `<BadgeStatus status: StatusPedido; tipo: TipoEntrega />`.
  - `<FotoProduto produto: Pick<Produto, "id" | "nome" | "imagemUrl">; tamanho: "sm" | "md" | "lg" />`: com foto, `<img loading="lazy">` com largura e altura fixas e `alt` igual ao nome; sem foto, placeholder com a inicial e `aria-hidden`.

- [ ] **Step 1: Write the failing tests** (um ciclo por comportamento, queries por role e label):
  - Preco: `"mostra o valor em reais"` (`"R$ 9,00"` com ` `); `"com aPartirDe mostra 'A partir de'"`.
  - SeletorQuantidade: `"botão Aumentar chama aoMudar com valor + 1"`; `"no máximo, Aumentar fica desabilitado"`; `"no mínimo, Diminuir fica desabilitado"`; `"os botões têm nome acessível com o rótulo"` (ex.: `"Aumentar quantidade de Pastel de Carne"`).
  - BadgeStatus: `"mostra o rótulo do status conforme o tipo"` (`Pronto` + `Retirada` → `"Pronto para retirada"`); `"expõe o status em data-status"`.
  - FotoProduto: `"com foto, renderiza img com alt do nome e lazy"`; `"sem foto, renderiza a inicial sem img"`.
- [ ] **Step 2: Run** — Expected: FAIL. **Step 3: Implement**, compondo os componentes da Task 10 (`Badge`, `Button` com `data-icon`). **Step 4: Run** — Expected: PASS.
- [ ] **Step 5: Registrar** cada componente desta tarefa, mais Button, Drawer, Sheet, AlertDialog, Empty, Skeleton e sonner, com a skill `frontend:register-component`: o padrão de uso, o padrão de botão com carregamento e a regra de ações (uma primária por tela ou card; destrutiva com AlertDialog; reversível com toast "Desfazer"). Resultado: `docs/components/README.md` lista todos e o `CLAUDE.md` ganha o bloco "Componentes base".
- [ ] **Step 6: Commit** `feat(ui): adiciona componentes de domínio e registra os componentes base`.

### Task 12: Página `/_design` com 3 direções visuais

**Files:**
- Modify: `src/features/design/PaginaDesign.tsx` (esqueleto da Task 9)
- Create: `src/features/design/direcoes.ts`, `src/features/design/direcoes.css`, `src/features/design/fixtures.ts` (pedidos de exemplo para a fila e a cozinha, com status variados), `src/features/design/telas/CardapioCelular.tsx`, `src/features/design/telas/FilaBalcao.tsx`, `src/features/design/telas/CozinhaKds.tsx`, `src/features/design/secoes/` (Cores, Tipografia, Botoes, Status, Motion)
- Test: `src/features/design/PaginaDesign.test.tsx`, `e2e/design.spec.ts`

**Interfaces:**
- Consumes: `useCardapio` (Task 9), componentes das Tasks 10 e 11, `transicao` (Task 7), `useTema` (Task 8).
- Produces: `DIRECOES: Array<{ id: "quitanda" | "brasa" | "varanda"; nome: string; resumo: string }>`. A direção ativa fica em `data-direcao` no contêiner da página e é salva em `localStorage["cp_direcao"]`.

As 3 direções, com os mesmos tokens e personalidades diferentes. Os valores exatos ficam com quem implementa, usando as skills `frontend:frontend-design` e `frontend:emil-design-eng`, com o laranja da logo como âncora:
- **Quitanda:** calor artesanal. Creme quente, laranja tijolo, serifa de display com sans de texto, cantos médios, fotos grandes.
- **Brasa:** contraste forte. Laranja vivo sobre carvão, sans geométrica, densidade alta na operação, cozinha nativamente escura.
- **Varanda:** leve e moderna. Areia e branco, laranja suave, sans humanista, raios grandes, muito respiro.

- [ ] **Step 1: Write the failing tests** (`PaginaDesign.test.tsx`):
  - `"mostra as três direções para escolher"`: `getByRole("radio", { name: "Quitanda" })`, `"Brasa"` e `"Varanda"` (ToggleGroup tipo single).
  - `"escolher Brasa aplica data-direcao='brasa' e salva a escolha"`.
  - `"o cardápio do celular lista as categorias do mock"`: dentro de `getByRole("region", { name: "Cardápio no celular" })`, `findByText("Pastéis")`.
  - `"a fila mostra as colunas Novos, Em preparo, Prontos e Em rota"`.
  - `"a cozinha mostra os pedidos em preparo com o botão de ação certo"`: `getAllByRole("button", { name: "Marcar como pronto" })` com pelo menos 1.
  - `"com prefers-reduced-motion, a troca de direção não anima deslocamento"`: com `matchMedia("(prefers-reduced-motion: reduce)")` verdadeiro, os elementos animados não recebem `transform` inline após a troca.
- [ ] **Step 2: Run** — Expected: FAIL. **Step 3: Implement** a página e as seções: cores com o par de contraste ao lado (ex.: `4.8:1 AA`), escala tipográfica, matriz de estados do Button (padrão, hover, foco, desabilitado, carregando), badges dos 7 status, demonstração de motion (item entrando na sacola e card mudando de coluna) e as 3 telas-chave numa moldura: celular de 390 px, fila e cozinha em tela grande. Fontes novas: **perguntar antes de instalar** `@fontsource-variable/*` (fora da ficha).
- [ ] **Step 4: Write the E2E** `e2e/design.spec.ts`: `"troca entre as três direções sem erro no console"` (desktop e celular). Ouve `page.on("console")` e espera zero erros; clica em cada direção e confere `data-direcao`.
- [ ] **Step 5: Run** `pnpm test && pnpm test:e2e && pnpm lint && pnpm typecheck` — Expected: PASS.
- [ ] **Step 6: Commit** `feat(design): adiciona a página /_design com três direções visuais`.

### Task 13: Revisão e ponto de decisão

**Files:**
- Create: `docs/adr/0004-direcao-visual.md` (só depois da escolha do usuário)

- [ ] **Step 1: Revisar a `/_design`** com as skills `web-quality:web-design-guidelines`, `design:accessibility-review` (contraste, foco e teclado nas 3 direções), `frontend:review-animations` e `design:ux-copy`. Corrigir o que for apontado, com teste quando houver comportamento.
- [ ] **Step 2: Verificar no painel do navegador** (`pnpm dev`): `/_design` no desktop e no celular (375×812), nos temas claro e escuro, sem rolagem horizontal e sem erro no console. Capturar screenshots das 3 direções.
- [ ] **Step 3: Medir** `pnpm build`: chunk inicial da rota `/` ≤ ~150 KB gzip. A `/_design` precisa ficar num chunk separado.
- [ ] **Step 4: Apresentar ao usuário** as 3 direções (screenshots e o que cada uma prioriza) e **parar**. Ele escolhe a direção ou pede uma combinação.
- [ ] **Step 5: Depois da escolha:** registrar a decisão no ADR 0004, promover os tokens da direção escolhida para `:root`/`.dark` em `src/index.css` e manter a `/_design` como guia vivo só com essa direção. Commit `feat(design): adota a direção visual <nome>` e `git push origin main` (fim da fase).
