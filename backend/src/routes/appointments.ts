import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import prisma from '../services/prisma';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const appointments = await prisma.appointment.findMany({
    where: { applicantId: req.user!.userId },
    orderBy: { date: 'desc' },
  });
  res.json({ appointments });
});

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { date, timeSlot, purpose } = req.body;
  if (!date || !timeSlot || !purpose) {
    res.status(400).json({ error: 'date, timeSlot, purpose required' });
    return;
  }
  const appointment = await prisma.appointment.create({
    data: {
      date: new Date(date),
      timeSlot,
      purpose,
      status: 'SCHEDULED',
      applicantId: req.user!.userId,
    },
  });
  res.status(201).json(appointment);
});

router.patch('/:id/cancel', authenticate, async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const appt = await prisma.appointment.findFirst({
    where: { id, applicantId: req.user!.userId },
  });
  if (!appt) {
    res.status(404).json({ error: 'Appointment not found' });
    return;
  }
  const updated = await prisma.appointment.update({
    where: { id },
    data: { status: 'CANCELLED' },
  });
  res.json(updated);
});

export default router;
