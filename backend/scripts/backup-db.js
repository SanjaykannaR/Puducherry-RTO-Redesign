#!/usr/bin/env node
// ── Database Backup Script ──
// Copies dev.db to backend/backups/dev-{timestamp}.db
// Keeps only the last 10 backups.
// Usage: node scripts/backup-db.js

const fs = require('fs');
const path = require('path');

const DB_PATH = path.resolve(__dirname, '../prisma/dev.db');
const BACKUP_DIR = path.resolve(__dirname, '../backups');
const MAX_BACKUPS = 10;

if (!fs.existsSync(DB_PATH)) {
  console.error('Error: dev.db not found at', DB_PATH);
  process.exit(1);
}

// Ensure backups directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log('Created backups directory:', BACKUP_DIR);
}

// Generate timestamped filename
const now = new Date();
const ts = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
const backupName = `dev-${ts}.db`;
const backupPath = path.join(BACKUP_DIR, backupName);

// Copy the database
fs.copyFileSync(DB_PATH, backupPath);
console.log(`Backup created: ${backupName}`);

// Clean up old backups (keep last MAX_BACKUPS)
const backups = fs.readdirSync(BACKUP_DIR)
  .filter(f => f.startsWith('dev-') && f.endsWith('.db'))
  .sort()
  .reverse();

if (backups.length > MAX_BACKUPS) {
  const toDelete = backups.slice(MAX_BACKUPS);
  for (const old of toDelete) {
    fs.unlinkSync(path.join(BACKUP_DIR, old));
    console.log(`Deleted old backup: ${old}`);
  }
}

console.log(`Total backups: ${Math.min(backups.length, MAX_BACKUPS)}`);
console.log('Done!');
