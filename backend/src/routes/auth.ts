import { Router, Response } from 'express';
import { hashPassword, verifyPassword, generateToken } from '../services/auth';
import { authenticate, AuthRequest } from '../middleware/auth';
import prisma from '../services/prisma';

const router = Router();

router.post('/register', async (req: AuthRequest, res: Response) => {
  const { email, mobile, password, name } = req.body;
  if (!email || !mobile || !password || !name) {
    res.status(400).json({ error: 'All fields required' });
    return;
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { mobile }] },
  });
  if (existing) {
    res.status(409).json({ error: 'Email or mobile already registered' });
    return;
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, mobile, passwordHash, name, role: 'CITIZEN' },
  });

  const token = generateToken({ userId: user.id, role: user.role });
  res.status(201).json({
    token,
    user: { id: user.id, email: user.email, mobile: user.mobile, name: user.name, role: user.role },
  });
});

router.post('/login', async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password required' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = generateToken({ userId: user.id, role: user.role });
  res.json({
    token,
    user: { id: user.id, email: user.email, mobile: user.mobile, name: user.name, role: user.role },
  });
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({
    user: { id: user.id, email: user.email, mobile: user.mobile, name: user.name, role: user.role },
  });
});

export default router;
