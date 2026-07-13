// promote-user.js — Promote a user to ADMIN by email
// Usage: node promote-user.js <email>
const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');

const email = process.argv[2];
if (!email) { console.error('Usage: node promote-user.js <email>'); process.exit(1); }

async function main() {
  const p = new PrismaClient({
    adapter: new PrismaLibSql({ url: 'file:' + require('path').resolve(__dirname, './dev.db') })
  });
  try {
    await p.user.update({ where: { email }, data: { role: 'ADMIN' } });
    console.log('PROMOTED', email);
  } catch(e) {
    console.error('FAILED:', e.message);
    process.exit(1);
  } finally {
    await p.$disconnect();
  }
}
main();
