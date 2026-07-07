import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const appointments: Array<{
  id: string; applicantId: string; date: string; timeSlot: string;
  purpose: string; status: string; notes?: string;
}> = [];
let nextId = 1;

router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  const userApps = appointments.filter((a) => a.applicantId === req.user!.userId);
  res.json({ appointments: userApps });
});

router.post('/', authenticate, (req: AuthRequest, res: Response) => {
  const { date, timeSlot, purpose } = req.body;
  if (!date || !timeSlot || !purpose) {
    res.status(400).json({ error: 'date, timeSlot, purpose required' });
    return;
  }
  const appointment = {
    id: String(nextId++),
    applicantId: req.user!.userId,
    date, timeSlot, purpose,
    status: 'SCHEDULED',
  };
  appointments.push(appointment);
  res.status(201).json(appointment);
});

router.patch('/:id/cancel', authenticate, (req: AuthRequest, res: Response) => {
  const appt = appointments.find((a) => a.id === req.params.id);
  if (!appt || appt.applicantId !== req.user!.userId) {
    res.status(404).json({ error: 'Appointment not found' });
    return;
  }
  appt.status = 'CANCELLED';
  res.json(appt);
});

export default router;
