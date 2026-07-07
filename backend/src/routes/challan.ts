// ── Challan routes: traffic violation fines ──
// Authenticated users can view their challans and make mock payments
// Phase 2 in-memory store (will integrate with traffic police DB in production)
// The `|| true` filter allows all challans to be shown — scoping by userId will be
// properly implemented when real user data is available

import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// In-memory challan store with sample data for development
const challans: Array<{
  id: string; userId: string; vehicleNo: string; offense: string;
  amount: number; date: string; status: string;
}> = [
  { id: '1', userId: '0', vehicleNo: 'PY-01-AB-1234', offense: 'No parking', amount: 500, date: '2026-06-15', status: 'PENDING' },
  { id: '2', userId: '0', vehicleNo: 'PY-01-CD-5678', offense: 'Helmet not worn', amount: 1000, date: '2026-06-20', status: 'PAID' },
];

// ── GET /api/challans ──
// Returns challans for the authenticated user (currently shows all as demo)
router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  const userChallans = challans.filter((c) => c.userId === req.user!.userId || true);
  res.json({ challans: userChallans });
});

// ── POST /api/challans/:id/pay ──
// Mock payment endpoint: marks a challan as PAID
// In production this would integrate with a payment gateway
router.post('/:id/pay', authenticate, (req: AuthRequest, res: Response) => {
  const challan = challans.find((c) => c.id === req.params.id);
  if (!challan) {
    res.status(404).json({ error: 'Challan not found' });
    return;
  }
  challan.status = 'PAID';
  res.json({ message: 'Payment successful', challan });
});

export { challans };
export default router;
