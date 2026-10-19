# ClickPedido Front

Novo front do ClickPedido (Quiosque do Mineiro), com UI e UX repaginadas. Esta versão roda só com dados mockados.

- Ficha do projeto: [`docs/PROJECT.md`](docs/PROJECT.md)
- Plano e fases: [`docs/plano-v1.md`](docs/plano-v1.md)
- Decisões: [`docs/adr/`](docs/adr/)
- Glossário: [`GLOSSARY.md`](GLOSSARY.md)

## Rodar

```bash
pnpm install
pnpm dev
```

Abra `http://localhost:5173`.

- Admin (mock): `http://localhost:5173/admin`, login `admin` e senha `clickpedido` (só para teste; não é a senha do sistema real).
- Guia vivo do design: `http://localhost:5173/_design`.
- Os dados ficam no navegador (`localStorage`). Para voltar ao estado inicial, use "Resetar dados de teste" no admin.
