import { execSync } from 'child_process';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

async function globalSetup() {
  const dbPath = join(__dirname, '..', 'dev.db');
  const testDbPath = join(__dirname, '..', 'test.db');
  if (existsSync(dbPath)) unlinkSync(dbPath);
  if (existsSync(testDbPath)) unlinkSync(testDbPath);
  execSync('npx prisma db push', { cwd: join(__dirname, '..'), stdio: 'pipe' });
}

export default globalSetup;
