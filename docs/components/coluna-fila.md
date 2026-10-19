# ColunaFila

**Caminho:** `src/features/admin/fila/ColunaFila.tsx`
**Exporta:** `ColunaFila`, `COLUNAS_FILA`

## O que é
Coluna da fila com marcador de cor, título, contagem e estado vazio. `COLUNAS_FILA` define as 4 colunas (Novos, Em preparo, Prontos, Em rota) e quais status entram em cada uma.

## Props
| Prop | Tipo | Obrigatória | Padrão | Para que serve |
|---|---|---|---|---|
| `titulo` | `string` | sim | — | Nome da coluna (vira o `aria-label` da seção). |
| `quantidade` | `number` | sim | — | Contagem exibida; `0` mostra o texto de vazio. |
| `cor` | `string` | sim | — | Classe de cor do marcador. |
| `vazio` | `string` | sim | — | Texto para quando não há pedidos. |
| `children` | `ReactNode` | sim | — | Os cards. |
| `className` | `string` | não | — | Layout. |

## Exemplos
```tsx
// src/features/design/telas/TelasChave.tsx
<ColunaFila key={coluna.id} titulo={coluna.titulo} quantidade={daColuna.length} cor={coluna.cor} vazio={coluna.vazio}>
  {daColuna.map((p) => <CartaoPedido key={p.id} pedido={p} agora={agora} aoAvancar={() => {}} />)}
</ColunaFila>
```
