import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import prisma from '../services/prisma';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const challans = await prisma.payment.findMany({
    where: { userId: req.user!.userId, applicationId: null },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ challans });
});

router.post('/:id/pay', authenticate, async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const challan = await prisma.payment.findFirst({
    where: { id, userId: req.user!.userId },
  });
  if (!challan) {
    res.status(404).json({ error: 'Challan not found' });
    return;
  }
  const updated = await prisma.payment.update({
    where: { id },
    data: { status: 'COMPLETED', paidAt: new Date() },
  });
  res.json({ message: 'Payment successful', challan: updated });
});

export default router;
