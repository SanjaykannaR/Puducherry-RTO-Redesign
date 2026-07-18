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
  // CI: blob reporter produces mergeable .zip files for the merge-reports job.
  // Local: HTML report for direct viewing.
  reporter: process.env.CI ? [['blob', { outputDir: 'all-blob-reports' }]] : 'html',
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
