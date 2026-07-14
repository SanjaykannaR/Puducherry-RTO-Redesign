// ── Scheduler routes: manual expiry alert triggers ──
// Provides endpoints to manually trigger expiry checks and view scheduler status.
// In a production app, this would use node-cron or Bull queue.

import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { adminOnly } from '../middleware/admin';
import { createExpiryAlerts, getExpiringItems } from '../services/notifications';

const router = Router();

// ── In-memory scheduler state ──
let lastExpiryCheck: Date | null = null;
let lastResult: { alertsCreated: number; usersNotified: number } | null = null;

// ── GET /api/admin/scheduler/status ──
// Returns scheduler status (last check time, result).
router.get('/status', authenticate, adminOnly, async (_req: AuthRequest, res: Response) => {
  res.json({
    lastExpiryCheck: lastExpiryCheck?.toISOString() || null,
    lastResult,
    nextScheduledCheck: 'Manual trigger only (demo mode)',
  });
});

// ── POST /api/admin/scheduler/expiry-check ──
// Manually triggers expiry alert generation for vehicles/licenses expiring in 30 days.
router.post('/expiry-check', authenticate, adminOnly, async (_req: AuthRequest, res: Response) => {
  try {
    const result = await createExpiryAlerts();
    lastExpiryCheck = new Date();
    lastResult = result;
    res.json({
      message: 'Expiry check completed',
      ...result,
      checkedAt: lastExpiryCheck.toISOString(),
    });
  } catch (err: any) {
    console.error('Expiry check failed:', err);
    res.status(500).json({ error: err.message || 'Expiry check failed' });
  }
});

// ── GET /api/admin/scheduler/expiring-items ──
// Preview items expiring within N days (default 30).
router.get('/expiring-items', authenticate, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const items = await getExpiringItems(days);
    res.json({ items, count: items.length, thresholdDays: days });
  } catch (err: any) {
    console.error('Failed to fetch expiring items:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch expiring items' });
  }
});

export default router;
