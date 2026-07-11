// ── Admin-only authorization middleware ──
// Used alongside `authenticate` to restrict routes to admin users only
// Checks that req.user.role === 'admin' after authentication has run

import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export function adminOnly(req: AuthRequest, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'ADMIN') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
}
