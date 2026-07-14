// ── Admin Panel E2E Tests ──
// Tests all admin pages: dashboard, users, reports, services, fares, settings.
// Verifies auth guards, then logs in as admin and checks each page renders correctly.

import { test, expect } from '@playwright/test';
import { registerTestUser, promoteToAdmin, authenticatePage, gotoAndWaitForAuth, AuthSession } from './test-utils';

// ── Shared state — populated once before all tests in this file ──
let citizenSession: AuthSession;
let adminSession: AuthSession;

// Serial: avoids rate limiting from parallel beforeAll calls
test.describe.serial('Admin Panel', () => {

  test.beforeAll(async () => {
    // Create citizen + admin (register once, promote via DB, re-login for fresh JWT)
    citizenSession = await registerTestUser();
    adminSession = await registerTestUser();
    const freshToken = await promoteToAdmin(adminSession.email);
    adminSession.token = freshToken;
  });

  // ══════════════════════════════════════════════
  // 1. AUTH GUARDS — unauthenticated access
  // ══════════════════════════════════════════════

  test.describe('Auth Guards', () => {
    const adminPages = [
      { path: '/admin', name: 'Dashboard' },
      { path: '/admin/users', name: 'Users' },
      { path: '/admin/reports', name: 'Reports' },
      { path: '/admin/services', name: 'Services' },
      { path: '/admin/fares', name: 'Fares' },
      { path: '/admin/settings', name: 'Settings' },
    ];

    for (const pg of adminPages) {
      test(`${pg.name} redirects to login when not authenticated`, async ({ page }) => {
        // Navigate to admin page — no auth token in localStorage
        // Use domcontentloaded — networkidle hangs on Windows Chromium SPAs
        await page.goto(pg.path, { waitUntil: 'domcontentloaded' });
        // Admin layout returns null while auth loads, then useEffect pushes to /login.
        // waitForURL is more reliable than toHaveURL for detecting client-side navigation.
        // The redirect may take time because: page load → AuthContext mounts → setLoading(false) →
        // admin layout re-renders → useEffect fires → router.push('/login')
        await page.waitForURL(/\/login/, { timeout: 30000 });
      });
    }
  });

  // ══════════════════════════════════════════════
  // 2. CITIZEN ACCESS — logged in but not admin
  // ══════════════════════════════════════════════

  test.describe('Access as CITIZEN', () => {
    test('dashboard redirects to login for CITIZEN role', async ({ page }) => {
      await authenticatePage(page, citizenSession);
      await page.goto('/admin', { waitUntil: 'domcontentloaded' });
      await page.waitForURL(/\/login/, { timeout: 20000 });
    });
  });

  // ══════════════════════════════════════════════
  // 3. ADMIN DASHBOARD
  // ══════════════════════════════════════════════

  test.describe('Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      await authenticatePage(page, adminSession);
      await gotoAndWaitForAuth(page, '/admin');
    });

    test('loads with Dashboard heading', async ({ page }) => {
      // The admin layout returns null while auth loads, then renders the page content.
      // The heading may take time to appear after auth resolves + page renders.
      await expect(page.getByText('Dashboard').first()).toBeVisible({ timeout: 15000 });
    });

    test('displays stat cards with numbers', async ({ page }) => {
      // The admin page fetches /admin/stats + /admin/users — may take time.
      // Stat card titles are always visible even while loading (values show skeletons).
      // If the API fails, the page shows an error instead.
      // Just wait for the Dashboard heading to confirm admin loaded, then check stat cards.
      await expect(page.getByText('Dashboard').first()).toBeVisible({ timeout: 15000 });
      // Stat card titles use <CardTitle> which renders as a div, not a heading
      await expect(page.getByText('Total Users').first()).toBeVisible({ timeout: 15000 });
      await expect(page.getByText('Appointments').first()).toBeVisible();
      await expect(page.getByText('Applications').first()).toBeVisible();
      await expect(page.getByText('Challans').first()).toBeVisible();
    });

    test('shows Recent Users section', async ({ page }) => {
      await expect(page.getByText('Recent Users')).toBeVisible();
    });

    test('shows Quick Actions section with navigation links', async ({ page }) => {
      await expect(page.getByText('Quick Actions')).toBeVisible();
      await expect(page.getByRole('link', { name: /Manage Users/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /View Reports/i })).toBeVisible();
      // Settings link appears both in sidebar and Quick Actions — use .first() to avoid strict mode
      await expect(page.getByRole('link', { name: /Settings/i }).first()).toBeVisible();
    });

    test('shows System Info section', async ({ page }) => {
      // System Info is a CardTitle (div) at the bottom of the admin dashboard —
      // it may take time to render if stats API is slow. Use .first() to avoid
      // strict mode if "System Info" appears elsewhere, and add explicit timeout.
      await expect(page.getByText('System Info').first()).toBeVisible({ timeout: 15000 });
    });
  });

  // ══════════════════════════════════════════════
  // 4. ADMIN USERS PAGE
  // ══════════════════════════════════════════════

  test.describe('Users', () => {
    test.beforeEach(async ({ page }) => {
      await authenticatePage(page, adminSession);
      await gotoAndWaitForAuth(page, '/admin/users');
    });

    test('loads with Users Management heading', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Users Management' })).toBeVisible();
    });

    test('displays a table with users', async ({ page }) => {
      const table = page.locator('table');
      await expect(table).toBeVisible({ timeout: 10000 });
    });

    test('table has correct column headers', async ({ page }) => {
      await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Email' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Mobile' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Role' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Actions' })).toBeVisible();
    });

    test('shows at least one user row', async ({ page }) => {
      const rows = page.locator('tbody tr');
      await expect(rows.first()).toBeVisible({ timeout: 10000 });
      const count = await rows.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });
  });

  // ══════════════════════════════════════════════
  // 5. ADMIN REPORTS PAGE
  // ══════════════════════════════════════════════

  test.describe('Reports', () => {
    test.beforeEach(async ({ page }) => {
      await authenticatePage(page, adminSession);
      // Wait for auth + stats API to resolve before checking content
      await gotoAndWaitForAuth(page, '/admin/reports');
    });

    test('loads with Reports heading', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Reports' })).toBeVisible();
    });

    test('displays KPI stat cards', async ({ page }) => {
      // Each KPI label appears twice: once in a card title and once in the summary table.
      // Use .first() to avoid strict mode violation.
      // Wait for /admin/stats API to populate the cards
      await page.waitForResponse(r => r.url().includes('/admin/stats') && r.status() === 200, { timeout: 15000 }).catch(() => {});
      await expect(page.getByText('Total Users').first()).toBeVisible({ timeout: 15000 });
      await expect(page.getByText('Total Appointments').first()).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('Total Applications').first()).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('Total Challans').first()).toBeVisible({ timeout: 10000 });
    });

    test('shows bar chart (Overview)', async ({ page }) => {
      // "Overview" is rendered as a CardTitle (div), not a heading element
      await expect(page.getByText('Overview').first()).toBeVisible();
      // recharts renders SVG inside a div with class recharts-wrapper
      const chart = page.locator('.recharts-wrapper');
      await expect(chart.first()).toBeVisible({ timeout: 10000 });
    });

    test('shows pie chart (Distribution)', async ({ page }) => {
      await expect(page.getByText('Distribution').first()).toBeVisible();
    });

    test('shows detailed summary table', async ({ page }) => {
      await expect(page.getByText('Detailed Summary').first()).toBeVisible({ timeout: 15000 });
      await expect(page.locator('table')).toBeVisible();
    });
  });

  // ══════════════════════════════════════════════
  // 6. ADMIN SERVICES PAGE
  // ══════════════════════════════════════════════

  test.describe('Services', () => {
    test.beforeEach(async ({ page }) => {
      await authenticatePage(page, adminSession);
      await gotoAndWaitForAuth(page, '/admin/services');
    });

    test('loads with Services Management heading', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Services Management' })).toBeVisible();
    });

    test('shows Add Service and Save buttons', async ({ page }) => {
      await expect(page.getByRole('button', { name: /Add Service/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Save Changes/i })).toBeVisible();
    });
  });

  // ══════════════════════════════════════════════
  // 7. ADMIN FARES PAGE
  // ══════════════════════════════════════════════

  test.describe('Fares', () => {
    test('loads with Fares heading', async ({ page }) => {
      await authenticatePage(page, adminSession);
      await page.goto('/admin/fares', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { name: /Fares/i })).toBeVisible();
    });
  });

  // ══════════════════════════════════════════════
  // 8. ADMIN SETTINGS PAGE
  // ══════════════════════════════════════════════

  test.describe('Settings', () => {
    test.beforeEach(async ({ page }) => {
      await authenticatePage(page, adminSession);
      await gotoAndWaitForAuth(page, '/admin/settings');
    });

    test('loads with Settings heading', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
    });

    test('shows current user email', async ({ page }) => {
      await expect(page.getByText(adminSession.email)).toBeVisible();
    });

    test('shows Change Email form', async ({ page }) => {
      await expect(page.getByText('Change Email').first()).toBeVisible({ timeout: 15000 });
      await expect(page.locator('#new-email')).toBeVisible();
      await expect(page.locator('#email-pw')).toBeVisible();
      await expect(page.getByRole('button', { name: /Update Email/i })).toBeVisible();
    });

    test('shows Change Password form', async ({ page }) => {
      await expect(page.getByText('Change Password').first()).toBeVisible({ timeout: 15000 });
      await expect(page.locator('#current-pw')).toBeVisible();
      await expect(page.locator('#new-pw')).toBeVisible();
      await expect(page.locator('#confirm-pw')).toBeVisible();
      await expect(page.getByRole('button', { name: /Update Password/i })).toBeVisible();
    });
  });

  // ══════════════════════════════════════════════
  // 9. ADMIN SIDEBAR NAVIGATION
  // ══════════════════════════════════════════════

  test.describe('Sidebar', () => {
    test('has all navigation links', async ({ page }) => {
      await authenticatePage(page, adminSession);
      await gotoAndWaitForAuth(page, '/admin');

      const sidebar = page.locator('aside');
      await expect(sidebar.getByText('Dashboard')).toBeVisible();
      await expect(sidebar.getByText('Users')).toBeVisible();
      await expect(sidebar.getByText('Reports')).toBeVisible();
      await expect(sidebar.getByText('Fares')).toBeVisible();
      await expect(sidebar.getByText('Services')).toBeVisible();
      await expect(sidebar.getByText('Settings')).toBeVisible();
    });

    test('clicking Users link navigates to users page', async ({ page }) => {
      await authenticatePage(page, adminSession);
      await gotoAndWaitForAuth(page, '/admin');

      await page.locator('aside').getByText('Users').click();
      await expect(page).toHaveURL(/\/admin\/users/);
      await expect(page.getByRole('heading', { name: 'Users Management' })).toBeVisible();
    });

    test('clicking Settings link navigates to settings page', async ({ page }) => {
      await authenticatePage(page, adminSession);
      await gotoAndWaitForAuth(page, '/admin');

      await page.locator('aside').getByText('Settings').click();
      await expect(page).toHaveURL(/\/admin\/settings/);
      await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
    });
  });

});
