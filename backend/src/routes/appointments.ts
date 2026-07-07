// ── Appointment routes: booking and cancellation ──
// All endpoints require authentication — appointments are user-scoped
// Users can list, create, and cancel their own appointments
// Phase 2 in-memory store (will migrate to Prisma/Postgres)

import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// In-memory store for appointments
const appointments: Array<{
  id: string; applicantId: string; date: string; timeSlot: string;
  purpose: string; status: string; notes?: string;
}> = [];
let nextId = 1;

// ── GET /api/appointments ──
// Returns all appointments belonging to the authenticated user
// Filters by applicantId so users only see their own bookings
router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  const userApps = appointments.filter((a) => a.applicantId === req.user!.userId);
  res.json({ appointments: userApps });
});

// ── POST /api/appointments ──
// Creates a new appointment for the authenticated user
// Requires date, timeSlot, and purpose. Starts in SCHEDULED status.
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

// ── PATCH /api/appointments/:id/cancel ──
// Cancels an existing appointment (soft delete via status change)
// Only the owning user can cancel their own appointment
router.patch('/:id/cancel', authenticate, (req: AuthRequest, res: Response) => {
  const appt = appointments.find((a) => a.id === req.params.id);
  if (!appt || appt.applicantId !== req.user!.userId) {
    res.status(404).json({ error: 'Appointment not found' });
    return;
  }
  appt.status = 'CANCELLED';
  res.json(appt);
});

export { appointments };
export default router;
