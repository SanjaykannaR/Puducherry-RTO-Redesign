import { defineConfig, devices } from '@playwright/test';

/**
 * Shard 1 — runs app.spec.ts + auth-flow.spec.ts (65 tests)
 * Keeps Chromium under the ~100 navigation threshold on Windows.
 * Run via: npx playwright test --config=playwright.shard1.config.ts
 */
export default defineConfig({
  testDir: './tests',
  testMatch: ['app.spec.ts', 'auth-flow.spec.ts'],
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
