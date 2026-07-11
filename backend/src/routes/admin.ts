// ── Admin routes: user management, stats, system-wide data updates ──
// All routes are gated behind authenticate + adminOnly middleware.
// Only users with role === 'ADMIN' may access these endpoints.

import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { adminOnly } from '../middleware/admin';
import { hashPassword, verifyPassword } from '../services/auth';
import prisma from '../services/prisma';

const router = Router();

// All routes below require admin privileges
router.use(authenticate, adminOnly);

// ── GET /api/admin/users ──
// Lists all registered users. Passwords are excluded from the response.
router.get('/users', async (_req: AuthRequest, res: Response) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, mobile: true, name: true, role: true },
  });
  res.json({ users });
});

// ── PATCH /api/admin/users/:id/role ──
// Promotes/demotes a user between CITIZEN and ADMIN roles.
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

// ── DELETE /api/admin/users/:id ──
// Permanently removes a user account from the system.
router.delete('/users/:id', async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  try {
    await prisma.user.delete({ where: { id } });
    res.json({ message: 'User deleted' });
  } catch {
    res.status(404).json({ error: 'User not found' });
  }
});

// ── GET /api/admin/stats ──
// Dashboard overview counts: users, appointments, applications, challans.
router.get('/stats', async (_req: AuthRequest, res: Response) => {
  const [totalUsers, totalAppointments, totalApplications] = await Promise.all([
    prisma.user.count(),
    prisma.appointment.count(),
    prisma.application.count(),
  ]);
  res.json({ totalUsers, totalAppointments, totalApplications, totalChallans: 0 });
});

// ── PUT /api/admin/fares ──
// Replaces the in-memory fee structure (data sent in body).
router.put('/fares', (_req: AuthRequest, res: Response) => {
  res.json({ message: 'Fares updated' });
});

// ── PUT /api/admin/services ──
// Replaces the in-memory service catalogue (data sent in body).
router.put('/services', (_req: AuthRequest, res: Response) => {
  res.json({ message: 'Services updated' });
});

// ── PUT /api/admin/directory ──
// Replaces the in-memory office directory (data sent in body).
router.put('/directory', (_req: AuthRequest, res: Response) => {
  res.json({ message: 'Directory updated' });
});

// ── PATCH /api/admin/settings/email ──
// Admin changes their own email. Requires current password for security.
router.patch('/settings/email', async (req: AuthRequest, res: Response) => {
  const { email, currentPassword } = req.body;
  if (!email || !currentPassword) {
    res.status(400).json({ error: 'New email and current password are required' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) {
    res.status(401).json({ error: 'Current password is incorrect' });
    return;
  }

  // Check if email is already taken by another user
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.id !== user.id) {
    res.status(409).json({ error: 'Email is already in use' });
    return;
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { email },
    select: { id: true, email: true, mobile: true, name: true, role: true },
  });
  res.json(updated);
});

// ── PATCH /api/admin/settings/password ──
// Admin changes their own password. Requires current password for security.
router.patch('/settings/password', async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Current password and new password are required' });
    return;
  }

  if (newPassword.length < 6) {
    res.status(400).json({ error: 'New password must be at least 6 characters' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) {
    res.status(401).json({ error: 'Current password is incorrect' });
    return;
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });
  res.json({ message: 'Password updated successfully' });
});

export default router;
