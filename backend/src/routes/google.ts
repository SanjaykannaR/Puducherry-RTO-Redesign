// ── Google OAuth 2.0 routes ──
// Full OAuth authorization code flow with Google:
//   1. Redirect user to Google's consent screen
//   2. Handle callback (exchange code for tokens, fetch profile)
//   3. Find or create local user, issue JWT
//   4. Redirect to frontend with the JWT
//
// Why Google? Unlike DigiLocker (which requires org-KYC), Google OAuth
// is free for anyone with a Google account — perfect for resume demos.

import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '../services/prisma';
import { generateToken, generateRefreshToken, hashRefreshToken } from '../services/auth';

const router = Router();

// ── Google OAuth endpoints (these don't change) ──
const GOOGLE_AUTH_URL  = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USER_INFO = 'https://www.googleapis.com/oauth2/v2/userinfo';

// ── Env-based config (set in backend/.env after creating Google Cloud creds) ──
const CLIENT_ID     = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI  = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback';
// CORS_ORIGIN is comma-separated; first entry is always the frontend
const FRONTEND_URL  = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',')[0].trim();

// ── In-memory OAuth state store (same pattern as DigiLocker route) ──
// Prevents CSRF: we generate a random state, store it, validate on callback.
// Entries older than 10 min get cleaned up.
const oauthStateStore = new Map<string, { returnUrl: string; createdAt: number }>();

function cleanStateStore() {
  const cutoff = Date.now() - 10 * 60 * 1000;
  for (const [key, val] of oauthStateStore) {
    if (val.createdAt < cutoff) oauthStateStore.delete(key);
  }
}

// ── GET /api/auth/google/login ──
// Kicks off Google OAuth. ?return= tells us where to send the user after
// the whole flow completes (default: /dashboard).
router.get('/login', (req: Request, res: Response) => {
  const returnUrl = (req.query.return as string) || '/';
  const state = crypto.randomBytes(16).toString('hex');

  cleanStateStore();
  oauthStateStore.set(state, { returnUrl, createdAt: Date.now() });

  // Build the Google consent-screen URL
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    state,
    scope: 'openid email profile',    // what we're asking for
    access_type: 'offline',            // gives us a refresh_token
    prompt: 'select_account',          // always show account picker
  });

  res.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
});

// ── GET /api/auth/google/callback ──
// Google redirects here after the user approves. We:
//   1. Validate state (CSRF check)
//   2. Exchange the code for an access + ID token
//   3. Fetch the user's Google profile
//   4. Find or create a local user (linking by googleId or email)
//   5. Issue a local JWT
//   6. Redirect to the frontend callback page with the token
router.get('/callback', async (req: Request, res: Response) => {
  const { code, state } = req.query;

  // ── Validate the CSRF state token ──
  if (!state || typeof state !== 'string' || !oauthStateStore.has(state)) {
    return res.redirect(`${FRONTEND_URL}/login?error=invalid_state`);
  }
  const { returnUrl } = oauthStateStore.get(state)!;
  oauthStateStore.delete(state); // one-time use only

  // ── Make sure we got a code ──
  if (!code || typeof code !== 'string') {
    return res.redirect(`${FRONTEND_URL}/login?error=no_code`);
  }

  try {
    // ── Step 1: Exchange the one-time code for tokens ──
    console.log(`[google-oauth] Exchanging code for tokens (email hint: ${code.slice(0,6)}...)`);
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json() as any;

    if (!tokenData.access_token) {
      console.error('[google-oauth] Token exchange failed:', JSON.stringify(tokenData));
      return res.redirect(`${FRONTEND_URL}/login?error=token_exchange_failed&detail=${encodeURIComponent(JSON.stringify(tokenData).slice(0, 200))}`);
    }

    // ── Step 2: Fetch the user's Google profile ──
    const profileRes = await fetch(GOOGLE_USER_INFO, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await profileRes.json() as any;

    // Google returns: id, email, verified_email, name, given_name, family_name, picture
    const googleId: string    = profile.id;
    const email: string       = profile.email || '';
    const name: string        = profile.name || profile.given_name || 'Google User';
    const isEmailVerified     = !!profile.verified_email;

    console.log(`[google-oauth] Profile received: googleId=${googleId}, email=${email}, name=${name}`);

    if (!googleId) {
      console.error('[google-oauth] Google profile missing id:', JSON.stringify(profile));
      return res.redirect(`${FRONTEND_URL}/login?error=no_user_id`);
    }

    // ── Step 3: Find or create local user ──
    // Priority: match by googleId → match by email (link accounts) → create new
    let user = await prisma.user.findFirst({ where: { googleId } });
    console.log(`[google-oauth] findFirst(googleId=${googleId}): ${user ? `found user=${user.id} email=${user.email}` : 'not found'}`);

    if (!user && email) {
      user = await prisma.user.findUnique({ where: { email } });
      console.log(`[google-oauth] findUnique(email=${email}): ${user ? `found user=${user.id} googleId=${user.googleId}` : 'not found'}`);
      if (user) {
        // Existing user — link their Google account
        // Check if this googleId is already used by another user (unique constraint)
        const existing = await prisma.user.findFirst({ where: { googleId, NOT: { id: user.id } } });
        if (existing) {
          console.error(`[google-oauth] CONFLICT: googleId=${googleId} already belongs to user=${existing.id} (${existing.email}), cannot link to user=${user.id} (${user.email})`);
          return res.redirect(`${FRONTEND_URL}/login?error=google_conflict&detail=${encodeURIComponent(`This Google account is already linked to another user`)}`);
        }
        await prisma.user.update({
          where: { id: user.id },
          data: { googleId },
        });
        console.log(`[google-oauth] Linked googleId=${googleId} to existing user=${user.id}`);
      }
    }

    if (!user) {
      // No existing user — create one from Google profile data
      // Google doesn't provide a mobile number. We use a unique placeholder
      // because the `mobile` column has a UNIQUE constraint — empty string
      // collides if another OAuth user already has mobile=''.
      const mobileValue = `oauth_${googleId}`;
      console.log(`[google-oauth] Creating new user: email=${email}, googleId=${googleId}`);
      user = await prisma.user.create({
        data: {
          googleId,
          name,
          email: email || `${googleId}@google.user`,
          mobile: mobileValue,
          passwordHash: '',     // OAuth user — no password needed
          role: 'CITIZEN',
          isEmailVerified,
        },
      });
      console.log(`[google-oauth] Created new user=${user.id}`);
    }

    // ── Step 4: Issue local JWT + refresh token and redirect ──
    const token = generateToken({ userId: user.id, role: user.role });
    // Generate and store a refresh token (same pattern as register/login routes)
    const refreshToken = generateRefreshToken();
    const refreshTokenHash = await hashRefreshToken(refreshToken);
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: refreshTokenHash } });
    console.log(`[google-oauth] Success! Redirecting user=${user.id} (${user.email}) to frontend`);
    // Redirect to frontend callback page with both tokens
    res.redirect(`${FRONTEND_URL}/auth/digilocker/callback?token=${token}&refreshToken=${refreshToken}&return=${encodeURIComponent(returnUrl)}`);

  } catch (err: any) {
    console.error('[google-oauth] FATAL:', err.message || err);
    console.error('[google-oauth] Stack:', err.stack || 'no stack');
    res.redirect(`${FRONTEND_URL}/login?error=google_error&detail=${encodeURIComponent(err.message || 'unknown').slice(0, 200)}`);
  }
});

// ── GET /api/auth/google/debug?email=... ──
// Diagnostic: shows the user record for a given email (no sensitive data exposed).
// Uses query param instead of path param to avoid Express routing edge cases.
router.get('/debug', async (req: Request, res: Response) => {
  const email = req.query.email as string;
  if (!email) {
    res.status(400).json({ error: 'email query param required' });
    return;
  }
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true, email: true, name: true, mobile: true, role: true,
        googleId: true, digilockerId: true, isEmailVerified: true,
        passwordHash: true, createdAt: true,
      },
    });
    if (!user) {
      res.json({ found: false, email });
      return;
    }
    res.json({
      found: true,
      ...user,
      // Mask passwordHash — just show if it exists or not
      hasPassword: !!user.passwordHash && user.passwordHash !== '',
      passwordHash: undefined,
    });
  } catch (err: any) {
    console.error('[google-debug]', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
