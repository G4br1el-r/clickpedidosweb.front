# BadgeStatus

**Caminho:** `src/components/ui/badge-status.tsx`
**Exporta:** `BadgeStatus`, `corDoStatus`

## O que é
O status do pedido com **a mesma cor e o mesmo rótulo em toda parte**. O rótulo vem de `rotuloStatus` (porta de `Rotulos.cs`) e muda com o tipo (ex.: "Pronto para retirada").

## Quando usar
- Fila, cozinha, lista e detalhe de pedidos, acompanhamento do cliente, dashboard.

## Quando NÃO usar
- Situação do pagamento, que é outro conceito: use o texto de `resumoPagamento`.

## Props
| Prop | Tipo | Obrigatória | Padrão | Para que serve |
|---|---|---|---|---|
| `status` | `StatusPedido` | sim | — | Etapa do pedido. Fica exposto em `data-status`. |
| `tipo` | `TipoEntrega` | sim | — | Ajusta o rótulo de Pronto e Concluído. |
| `tamanho` | `"sm" \| "md"` | não | `"md"` | `sm` dentro de cards. |
| `className` | `string` | não | — | Layout. |

## Exemplos
```tsx
// src/features/admin/fila/CartaoPedido.tsx
<BadgeStatus status={pedido.status} tipo={pedido.tipo} tamanho="sm" />
```

```tsx
// src/features/design/secoes/Fundamentos.tsx
{STATUS_PEDIDO.map((s) => <BadgeStatus key={s} status={s} tipo="Entrega" />)}
```

## Como estender
- `corDoStatus(status)` devolve as classes de cor, para fundos e cabeçalhos da mesma família.
- Cores novas entram como tokens `--status-*` em `src/index.css`, no claro e no escuro.
