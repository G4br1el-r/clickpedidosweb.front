# CabecalhoLoja

**Caminho:** `src/features/loja/cardapio/CabecalhoLoja.tsx`
**Exporta:** `CabecalhoLoja`

## O que é
Topo da loja com o **toldo listrado** (o elemento marcante da direção Feira), logo, aberto ou fechado, nome, slogan e os cartões de entrega, retirada e pedido mínimo. Com a loja fechada, mostra a mensagem de fechada.

## Props
| Prop | Tipo | Obrigatória | Padrão | Para que serve |
|---|---|---|---|---|
| `loja` | `LojaPublica` | sim | — | Dados públicos da loja (`src/mock/loja/publica.ts`). |
| `nivelTitulo` | `1 \| 2` | não | `1` | Use `2` quando estiver dentro de outra página (ex.: `/_design`). |
| `className` | `string` | não | — | Layout. |

## Exemplos
```tsx
// src/features/design/telas/TelasChave.tsx
<CabecalhoLoja loja={data.loja} nivelTitulo={2} />
```
