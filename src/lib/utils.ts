import { createCn } from "cn/engine"
// Gerado pelo plugin cn/vite a cada build e no dev (src/lib/cn-tables.mjs).
import tabelas from "./cn-tables.mjs"

export const cn = createCn(tabelas)
