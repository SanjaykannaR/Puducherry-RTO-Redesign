// ── Auth routes: register, login, and current-user lookup ──
// Public endpoints for account creation and authentication (JWT-based).
// Access tokens expire in 15 min; refresh tokens are 7-day rotating.

import { Router, Response } from 'express';
import { hashPassword, verifyPassword, generateToken, generateRefreshToken, hashRefreshToken, verifyRefreshToken } from '../services/auth';
import { authenticate, AuthRequest } from '../middleware/auth';
import prisma from '../services/prisma';

const router = Router();

// ── POST /api/auth/register ──
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
  const refreshToken = generateRefreshToken();
  const refreshTokenHash = await hashRefreshToken(refreshToken);

  const user = await prisma.user.create({
    data: { email, mobile, passwordHash, name, role: 'CITIZEN', refreshToken: refreshTokenHash },
  });

  const token = generateToken({ userId: user.id, role: user.role });
  res.status(201).json({
    token,
    refreshToken,
    user: { id: user.id, email: user.email, mobile: user.mobile, name: user.name, role: user.role },
  });
});

// ── POST /api/auth/login ──
router.post('/login', async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password required' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  // OAuth users have no password — guide them to Google login
  if (!user.passwordHash || user.passwordHash === '') {
    if (user.googleId) {
      res.status(401).json({ error: 'This account uses Google Sign-In. Please use the Google login button.' });
      return;
    }
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  if (!(await verifyPassword(password, user.passwordHash))) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  // Generate new refresh token (rotate on every login)
  const refreshToken = generateRefreshToken();
  const refreshTokenHash = await hashRefreshToken(refreshToken);
  await prisma.user.update({ where: { id: user.id }, data: { refreshToken: refreshTokenHash } });

  const token = generateToken({ userId: user.id, role: user.role });
  res.json({
    token,
    refreshToken,
    user: { id: user.id, email: user.email, mobile: user.mobile, name: user.name, role: user.role },
  });
});

// ── POST /api/auth/refresh ──
// Exchange a valid refresh token for a new access token (token rotation).
// Body: { refreshToken: string }
router.post('/refresh', async (req: AuthRequest, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(400).json({ error: 'Refresh token required' });
    return;
  }

  // Find user by comparing refresh token against all stored hashes
  const users = await prisma.user.findMany({ where: { refreshToken: { not: null } }, select: { id: true, role: true, refreshToken: true } });
  let matchedUser: typeof users[number] | null = null;
  for (const u of users) {
    if (await verifyRefreshToken(refreshToken, u.refreshToken)) {
      matchedUser = u;
      break;
    }
  }

  if (!matchedUser) {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
    return;
  }

  // Rotate: issue new access + new refresh token
  const newRefreshToken = generateRefreshToken();
  const newRefreshTokenHash = await hashRefreshToken(newRefreshToken);
  await prisma.user.update({ where: { id: matchedUser.id }, data: { refreshToken: newRefreshTokenHash } });

  const token = generateToken({ userId: matchedUser.id, role: matchedUser.role });
  res.json({ token, refreshToken: newRefreshToken });
});

// ── POST /api/auth/logout ──
// Clears the refresh token (invalidates future refreshes).
router.post('/logout', authenticate, async (req: AuthRequest, res: Response) => {
  await prisma.user.update({ where: { id: req.user!.userId }, data: { refreshToken: null } });
  res.json({ message: 'Logged out' });
});

// ── GET /api/auth/me ──
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

// ── POST /api/auth/forgot-password ──
router.post('/forgot-password', async (req: AuthRequest, res: Response) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
    return;
  }

  console.log(`[forgot-password] Reset requested for: ${email} (user: ${user.id})`);
  res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
});

// ── POST /api/auth/bootstrap-admin ──
// One-time endpoint: promotes the authenticated user to ADMIN if no admins exist yet.
// Self-destructs once an admin exists — cannot be abused after initial setup.
router.post('/bootstrap-admin', authenticate, async (req: AuthRequest, res: Response) => {
  const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
  if (adminCount > 0) {
    res.status(403).json({ error: 'Admin already exists. Use the admin panel to promote users.' });
    return;
  }
  const user = await prisma.user.update({
    where: { id: req.user!.userId },
    data: { role: 'ADMIN' },
    select: { id: true, email: true, name: true, role: true },
  });
  console.log(`[bootstrap] Promoted user ${user.id} (${user.email}) to ADMIN`);
  res.json({ message: `You (${user.email}) are now an admin.`, user });
});

export default router;
