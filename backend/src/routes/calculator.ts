// ── Fee Calculator route ──
// Public endpoint: computes total fee for selected RTO services including 18% GST
// No auth required — calculators are typically public tools
// Uses a static fee database mirroring the fares route data

import { Router, Request, Response } from 'express';

const router = Router();

// Internal fee lookup table: serviceId → base fee (₹)
const feeDatabase: Record<string, number> = {
  'learners-license': 250,
  'permanent-license-mcwg': 500,
  'permanent-license-lmv': 500,
  'international-permit': 1000,
  'license-renewal': 400,
  'duplicate-license': 300,
  'new-registration-mc': 1500,
  'new-registration-lmv': 3000,
  'new-registration-commercial': 5000,
  'transfer-ownership': 500,
  'duplicate-rc': 300,
  'hypothecation': 200,
  'national-permit-goods': 5000,
  'national-permit-passenger': 7500,
  'state-permit': 2000,
  'tourist-permit': 3000,
};

// ── POST /api/calculator ──
// Accepts an array of service IDs, looks up each fee, sums them,
// applies 18% GST (rounded to nearest integer), and returns breakdown.
// Example: { services: ["learners-license", "duplicate-rc"] }
router.post('/', (req: Request, res: Response) => {
  const { services: selected } = req.body;
  if (!Array.isArray(selected) || selected.length === 0) {
    res.status(400).json({ error: 'Select at least one service' });
    return;
  }
  const items = selected.map((id: string) => ({
    id,
    fee: feeDatabase[id] || 0,
  }));
  const subtotal = items.reduce((sum: number, i: { fee: number }) => sum + i.fee, 0);
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  res.json({ items, subtotal, gst, total });
});

export default router;
