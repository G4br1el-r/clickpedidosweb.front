# FotoProduto

**Caminho:** `src/components/ui/foto-produto.tsx`
**Exporta:** `FotoProduto`

## O que é
Foto do produto com tamanho fixo (a tela não pula), `loading="lazy"` e `alt` com o nome. Sem foto, mostra um placeholder com a inicial num tom quente da marca.

## Props
| Prop | Tipo | Obrigatória | Padrão | Para que serve |
|---|---|---|---|---|
| `produto` | `Pick<Produto, "id" \| "nome" \| "imagemUrl">` | sim | — | Dados da foto. |
| `tamanho` | `"sm" \| "md" \| "lg"` | sim | — | 56 px, 96 px ou largura total em 4:3. |
| `prioridade` | `boolean` | não | `false` | Carrega na hora (foto acima da dobra, ex.: modal aberto). |
| `className` | `string` | não | — | Layout e filtros (ex.: `grayscale` no esgotado). |

## Exemplos
```tsx
// src/features/loja/cardapio/ProdutoLinha.tsx
<FotoProduto produto={produto} tamanho="md" className={cn(esgotado && "grayscale")} />
```

## Dependências
- Fotos do Unsplash por URL (`src/mock/cardapio/fotos.ts`), com crédito em `creditosFotos`.
