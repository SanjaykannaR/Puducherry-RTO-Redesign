// ── Admin routes: system management ──
// All routes are guarded by authenticate + adminOnly middleware
// Provides CRUD for users, services, fares, directory, and system stats
// Only users with 'admin' role can access these endpoints

import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { adminOnly } from '../middleware/admin';
import { users } from './auth';
import { appointments } from './appointments';
import { applications } from './applications';
import { challans } from './challan';
import { setFeeStructure } from './fares';
import { setServices } from './services';
import { setOffices } from './directory';

const router = Router();

// Apply auth + admin guard to ALL routes in this file
router.use(authenticate, adminOnly);

// ── GET /api/admin/users ──
// Lists all registered users (excludes passwordHash for security)
router.get('/users', (_req: AuthRequest, res: Response) => {
  const userList = users.map(({ id, email, mobile, name, role }) => ({
    id, email, mobile, name, role,
  }));
  res.json({ users: userList });
});

// ── PATCH /api/admin/users/:id/role ──
// Promotes or demotes a user's role (e.g. CITIZEN → ADMIN)
// Only accepts "user" or "admin" values
router.patch('/users/:id/role', (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!role || !['user', 'admin'].includes(role)) {
    res.status(400).json({ error: 'Invalid role. Must be "user" or "admin"' });
    return;
  }
  const user = users.find((u) => u.id === id);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  user.role = role;
  res.json({ id: user.id, email: user.email, mobile: user.mobile, name: user.name, role: user.role });
});

// ── DELETE /api/admin/users/:id ──
// Removes a user from the system permanently
router.delete('/users/:id', (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  users.splice(index, 1);
  res.json({ message: 'User deleted' });
});

// ── GET /api/admin/stats ──
// Returns aggregate counts across all data stores for the admin dashboard
router.get('/stats', (_req: AuthRequest, res: Response) => {
  res.json({
    totalUsers: users.length,
    totalAppointments: appointments.length,
    totalApplications: applications.length,
    totalChallans: challans.length,
  });
});

// ── PUT /api/admin/fares ──
// Replaces the entire fee structure with the provided payload
router.put('/fares', (req: AuthRequest, res: Response) => {
  setFeeStructure(req.body);
  res.json({ message: 'Fares updated' });
});

// ── PUT /api/admin/services ──
// Replaces the entire service catalogue with the provided payload
router.put('/services', (req: AuthRequest, res: Response) => {
  setServices(req.body);
  res.json({ message: 'Services updated' });
});

// ── PUT /api/admin/directory ──
// Replaces the entire office directory with the provided payload
router.put('/directory', (req: AuthRequest, res: Response) => {
  setOffices(req.body);
  res.json({ message: 'Directory updated' });
});

export default router;
