# TabelaDados

**Caminho:** `src/components/ui/tabela-dados.tsx`
**Exporta:** `TabelaDados`

## O que é
A tabela padrão do admin sobre o TanStack Table **v8**: ordena ao clicar no cabeçalho (com `aria-sort`), alinha à direita as colunas com `meta: { direita: true }` e, se receber `aoAbrir`, torna a linha clicável e acessível por teclado (Enter e espaço).

## Quando usar
- Toda lista tabular do admin: pedidos, categorias, bairros, motoboys.
- Não use para listas agrupadas sem ordenação (ex.: produtos por categoria usa `Table` direto).

## Props
| Prop | Tipo | Obrigatória | Padrão | Para que serve |
|---|---|---|---|---|
| `dados` | `T[]` | sim | — | Linhas. |
| `colunas` | `ColumnDef<T, any>[]` | sim | — | Colunas do TanStack. `enableSorting: false` deixa a coluna fixa; `meta.direita` alinha à direita. |
| `ordemInicial` | `SortingState` | não | `[]` | Ordenação ao abrir. |
| `aoAbrir` | `(linha: T) => void` | não | — | Linha clicável (cursor, `tabIndex`, teclado). |
| `rotuloLinha` | `(linha: T) => string` | não | — | `aria-label` da linha clicável. |
| `idLinha` | `(linha: T) => string` | não | índice | Chave estável da linha. |
| `classeLinha` | `(linha: T) => string \| undefined` | não | — | Destaque por linha (ex.: inativo esmaecido). |

## Exemplos
```tsx
// src/features/admin/pedidos/PaginaPedidos.tsx
<TabelaDados
  dados={pedidos}
  colunas={colunas}
  ordemInicial={[{ id: "criadoEm", desc: true }]}
  idLinha={(p) => String(p.id)}
  rotuloLinha={(p) => `Abrir pedido #${p.id}`}
  aoAbrir={(p) => navegar(`/admin/pedidos/${p.id}`)}
/>

// src/features/admin/bairros/PaginaBairros.tsx
<TabelaDados
  dados={bairros}
  colunas={colunas}
  idLinha={(b) => String(b.id)}
  classeLinha={(b) => (b.ativo ? undefined : "text-muted-foreground")}
/>
```

## Como estender
- Paginação ou filtro de coluna: prop opcional nova que liga o row model correspondente; sem a prop, o comportamento atual continua.

## Dependências
- `@tanstack/react-table` v8, `Table` (shadcn), lucide (`ArrowUpIcon`, `ArrowDownIcon`)
