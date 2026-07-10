// ── DigiLocker OAuth 2.0 routes ──
// Handles the full OAuth authorization code flow:
//   1. Redirect user to DigiLocker for authentication
//   2. Handle callback (exchange code for token, fetch user info)
//   3. Find or create local user, issue JWT
//   4. Redirect to frontend with the JWT

import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '../services/prisma';
import { generateToken } from '../services/auth';

const router = Router();

// ── DigiLocker OAuth endpoints ──
const DIGILOCKER_AUTH_URL = 'https://digilocker.meripehchaan.gov.in/public/oauth2/1/authorize';
const DIGILOCKER_TOKEN_URL = 'https://digilocker.meripehchaan.gov.in/public/oauth2/2/token';
const DIGILOCKER_USER_INFO_URL = 'https://digilocker.meripehchaan.gov.in/public/oauth2/2/userinfo';

// ── Env-based config (set in .env) ──
const CLIENT_ID     = process.env.DIGILOCKER_CLIENT_ID!;
const CLIENT_SECRET = process.env.DIGILOCKER_CLIENT_SECRET!;
const REDIRECT_URI  = process.env.DIGILOCKER_REDIRECT_URI!;
const FRONTEND_URL  = process.env.CORS_ORIGIN || 'http://localhost:3000';

// ── In-memory OAuth state store ──
// Used for CSRF protection: we generate a random state, store it here with a
// timestamp, and validate it when the callback arrives. Entries older than
// 10 minutes are cleaned up on each new authorisation request.
const oauthStateStore = new Map<string, { returnUrl: string; createdAt: number }>();

function cleanStateStore() {
  const cutoff = Date.now() - 10 * 60 * 1000;
  for (const [key, val] of oauthStateStore) {
    if (val.createdAt < cutoff) oauthStateStore.delete(key);
  }
}

// ── GET /api/auth/digilocker/login ──
// Initiates the OAuth flow. The `?return=` query parameter tells us where to
// send the user on the frontend after successful authentication (default: /).
router.get('/login', (req: Request, res: Response) => {
  const returnUrl = (req.query.return as string) || '/';
  const state = crypto.randomBytes(16).toString('hex');

  cleanStateStore();
  oauthStateStore.set(state, { returnUrl, createdAt: Date.now() });

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    state,
    scope: 'openid',
  });

  res.redirect(`${DIGILOCKER_AUTH_URL}?${params.toString()}`);
});

// ── GET /api/auth/digilocker/callback ──
// Handles the OAuth callback from DigiLocker. Validates state, exchanges the
// authorisation code for tokens, fetches the user's identity, finds or creates
// a local user, and redirects to the frontend with a JWT.
router.get('/callback', async (req: Request, res: Response) => {
  const { code, state } = req.query;

  // ── Validate state (CSRF protection) ──
  if (!state || typeof state !== 'string' || !oauthStateStore.has(state)) {
    return res.redirect(`${FRONTEND_URL}/login?error=invalid_state`);
  }
  const { returnUrl } = oauthStateStore.get(state)!;
  oauthStateStore.delete(state); // one-time use

  if (!code || typeof code !== 'string') {
    return res.redirect(`${FRONTEND_URL}/login?error=no_code`);
  }

  try {
    // ── Exchange authorisation code for access token ──
    const tokenRes = await fetch(DIGILOCKER_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const tokenData = await tokenRes.json() as any;

    if (!tokenData.access_token) {
      console.error('DigiLocker token exchange failed:', tokenData);
      return res.redirect(`${FRONTEND_URL}/login?error=token_exchange_failed`);
    }

    // ── Fetch user identity from DigiLocker ──
    const userRes = await fetch(DIGILOCKER_USER_INFO_URL, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userInfo = await userRes.json() as any;

    // DigiLocker returns `sub` (unique ID), `name`, `email`, `mobile`, etc.
    const digilockerId: string = userInfo.sub || userInfo.id;
    const name: string        = userInfo.name || 'DigiLocker User';
    const email: string       = userInfo.email || '';
    const mobile: string      = userInfo.mobile || '';

    if (!digilockerId) {
      console.error('DigiLocker user info missing sub/id:', userInfo);
      return res.redirect(`${FRONTEND_URL}/login?error=no_user_id`);
    }

    // ── Find or create user ──
    // Priority: 1) match by digilockerId  2) match by email  3) create new
    let user = await prisma.user.findUnique({ where: { digilockerId } });

    if (!user && email) {
      user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        // Link DigiLocker account to existing user
        await prisma.user.update({
          where: { id: user.id },
          data: { digilockerId },
        });
      }
    }

    if (!user) {
      // Create a new user from DigiLocker data
      user = await prisma.user.create({
        data: {
          digilockerId,
          name,
          email: email || `${digilockerId}@digilocker.user`,
          mobile: mobile || '0000000000',
          passwordHash: '',       // OAuth-authenticated — no password
          role: 'CITIZEN',
          isEmailVerified: !!email,
          isMobileVerified: !!mobile,
        },
      });
    }

    // ── Issue local JWT ──
    const token = generateToken({ userId: user.id, role: user.role });

    // ── Redirect to frontend callback page with token ──
    res.redirect(`${FRONTEND_URL}/auth/digilocker/callback?token=${token}&return=${encodeURIComponent(returnUrl)}`);

  } catch (err) {
    console.error('DigiLocker OAuth error:', err);
    res.redirect(`${FRONTEND_URL}/login?error=digilocker_error`);
  }
});

export default router;
