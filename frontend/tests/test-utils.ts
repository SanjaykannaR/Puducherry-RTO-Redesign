// ── Shared test utilities for Playwright E2E tests ──
// Provides helpers to create test users and set up authenticated browser sessions.

import { Page } from '@playwright/test';

const API_BASE = 'http://localhost:5000/api';

export interface AuthSession {
  email: string;
  password: string;
  token: string;
  userId?: string;
}

// ── registerTestUser ──
// Creates a fresh user via the API with a unique email (timestamp + random suffix).
// Returns the session info (email, password, token) for use across tests.
// Each call produces a unique user so parallel tests don't collide on the DB.
export async function registerTestUser(): Promise<AuthSession> {
  const suffix = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const email = `e2e_${suffix}@test.com`;
  const password = 'Test@123';
  const mobile = `${9000000000 + Math.floor(Math.random() * 999999999)}`;

  const url = `${API_BASE}/auth/register`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, mobile, password, name: 'E2E Test User' }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to register test user: ${res.status} ${body}`);
  }

  const data = await res.json();
  return { email, password, token: data.token, userId: data.user?.id };
}

// ── authenticatePage ──
// Sets the auth token in the page's localStorage so the frontend AuthContext
// picks it up on reload. After calling this, the page behaves as a logged-in user.
export async function authenticatePage(page: Page, session: AuthSession) {
  // Navigate first so we're on an origin where localStorage works
  await page.goto('/');
  await page.evaluate((token) => {
    localStorage.setItem('token', token);
  }, session.token);

  // Reload to let AuthContext detect the token and call /auth/me
  await page.reload();

  // Wait for auth to fully resolve — the loading spinner should disappear
  await page.waitForFunction(() => {
    return !document.body.textContent?.includes('Checking authentication');
  }, { timeout: 8000 }).catch(() => {
    // If it times out, the page might already be loaded without the spinner
  });
}

// ── ADMIN ──
// The registration endpoint always creates CITIZEN users, so we cannot create
// an admin via the API. Skip admin tests that require actual admin privileges,
// and test admin pages only for redirect/403 behavior.
export const ADMIN_EMAIL = 'admin@rto.gov.in';
export const ADMIN_PASSWORD = 'Admin@123'; // pre-seeded admin
