# Componentes base

Componentes que são padrão neste projeto. Antes de criar um componente novo, procure aqui. Se um destes resolve o caso, use; se resolve em parte, estenda com prop opcional seguindo a seção "Como estender" da doc.

Para registrar um componente novo: diga "registra componente <arquivo>".

| Componente | Caminho | Use para | Doc |
|---|---|---|---|
| BadgeStatus | `src/components/ui/badge-status.tsx` | Status do pedido com cor e rótulo únicos | [badge-status.md](badge-status.md) |
| Button | `src/components/ui/button.tsx` | Toda ação clicável, inclusive `xl` para cozinha e garçom | [button.md](button.md) |
| CabecalhoLoja | `src/features/loja/cardapio/CabecalhoLoja.tsx` | Topo da loja com o toldo e os dados de entrega | [cabecalho-loja.md](cabecalho-loja.md) |
| CartaoPedido | `src/features/admin/fila/CartaoPedido.tsx` | Pedido em card na operação, com a próxima ação | [cartao-pedido.md](cartao-pedido.md) |
| ConfirmarExclusao | `src/features/admin/componentes/ConfirmarExclusao.tsx` | Confirmação das ações destrutivas do admin | [confirmar-exclusao.md](confirmar-exclusao.md) |
| ColunaFila | `src/features/admin/fila/ColunaFila.tsx` | Colunas da fila (Novos, Em preparo, Prontos, Em rota) | [coluna-fila.md](coluna-fila.md) |
| FotoProduto | `src/components/ui/foto-produto.tsx` | Foto com tamanho fixo ou placeholder com a inicial | [foto-produto.md](foto-produto.md) |
| Padrões shadcn | `src/components/ui/` | Dialog, Drawer, Sheet, AlertDialog, Empty, Skeleton, Toaster, ToggleGroup, Field | [padroes-shadcn.md](padroes-shadcn.md) |
| Preco | `src/components/ui/preco.tsx` | Valores em reais, "A partir de" e preço riscado | [preco.md](preco.md) |
| ProdutoLinha | `src/features/loja/cardapio/ProdutoLinha.tsx` | Linha do cardápio (loja, cardápio digital, garçom) | [produto-linha.md](produto-linha.md) |
| SeletorQuantidade | `src/components/ui/seletor-quantidade.tsx` | Quantidade com − e + acessíveis | [seletor-quantidade.md](seletor-quantidade.md) |
| TabelaDados | `src/components/ui/tabela-dados.tsx` | Tabelas do admin com ordenação e linha clicável | [tabela-dados.md](tabela-dados.md) |
| TicketCozinha | `src/features/admin/cozinha/TicketCozinha.tsx` | Ticket da cozinha com urgência pelo tempo | [ticket-cozinha.md](ticket-cozinha.md) |
