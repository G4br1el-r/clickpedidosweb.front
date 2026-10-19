# ClickPedido Front

## Visão
O ClickPedido do Quiosque do Mineiro funciona bem, mas o front é Razor com JS puro e visual simples. Este projeto é uma **repaginada total de UI e UX**: as mesmas funcionalidades de hoje, com visual premium, padronizado e com motion, sem perder a praticidade e a velocidade da operação. Atende os clientes da loja (no celular) e a equipe (balcão, garçom, cozinha e gestão). A primeira versão roda **só com dados mockados**, para validar a nova experiência antes de ligar no backend.

## MVP
1. Design system e página `/_design` com 2 ou 3 direções visuais aplicadas ao cardápio no celular, à fila e à cozinha. Pronto quando: a direção foi escolhida.
2. Loja: cardápio, modal de opções, sacola, cardápio digital, checkout e acompanhamento. Pronto quando: um pedido sai do começo ao fim no mock, com Pix simulado.
3. Admin: login, visão geral, fila (alerta sonoro, impressão automática, WhatsApp), pedidos e cupom 80 mm. Pronto quando: o pedido da loja aparece na fila e avança até "Em rota".
4. Cadastros e configurações: produtos com foto, categorias, bairros, motoboys, configurações e trocar senha. Pronto quando: as mudanças refletem na loja.
5. Salão: mesas e comanda, modo garçom e cozinha (KDS). Pronto quando: a mesa abre, lança itens, passa pela cozinha e fecha a conta.

Fora do MVP: ligar no backend real, editar grupos de opções no admin, tempo real, PWA, multi-loja, deploy, CI e analytics.

Detalhe completo de telas, mocks e fases em `docs/plano-v1.md`.

## Domínio
Entidades principais: Categoria, Produto, Grupo de opções, Item de opção, Pedido, Item do pedido, Mesa, Motoboy, Bairro de entrega, Configuração da loja, Horário de funcionamento e Usuário. Glossário completo em `GLOSSARY.md`.

## Referências
| Referência | O que ela decide |
|---|---|
| `docs/plano-v1.md` | Escopo, telas, estrutura do mock, design system e fases |
| `../betaup.clickpedidoweb/ClickPedido.Web/` (só leitura) | Funcionalidades a manter e regras de negócio: `Services/PedidoService.cs`, `Infra/Rotulos.cs`, `ViewModels/ViewModels.cs`, `Services/LojaService.cs`, `Infra/Texto.cs` |
| `../betaup.clickpedidoweb/ClickPedido.Web/Data/Seed.cs` | Cardápio dos dados mockados |
| `../betaup.clickpedidoweb/ClickPedido.Web/Models/Entidades.cs` | Tipos das entidades |
| `../betaup.clickpedidoweb/ClickPedido.Web/wwwroot/img/` | Logo e cor da marca (laranja) como âncora da direção visual |
| Unsplash | Fotos dos produtos nos mocks |

## Stack
| Camada | Escolha | Por quê |
|---|---|---|
| Front | Vite + React 19 + TypeScript strict | SPA rápida, sem servidor Node; sem necessidade de indexação |
| Rotas | React Router com carregamento sob demanda | O cliente no celular não baixa o código do admin |
| UI | Tailwind CSS v4 + shadcn/ui + lucide + sonner | Componentes acessíveis, personalizados com os tokens da marca |
| Motion | Motion (`motion/react`) com LazyMotion | Microinterações e layout animations sem pesar o bundle |
| Dados | TanStack Query sobre as funções de `src/mock/` | Carregamento, cache e atualização periódica (fila, cozinha, acompanhamento) |
| Formulários | React Hook Form + Zod | Checkout e cadastros com validação no campo |
| Estado local | Zustand com persistência | Sacola e preferências da fila |
| Tabelas | TanStack Table | Listas do admin com ordenação, filtro e busca padronizados |
| Extras | `qrcode.react` | QR Code do Pix |
| Fotos | Unsplash por URL direta, com crédito | Visual apetitoso de verdade, sem baixar arquivos |
| Testes | Vitest + Testing Library; Playwright | TDD em todo código novo; E2E nos fluxos críticos |
| Back | Nenhum nesta versão (mock em código) | Validar a experiência primeiro; ver `docs/adr/0003-mock-em-codigo-sem-api.md` |
| Deploy | Ainda não decidido | Versão só local por enquanto |

## Estrutura
Organização **por feature**.

```
clickpedido-front/
├─ docs/            PROJECT.md, plano-v1.md, adr/, components/
├─ e2e/             testes Playwright
├─ src/
│  ├─ app/          rotas, providers, layouts (Loja, Admin, TelaCheia)
│  ├─ features/
│  │  ├─ loja/      cardapio, produto, sacola, checkout, pedido
│  │  └─ admin/     conta, dashboard, fila, pedidos, impressao, produtos, categorias,
│  │                bairros, motoboys, configuracoes, mesas, garcom, cozinha
│  ├─ mock/         banco, regras e uma pasta por seção (dados.ts + acoes.ts)
│  ├─ components/ui componentes base do design system
│  ├─ types/        tipos das entidades
│  └─ lib/          moeda, whatsapp, som, impressao, datas
├─ CLAUDE.md
└─ GLOSSARY.md
```

## Qualidade
TDD: todo código novo. E2E: Playwright no pedido completo (loja → fila → cozinha) e no fechamento de mesa. Cobertura mínima: medida após o setup, só sobe. Lint e formato: Biome. Pre-commit: Husky + lint-staged. CI: não por enquanto. Acessibilidade: WCAG 2.2 AA. SEO: não importa. Performance: JS inicial da loja ≤ ~150 KB gzip, interações < 100 ms, `prefers-reduced-motion` respeitado.

## Git e deploy
Repositório próprio, fora da BetaUp: `https://github.com/G4br1el-r/clickpedidosweb.front` (remoto `origin`, branch `main`). Commits: conventional commits em pt-BR. Git guardrails ligados (push normal liberado; force push e apagar branch bloqueados). Ambientes: só dev local. Deploy: ainda não decidido.

## Como o Claude trabalha neste projeto
- Instala o que está nesta ficha sem pedir ok a cada pacote; pergunta antes de pacote fora da ficha ou de mudança grande.
- Tudo em pt-BR: código, nomes, interface e textos.
- Comentários só para o porquê não óbvio. Cada ação do mock diz qual endpoint ou ação do backend ela replica.
- Uma fase por vez, e cada fase só começa quando o usuário mandar.
- Commit ao fim de cada tarefa e, obrigatoriamente, commit + push para `origin/main` ao fim de cada fase, sem pedir confirmação (liberado pelo usuário em 18/10/2026).

## Decisões
ADRs em `docs/adr/`.
