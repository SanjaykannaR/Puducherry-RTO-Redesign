import { execSync } from 'child_process';
import { existsSync, unlinkSync, renameSync } from 'fs';
import { join } from 'path';

async function globalSetup() {
  const dbPath = join(__dirname, '..', 'dev.db');
  const testDbPath = join(__dirname, '..', 'test.db');
  // Rename instead of delete — avoids EBUSY on Windows when file is locked
  if (existsSync(dbPath)) {
    try { unlinkSync(dbPath); } catch { try { renameSync(dbPath, dbPath + '.bak'); } catch {} }
  }
  if (existsSync(testDbPath)) {
    try { unlinkSync(testDbPath); } catch {}
  }
  execSync('npx prisma db push', { cwd: join(__dirname, '..'), stdio: 'pipe' });
}

export default globalSetup;
