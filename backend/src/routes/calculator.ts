import { Router, Request, Response } from 'express';

const router = Router();

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
