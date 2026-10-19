# ProdutoLinha

**Caminho:** `src/features/loja/cardapio/ProdutoLinha.tsx`
**Exporta:** `ProdutoLinha`

## O que é
Uma linha do cardápio: nome, descrição em até 2 linhas, preço (ou "Esgotado") e foto à direita. Vira botão quando dá para pedir.

## Quando usar
- Cardápio da loja, cardápio digital (sem `aoAbrir`) e cardápio do garçom.

## Props
| Prop | Tipo | Obrigatória | Padrão | Para que serve |
|---|---|---|---|---|
| `produto` | `Produto` | sim | — | Produto do cardápio. |
| `aoAbrir` | `(produto: Produto) => void` | não | — | Sem ela, a linha é só de consulta (não vira botão). |
| `bloqueado` | `boolean` | não | `false` | Loja fechada: mostra, mas não deixa abrir. |
| `modoSalao` | `boolean` | não | `false` | Garçom: esgotado ou oculto online continua lançável, com as marcas "Esgotado online" e "Oculto online". |

## Exemplos
```tsx
// src/features/admin/garcom/PaginaGarcom.tsx
<ProdutoLinha key={p.id} produto={p} aoAbrir={setAberto} modoSalao />
```

```tsx
// src/features/design/telas/TelasChave.tsx
<ProdutoLinha key={p.id} produto={p} aoAbrir={() => {}} />
```

## Dependências
- `FotoProduto`, `Preco`, `temPrecoAPartirDe`
