import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import prisma from '../services/prisma';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const applications = await prisma.application.findMany({
    where: { applicantId: req.user!.userId },
    include: { documents: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ applications });
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const app = await prisma.application.findFirst({
    where: { id, applicantId: req.user!.userId },
    include: { documents: true },
  });
  if (!app) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }
  res.json(app);
});

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { type, formData } = req.body;
  if (!type) {
    res.status(400).json({ error: 'Application type required' });
    return;
  }
  const app = await prisma.application.create({
    data: {
      type,
      status: 'SUBMITTED',
      formData: formData ? JSON.stringify(formData) : null,
      applicantId: req.user!.userId,
    },
  });
  res.status(201).json(app);
});

router.patch('/:id/cancel', authenticate, async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const app = await prisma.application.findFirst({
    where: { id, applicantId: req.user!.userId },
  });
  if (!app) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }
  const updated = await prisma.application.update({
    where: { id },
    data: { status: 'CANCELLED' },
  });
  res.json(updated);
});

export default router;
