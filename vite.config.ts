/// <reference types="vitest/config" />
import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { cn } from "cn/vite"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  // cn/vite compila só as classes do Tailwind que o projeto usa (bundle menor que as tabelas completas).
  plugins: [
    react(),
    tailwindcss(),
    cn({
      out: "src/lib/cn-tables.mjs",
      content: ["src/**/*.{ts,tsx}", "index.html"],
      css: "src/index.css",
    }),
  ],
  // Pré-compila as telas ao subir o dev server (primeira visita e E2E mais rápidos).
  server: { warmup: { clientFiles: ["./src/main.tsx", "./src/features/**/*.tsx"] } },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.{ts,tsx}", "src/main.tsx", "src/**/*.d.ts"],
      // Valor medido no setup, arredondado para baixo. A meta só sobe.
      thresholds: {
        statements: 86,
        branches: 80,
        functions: 82,
        lines: 87,
      },
    },
  },
})
