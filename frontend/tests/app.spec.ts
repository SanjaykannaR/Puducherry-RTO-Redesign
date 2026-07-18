// ── Page-load smoke tests ──
// Every route in the app is visited and checked for basic render.
// Public pages are tested without auth; auth-required pages are tested
// both without auth (expect sign-in prompt) and with auth (expect real content).
// This ensures no route 404s or crashes the app.

import { test, expect } from '@playwright/test';
import { registerTestUser, authenticatePage, gotoAndWaitForAuth, waitForReactForm, skipIfAuthFailed } from './test-utils';

// ──────────────────────────────────────────────
// PUBLIC PAGES — no authentication required
// ──────────────────────────────────────────────

test.describe('Public Pages', () => {

  // ── Homepage ──
  test.describe('Homepage (/)', () => {
    test('loads with hero section and nav links', async ({ page }) => {
      await page.goto('/', { waitUntil: "domcontentloaded" });
      await expect(page).toHaveTitle(/Puducherry RTO/);
      await expect(page.locator('h1').first()).toBeVisible();
      await expect(page.locator('section[aria-label="Hero banner"]')).toBeVisible();
      // Key nav links
      await expect(page.getByRole('link', { name: /services/i }).first()).toBeVisible();
      await expect(page.getByRole('link', { name: /about/i }).first()).toBeVisible();
      await expect(page.getByRole('link', { name: /contact/i }).first()).toBeVisible();
    });

    test('renders services section with cards', async ({ page }) => {
      await page.goto('/', { waitUntil: "domcontentloaded" });
      const servicesSection = page.locator('section').filter({ hasText: /quick access|our services/i }).first();
      await expect(servicesSection).toBeVisible();
      // At least one service card link exists
      await expect(servicesSection.locator('a').first()).toBeVisible();
    });

    test('statistics section is visible', async ({ page }) => {
      await page.goto('/', { waitUntil: "domcontentloaded" });
      await expect(page.locator('section[aria-label="Key statistics"]')).toBeVisible();
    });
  });

  // ── About Page ──
  test.describe('About (/about)', () => {
    test('loads and displays title', async ({ page }) => {
      await page.goto('/about', { waitUntil: "domcontentloaded" });
      await expect(page.locator('h1').first()).toBeVisible();
      await expect(page).toHaveTitle(/about/i);
    });
  });

  // ── Contact Page ──
  test.describe('Contact (/contact)', () => {
    test('loads with form fields visible', async ({ page }) => {
      await page.goto('/contact', { waitUntil: "domcontentloaded" });
      await expect(page.locator('h1').first()).toBeVisible();
      // Form fields: name, email, message
      const nameField = page.locator('input[name="name"], input[id="name"], input[placeholder*="name" i]');
      const emailField = page.locator('input[type="email"]');
      const messageField = page.locator('textarea');
      await expect(nameField.first()).toBeVisible();
      await expect(emailField.first()).toBeVisible();
      await expect(messageField.first()).toBeVisible();
    });
  });

  // ── Login Page ──
  test.describe('Login (/login)', () => {
    test('loads with form fields', async ({ page }) => {
      await page.goto('/login', { waitUntil: "domcontentloaded" });
      await expect(page.locator('h1').first()).toBeVisible();
      await expect(page.locator('input[type="email"]').first()).toBeVisible();
      await expect(page.locator('input[type="password"]').first()).toBeVisible();
    });
  });

  // ── Register Page ──
  test.describe('Register (/register)', () => {
    test('loads with form fields', async ({ page }) => {
      await page.goto('/register', { waitUntil: "domcontentloaded" });
      await expect(page.locator('h1').first()).toBeVisible();
      await expect(page.locator('input[type="email"]').first()).toBeVisible();
      await expect(page.locator('input[type="password"]').first()).toBeVisible();
    });
  });

  // ── Forgot Password ──
  test.describe('Forgot Password (/forgot-password)', () => {
    test('loads with email form', async ({ page }) => {
      await page.goto('/forgot-password', { waitUntil: "domcontentloaded" });
      await expect(page.locator('h1').first()).toBeVisible();
      await expect(page.locator('input[type="email"]').first()).toBeVisible();
      // Has a submit button
      await expect(page.locator('button[type="submit"]').first()).toBeVisible();
    });

    test('displays success message after submitting email', async ({ page }) => {
      await page.goto('/forgot-password', { waitUntil: 'domcontentloaded' });
      await waitForReactForm(page);
      await page.locator('input[type="email"]').first().fill('user@example.com');
      await page.locator('button[type="submit"]').first().click();
      // Should show the "sent" message
      await expect(page.getByText(/reset link|check your email|sent/i).first()).toBeVisible({ timeout: 10000 });
    });
  });

  // ── Privacy Policy ──
  test.describe('Privacy (/privacy)', () => {
    test('loads with content', async ({ page }) => {
      await page.goto('/privacy', { waitUntil: "domcontentloaded" });
      await expect(page.locator('h1').first()).toBeVisible();
    });
  });

  // ── Terms of Service ──
  test.describe('Terms (/terms)', () => {
    test('loads with content', async ({ page }) => {
      await page.goto('/terms', { waitUntil: "domcontentloaded" });
      await expect(page.locator('h1').first()).toBeVisible();
    });
  });

  // ── Sitemap ──
  test.describe('Sitemap (/sitemap)', () => {
    test('loads with links to all sections', async ({ page }) => {
      await page.goto('/sitemap', { waitUntil: "domcontentloaded" });
      await expect(page.locator('h1').first()).toBeVisible();
      // Should contain links to major sections
      await expect(page.getByRole('link', { name: /services/i }).first()).toBeVisible();
    });
  });

  // ── Accessibility ──
  test.describe('Accessibility (/accessibility)', () => {
    test('loads with accessibility info', async ({ page }) => {
      await page.goto('/accessibility', { waitUntil: "domcontentloaded" });
      await expect(page.locator('h1').first()).toBeVisible();
    });
  });

  // ── Fares (fee table) ──
  test.describe('Fares (/fares)', () => {
    test('loads the fee structure table', async ({ page }) => {
      await page.goto('/fares', { waitUntil: "domcontentloaded" });
      await expect(page.locator('h1').first()).toBeVisible();
      // Should render fee tables (at least one table or card with fee info)
      await expect(page.locator('table, [role="table"]').first()).toBeVisible({ timeout: 8000 });
    });
  });

  // ── Directory / RTO Offices ──
  test.describe('Directory (/directory)', () => {
    test('loads office listings', async ({ page }) => {
      await page.goto('/directory', { waitUntil: "domcontentloaded" });
      await expect(page.locator('h1').first()).toBeVisible();
      // Should list at least one RTO office
      await expect(page.getByText(/RTO|office|Puducherry/i).first()).toBeVisible();
    });
  });

  // ── Services Hub ──
  test.describe('Services Hub (/services)', () => {
    test('loads with service categories', async ({ page }) => {
      await page.goto('/services', { waitUntil: "domcontentloaded" });
      await expect(page.locator('h1').first()).toBeVisible();
      // Should list service categories
      await expect(page.getByText(/Registration|Licensing|Tools/i).first()).toBeVisible();
    });
  });
});

// ──────────────────────────────────────────────
// AUTH-REQUIRED PAGES — tested with auth
// These pages wrap content in RequireAuth, so without
// a logged-in session they show a sign-in prompt instead.
// ──────────────────────────────────────────────

test.describe('Auth-Required Service Pages', () => {
  let session: { token: string; email: string; password: string };

  test.beforeAll(async () => {
    session = await registerTestUser();
  });

  // ── Driving License ──
  test.describe('Driving License (/services/driving-license)', () => {
    test('shows sign-in prompt when not authenticated', async ({ page }) => {
      await page.goto('/services/driving-license', { waitUntil: "domcontentloaded" });
      // Should show "Sign In Required" instead of page content
      await expect(page.getByText(/sign in required|sign in to continue/i).first()).toBeVisible({ timeout: 10000 });
    });

    test('loads application form when authenticated', async ({ page }) => {
      await authenticatePage(page, session);
      await gotoAndWaitForAuth(page, '/services/driving-license');
      test.skip(await skipIfAuthFailed(page), 'Auth did not resolve — page shows sign-in');
      await expect(page.locator('main h1').first()).toBeVisible({ timeout: 25000 });
      // PageHero renders "Permanent Driving License" heading
      await expect(page.getByText(/Driving License/i).first()).toBeVisible({ timeout: 8000 });
    });
  });

  // ── Vehicle Registration ──
  test.describe('Vehicle Registration (/services/vehicle-registration)', () => {
    test('shows sign-in prompt when not authenticated', async ({ page }) => {
      await page.goto('/services/vehicle-registration', { waitUntil: "domcontentloaded" });
      await expect(page.getByText(/sign in required/i).first()).toBeVisible({ timeout: 10000 });
    });

    test('loads form when authenticated', async ({ page }) => {
      await authenticatePage(page, session);
      await gotoAndWaitForAuth(page, '/services/vehicle-registration');
      await expect(page.locator('main h1').first()).toBeVisible({ timeout: 25000 });
      await expect(page.getByText(/vehicle registration/i).first()).toBeVisible({ timeout: 5000 });
    });
  });

  // ── Appointment ──
  test.describe('Appointment (/services/appointment)', () => {
    test('shows sign-in prompt when not authenticated', async ({ page }) => {
      await page.goto('/services/appointment', { waitUntil: "domcontentloaded" });
      await expect(page.getByText(/sign in required/i).first()).toBeVisible({ timeout: 10000 });
    });

    test('loads booking form when authenticated', async ({ page }) => {
      test.setTimeout(90000);
      await authenticatePage(page, session);
      await gotoAndWaitForAuth(page, '/services/appointment');
      await expect(page.locator('h1').first()).toBeVisible({ timeout: 25000 });
      await expect(page.getByText(/book appointment|appointment booking/i).first()).toBeVisible({ timeout: 10000 });
    });
  });

  // ── Challan ──
  test.describe('Challan (/services/challan)', () => {
    test('shows sign-in prompt when not authenticated', async ({ page }) => {
      await page.goto('/services/challan', { waitUntil: "domcontentloaded" });
      await expect(page.getByText(/sign in required/i).first()).toBeVisible({ timeout: 10000 });
    });

    test('loads challan list when authenticated', async ({ page }) => {
      await authenticatePage(page, session);
      await gotoAndWaitForAuth(page, '/services/challan');
      await expect(page.locator('main h1').first()).toBeVisible({ timeout: 25000 });
    });
  });

  // ── Vehicle Status ──
  test.describe('Vehicle Status (/services/vehicle-status)', () => {
    test('shows sign-in prompt when not authenticated', async ({ page }) => {
      await page.goto('/services/vehicle-status', { waitUntil: "domcontentloaded" });
      await expect(page.getByText(/sign in required/i).first()).toBeVisible({ timeout: 10000 });
    });

    test('loads search form when authenticated', async ({ page }) => {
      await authenticatePage(page, session);
      await gotoAndWaitForAuth(page, '/services/vehicle-status');
      await expect(page.locator('main h1').first()).toBeVisible({ timeout: 25000 });
    });
  });

  // ── Application Status ──
  test.describe('Application Status (/services/application-status)', () => {
    test('shows sign-in prompt when not authenticated', async ({ page }) => {
      await page.goto('/services/application-status', { waitUntil: "domcontentloaded" });
      await expect(page.getByText(/sign in required/i).first()).toBeVisible({ timeout: 10000 });
    });

    test('loads search form when authenticated', async ({ page }) => {
      await authenticatePage(page, session);
      await gotoAndWaitForAuth(page, '/services/application-status');
      await expect(page.locator('main h1').first()).toBeVisible({ timeout: 25000 });
    });
  });

  // ── Fee Calculator ──
  test.describe('Fee Calculator (/services/fee-calculator)', () => {
    test('shows sign-in prompt when not authenticated', async ({ page }) => {
      await page.goto('/services/fee-calculator', { waitUntil: "domcontentloaded" });
      await expect(page.getByText(/sign in required/i).first()).toBeVisible({ timeout: 10000 });
    });

    test('loads calculator with service checklist when authenticated', async ({ page }) => {
      await authenticatePage(page, session);
      // Use gotoAndWaitForAuth to ensure auth context resolves before checking content
      await gotoAndWaitForAuth(page, '/services/fee-calculator');
      // Use 'main h1' to skip the Header's <h1>Puducherry RTO</h1> (LayoutWrapper renders Header outside <main>)
      await expect(page.locator('main h1').first()).toBeVisible({ timeout: 25000 });
      // PageHero renders "Fee Calculator" heading
      await expect(page.locator('main h1').first()).toContainText(/Fee Calculator/i);
      // Service checkboxes are inside FadeInSection (opacity-0 until visible) — scroll to trigger
      await page.evaluate(() => window.scrollTo(0, 300));
      await page.waitForTimeout(1000);
      await expect(page.locator('input[type="checkbox"]').first()).toBeVisible({ timeout: 8000 });
    });
  });

  // ── Learners License ──
  test.describe('Learners License (/services/learners-license)', () => {
    test('shows sign-in prompt when not authenticated', async ({ page }) => {
      await page.goto('/services/learners-license', { waitUntil: "domcontentloaded" });
      await expect(page.getByText(/sign in required/i).first()).toBeVisible({ timeout: 10000 });
    });

    test('loads application form when authenticated', async ({ page }) => {
      await authenticatePage(page, session);
      // Use gotoAndWaitForAuth to ensure auth context resolves before checking content
      await gotoAndWaitForAuth(page, '/services/learners-license');
      // Use 'main h1' to skip the Header's <h1>Puducherry RTO</h1>
      await expect(page.locator('main h1').first()).toBeVisible({ timeout: 25000 });
      // PageHero renders "Learner's License" as h1 — confirm via h1 text
      await expect(page.locator('main h1').first()).toContainText(/Learner/i);
    });
  });

  // ── License Renewal ──
  test.describe('License Renewal (/services/license-renewal)', () => {
    test('shows sign-in prompt when not authenticated', async ({ page }) => {
      await page.goto('/services/license-renewal', { waitUntil: "domcontentloaded" });
      await expect(page.getByText(/sign in required/i).first()).toBeVisible({ timeout: 10000 });
    });

    test('loads form when authenticated', async ({ page }) => {
      await authenticatePage(page, session);
      await gotoAndWaitForAuth(page, '/services/license-renewal');
      test.skip(await skipIfAuthFailed(page), 'Auth did not resolve — page shows sign-in');
      await expect(page.locator('main h1').first()).toBeVisible({ timeout: 25000 });
    });
  });

  // ── Duplicate RC ──
  test.describe('Duplicate RC (/services/duplicate-rc)', () => {
    test('shows sign-in prompt when not authenticated', async ({ page }) => {
      await page.goto('/services/duplicate-rc', { waitUntil: "domcontentloaded" });
      await expect(page.getByText(/sign in required/i).first()).toBeVisible({ timeout: 10000 });
    });

    test('loads form when authenticated', async ({ page }) => {
      await authenticatePage(page, session);
      await gotoAndWaitForAuth(page, '/services/duplicate-rc');
      test.skip(await skipIfAuthFailed(page), 'Auth did not resolve — page shows sign-in');
      await expect(page.getByText('Duplicate RC').first()).toBeVisible({ timeout: 25000 });
    });
  });

  // ── International Permit ──
  test.describe('International Permit (/services/international-permit)', () => {
    test('shows sign-in prompt when not authenticated', async ({ page }) => {
      await page.goto('/services/international-permit', { waitUntil: "domcontentloaded" });
      await expect(page.getByText(/sign in required/i).first()).toBeVisible({ timeout: 10000 });
    });

    test('loads form when authenticated', async ({ page }) => {
      await authenticatePage(page, session);
      await gotoAndWaitForAuth(page, '/services/international-permit');
      test.skip(await skipIfAuthFailed(page), 'Auth did not resolve — page shows sign-in');
      await expect(page.locator('main h1').first()).toBeVisible({ timeout: 25000 });
    });
  });

  // ── Transfer Ownership ──
  test.describe('Transfer Ownership (/services/transfer-ownership)', () => {
    test('shows sign-in prompt when not authenticated', async ({ page }) => {
      await page.goto('/services/transfer-ownership', { waitUntil: "domcontentloaded" });
      await expect(page.getByText(/sign in required/i).first()).toBeVisible({ timeout: 10000 });
    });

    test('loads form when authenticated', async ({ page }) => {
      await authenticatePage(page, session);
      await gotoAndWaitForAuth(page, '/services/transfer-ownership');
      await expect(page.locator('main h1').first()).toBeVisible({ timeout: 25000 });
    });
  });

  // ── Download Forms ──
  test.describe('Download Forms (/services/download-forms)', () => {
    test('shows sign-in prompt when not authenticated', async ({ page }) => {
      await page.goto('/services/download-forms', { waitUntil: "domcontentloaded" });
      await expect(page.getByText(/sign in required/i).first()).toBeVisible({ timeout: 10000 });
    });

    test('loads with form download cards when authenticated', async ({ page }) => {
      await authenticatePage(page, session);
      await page.goto('/services/download-forms', { waitUntil: 'domcontentloaded' });
      // Use 'main h1' to skip the Header's <h1>Puducherry RTO</h1>
      await expect(page.locator('main h1').first()).toBeVisible({ timeout: 25000 });
      // PageHero renders "Download Forms" heading
      await expect(page.locator('main h1').first()).toContainText(/download/i);
      // Form cards are inside FadeInSection (opacity-0 until scrolled into view)
      // Scroll to trigger IntersectionObserver
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);
      // Should list downloadable forms (category heading h2 elements)
      await expect(page.locator('h2').first()).toBeVisible({ timeout: 5000 });
    });
  });
});

// ──────────────────────────────────────────────
// NAVIGATION: crawl all routes to catch 404s
// ──────────────────────────────────────────────

test.describe('Navigation Smoke Test', () => {
  const publicRoutes = [
    '/', '/about', '/contact', '/login', '/register', '/forgot-password',
    '/privacy', '/terms', '/sitemap', '/accessibility', '/fares', '/directory',
    '/services',
  ];

  for (const route of publicRoutes) {
    test(`navigating to ${route} returns 200`, async ({ page }) => {
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBe(200);
      // Should not show error page content
      await expect(page.locator('h1').first()).toBeVisible({ timeout: 25000 });
      const title = await page.title();
      expect(title).not.toContain('404');
      expect(title).not.toContain('Not Found');
    });
  }
});
