> Plano aprovado em 18/10/2026 na sessão de planejamento. Adaptado ao projeto novo: pasta própria `clickpedido-front` (fora do repositório da BetaUp) e **pnpm** no lugar de npm. Os caminhos de backend citados (`ClickPedido.Web/...`) ficam em `../betaup.clickpedidoweb/` e são só referência de leitura.

# Plano: novo frontend ClickPedido em Vite com dados mockados

## Contexto

Hoje o front é Razor + JS puro dentro do `ClickPedido.Web` (ASP.NET Core 10). O Next foi descartado: não há necessidade de indexação e ele exigiria um servidor Node ao lado do .NET no IIS.

Decisão: construir **um front Vite completo, com todas as funcionalidades atuais (loja, admin, salão, cozinha), rodando só com dados mockados**, sem tocar no backend e **sem chamar API nenhuma**. É uma primeira versão para testar.

**Objetivo principal: uma repaginada total de UI e UX.** As funcionalidades são as mesmas de hoje, mas com outra cara: visual premium, mais detalhe e profissionalismo, botões e ações padronizados, animações com propósito. Tudo isso **sem perder a praticidade e a velocidade** que o sistema já tem: balcão, garçom e cozinha precisam continuar rápidos de operar.

## Stack

| Peça | Escolha |
|---|---|
| Base | Vite + React 19 + TypeScript |
| Rotas | React Router (com carregamento sob demanda: o cliente no celular não baixa o admin) |
| Dados | TanStack Query chamando as funções do mock (estados de carregamento, cache, atualização periódica da fila, cozinha e acompanhamento) |
| Visual | Tailwind CSS v4 + shadcn/ui + lucide (ícones) + sonner (avisos) |
| Animação | **Motion** (`motion/react`, sucessor do Framer Motion) com `LazyMotion` para não pesar o bundle |
| Formulários | React Hook Form + Zod |
| Estado local | Zustand com persistência (sacola, preferências da fila) |
| Extras | `qrcode.react` (QR do Pix), Vitest (regras de preço e status) |

## Onde fica

Projeto próprio em `C:/Users/gabri/Documents/Projetos/clickpedido-front`, com Git local e fora da BetaUp. Nada em `ClickPedido.Web` é alterado.

```
src/
├─ app/          rotas, providers, layouts (Loja, Admin, TelaCheia)
├─ mock/         dados e ações mockadas, por seção (detalhe abaixo)
├─ features/
│  ├─ loja/      cardapio, produto (modal de opções), sacola, checkout, pedido
│  └─ admin/     conta, dashboard, fila, pedidos, impressao, produtos, categorias,
│                bairros, motoboys, configuracoes, mesas, garcom, cozinha
├─ components/ui componentes base do design system (shadcn personalizado)
├─ types/        tipos das entidades (espelho de Models/Entidades.cs)
└─ lib/          moeda, whatsapp, som (AudioContext), impressao, datas
```

## Mock: código direto, organizado por seção

Sem API, sem interceptação. Cada tela importa funções `async` da pasta `mock/` que fazem a mesma coisa que o endpoint correspondente do backend faz hoje, só que em cima de dados em memória.

```
src/mock/
├─ banco/          estado compartilhado em memória, salvo no localStorage (cp_mock_db),
│                  com resetar(); latência artificial de 200 a 600 ms
├─ regras/         regras portadas do backend, usadas por várias seções
├─ loja/           cardápio, consulta de CEP, bairros, criar pedido, acompanhar pedido
├─ conta/          login, sessão, sair, trocar senha
├─ dashboard/      números do dia, mais vendidos, últimos pedidos
├─ fila/           fila por coluna, avançar, cancelar, chamar motoboy
├─ pedidos/        lista por data e status, detalhe, mudar status, marcar pago
├─ produtos/       CRUD, foto (guardada como data URL), alternar ativo e esgotado
├─ categorias/     CRUD e ordem
├─ bairros/        CRUD, busca, alternar ativo
├─ motoboys/       CRUD
├─ mesas/          lista, criar, excluir, comanda, fechar conta, liberar
├─ garcom/         lançar itens na mesa
├─ cozinha/        pedidos do KDS, mudar status
├─ configuracoes/  loja, entrega, pagamentos, horários, Mercado Pago, impressora
├─ impressao/      impressoras e agente com status simulado, teste de impressão
└─ simulador/      Pix que "paga sozinho", pedidos novos chegando (opcional)
```

Cada seção tem:
- `dados.ts`: os dados iniciais da seção. O cardápio vem do que existe em `ClickPedido.Web/Data/Seed.cs`, mais bairros, motoboys, mesas e pedidos do dia em status variados.
- `acoes.ts`: as funções. Cada uma traz um comentário dizendo qual endpoint ou ação do backend ela replica (por exemplo, `criarPedido` ↔ `POST /api/pedidos`), para facilitar trocar pelo backend real depois.

**Regras portadas para `mock/regras/`**, para o mock se comportar igual ao sistema atual:
- Criação de pedido e preço com opções (mínimo, máximo, `GratisAte`, adicional), pedido mínimo, taxa por bairro e troco: `Services/PedidoService.cs` (`CriarAsync`, linhas ~50-260).
- Formas de pagamento permitidas: `PedidoService.FormaPermitida` + flags `Aceita*` da loja.
- Etapas e textos do acompanhamento: `ViewModels/ViewModels.cs` (`AcompanhamentoDto.De`) e `Infra/Rotulos.cs`.
- Cidade atendida: `LojaService.CidadeAtendida`. Normalização de texto: `Infra/Texto.cs`.
- Abertura automática por horário: `Services/LojaService.cs`.

**Ações que replicam o backend** (levantadas do código atual):
- Loja: `Controllers/Api/PublicoApiController.cs` (cardápio, CEP, bairros, criar e acompanhar pedido) e `Controllers/HomeController.cs` (formas disponíveis no checkout, itens e totais do pedido).
- Admin via API: `Controllers/Api/AdminApiController.cs` (fila, cozinha, avançar, cancelar, motoboy, abrir e fechar loja, impressoras).
- Admin via formulário: `Areas/Admin/Controllers/AdminControllers.cs` (conta, dashboard, pedidos, produtos, categorias, motoboys, configurações), `BairrosController.cs`, `MesasController.cs`, `GarcomController.cs`, `CozinhaController.cs`.
- Agente de impressão: `Controllers/Api/AgenteApiController.cs` (status e teste, simulados).

Como loja e admin rodam no mesmo navegador e compartilham o banco mockado, um pedido feito na loja aparece na fila e na cozinha. Dá para testar o fluxo completo de ponta a ponta. Um botão "Resetar dados de teste" no admin volta tudo ao estado inicial.

## Design system e qualidade visual

O design system vem **antes** das telas. Toda tela é montada só com peças dele, e é isso que garante a padronização.

**Direção visual**
- Âncora na marca atual (logo e laranja de `ClickPedido.Web/wwwroot/img/`), refinada: paleta com neutros quentes, um laranja principal mais sofisticado e cores de status próprias.
- Duas personalidades sobre os mesmos tokens:
  - **Loja:** apetitosa e acolhedora, com fotos em destaque, tipografia com personalidade e mobile-first.
  - **Operação** (admin, fila, garçom, cozinha): densa, calma e legível de longe, com alto contraste, alvos de toque grandes e modo escuro para a cozinha.
- A fase 0 entrega uma página `/_design` (guia vivo) com 2 ou 3 direções aplicadas a telas-chave. **Você escolhe a direção antes de seguirmos para o resto.**

**Tokens**
- Cor (marca, neutros, superfícies, status do pedido), tipografia (escala e pesos), espaçamento, raios, sombras e elevação.
- **Motion:** durações (rápida ~150 ms, base ~220 ms, ênfase ~320 ms) e curvas padrão.
- Modo claro e escuro.

**Componentes padronizados** (shadcn/ui como base, personalizados com os tokens)
- Button (primário, secundário, fantasma, destrutivo; tamanhos; com ícone; estado de carregamento), IconButton, grupo de ações.
- Campos, máscara de telefone, CEP, CPF e moeda.
- Dialog, Sheet e Drawer (sacola e produto como gaveta inferior no celular), ConfirmDialog para ações destrutivas.
- Badge de status do pedido com **a mesma cor e o mesmo rótulo em toda parte** (fila, cozinha, pedidos, acompanhamento).
- Card de pedido, tabela de dados do admin, EmptyState, Skeleton, Toast com "Desfazer", Stepper do acompanhamento, PriceTag, QuantityStepper.
- Regra de ações: uma ação primária por tela ou card; destrutivas sempre com confirmação; reversíveis com desfazer em vez de confirmação.

**Motion com propósito** (nada decorativo que atrase a operação)
- Itens entrando na sacola, contador da sacola pulsando, abrir e fechar gavetas e modais.
- Cards da fila **deslizando entre colunas** quando o status muda; pedido novo chegando com destaque.
- Linha do tempo do acompanhamento avançando; números do dashboard animando.
- Skeletons em vez de spinners; transições curtas entre rotas.
- Só `transform` e `opacity`; respeito total a `prefers-reduced-motion`.

**Melhorias de UX** (mantendo os mesmos fluxos)
- Botão da sacola fixo com total sempre visível no celular; checkout em etapas claras, com validação no campo e sem perder o que foi digitado.
- Atualização otimista: avançar status na fila e na cozinha responde na hora.
- Atalhos de teclado na fila e na cozinha; tela cheia na cozinha.
- Estados de carregando, vazio e erro desenhados para cada tela.

**Velocidade é requisito** (orçamento, não sugestão)
- Loja: JS inicial ≤ ~150 KB gzip; admin e salão carregados sob demanda.
- Fotos com `loading="lazy"`, tamanhos fixos (sem pular a tela) e placeholders.
- Interações respondendo em < 100 ms.

**Skills que vamos usar em cada etapa**
- `frontend:frontend-design` e `frontend:emil-design-eng`: direção visual, detalhes de polimento e decisões de animação.
- `design:design-system`: tokens e documentação dos componentes. `frontend:shadcn`: base dos componentes.
- `frontend:framer-motion-animator` e `frontend:animation-vocabulary`: animações com Motion.
- `frontend:register-component`: registrar cada componente base em `docs/components/`, para todas as telas reutilizarem.
- Revisões ao fim de cada fase: `web-quality:web-design-guidelines`, `design:accessibility-review`, `design:ux-copy` (textos, erros, estados vazios), `frontend:improve-animations` e `performance:vercel-react-best-practices`.

## Telas (paridade com o que existe hoje)

**Loja (cliente)**
- `/`: cardápio por categoria com abas fixas, banner de loja aberta/fechada, tempos e taxa, produtos esgotados, "a partir de" quando há opção paga.
- Modal de produto: grupos de opções (mín/máx/grátis até), quantidade, observação por item, preço ao vivo.
- Sacola persistente: soma itens iguais, mostra pedido mínimo.
- `/cardapio`: só consulta (QR Code e TV).
- `/checkout`: entrega ou retirada; CEP mockado com bairro e taxa automáticos ou escolha manual do bairro; cidade não atendida; formas de pagamento conforme a loja; troco; CPF e e-mail só para Pix.
- `/pedido/:token`: linha do tempo por tipo (entrega, retirada, mesa), QR e copia-e-cola do Pix com expiração, link do cartão online, atualização a cada 5 s que para no status final, itens e totais.

**Admin**
- Login com proteção de rota, trocar senha, sair; menu igual ao `_AdminLayout.cshtml`.
- Visão geral do dia: pedidos, faturamento, ticket médio, em andamento, aguardando pagamento, cancelados, mais vendidos, últimos pedidos.
- Fila: colunas Novos → Em preparo → Prontos → Em rota; atualiza a cada 5 s; alerta sonoro (destravado no primeiro clique); impressão automática de novos pedidos (preferência salva no navegador); "Chamar motoboy" pelo WhatsApp; badge de status do agente.
- Pedidos: lista por data e status; detalhe com cliente, endereço e mapa, itens, pagamento, motoboy, avançar, mudar status, cancelar, marcar pago, "Avisar cliente no WhatsApp".
- Impressão: cupom 80 mm (porte de `Pedidos/Imprimir.cshtml`) com CSS de impressão e iframe invisível para a impressão automática; conta da mesa.
- Cadastros: produtos (lista com alternar ativo e esgotado, formulário com foto JPG/PNG/WEBP até 3 MB), categorias (ordem, ativa), bairros (cidade, taxa, busca, alternar), motoboys.
- Configurações: loja, entrega e retirada, formas de pagamento, horários por dia com controle automático, Mercado Pago, impressora do servidor e teste, agente de impressão (download e status).

**Salão**
- Mesas: grade com status (livre, ocupada, conta pedida), cadastrar, excluir, comanda, fechar conta com forma de pagamento, liberar, imprimir conta.
- Modo Garçom (mobile-first): escolher mesa, cardápio com opções, itens a lançar, enviar para a cozinha.
- Cozinha (KDS): tela cheia, filtros Todos, Mesas e Delivery, Iniciar preparo, Marcar pronto, Finalizar, atualização a cada 4 s.

Fora do escopo (não existe hoje): editar grupos de opções do produto no admin (hoje só vêm do seed), tempo real, PWA, multi-loja, ligar no backend. Ficam como próximos passos.

## Ordem de entrega

0. **Direção visual:** tokens, componentes base, motion e a página `/_design` com as direções aplicadas a 3 telas-chave (cardápio no celular, fila, cozinha). **Ponto de decisão com você.**
1. **Base:** scaffold Vite, Tailwind e shadcn, rotas e layouts, pasta `mock/` (banco, regras e dados iniciais) com testes Vitest das regras.
2. **Loja:** cardápio, modal de opções, sacola, cardápio digital, checkout e acompanhamento com o simulador de Pix.
3. **Admin, núcleo:** login, layout, visão geral, fila (som, impressão automática, WhatsApp), pedidos e cupom 80 mm.
4. **Cadastros:** produtos com foto, categorias, bairros, motoboys, configurações e trocar senha.
5. **Salão:** mesas e comanda, modo garçom, cozinha (KDS).

Na prática, as fases 0 e 1 andam juntas: a base técnica é pequena e a direção visual precisa dela para rodar. Cada seção do `mock/` é criada junto com a fase que a usa.

Cada fase termina navegável e testável, e passa pelas revisões de design, acessibilidade e performance antes da próxima.

## Verificação

- `pnpm dev` na raiz do projeto (porta 5173). Não precisa do backend rodando.
- `pnpm build` (inclui `tsc`) e `pnpm test` (Vitest nas regras de preço, troco, pedido mínimo, formas permitidas e etapas) sem erros.
- Roteiro no painel do navegador, de ponta a ponta:
  1. Montar pedido com opções pagas e observação; conferir preço e pedido mínimo.
  2. Checkout com entrega: CEP, bairro, taxa, Pix com CPF e e-mail; acompanhar até o Pix ser "pago".
  3. O pedido aparece na fila com alerta; avançar até "Em rota"; chamar motoboy; imprimir o cupom.
  4. Lançar itens numa mesa pelo garçom; ver na cozinha; marcar pronto; fechar a conta e liberar a mesa.
  5. Mudar configurações (fechar a loja, desligar Pix) e ver o efeito na loja.
  6. Testar no tamanho de celular (loja e garçom) e em tela cheia (cozinha).
- Qualidade visual e de UX, ao fim de cada fase:
  - Comparar lado a lado com o front atual (`localhost:5080`) tela por tela: nenhuma funcionalidade a menos.
  - Revisões com as skills de design, acessibilidade (WCAG AA, contraste, teclado, foco) e animação.
  - Conferir com `prefers-reduced-motion` ligado.
  - Medir o bundle da loja contra o orçamento (`vite build` + relatório de tamanho) e o Lighthouse mobile da loja.
