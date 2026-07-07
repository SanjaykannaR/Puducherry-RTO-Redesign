// ── Authentication & Authorization middleware ──
// Placed in front of any route that requires a logged-in user or specific role
// Extends Express Request to carry the authenticated user payload

import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/auth';

// Augmented request type — used downstream to access the authenticated user
export interface AuthRequest extends Request {
  user?: { userId: string; role: string };
}

// ── authenticate ──
// 1. Extracts Bearer token from the Authorization header
// 2. Verifies it via JWT (handles expiry, malformation)
// 3. Injects decoded payload into req.user for downstream handlers
// 4. Returns 401 if missing/invalid — no further middleware runs
export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  const token = header.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }
  req.user = payload;
  next();
}

// ── authorize ──
// Higher-order middleware factory: accepts allowed roles, returns middleware that
// checks req.user.role against them.
// Returns 403 if the authenticated user lacks the required role.
export function authorize(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}
