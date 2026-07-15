# ── Production Deploy Script ──
# Usage: node scripts/deploy.js
# Runs Prisma migrations + seeds (if first deploy) + starts server.
# Set DATABASE_URL in .env.production before running.

const { execSync } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function run(cmd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { cwd: ROOT, stdio: 'inherit' });
}

console.log('=== RTO Backend Production Deploy ===\n');

// 1. Build TypeScript (if using tsc output)
console.log('Step 1: Applying database migrations...');
run('npx prisma migrate deploy');

// 2. Generate Prisma Client
console.log('\nStep 2: Generating Prisma Client...');
run('npx prisma generate');

// 3. Seed (only on first deploy — idempotent via upserts)
console.log('\nStep 3: Seeding database...');
try {
  run('npx prisma db seed');
} catch (e) {
  console.log('Seed skipped (may already exist)');
}

// 4. Start server
console.log('\nStep 4: Starting server...');
run('node src/index.js');
