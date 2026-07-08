// ── License routes: user driving licenses ──
// Authenticated users can list, view, and register their driving licenses.
// Each license tracks type (MCWG/LMV/etc.), validity dates, and holder info.

import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import prisma from '../services/prisma';

const router = Router();

// ── GET /api/licenses ──
// Returns all licenses for the authenticated user.
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const licenses = await prisma.license.findMany({
    where: { holderId: req.user!.userId },
  });
  res.json({ licenses });
});

// ── GET /api/licenses/:id ──
// Returns a single license record (scoped to the authenticated user).
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const license = await prisma.license.findFirst({
    where: { id, holderId: req.user!.userId },
  });
  if (!license) {
    res.status(404).json({ error: 'License not found' });
    return;
  }
  res.json(license);
});

// ── POST /api/licenses ──
// Registers a new driving license for the user.
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { licenseNo, type, name, dob, address, issueDate, expiryDate } = req.body;
  if (!licenseNo || !name || !dob || !address || !issueDate || !expiryDate) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }
  const license = await prisma.license.create({
    data: {
      licenseNo,
      type: type || 'MCWG',
      name,
      dob: new Date(dob),
      address,
      issueDate: new Date(issueDate),
      expiryDate: new Date(expiryDate),
      holderId: req.user!.userId,
    },
  });
  res.status(201).json(license);
});

export default router;
