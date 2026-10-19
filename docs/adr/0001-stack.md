# Front em Vite + React (SPA), não Next.js

O backend é ASP.NET Core 10 no IIS e o produto não precisa de indexação: o cliente chega pelo link do WhatsApp, Instagram ou QR Code. Escolhemos Vite + React 19 + TypeScript como SPA estática, porque ela pode ser servida pelo próprio ASP.NET no futuro, sem um servidor Node ao lado do .NET. Com isso, o Next.js perderia justamente o que tem de melhor (renderização no servidor).

## Considered Options
- **Next.js**: exigiria Node no Windows Server ou `output: export`, que anula a vantagem dele.
- **Vue ou Svelte**: válidos, mas o ecossistema do React (shadcn/ui, TanStack, Motion) pesou mais.
