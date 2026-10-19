# Padrões shadcn do projeto

**Caminho:** `src/components/ui/` (base Radix, estilo `radix-nova`, ícones lucide)

## O que é
Os componentes do shadcn adotados como padrão, com as regras de uso do projeto. Leia também a skill `frontend:shadcn` antes de compor.

| Componente | Use para |
|---|---|
| `Dialog` | Modal no desktop (produto, formulários curtos). Sempre com `DialogTitle`. |
| `Drawer` (vaul) | Gaveta inferior no celular: produto e sacola. Sempre com `DrawerTitle`. |
| `Sheet` | Painel lateral no admin (detalhe rápido, filtros). |
| `AlertDialog` | **Toda ação destrutiva** (excluir, cancelar pedido). |
| `Empty` | Estado vazio, sempre dizendo o que fazer. |
| `Skeleton` | Carregamento. Nada de spinner solto na tela inteira. |
| `Toaster` (sonner) | Avisos. Ação reversível usa toast com "Desfazer". Já está montado em `src/app/Providers.tsx`. |
| `ToggleGroup` | Escolha entre 2 e 7 opções (tema, direção, filtros, entrega ou retirada). |
| `Field`, `Input`, `Textarea`, `RadioGroup`, `Checkbox`, `Switch`, `Select` | Formulários: `FieldGroup` + `Field`, validação com `data-invalid` + `aria-invalid`. |
| `Tabs` | Abas de conteúdo (configurações). |
| `Table` | Listas tabulares do admin (com TanStack Table quando houver ordenação ou filtro). |

## Exemplos
```tsx
// src/features/design/PaginaDesign.tsx
<ToggleGroup type="single" variant="outline" value={direcao} onValueChange={escolher} aria-label="Direção visual">
  {DIRECOES.map((d) => <ToggleGroupItem key={d.id} value={d.id} className="px-3">{d.nome}</ToggleGroupItem>)}
</ToggleGroup>
```

## Como estender
- Para atualizar um componente do shadcn, rode `pnpm dlx shadcn@latest add <nome> --dry-run` e `--diff` antes. Nunca use `--overwrite` sem revisar.
- O `ToggleGroup` e o `Toggle` foram ajustados: o selecionado fica em `bg-foreground`, com alturas de 36 e 44 px.
- O `sonner` usa o `useTema` do projeto, não o `next-themes`.
