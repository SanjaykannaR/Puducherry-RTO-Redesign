// ── Application routes: user service applications (e.g. license, registration) ──
// All endpoints require authentication. Applications track their lifecycle
// via a status field: SUBMITTED → IN_REVIEW → APPROVED/REJECTED/CANCELLED.

import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import prisma from '../services/prisma';

const router = Router();

// ── GET /api/applications ──
// Returns all applications for the authenticated user, newest first.
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const applications = await prisma.application.findMany({
    where: { applicantId: req.user!.userId },
    include: { documents: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ applications });
});

// ── GET /api/applications/:id ──
// Returns a single application (scoped to the authenticated user).
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

// ── POST /api/applications ──
// Creates a new application with type and optional form-data payload.
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

// ── PATCH /api/applications/:id/cancel ──
// Cancels an application that is no longer needed.
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
