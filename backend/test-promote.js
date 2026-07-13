// Quick test: register + promote to admin + verify login
const { execSync } = require('child_process');
const path = require('path');
const backendDir = __dirname;

async function main() {
  const suffix = Date.now();
  const email = `quicktest_${suffix}@test.com`;
  
  // Register
  const regRes = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'Test@123', name: 'Quick Test', mobile: '9876543210' }),
  });
  const regData = await regRes.json();
  console.log('Registered:', regData.user?.email, 'role:', regData.user?.role);

  // Build the Prisma promote script as a simple one-liner
  const emailJson = JSON.stringify(email);
  const prismaScript = [
    'const { PrismaClient } = require("@prisma/client");',
    'const { PrismaLibSql } = require("@prisma/adapter-libsql");',
    'const p = new PrismaClient({',
    '  adapter: new PrismaLibSql({ url: "file:" + require("path").resolve("./dev.db") })',
    '});',
    'p.user.update({ where: { email: ' + emailJson + ' }, data: { role: "ADMIN" } })',
    '  .then(() => { console.log("PROMOTED OK"); process.exit(0); })',
    '  .catch(e => { console.error("PROMOTE FAILED:", e.message); process.exit(1); })',
    '  .finally(() => p.$disconnect());',
  ].join('\n');

  try {
    const result = execSync('node -e ' + JSON.stringify(prismaScript), {
      cwd: backendDir, stdio: 'pipe', timeout: 30000
    });
    console.log('Promote output:', result.toString().trim());
  } catch(e) {
    console.error('Promote error:', e.stderr?.toString() || e.message);
    return;
  }

  // Login as admin
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'Test@123' }),
  });
  const loginData = await loginRes.json();
  console.log('Login role:', loginData.user?.role);
  console.log('Token present:', !!loginData.token);
}

main().catch(e => console.error(e));
