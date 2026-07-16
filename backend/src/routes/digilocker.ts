// ── DigiLocker OAuth 2.0 routes ──
// Handles the full OAuth authorization code flow:
//   1. Redirect user to DigiLocker for authentication
//   2. Handle callback (exchange code for token, fetch user info)
//   3. Find or create local user, issue JWT
//   4. Redirect to frontend with the JWT
//
// MOCK MODE: When DIGILOCKER_CLIENT_ID is the placeholder value ("your_digilocker_client_id"),
// the routes serve a local mock login page instead of redirecting to real DigiLocker.
// This allows demo/resume use without org KYC.

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
const CLIENT_ID     = process.env.DIGILOCKER_CLIENT_ID || '';
const CLIENT_SECRET = process.env.DIGILOCKER_CLIENT_SECRET || '';
const REDIRECT_URI  = process.env.DIGILOCKER_REDIRECT_URI || '';
const FRONTEND_URL  = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',')[0].trim();

// ── Mock mode detection ──
const IS_MOCK = !CLIENT_ID || CLIENT_ID === 'your_digilocker_client_id';

// ── In-memory OAuth state store ──
const oauthStateStore = new Map<string, { returnUrl: string; createdAt: number }>();

function cleanStateStore() {
  const cutoff = Date.now() - 10 * 60 * 1000;
  for (const [key, val] of oauthStateStore) {
    if (val.createdAt < cutoff) oauthStateStore.delete(key);
  }
}

// ── GET /api/auth/digilocker/login ──
// Initiates the OAuth flow. In mock mode, serves the local mock login page.
router.get('/login', (req: Request, res: Response) => {
  const returnUrl = (req.query.return as string) || '/';
  const state = crypto.randomBytes(16).toString('hex');

  cleanStateStore();
  oauthStateStore.set(state, { returnUrl, createdAt: Date.now() });

  if (IS_MOCK) {
    // Mock mode: show local DigiLocker login page
    res.send(MOCK_LOGIN_PAGE(state));
    return;
  }

  // Real mode: redirect to DigiLocker
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    state,
    scope: 'openid',
  });

  res.redirect(`${DIGILOCKER_AUTH_URL}?${params.toString()}`);
});

// ── POST /api/auth/digilocker/mock/submit ──
// Handles mock login form submission. Generates a mock code and redirects to callback.
router.post('/mock/submit', (req: Request, res: Response) => {
  const { state, name, email, mobile } = req.body;

  if (!state || !oauthStateStore.has(state)) {
    return res.redirect(`${FRONTEND_URL}/login?error=invalid_state`);
  }

  const { returnUrl } = oauthStateStore.get(state)!;
  // NOTE: Do NOT delete state here — let /callback consume it (normal OAuth pattern)

  // Generate a mock authorization code (we'll decode it in the callback)
  const mockData = { name: name || 'DigiLocker User', email: email || '', mobile: mobile || '9999999999' };
  const mockCode = Buffer.from(JSON.stringify(mockData)).toString('base64url');

  // Redirect to our own callback endpoint with the mock code
  res.redirect(`/api/auth/digilocker/callback?code=${mockCode}&state=${state}&return=${encodeURIComponent(returnUrl)}`);
});

// ── GET /api/auth/digilocker/callback ──
// Handles the OAuth callback. In mock mode, decodes the mock code directly.
router.get('/callback', async (req: Request, res: Response) => {
  const { code, state, return: returnUrl } = req.query;
  const targetReturn = (returnUrl as string) || '/';

  // ── Validate state (CSRF protection) ──
  if (!state || typeof state !== 'string' || !oauthStateStore.has(state)) {
    // In mock mode, the state may have been consumed by /mock/submit already
    // If state is missing from store but code is present, allow it for mock
    if (IS_MOCK && code) {
      // Proceed with mock decode
    } else {
      return res.redirect(`${FRONTEND_URL}/login?error=invalid_state`);
    }
  } else {
    oauthStateStore.delete(state);
  }

  if (!code || typeof code !== 'string') {
    return res.redirect(`${FRONTEND_URL}/login?error=no_code`);
  }

  try {
    let digilockerId: string;
    let name: string;
    let email: string;
    let mobile: string;

    if (IS_MOCK) {
      // Mock mode: decode the code as base64url-encoded JSON
      try {
        const mockData = JSON.parse(Buffer.from(code, 'base64url').toString());
        digilockerId = `mock_${Date.now()}`;
        name = mockData.name || 'DigiLocker User';
        email = mockData.email || '';
        mobile = mockData.mobile || '9999999999';
      } catch {
        return res.redirect(`${FRONTEND_URL}/login?error=mock_decode_failed`);
      }
    } else {
      // Real mode: exchange code for token at DigiLocker
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

      // Fetch user identity from DigiLocker
      const userRes = await fetch(DIGILOCKER_USER_INFO_URL, {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const userInfo = await userRes.json() as any;

      digilockerId = userInfo.sub || userInfo.id;
      name = userInfo.name || 'DigiLocker User';
      email = userInfo.email || '';
      mobile = userInfo.mobile || '';

      if (!digilockerId) {
        console.error('DigiLocker user info missing sub/id:', userInfo);
        return res.redirect(`${FRONTEND_URL}/login?error=no_user_id`);
      }
    }

    // ── Find or create user ──
    let user = await prisma.user.findUnique({ where: { digilockerId } });

    if (!user && email) {
      user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { digilockerId },
        });
      }
    }

    if (!user) {
      user = await prisma.user.create({
        data: {
          digilockerId,
          name,
          email: email || `${digilockerId}@digilocker.user`,
          mobile: mobile || '0000000000',
          passwordHash: '',
          role: 'CITIZEN',
          isEmailVerified: !!email,
          isMobileVerified: !!mobile,
        },
      });
    }

    // ── Issue local JWT ──
    const token = generateToken({ userId: user.id, role: user.role });

    // ── Redirect to frontend callback page with token ──
    res.redirect(`${FRONTEND_URL}/auth/digilocker/callback?token=${token}&return=${encodeURIComponent(targetReturn)}`);

  } catch (err: any) {
    console.error('DigiLocker OAuth error:', err?.message || err);
    console.error('Stack:', err?.stack);
    res.redirect(`${FRONTEND_URL}/login?error=digilocker_error`);
  }
});

// ── Mock DigiLocker Login Page HTML ──
function MOCK_LOGIN_PAGE(state: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DigiLocker (Mock) — Sign In</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f0f4f8; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .card { background: white; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); width: 100%; max-width: 420px; padding: 40px 32px; }
    .logo { text-align: center; margin-bottom: 24px; }
    .logo .icon { width: 56px; height: 56px; background: linear-gradient(135deg, #1565c0, #42a5f5); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold; }
    .logo h1 { font-size: 18px; color: #1a1a1a; margin-top: 12px; }
    .logo p { font-size: 13px; color: #666; margin-top: 4px; }
    .mock-badge { display: inline-block; background: #fff3cd; color: #856404; font-size: 11px; padding: 2px 8px; border-radius: 4px; margin-top: 8px; }
    label { display: block; font-size: 13px; font-weight: 600; color: #333; margin-bottom: 6px; margin-top: 16px; }
    input { width: 100%; padding: 10px 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; transition: border 0.2s; }
    input:focus { outline: none; border-color: #1565c0; box-shadow: 0 0 0 3px rgba(21,101,192,0.1); }
    button { width: 100%; padding: 12px; margin-top: 24px; background: #1565c0; color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
    button:hover { background: #0d47a1; }
    .footer { text-align: center; margin-top: 16px; font-size: 11px; color: #999; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">
      <div class="icon">DL</div>
      <h1>DigiLocker</h1>
      <p>Government of India — Digital Document Wallet</p>
      <div class="mock-badge">DEMO / MOCK MODE</div>
    </div>
    <form action="/api/auth/digilocker/mock/submit" method="POST">
      <input type="hidden" name="state" value="${state}" />
      <label for="name">Full Name</label>
      <input type="text" id="name" name="name" placeholder="Enter your name" value="Rajesh Kumar" required />
      <label for="email">Email Address</label>
      <input type="email" id="email" name="email" placeholder="user@example.com" value="rajesh@digilocker.mock" />
      <label for="mobile">Mobile Number</label>
      <input type="tel" id="mobile" name="mobile" placeholder="9999999999" value="9876543210" />
      <button type="submit">Sign In with DigiLocker</button>
    </form>
    <div class="footer">This is a mock DigiLocker page for demo purposes only.<br>No real authentication is performed.</div>
  </div>
</body>
</html>`;
}

export default router;
