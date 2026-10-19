# CartaoPedido

**Caminho:** `src/features/admin/fila/CartaoPedido.tsx`
**Exporta:** `CartaoPedido`

## O que é
Card do pedido na operação. Mostra número, origem (entrega, retirada ou mesa), cliente, tempo de espera, itens, status, total, pagamento, aviso de troco e a ação principal com o texto da próxima etapa (`rotuloAcao`).

## Quando usar
- Fila do balcão, lista de pedidos do dia em cards, painéis com pedidos.

## Props
| Prop | Tipo | Obrigatória | Padrão | Para que serve |
|---|---|---|---|---|
| `pedido` | `Pedido` | sim | — | Pedido completo. |
| `agora` | `Date` | não | `new Date()` | Referência do tempo de espera (testes e relógio da tela). |
| `aoAvancar` | `(pedido: Pedido) => void` | não | — | Sem ela, não aparece o botão de avançar. |
| `avancando` | `boolean` | não | `false` | Desabilita o botão durante a ação. |
| `acoes` | `ReactNode` | não | — | Ações secundárias ao lado (imprimir, motoboy, menu). |
| `destaque` | `boolean` | não | `false` | Anel de destaque (pedido que acabou de chegar). |
| `className` | `string` | não | — | Layout. |

## Exemplos
```tsx
// src/features/design/telas/TelasChave.tsx
<CartaoPedido key={p.id} pedido={p} agora={agora} aoAvancar={() => {}} />
```

## Dependências
- `BadgeStatus`, `Button`, `rotuloAcao` e os helpers de `src/features/admin/pedidos/rotulos-ui.tsx`
