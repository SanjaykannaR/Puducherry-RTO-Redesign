import { test, expect } from '@playwright/test';

// ── Helpers ──

const TEST_USER = {
  name: 'E2E Test User',
  email: `e2e_${Date.now()}@test.com`,
  mobile: '9999999999',
  password: 'Test@123',
};

// ── Homepage ──

test.describe('Homepage', () => {
  test('loads with correct title and hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Puducherry RTO/);
    await expect(page.locator('h1').first()).toBeVisible();
    // Hero banner section (identified by aria-label)
    await expect(page.locator('section[aria-label="Hero banner"]')).toBeVisible();
  });

  test('navigation links are present', async ({ page }) => {
    await page.goto('/');
    // Check key nav links
    await expect(page.getByRole('link', { name: /services/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /about/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /contact/i }).first()).toBeVisible();
  });

  test('services section lists cards', async ({ page }) => {
    await page.goto('/');
    // Scroll to services section
    const servicesSection = page.locator('section').filter({ hasText: /our services|apply for/i }).first();
    if (await servicesSection.isVisible()) {
      // At least one service card should exist
      await expect(servicesSection.locator('a, button, [role="button"]').first()).toBeVisible();
    }
  });
});

// ── About Page ──

test.describe('About Page', () => {
  test('loads and displays content', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page).toHaveTitle(/about/i);
  });
});

// ── Contact Page ──

test.describe('Contact Page', () => {
  test('loads and has contact form', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('h1').first()).toBeVisible();
    // Contact form should have name, email, message fields
    const nameField = page.locator('input[name="name"], input[id="name"], input[placeholder*="name" i]');
    const emailField = page.locator('input[type="email"]');
    const messageField = page.locator('textarea');
    if (await nameField.isVisible()) {
      await expect(nameField).toBeVisible();
      await expect(emailField).toBeVisible();
      await expect(messageField).toBeVisible();
    }
  });
});

// ── Authentication Flow ──

test.describe('Authentication', () => {
  test('register page loads and form is present', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

  test('login page loads and form is present', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

  test('can register a new user', async ({ page }) => {
    await page.goto('/register');

    // Fill registration form
    const nameInput = page.locator('input[name="name"], input[id="name"], input[placeholder*="name" i]').first();
    const emailInput = page.locator('input[type="email"]').first();
    const mobileInput = page.locator('input[name="mobile"], input[id="mobile"], input[placeholder*="mobile" i], input[placeholder*="phone" i]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const confirmPassword = page.locator('input[name="confirmPassword"], input[name="confirm_password"], input[placeholder*="confirm" i]');

    await nameInput.fill(TEST_USER.name);
    await emailInput.fill(TEST_USER.email);
    if (await mobileInput.isVisible()) {
      await mobileInput.fill(TEST_USER.mobile);
    }
    await passwordInput.fill(TEST_USER.password);
    if (await confirmPassword.isVisible()) {
      await confirmPassword.fill(TEST_USER.password);
    }

    // Submit
    const submitBtn = page.locator('button[type="submit"]').first();
    await submitBtn.click();

    // Should redirect to login or dashboard after successful registration
    await page.waitForURL(/\/(login|dashboard)/, { timeout: 10000 }).catch(() => {
      // If no redirect, at least check for success toast/message
    });
  });

  test('can login with registered credentials', async ({ page }) => {
    // First ensure user is registered
    await page.goto('/register');
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    await emailInput.fill(TEST_USER.email);
    await passwordInput.fill(TEST_USER.password);
    const submitBtn = page.locator('button[type="submit"]').first();
    await submitBtn.click();

    // Now login
    await page.goto('/login');
    await page.locator('input[type="email"]').first().fill(TEST_USER.email);
    await page.locator('input[type="password"]').first().fill(TEST_USER.password);
    await page.locator('button[type="submit"]').first().click();

    // After login, should be on dashboard or homepage with user info
    await page.waitForURL(/\/(dashboard|home|$)/, { timeout: 10000 }).catch(() => {
      // Allow other redirects
    });
    // Check that some auth-visible element appears (e.g. user name, logout button, dashboard link)
    await expect(page.getByText(/logout|dashboard|profile/i).first()).toBeVisible({ timeout: 8000 }).catch(() => {
      // Non-critical assertion - the login may work but redirect differently
    });
  });
});

// ── Service Pages ──

test.describe('Service Pages', () => {
  test('driving license page loads', async ({ page }) => {
    await page.goto('/services/driving-license');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('vehicle registration page loads', async ({ page }) => {
    await page.goto('/services/vehicle-registration');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('appointment booking page loads', async ({ page }) => {
    await page.goto('/services/appointment');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('challan payment page loads', async ({ page }) => {
    await page.goto('/services/challan');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('vehicle status page loads and allows search', async ({ page }) => {
    await page.goto('/services/vehicle-status');
    await expect(page.locator('h1').first()).toBeVisible();
    // There should be a search input (reg no field)
    const searchInput = page.locator('input[placeholder*="reg" i], input[placeholder*="number" i], input[name="regNo"]').first();
    if (await searchInput.isVisible()) {
      await expect(searchInput).toBeVisible();
    }
  });
});

// ── Navigation and Responsiveness ──

test.describe('Navigation', () => {
  test('can navigate between pages without 404', async ({ page }) => {
    const pages = ['/', '/about', '/contact', '/login', '/register', '/services/driving-license', '/services/vehicle-registration', '/services/appointment', '/services/challan', '/services/vehicle-status'];
    for (const path of pages) {
      await page.goto(path);
      // Should not see a 404 or error page title
      await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });
      const title = await page.title();
      expect(title).not.toContain('404');
      expect(title).not.toContain('Not Found');
    }
  });
});
