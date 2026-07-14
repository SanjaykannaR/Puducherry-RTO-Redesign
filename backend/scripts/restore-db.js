#!/usr/bin/env node
// ── Database Restore Script ──
// Restores dev.db from a backup file.
// Usage:
//   node scripts/restore-db.js                        (restores latest backup)
//   node scripts/restore-db.js dev-2026-07-14T12.db   (restores specific backup)

const fs = require('fs');
const path = require('path');

const DB_PATH = path.resolve(__dirname, '../prisma/dev.db');
const BACKUP_DIR = path.resolve(__dirname, '../backups');

if (!fs.existsSync(BACKUP_DIR)) {
  console.error('Error: No backups directory found. Run backup-db.js first.');
  process.exit(1);
}

const arg = process.argv[2];
let backupFile;

if (arg) {
  // Specific backup requested
  backupFile = arg.endsWith('.db') ? arg : `${arg}.db`;
  backupFile = path.join(BACKUP_DIR, backupFile);
} else {
  // Find latest backup
  const backups = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('dev-') && f.endsWith('.db'))
    .sort()
    .reverse();

  if (backups.length === 0) {
    console.error('Error: No backups found. Run backup-db.js first.');
    process.exit(1);
  }
  backupFile = path.join(BACKUP_DIR, backups[0]);
  console.log(`Latest backup: ${backups[0]}`);
}

if (!fs.existsSync(backupFile)) {
  console.error(`Error: Backup file not found: ${backupFile}`);
  process.exit(1);
}

// Restore
fs.copyFileSync(backupFile, DB_PATH);
console.log(`Restored: ${path.basename(backupFile)} → dev.db`);
console.log('Done! Restart the backend to use the restored database.');
