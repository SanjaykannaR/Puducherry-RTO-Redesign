// ── Authentication services ──
// Centralized password hashing + JWT token utilities shared across the app
// Separation of concerns: routes never deal with bcrypt/jwt directly

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Fallback secret is only for dev; must be set via env in production
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-to-a-secure-random-string';
// 12 salt rounds = ~250ms per hash (strong against brute-force, acceptable UX latency)
const SALT_ROUNDS = 12;

// ── Password hashing ──
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// ── Password verification ──
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ── Access token (short-lived: 15 min) ──
export function generateToken(payload: { userId: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}

// ── Refresh token (random 40-byte hex, stored as bcrypt hash in DB) ──
export function generateRefreshToken(): string {
  return crypto.randomBytes(40).toString('hex');
}

// ── Hash a refresh token for storage ──
export async function hashRefreshToken(token: string): Promise<string> {
  return bcrypt.hash(token, SALT_ROUNDS);
}

// ── Verify access token ──
// Returns null on expiry / malformation so callers can return 401 uniformly
export function verifyToken(token: string): { userId: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
  } catch {
    return null;
  }
}

// ── Verify refresh token (compares against stored bcrypt hash) ──
export async function verifyRefreshToken(token: string, storedHash: string | null): Promise<boolean> {
  if (!storedHash || !token) return false;
  return bcrypt.compare(token, storedHash);
}
