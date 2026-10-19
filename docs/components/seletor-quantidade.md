# SeletorQuantidade

**Caminho:** `src/components/ui/seletor-quantidade.tsx`
**Exporta:** `SeletorQuantidade`

## O que é
Botões − e + com a quantidade no meio, anunciada para leitor de tela (`role="status"`), e o número trocando com uma animação curta.

## Quando usar
- Quantidade de item no modal do produto, na sacola, no garçom e em opções com quantidade.

## Props
| Prop | Tipo | Obrigatória | Padrão | Para que serve |
|---|---|---|---|---|
| `valor` | `number` | sim | — | Quantidade atual. |
| `aoMudar` | `(valor: number) => void` | sim | — | Recebe o novo valor. |
| `rotulo` | `string` | sim | — | Nome do item: vira "Aumentar quantidade de <rotulo>". |
| `min` | `number` | não | `1` | Abaixo disso "Diminuir" desabilita. Use `0` para opções. |
| `max` | `number` | não | `50` | Limite do backend (50 por item). |
| `tamanho` | `"sm" \| "md"` | não | `"md"` | `sm` em listas densas. |
| `className` | `string` | não | — | Layout. |

## Exemplos
```tsx
// src/components/ui/dominio.test.tsx
<SeletorQuantidade valor={2} aoMudar={aoMudar} rotulo="Pastel de Carne" />
```

## Dependências
- `Button`, `motion/react` (`m`, `AnimatePresence`), `transicao` (`src/lib/motion.ts`)
