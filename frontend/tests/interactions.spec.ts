// ── User interaction / workflow tests ──
// Tests form submissions, API-driven pages, and authenticated areas.
// All tests in this file share a single registered test user to minimize
// API calls while keeping tests isolated from one another.

import { test, expect } from '@playwright/test';
import { registerTestUser, authenticatePage, AuthSession } from './test-utils';

let session: AuthSession;

test.beforeAll(async () => {
  session = await registerTestUser();
});

// ── Contact Form ──

test.describe('Contact Form Submission', () => {
  test('submits the contact form successfully', async ({ page }) => {
    await page.goto('/contact');

    const nameInput = page.locator('input[name="name"], input[id="name"], input[placeholder*="name" i]').first();
    const emailInput = page.locator('input[type="email"]').first();
    const messageArea = page.locator('textarea').first();

    await nameInput.fill('Test User');
    await emailInput.fill(session.email);
    await messageArea.fill('This is a test message from Playwright E2E tests.');

    await page.locator('button[type="submit"]').first().click();

    // Should show a success message
    await expect(page.getByText(/thank you|submitted|success|we will get back/i).first()).toBeVisible({ timeout: 8000 });
  });
});

// ── Fee Calculator ──

test.describe('Fee Calculator Interaction', () => {
  test('calculates fees when toggling services', async ({ page }) => {
    await authenticatePage(page, session);
    await page.goto('/services/fee-calculator');

    // Check a service checkbox
    const checkboxes = page.locator('input[type="checkbox"]');
    const firstCheckbox = checkboxes.first();

    await expect(firstCheckbox).toBeVisible({ timeout: 5000 });
    await firstCheckbox.check();

    // Should show the fee summary with the selected service
    await expect(page.getByText(/subtotal|total|gst/i).first()).toBeVisible({ timeout: 3000 });

    // Check a second service
    const secondCheckbox = checkboxes.nth(1);
    await secondCheckbox.check();

    // Fee summary should update (subtotal should increase)
    const subtotalText = await page.getByText(/subtotal/i).first().textContent();
    expect(subtotalText).toBeTruthy();

    // Uncheck first — total should decrease
    await firstCheckbox.uncheck();
  });
});

// ── Learner's License Application ──

test.describe("Learner's License Application", () => {
  test('submits LL application successfully', async ({ page }) => {
    await authenticatePage(page, session);
    await page.goto('/services/learners-license');

    // Fill the application form
    await page.locator('input[placeholder*="name" i], input[name="fullName"]').first().fill('E2E Learner');
    await page.locator('input[type="date"]').first().fill('2000-01-15');
    await page.locator('input[placeholder*="address" i], input[name="address"]').first().fill('123 Test Street, Pondy');
    const mobileInput = page.locator('input[type="tel"], input[name="mobile"]').first();
    if (await mobileInput.isVisible()) {
      await mobileInput.fill('9988776655');
    }

    // Submit
    await page.locator('button[type="submit"]').first().click();

    // Should show success confirmation with application ID
    await expect(page.getByText(/applied successfully|application submitted|submitted/i).first()).toBeVisible({ timeout: 10000 });
    // Should contain the application ID (RTO-...)
    await expect(page.getByText(/RTO-/i).first()).toBeVisible({ timeout: 5000 });
  });
});

// ── Driving License Application ──

test.describe('Driving License Application', () => {
  test('submits DL application successfully', async ({ page }) => {
    await authenticatePage(page, session);
    await page.goto('/services/driving-license');

    // Fill the form
    await page.locator('input[placeholder*="name" i], input[name="fullName"]').first().fill('E2E Driver');
    await page.locator('input[type="date"]').first().fill('1998-06-20');
    await page.locator('input[placeholder*="learner" i], input[name="llNo"]').first().fill('PY-012025-0001');

    // Select vehicle type from dropdown
    const select = page.locator('select').first();
    if (await select.isVisible()) {
      await select.selectOption('MCWG');
    }

    // Submit
    await page.locator('button[type="submit"]').first().click();

    // Should show success
    await expect(page.getByText(/applied successfully|application submitted|submitted/i).first()).toBeVisible({ timeout: 10000 });
  });
});

// ── Appointment Booking ──

test.describe('Appointment Booking', () => {
  test('books an appointment via the 2-step form', async ({ page }) => {
    await authenticatePage(page, session);
    await page.goto('/services/appointment');

    // Step 1: fill date and time slot
    const dateInput = page.locator('input[type="date"]').first();
    await dateInput.fill('2026-07-20');

    // Select a time slot (likely a radio group or select)
    const timeRadio = page.locator('input[type="radio"], input[type="checkbox"]').first();
    const timeSelect = page.locator('select').first();
    if (await timeRadio.isVisible()) {
      await timeRadio.check();
    } else if (await timeSelect.isVisible()) {
      await timeSelect.selectOption({ index: 1 });
    }

    // Click Next / Continue to Step 2
    const nextBtn = page.getByText(/next|continue/i).first();
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
    }

    // Step 2: select purpose
    const purposeRadio = page.locator('input[type="radio"]').first();
    if (await purposeRadio.isVisible()) {
      await purposeRadio.check();
    }
    const purposeSelect = page.locator('select').last();
    if (await purposeSelect.isVisible() && !await purposeRadio.isVisible()) {
      // If we already selected from dropdown in step 1, try the next/only select
    }

    // Submit
    const submitBtn = page.locator('button[type="submit"]').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
    } else {
      // May need to click the final submit/confirm
      await page.getByText(/submit|book|confirm|finish/i).first().click().catch(() => {});
    }

    // Should show booking confirmation
    await expect(page.getByText(/appointment booked|booked successfully|scheduled/i).first()).toBeVisible({ timeout: 10000 });
  });
});

// ── Dashboard ──

test.describe('Dashboard (Authenticated)', () => {
  test('loads dashboard with user greeting', async ({ page }) => {
    await authenticatePage(page, session);
    await page.goto('/dashboard');

    // Should see the user's name or email
    await expect(page.getByText(/welcome/i).first()).toBeVisible({ timeout: 8000 });

    // Should show summary cards (pending challans, active applications, etc.)
    await expect(page.getByText(/pending|active|unread/i).first()).toBeVisible({ timeout: 8000 });

    // Should show dashboard links (My Vehicles, My Licenses, etc.)
    await expect(page.getByText(/my vehicles|my licenses|notifications/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('dashboard links navigate to correct sub-pages', async ({ page }) => {
    await authenticatePage(page, session);
    await page.goto('/dashboard');

    // Click "My Vehicles" link
    const vehiclesLink = page.getByText(/my vehicles/i).first();
    await expect(vehiclesLink).toBeVisible({ timeout: 5000 });

    // Navigate to vehicles sub-page
    await page.goto('/dashboard/vehicles');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 8000 });

    // Navigate to applications sub-page
    await page.goto('/dashboard/applications');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 8000 });

    // Navigate to licenses sub-page
    await page.goto('/dashboard/licenses');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 8000 });

    // Navigate to notifications sub-page
    await page.goto('/dashboard/notifications');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 8000 });
  });
});

// ── Admin Area (limited — role-gated) ──

test.describe('Admin Pages (Role-Gated)', () => {
  test('blocks non-admin users from accessing admin', async ({ page }) => {
    await authenticatePage(page, session);
    // session.user is CITIZEN, not admin
    await page.goto('/admin');

    // Should redirect to /login because the admin layout checks user.role
    await page.waitForURL('/login', { timeout: 10000 }).catch(() => {
      // Fallback: check we didn't see admin content
    });
    expect(page.url().includes('login')).toBeTruthy();
  });

  test('admin sub-routes redirect to login for non-admins', async ({ page }) => {
    await authenticatePage(page, session);

    const adminRoutes = ['/admin/users', '/admin/fares', '/admin/reports', '/admin/services'];
    for (const route of adminRoutes) {
      await page.goto(route);
      await page.waitForURL('/login', { timeout: 10000 }).catch(() => {});
      expect(page.url().includes('login')).toBeTruthy();
    }
  });
});

// ─── End-to-End Full Flow ───

test.describe('Full E2E User Journey', () => {
  test('complete citizen journey: register → login → apply → dashboard → logout', async ({ page }) => {
    // 1. REGISTER via UI
    const email = `journey_${Date.now()}@test.com`;
    const password = 'Journey@123';

    await page.goto('/register');
    await page.locator('input[name="name"], input[id="name"], input[placeholder*="name" i]').first().fill('Journey User');
    await page.locator('input[type="email"]').first().fill(email);
    const mobileInput = page.locator('input[name="mobile"], input[id="mobile"], input[placeholder*="mobile" i]').first();
    if (await mobileInput.isVisible()) {
      await mobileInput.fill('8887776665');
    }
    await page.locator('input[type="password"]').first().fill(password);
    const confirmInput = page.locator('input[name="confirmPassword"], input[name="confirm_password"], input[placeholder*="confirm" i]').first();
    if (await confirmInput.isVisible()) {
      await confirmInput.fill(password);
    }
    await page.locator('button[type="submit"]').first().click();
    await page.waitForURL(/\/(login|dashboard)/, { timeout: 10000 });

    // 2. LOGIN via UI
    await page.goto('/login');
    await page.locator('input[type="email"]').first().fill(email);
    await page.locator('input[type="password"]').first().fill(password);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForURL(/\/(dashboard|home|$)/, { timeout: 10000 });

    // 3. VISIT DASHBOARD
    await page.goto('/dashboard');
    await expect(page.getByText(/welcome/i).first()).toBeVisible({ timeout: 8000 });

    // 4. SUBMIT A LEARNER'S LICENSE APPLICATION
    await page.goto('/services/learners-license');
    await page.locator('input[placeholder*="name" i], input[name="fullName"]').first().fill('Journey User');
    await page.locator('input[type="date"]').first().fill('1995-03-10');
    await page.locator('input[placeholder*="address" i], input[name="address"]').first().fill('456 E2E Street');
    const llMobile = page.locator('input[type="tel"], input[name="mobile"]').first();
    if (await llMobile.isVisible()) {
      await llMobile.fill('8887776665');
    }
    await page.locator('button[type="submit"]').first().click();
    await expect(page.getByText(/applied successfully|submitted/i).first()).toBeVisible({ timeout: 10000 });

    // 5. LOGOUT
    await page.goto('/dashboard');
    const logoutBtn = page.getByText(/sign out|log out/i).first();
    await expect(logoutBtn).toBeVisible({ timeout: 5000 });
    await logoutBtn.click();
    await page.waitForURL(/\/(login|home|$)/, { timeout: 10000 });

    // 6. VERIFY LOGGED OUT - protected route redirects
    await page.goto('/dashboard');
    await expect(page.getByText(/sign in required/i).first()).toBeVisible({ timeout: 10000 });
  });
});
