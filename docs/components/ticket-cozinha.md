# TicketCozinha

**Caminho:** `src/features/admin/cozinha/TicketCozinha.tsx`
**Exporta:** `TicketCozinha`, `urgenciaDoPedido`, `Urgencia`

## O que é
Ticket da cozinha (KDS) feito para ler de longe: número grande, origem, tempo de espera com cor de urgência (atenção aos 15 min, atrasado aos 30 min), itens grandes com opções e observação em destaque, e botão `xl` com a próxima etapa.

## Props
| Prop | Tipo | Obrigatória | Padrão | Para que serve |
|---|---|---|---|---|
| `pedido` | `Pedido` | sim | — | Pedido completo. |
| `agora` | `Date` | não | `new Date()` | Referência do tempo e da urgência. |
| `aoAvancar` | `(pedido: Pedido) => void` | não | — | Sem ela, não aparece o botão. |
| `avancando` | `boolean` | não | `false` | Desabilita o botão durante a ação. |
| `className` | `string` | não | — | Layout. |

## Exemplos
```tsx
// src/features/design/telas/TelasChave.tsx
<TicketCozinha key={p.id} pedido={p} agora={agora} aoAvancar={() => {}} />
```
