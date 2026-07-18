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
export async function registerTestUser(maxRetries = 3): Promise<AuthSession> {
  const suffix = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const email = `e2e_${suffix}@test.com`;
  const password = 'Test@123';
  const mobile = `${9000000000 + Math.floor(Math.random() * 999999999)}`;

  const url = `${API_BASE}/auth/register`;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, mobile, password, name: 'E2E Test User' }),
    });

    if (res.ok) {
      const data = await res.json();
      return { email, password, token: data.token, userId: data.user?.id };
    }

    // Retry on 429 (rate-limited) or 5xx (server errors), but not on 4xx client errors
    if (res.status === 429 || res.status >= 500) {
      const backoffMs = 1000 * Math.pow(2, attempt); // 1s, 2s, 4s
      console.log(`[registerTestUser] Got ${res.status}, retrying in ${backoffMs}ms (attempt ${attempt + 1}/${maxRetries})`);
      await new Promise((r) => setTimeout(r, backoffMs));
      continue;
    }

    // Non-retryable error
    const body = await res.text();
    throw new Error(`Failed to register test user: ${res.status} ${body}`);
  }

  throw new Error(`Failed to register test user after ${maxRetries} retries`);
}

// ── promoteToAdmin ──
// Promotes a test user to ADMIN role by running backend/promote-user.js,
// then re-logins to get a fresh JWT with the ADMIN role claim.
export async function promoteToAdmin(email: string): Promise<string> {
  const { execSync } = await import('child_process');
  const backendDir = require('path').resolve(__dirname, '../../backend');
  execSync(
    `node promote-user.js "${email}"`,
    { cwd: backendDir, stdio: 'pipe', timeout: 30000 }
  );
  // Re-login to get a fresh JWT with ADMIN role
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'Test@123' }),
  });
  if (!res.ok) throw new Error(`Failed to re-login after promote: ${res.status}`);
  const data = await res.json();
  return data.token;
}

// ── authenticatePage ──
// Sets the auth token in the page's localStorage so the frontend AuthContext
// picks it up on reload. After calling this, the page behaves as a logged-in user.
// Explicitly waits for the /auth/me API response to ensure the session is fully
// restored before returning.
export async function authenticatePage(page: Page, session: AuthSession) {
  // Navigate first so we're on an origin where localStorage works.
  // Use domcontentloaded — networkidle hangs on Windows Chromium SPAs
  // and causes flaky timeouts on CI when polling/long-polling keeps connections alive.
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.evaluate((token) => {
    localStorage.setItem('token', token);
  }, session.token);

  // Set up a listener for the /auth/me response BEFORE reloading
  const meResponse = page.waitForResponse(
    (resp) => resp.url().includes('/auth/me'),
    { timeout: 15000 }
  );

  // Reload — wait for DOMContentLoaded (not networkidle, which is too slow for SPAs)
  await page.reload({ waitUntil: 'domcontentloaded' });

  // Wait explicitly for /auth/me to complete — this is the signal that AuthContext has resolved
  await meResponse.catch(() => {});

  // Final stabilization: brief wait for React to render after auth state settles.
  // Use a short fixed timeout instead of networkidle to avoid flakiness from
  // ongoing polling requests (notification bell, etc.).
  await page.waitForTimeout(500);
}

// ── gotoAndWaitForAuth ──
// Navigates to a URL and waits for AuthContext to resolve on the new page.
// After authenticatePage() sets the token, page.goto() triggers a fresh page load
// where AuthContext re-initializes: reads localStorage → calls /auth/me → sets user
// → RequireAuth shows children. This helper waits for /auth/me to fire AND for
// the RequireAuth loading spinner to disappear, meaning the page content is visible.
export async function gotoAndWaitForAuth(
  page: Page,
  url: string,
  opts?: { timeout?: number }
) {
  const timeout = opts?.timeout ?? 25000;

  // Navigate first with domcontentloaded
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  // Now set up the /auth/me listener AFTER navigation starts — this ensures
  // we catch the /auth/me from the NEW page, not from a previous context
  const meResponse = page.waitForResponse(
    (resp) => resp.url().includes('/auth/me'),
    { timeout }
  ).catch(() => null);

  // Wait for /auth/me to complete (signals auth context resolved)
  await meResponse;

  // Wait for the RequireAuth loading spinner to disappear AND actual content to appear.
  // Checks for: animate-spin (RequireAuth spinner), animate-pulse (admin layout Loading...),
  // and "Checking authentication" text. Returns true once auth resolved.
  await page.waitForFunction(() => {
    const hasSpinAnimation = !!document.querySelector('.animate-spin');
    const hasPulseAnimation = !!document.querySelector('.animate-pulse');
    const hasCheckingText = document.body.textContent?.includes('Checking authentication');
    return !hasSpinAnimation && !hasPulseAnimation && !hasCheckingText;
  }, { timeout: Math.min(timeout, 20000) }).catch(() => {});

  // Brief stabilization wait for final render
  await page.waitForTimeout(300);
}

// ── waitForReactForm ──
// Waits for a React form to be fully hydrated (onSubmit handler attached).
// networkidle is NOT sufficient — React hydration happens after the browser
// is idle. This checks for __reactProps.onSubmit on the first <form> element.
export async function waitForReactForm(page: Page, opts?: { timeout?: number }) {
  const timeout = opts?.timeout ?? 20000;
  await page.waitForFunction(() => {
    // If the page redirected to login or shows "Sign In Required", there's no service form
    if (document.body.textContent?.includes('Sign In Required') ||
        document.body.textContent?.includes('Checking authentication')) {
      return false; // Will timeout — caller should handle auth failure
    }
    const form = document.querySelector('form');
    if (!form) return false;
    const propsKey = Object.keys(form).find(k => k.startsWith('__reactProps'));
    if (!propsKey) return false;
    return !!form[propsKey]?.onSubmit;
  }, { timeout });
}

// ── ADMIN ──
// The registration endpoint always creates CITIZEN users, so we cannot create
// an admin via the API. Skip admin tests that require actual admin privileges,
// and test admin pages only for redirect/403 behavior.
// The registration endpoint always creates CITIZEN users, so we cannot create
// an admin via the API. Skip admin tests that require actual admin privileges,
// and test admin pages only for redirect/403 behavior.
export const ADMIN_EMAIL = 'admin@rto.gov.in';
export const ADMIN_PASSWORD = 'Admin@123'; // pre-seeded admin
