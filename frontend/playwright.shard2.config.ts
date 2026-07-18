import { defineConfig, devices } from '@playwright/test';

/**
 * Shard 2 — runs admin.spec.ts + interactions.spec.ts + admin-applications.spec.ts + exam.spec.ts (66 tests)
 * Keeps Chromium under the ~100 navigation threshold on Windows.
 * Run via: npx playwright test --config=playwright.shard2.config.ts
 */
export default defineConfig({
  testDir: './tests',
  testMatch: ['admin.spec.ts', 'interactions.spec.ts', 'admin-applications.spec.ts', 'exam.spec.ts'],
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 90000,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
