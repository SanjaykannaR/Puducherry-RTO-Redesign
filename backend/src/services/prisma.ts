// ── Prisma client singleton ──
// Initialises the database connection using the PrismaLibSql adapter
// (Turso/LibSQL-compatible). The DATABASE_URL env var or a local dev.db
// file path determines the target.

import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:./dev.db',
});
const prisma = new PrismaClient({ adapter });

export default prisma;
