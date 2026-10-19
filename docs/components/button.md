# Button

**Caminho:** `src/components/ui/button.tsx`
**Exporta:** `Button`, `buttonVariants`

## O que é
Botão base (shadcn, estilo nova) ajustado para o ClickPedido: alvos maiores para toque, peso semibold, "press" com `scale(0.97)` e transição só de cor e transform nos tokens de motion.

## Quando usar
- Toda ação clicável. Uma **ação principal** (`default` ou `sucesso`) por tela ou card.
- `sucesso`: ações que concluem etapa (Marcar como pronto). `destructive`: excluir e cancelar, sempre com `AlertDialog`.
- `xl` (56 px): cozinha e garçom, onde se toca rápido e de pé.

## Quando NÃO usar
- Navegação pura: use `Link`. Só envolva com `<Button asChild>` quando precisar do visual de botão.

## Props
| Prop | Tipo | Obrigatória | Padrão | Para que serve |
|---|---|---|---|---|
| `variant` | `"default" \| "sucesso" \| "secondary" \| "outline" \| "ghost" \| "destructive" \| "link"` | não | `"default"` | Peso visual da ação. |
| `size` | `"xs" \| "sm" \| "default" \| "lg" \| "xl" \| "icon" \| "icon-xs" \| "icon-sm" \| "icon-lg"` | não | `"default"` (40 px) | Altura e respiro. |
| `asChild` | `boolean` | não | `false` | Renderiza o filho (ex.: `Link`) com o visual do botão. |
| demais | `ComponentProps<"button">` | não | — | `onClick`, `disabled`, `type`… |

## Exemplos
```tsx
// src/features/admin/cozinha/TicketCozinha.tsx
<Button size="xl" className="w-full" variant={pedido.status === "EmPreparo" ? "sucesso" : "default"} onClick={() => aoAvancar(pedido)}>
  {acao}
</Button>
```

```tsx
// src/app/PaginaNaoEncontrada.tsx
<Button asChild size="lg">
  <Link to="/">Voltar ao cardápio</Link>
</Button>
```

```tsx
// src/features/design/secoes/Fundamentos.tsx: carregando não tem prop própria, compõe com Spinner
<Button disabled>
  <Spinner data-icon="inline-start" />
  Enviando pedido
</Button>
```

## Como estender
- Ícones dentro do botão usam `data-icon="inline-start|inline-end"`, sem classe de tamanho.
- Carregando: `disabled` + `Spinner` (não existe `isLoading`).
- Variante nova só para um papel novo de ação; cor nova vem de token, nunca de classe crua.

## Dependências
- `class-variance-authority`, `radix-ui` (Slot)
