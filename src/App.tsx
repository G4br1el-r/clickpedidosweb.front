export function App() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background p-6 text-foreground">
      <img
        src="/img/logo-quadrado.jpg"
        alt=""
        width={96}
        height={96}
        className="size-24 rounded-2xl"
      />
      <h1 className="font-heading font-semibold text-3xl">Quiosque do Mineiro</h1>
      <p className="text-muted-foreground">Novo front do ClickPedido em construção.</p>
    </main>
  )
}
