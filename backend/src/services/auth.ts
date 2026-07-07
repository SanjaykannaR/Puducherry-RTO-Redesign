// ── Authentication services ──
// Centralized password hashing + JWT token utilities shared across the app
// Separation of concerns: routes never deal with bcrypt/jwt directly

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Fallback secret is only for dev; must be set via env in production
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-to-a-secure-random-string';
// 12 salt rounds = ~250ms per hash (strong against brute-force, acceptable UX latency)
const SALT_ROUNDS = 12;

// ── Password hashing ──
// Hash a plaintext password before storing it (never store plaintext)
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// ── Password verification ──
// Compare login attempt against stored bcrypt hash (constant-time comparison)
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ── JWT token generation ──
// Sign a short-lived token (24h) embedding userId + role for stateless auth
export function generateToken(payload: { userId: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

// ── JWT token verification ──
// Decode + validate a token. Returns null (not throws) on expiry / malformation
// so callers can return 401 uniformly
export function verifyToken(token: string): { userId: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
  } catch {
    return null;
  }
}
