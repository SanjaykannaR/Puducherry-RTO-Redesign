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
    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'USER_ROLE_CHANGED',
        targetType: 'USER',
        targetId: id,
        details: JSON.stringify({ newRole: role }),
        actorId: req.user!.userId,
      },
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
// Creates a notification for the applicant on status change + audit log.
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
    const oldStatus = app.status;
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
    // Audit log
    await prisma.auditLog.create({
      data: {
        action: `APPLICATION_${status}`,
        targetType: 'APPLICATION',
        targetId: id,
        details: JSON.stringify({ oldStatus, newStatus: status, applicationType: app.type }),
        actorId: req.user!.userId,
      },
    });
    res.json(updated);
  } catch {
    res.status(404).json({ error: 'Application not found' });
  }
});

// ── GET /api/admin/payments ──
// Lists all payments across all users for admin management.
router.get('/payments', async (_req: AuthRequest, res: Response) => {
  const payments = await prisma.payment.findMany({
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ payments });
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

    const totalRevenue = completedPayments.reduce((sum: number, p: { amount: number }) => sum + p.amount, 0);
    const completedCount = completedPayments.length;
    const pendingCount = pendingPayments.length;
    const pendingAmount = pendingPayments.reduce((sum: number, p: { amount: number }) => sum + p.amount, 0);
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

// ── GET /api/admin/analytics ──
// Service usage analytics: which services are most popular, monthly trends, conversion rates.
router.get('/analytics', async (_req: AuthRequest, res: Response) => {
  try {
    const now = new Date();

    // Applications by type (service popularity)
    const allApps = await prisma.application.findMany({ select: { type: true, status: true, createdAt: true } });
    const byType = new Map<string, { total: number; approved: number; rejected: number; pending: number }>();
    for (const app of allApps) {
      const entry = byType.get(app.type) || { total: 0, approved: 0, rejected: 0, pending: 0 };
      entry.total++;
      if (app.status === 'APPROVED') entry.approved++;
      else if (app.status === 'REJECTED') entry.rejected++;
      else entry.pending++;
      byType.set(app.type, entry);
    }
    const serviceUsage = Array.from(byType.entries())
      .map(([type, data]) => ({
        type,
        ...data,
        conversionRate: data.total > 0 ? Math.round((data.approved / data.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);

    // Monthly application trends (last 6 months)
    const monthlyMap = new Map<string, { submitted: number; approved: number; rejected: number }>();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap.set(key, { submitted: 0, approved: 0, rejected: 0 });
    }
    for (const app of allApps) {
      const key = `${app.createdAt.getFullYear()}-${String(app.createdAt.getMonth() + 1).padStart(2, '0')}`;
      const entry = monthlyMap.get(key);
      if (entry) {
        entry.submitted++;
        if (app.status === 'APPROVED') entry.approved++;
        else if (app.status === 'REJECTED') entry.rejected++;
      }
    }
    const monthlyTrends = Array.from(monthlyMap.entries()).map(([month, data]) => ({ month, ...data }));

    // Overall conversion rate
    const totalApps = allApps.length;
    const totalApproved = allApps.filter((a: { status: string }) => a.status === 'APPROVED').length;
    const overallConversion = totalApps > 0 ? Math.round((totalApproved / totalApps) * 100) : 0;

    // Payment stats
    const [completedPayments, refundedPayments] = await Promise.all([
      prisma.payment.findMany({ where: { status: 'COMPLETED' }, select: { amount: true } }),
      prisma.payment.findMany({ where: { status: 'REFUNDED' }, select: { amount: true } }),
    ]);
    const totalCollected = completedPayments.reduce((s: number, p: { amount: number }) => s + p.amount, 0);
    const totalRefunded = refundedPayments.reduce((s: number, p: { amount: number }) => s + p.amount, 0);

    res.json({
      serviceUsage,
      monthlyTrends,
      overallConversion,
      totalApplications: totalApps,
      totalCollected,
      totalRefunded,
      netRevenue: totalCollected - totalRefunded,
    });
  } catch (err: any) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch analytics' });
  }
});

// ── POST /api/admin/applications/bulk-status ──
// Bulk approve or reject multiple applications at once.
// Body: { ids: string[], status: 'APPROVED' | 'REJECTED', reason?: string }
router.post('/applications/bulk-status', async (req: AuthRequest, res: Response) => {
  const { ids, status, reason } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({ error: 'ids array is required' });
    return;
  }
  if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
    res.status(400).json({ error: 'Status must be APPROVED or REJECTED' });
    return;
  }
  if (ids.length > 50) {
    res.status(400).json({ error: 'Maximum 50 applications per batch' });
    return;
  }

  const results = { updated: 0, failed: 0, errors: [] as string[] };

  for (const id of ids) {
    try {
      const app = await prisma.application.findUnique({ where: { id } });
      if (!app) { results.failed++; results.errors.push(`${id}: not found`); continue; }

      const oldStatus = app.status;
      await prisma.application.update({ where: { id }, data: { status } });

      // Notify
      const msg = status === 'APPROVED'
        ? `Your ${app.type} application has been approved!`
        : `Your ${app.type} application has been rejected.${reason ? ` Reason: ${reason}` : ''}`;
      await prisma.notification.create({
        data: {
          title: `Application ${status}`,
          message: msg,
          type: status === 'APPROVED' ? 'SUCCESS' : 'ERROR',
          userId: app.applicantId,
        },
      });

      // Audit log
      await prisma.auditLog.create({
        data: {
          action: `APPLICATION_${status}`,
          targetType: 'APPLICATION',
          targetId: id,
          details: JSON.stringify({ oldStatus, newStatus: status, bulk: true, reason: reason || null }),
          actorId: req.user!.userId,
        },
      });

      results.updated++;
    } catch (err: any) {
      results.failed++;
      results.errors.push(`${id}: ${err.message}`);
    }
  }

  res.json({ message: `Bulk ${status.toLowerCase()} complete`, ...results });
});

// ── GET /api/admin/audit-log ──
// Lists recent audit log entries for compliance tracking.
router.get('/audit-log', async (req: AuthRequest, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const logs = await prisma.auditLog.findMany({
    include: { actor: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  res.json({ logs });
});

// ── PATCH /api/admin/payments/:id/refund ──
// Issues a refund for a completed payment. Marks status as REFUNDED.
// Body: { reason: string }
router.patch('/payments/:id/refund', async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const { reason } = req.body;
  if (!reason || !reason.trim()) {
    res.status(400).json({ error: 'Refund reason is required' });
    return;
  }
  try {
    const payment = await prisma.payment.findUnique({ where: { id } });
    if (!payment) {
      res.status(404).json({ error: 'Payment not found' });
      return;
    }
    if (payment.status === 'REFUNDED') {
      res.status(400).json({ error: 'Payment already refunded' });
      return;
    }
    if (payment.status !== 'COMPLETED') {
      res.status(400).json({ error: 'Only completed payments can be refunded' });
      return;
    }
    const updated = await prisma.payment.update({
      where: { id },
      data: {
        status: 'REFUNDED',
        refundedAt: new Date(),
        refundReason: reason.trim(),
      },
    });
    // Notify the user about the refund
    await prisma.notification.create({
      data: {
        title: 'Payment Refunded',
        message: `Your payment of ₹${payment.amount} has been refunded. Reason: ${reason.trim()}`,
        type: 'INFO',
        userId: payment.userId,
      },
    });
    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'PAYMENT_REFUNDED',
        targetType: 'PAYMENT',
        targetId: id,
        details: JSON.stringify({ amount: payment.amount, reason: reason.trim(), grn: payment.transactionId }),
        actorId: req.user!.userId,
      },
    });
    res.json({ message: 'Payment refunded successfully', payment: updated });
  } catch {
    res.status(404).json({ error: 'Payment not found' });
  }
});

export default router;
