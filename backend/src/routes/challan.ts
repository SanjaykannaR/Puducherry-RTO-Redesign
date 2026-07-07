import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const challans: Array<{
  id: string; userId: string; vehicleNo: string; offense: string;
  amount: number; date: string; status: string;
}> = [
  { id: '1', userId: '0', vehicleNo: 'PY-01-AB-1234', offense: 'No parking', amount: 500, date: '2026-06-15', status: 'PENDING' },
  { id: '2', userId: '0', vehicleNo: 'PY-01-CD-5678', offense: 'Helmet not worn', amount: 1000, date: '2026-06-20', status: 'PAID' },
];

router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  const userChallans = challans.filter((c) => c.userId === req.user!.userId || true);
  res.json({ challans: userChallans });
});

router.post('/:id/pay', authenticate, (req: AuthRequest, res: Response) => {
  const challan = challans.find((c) => c.id === req.params.id);
  if (!challan) {
    res.status(404).json({ error: 'Challan not found' });
    return;
  }
  challan.status = 'PAID';
  res.json({ message: 'Payment successful', challan });
});

export default router;
