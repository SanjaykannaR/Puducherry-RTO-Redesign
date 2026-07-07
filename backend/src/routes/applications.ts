// ── Application routes: service applications CRUD ──
// Authenticated users can submit applications for RTO services (DL, RC, permits, etc.)
// Each application tracks its lifecycle: SUBMITTED → UNDER_REVIEW → APPROVED/REJECTED
// Phase 2 in-memory store (will migrate to Prisma with document attachments)

import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// In-memory store for service applications
const applications: Array<{
  id: string; applicantId: string; type: string;
  status: string; createdAt: string; updatedAt: string;
}> = [];
let nextId = 1;

// ── GET /api/applications ──
// Returns all applications belonging to the authenticated user
router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  const userApps = applications.filter((a) => a.applicantId === req.user!.userId);
  res.json({ applications: userApps });
});

// ── GET /api/applications/:id ──
// Returns a single application — only the owning user can view it
router.get('/:id', authenticate, (req: AuthRequest, res: Response) => {
  const app = applications.find((a) => a.id === req.params.id);
  if (!app || app.applicantId !== req.user!.userId) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }
  res.json(app);
});

// ── POST /api/applications ──
// Submits a new application of a given type (e.g. "DL", "RC", "PERMIT")
// Starts in SUBMITTED status. Additional formData/docs will be added in Phase 3.
router.post('/', authenticate, (req: AuthRequest, res: Response) => {
  const { type } = req.body;
  if (!type) {
    res.status(400).json({ error: 'Application type required' });
    return;
  }
  const app = {
    id: String(nextId++),
    applicantId: req.user!.userId,
    type,
    status: 'SUBMITTED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  applications.push(app);
  res.status(201).json(app);
});

export { applications };
export default router;
