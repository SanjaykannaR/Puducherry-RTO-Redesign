// ── Notification routes: user inbox ──
// Authenticated users can list their notifications and mark them as read.
// Notifications cover application status changes, appointment reminders, etc.

import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import prisma from '../services/prisma';

const router = Router();

// ── GET /api/notifications ──
// Returns all notifications for the authenticated user, newest first.
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ notifications });
});

// ── PATCH /api/notifications/:id/read ──
// Marks a single notification as read.
router.patch('/:id/read', authenticate, async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const notif = await prisma.notification.findFirst({
    where: { id, userId: req.user!.userId },
  });
  if (!notif) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  const updated = await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
  res.json(updated);
});

export default router;
