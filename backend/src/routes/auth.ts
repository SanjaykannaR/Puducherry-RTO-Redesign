// ── Auth routes: registration, login, profile ──
// In-memory store during Phase 2 prototyping; will migrate to Prisma/Postgres
// Users auto-get CITIZEN role on register (admin promotion is done via admin routes)

import { Router, Response } from 'express';
import { hashPassword, verifyPassword, generateToken } from '../services/auth';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// In-memory user store for Phase 2 (will move to Prisma/Postgres)
// Persistence is lost on restart — acceptable for early prototyping
const users: Array<{
  id: string;
  email: string;
  mobile: string;
  passwordHash: string;
  name: string;
  role: string;
}> = [];

let nextId = 1;

// ── POST /api/auth/register ──
// Creates a new user account. Validates required fields, checks duplicate email,
// hashes password, returns JWT + user object (so client is immediately logged in).
// No auth required (obviously) — this is how users create their account.
router.post('/register', async (req: AuthRequest, res: Response) => {
  const { email, mobile, password, name } = req.body;
  if (!email || !mobile || !password || !name) {
    res.status(400).json({ error: 'All fields required' });
    return;
  }
  if (users.find((u) => u.email === email)) {
    res.status(409).json({ error: 'Email already registered' });
    return;
  }
  const id = String(nextId++);
  const passwordHash = await hashPassword(password);
  users.push({ id, email, mobile, passwordHash, name, role: 'CITIZEN' });
  const token = generateToken({ userId: id, role: 'CITIZEN' });
  res.status(201).json({ token, user: { id, email, mobile, name, role: 'CITIZEN' } });
});

// ── POST /api/auth/login ──
// Authenticates existing user via email + password. Returns JWT for subsequent requests.
// No auth required — this IS the auth endpoint.
router.post('/login', async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password required' });
    return;
  }
  const user = users.find((u) => u.email === email);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    // Don't reveal whether the email or password was wrong (security best practice)
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  const token = generateToken({ userId: user.id, role: user.role });
  res.json({ token, user: { id: user.id, email: user.email, mobile: user.mobile, name: user.name, role: user.role } });
});

// ── GET /api/auth/me ──
// Returns the authenticated user's profile. Used by frontend to hydrate session state.
// Requires a valid Bearer token.
router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  const user = users.find((u) => u.id === req.user!.userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ user: { id: user.id, email: user.email, mobile: user.mobile, name: user.name, role: user.role } });
});

// Export the users array so admin routes can inspect/manage it
export { users };
export default router;
