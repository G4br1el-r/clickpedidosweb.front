# Preco

**Caminho:** `src/components/ui/preco.tsx`
**Exporta:** `Preco`

## O que é
Valor em reais com números tabulares (não "dançam" quando mudam), opcionalmente com "A partir de" e preço antigo riscado.

## Quando usar
- Qualquer preço exibido ao cliente ou na operação.

## Quando NÃO usar
- Texto corrido e mensagens: use `formatarMoeda` de `src/lib/moeda.ts`.

## Props
| Prop | Tipo | Obrigatória | Padrão | Para que serve |
|---|---|---|---|---|
| `valor` | `number` | sim | — | Valor em reais. |
| `aPartirDe` | `boolean` | não | `false` | Produto com opção paga obrigatória (regra `temPrecoAPartirDe`). |
| `valorAntigo` | `number` | não | — | Preço anterior, riscado, com "De … por" para leitor de tela. |
| demais | `ComponentProps<"span">` | não | — | `className` etc. |

## Exemplos
```tsx
// src/features/loja/cardapio/ProdutoLinha.tsx
<Preco valor={produto.preco} aPartirDe={temPrecoAPartirDe(produto)} />
```

```tsx
// src/features/design/telas/TelasChave.tsx
<Preco valor={42} className="text-primary-foreground" />
```

## Dependências
- `formatarMoeda` (`src/lib/moeda.ts`)
