# ConfirmarExclusao

**Caminho:** `src/features/admin/componentes/ConfirmarExclusao.tsx`
**Exporta:** `ConfirmarExclusao`

## O que é
O `AlertDialog` padrão das ações destrutivas do admin: título com a pergunta, descrição do efeito, "Voltar" e a ação em vermelho. O gatilho é o filho (`asChild`).

## Quando usar
- Excluir ou remover qualquer cadastro (produto, categoria, bairro, motoboy, mesa).
- Ação reversível não usa confirmação: use desfazer no aviso.

## Props
| Prop | Tipo | Obrigatória | Padrão | Para que serve |
|---|---|---|---|---|
| `titulo` | `string` | sim | — | A pergunta: "Excluir X?". |
| `descricao` | `ReactNode` | sim | — | O que acontece depois. |
| `rotuloAcao` | `string` | não | `"Excluir"` | Texto do botão vermelho (ex.: "Remover"). |
| `onConfirmar` | `() => void` | sim | — | Roda ao confirmar. |
| `children` | `ReactNode` | sim | — | O botão que abre a confirmação. |

## Exemplos
```tsx
// src/features/admin/motoboys/PaginaMotoboys.tsx
<ConfirmarExclusao
  titulo={`Remover ${m.nome}?`}
  descricao="Pedidos já entregues continuam com o nome dele. Para só tirar da lista da fila, desative em vez de remover."
  rotuloAcao="Remover"
  onConfirmar={() => exclusao.mutate()}
>
  <Button variant="ghost" size="icon-sm" aria-label={`Remover ${m.nome}`}>
    <Trash2Icon />
  </Button>
</ConfirmarExclusao>
```

## Dependências
- `AlertDialog` (shadcn)
