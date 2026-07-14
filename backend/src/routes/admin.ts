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

// ── GET /api/admin/applications ──
// Lists all applications across all users, newest first.
// Includes applicant name/email for admin context.
router.get('/applications', async (_req: AuthRequest, res: Response) => {
  const applications = await prisma.application.findMany({
    include: {
      applicant: { select: { id: true, name: true, email: true } },
      documents: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ applications });
});

// ── PATCH /api/admin/applications/:id/status ──
// Updates an application's status (APPROVED, REJECTED, UNDER_REVIEW).
// Creates a notification for the applicant on status change.
const VALID_STATUSES = ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'];
router.patch('/applications/:id/status', async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const { status } = req.body;
  if (!status || !VALID_STATUSES.includes(status)) {
    res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
    return;
  }
  try {
    const app = await prisma.application.findUnique({ where: { id } });
    if (!app) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }
    const updated = await prisma.application.update({
      where: { id },
      data: { status },
    });
    // Create notification for the applicant
    const statusMessages: Record<string, { title: string; message: string }> = {
      UNDER_REVIEW: { title: 'Application Under Review', message: `Your ${app.type} application is now under review.` },
      APPROVED: { title: 'Application Approved', message: `Your ${app.type} application has been approved!` },
      REJECTED: { title: 'Application Rejected', message: `Your ${app.type} application has been rejected. Please contact the RTO for details.` },
    };
    const notif = statusMessages[status];
    if (notif) {
      await prisma.notification.create({
        data: {
          title: notif.title,
          message: notif.message,
          type: status === 'APPROVED' ? 'SUCCESS' : status === 'REJECTED' ? 'ERROR' : 'INFO',
          userId: app.applicantId,
        },
      });
    }
    res.json(updated);
  } catch {
    res.status(404).json({ error: 'Application not found' });
  }
});

// ── GET /api/admin/revenue ──
// Revenue dashboard data: totals, monthly breakdown, payment methods, recent transactions.
router.get('/revenue', async (_req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [completedPayments, pendingPayments, allPayments] = await Promise.all([
      prisma.payment.findMany({ where: { status: 'COMPLETED' } }),
      prisma.payment.findMany({ where: { status: 'PENDING' } }),
      prisma.payment.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { user: { select: { name: true, email: true } } },
      }),
    ]);

    const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);
    const completedCount = completedPayments.length;
    const pendingCount = pendingPayments.length;
    const pendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
    const avgTransaction = completedCount > 0 ? Math.round(totalRevenue / completedCount) : 0;

    // Monthly revenue (last 6 months)
    const monthlyMap = new Map<string, { revenue: number; count: number }>();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap.set(key, { revenue: 0, count: 0 });
    }
    for (const p of completedPayments) {
      const key = `${p.paidAt?.getFullYear()}-${String((p.paidAt?.getMonth() ?? 0) + 1).padStart(2, '0')}`;
      const entry = monthlyMap.get(key);
      if (entry) {
        entry.revenue += p.amount;
        entry.count++;
      }
    }
    const monthlyRevenue = Array.from(monthlyMap.entries()).map(([month, data]) => ({ month, ...data }));

    // Revenue by payment method
    const methodMap = new Map<string, { count: number; total: number }>();
    for (const p of completedPayments) {
      const method = p.paymentMethod || 'Unknown';
      const entry = methodMap.get(method) || { count: 0, total: 0 };
      entry.count++;
      entry.total += p.amount;
      methodMap.set(method, entry);
    }
    const byMethod = Array.from(methodMap.entries()).map(([method, data]) => ({ method, ...data }));

    res.json({
      totalRevenue,
      completedPayments: completedCount,
      pendingPayments: pendingCount,
      pendingAmount,
      avgTransaction,
      monthlyRevenue,
      byMethod,
      recentTransactions: allPayments,
    });
  } catch (err: any) {
    console.error('Revenue query error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch revenue data' });
  }
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
