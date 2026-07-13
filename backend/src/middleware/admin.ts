// ── Admin-only authorization middleware ──
// Used alongside `authenticate` to restrict routes to admin users only
// Fetches the current role from the DB to avoid stale JWT role claims
// (e.g. a user promoted to admin after their JWT was minted)

import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import prisma from '../services/prisma';

export async function adminOnly(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  if (!req.user?.userId) {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId }, select: { role: true } });
    if (user?.role !== 'ADMIN') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }
    // Update req.user.role to current DB value so downstream handlers see it
    req.user.role = user.role;
    next();
  } catch {
    res.status(500).json({ error: 'Failed to verify admin role' });
  }
}
