import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { adminOnly } from '../middleware/admin';
import prisma from '../services/prisma';

const router = Router();

router.use(authenticate, adminOnly);

router.get('/users', async (_req: AuthRequest, res: Response) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, mobile: true, name: true, role: true },
  });
  res.json({ users });
});

router.patch('/users/:id/role', async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const { role } = req.body;
  if (!role || !['CITIZEN', 'ADMIN'].includes(role)) {
    res.status(400).json({ error: 'Invalid role. Must be "CITIZEN" or "ADMIN"' });
    return;
  }
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, mobile: true, name: true, role: true },
    });
    res.json(user);
  } catch {
    res.status(404).json({ error: 'User not found' });
  }
});

router.delete('/users/:id', async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  try {
    await prisma.user.delete({ where: { id } });
    res.json({ message: 'User deleted' });
  } catch {
    res.status(404).json({ error: 'User not found' });
  }
});

router.get('/stats', async (_req: AuthRequest, res: Response) => {
  const [totalUsers, totalAppointments, totalApplications] = await Promise.all([
    prisma.user.count(),
    prisma.appointment.count(),
    prisma.application.count(),
  ]);
  res.json({ totalUsers, totalAppointments, totalApplications, totalChallans: 0 });
});

router.put('/fares', (_req: AuthRequest, res: Response) => {
  res.json({ message: 'Fares updated' });
});

router.put('/services', (_req: AuthRequest, res: Response) => {
  res.json({ message: 'Services updated' });
});

router.put('/directory', (_req: AuthRequest, res: Response) => {
  res.json({ message: 'Directory updated' });
});

export default router;
