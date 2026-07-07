import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const applications: Array<{
  id: string; applicantId: string; type: string;
  status: string; createdAt: string; updatedAt: string;
}> = [];
let nextId = 1;

router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  const userApps = applications.filter((a) => a.applicantId === req.user!.userId);
  res.json({ applications: userApps });
});

router.get('/:id', authenticate, (req: AuthRequest, res: Response) => {
  const app = applications.find((a) => a.id === req.params.id);
  if (!app || app.applicantId !== req.user!.userId) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }
  res.json(app);
});

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
