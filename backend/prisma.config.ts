// ── Prisma CLI config ──
// Used by `prisma generate`, `prisma db push`, `prisma migrate`.
// We use process.env directly (not env() from prisma/config) so
// `prisma generate` works even without DATABASE_URL set — generate
// doesn't need a live connection.

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL || "file:./dev.db",
  },
  migrations: {
    seed: "node seed.js",
  },
});
