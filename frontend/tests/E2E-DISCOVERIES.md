# E2E Test Discoveries — Playwright on Windows + Next.js 16

Lessons learned stabilizing 112 Playwright E2E tests for the RTO Portal.

---

## 1. Auth Context Race Condition (Biggest Source of Flakiness)

`page.goto()` after `authenticatePage()` triggers a fresh page load where AuthContext re-initializes: reads localStorage → calls `/auth/me` → sets user → RequireAuth shows children. Content doesn't appear until `/auth/me` resolves + React re-renders.

**Fix:** Use `gotoAndWaitForAuth(page, url)` which sets up a `/auth/me` response listener BEFORE navigation and waits for it to complete.

**Anti-pattern:** `await page.goto('/admin', { waitUntil: 'networkidle' })` — `networkidle` fires before auth resolves on SPAs.

---

## 2. `networkidle` is Unreliable for SPAs

`waitUntil: 'networkidle'` completes when there are no network requests for 500ms. On Next.js SPAs, this fires BEFORE AuthContext, data fetches, and React hydration complete — the page appears loaded but content is still rendering.

**When to use `domcontentloaded`:** For `page.goto()` in `authenticatePage()` and `gotoAndWaitForAuth()` — faster and lets us manually wait for specific signals.

**When `networkidle` is OK:** Public pages with no auth or dynamic data (e.g., `/about`, `/contact`).

---

## 3. FadeInSection Requires Scroll-to-View

Components wrapped in `FadeInSection` use IntersectionObserver and start with `opacity-0`. They're invisible to Playwright until scrolled into view.

**Fix:** `await locator.scrollIntoViewIfNeeded()` before asserting visibility.

---

## 4. CardTitle ≠ Heading

shadcn `<CardTitle>` renders as a `<div>`, not an `<h1>`–`<h6>`. `getByRole('heading', { name: 'X' })` won't match it.

**Fix:** Use `getByText('X').first()` for CardTitle text, or add `.first()` to avoid strict mode violations.

---

## 5. STATUS_STACK_OVERFLOW on Windows (code 3221225794)

Windows Chromium crashes with this error code under heavy page load. Known Playwright issue.

**Mitigation:**
- `retries: 0` (prevents cascade — a crashed test shouldn't retry and crash again)
- `workers: 1` (single worker reduces memory pressure)
- Avoid `networkidle` + `page.goto()` in succession — prefer `gotoAndWaitForAuth()`
- Use `domcontentloaded` instead of `networkidle` for authenticated pages

---

## 6. Rate Limiter Blocks Test Registration

The backend rate limiter (express-rate-limit) blocks `registerTestUser()` calls during E2E runs because each `beforeAll` + `beforeEach` hits `/api/auth/register`.

**Fix:** Start backend with `PLAYWRIGHT_TEST=1` env var to bypass the rate limiter entirely.

---

## 7. Form Inputs Without Attributes

LL/DL/Transfer pages have bare `<Input>` components with sibling `<label>` — no `name`, `id`, or `placeholder`.

**Fix:** Use CSS sibling selectors: `label:has-text("Full Name") ~ input`. The language `<select>` in the Header means vehicle type selects must be targeted as `label:has-text("Vehicle Type") ~ select` to avoid matching the header selector.

---

## 8. Status Overflow Cascade

When a test crashes with STATUS_STACK_OVERFLOW (Windows bug), the worker process dies. With `retries > 0`, Playwright re-runs the crashed test in the SAME worker state, causing an infinite cascade.

**Fix:** Always use `retries: 0` on Windows. If a test crashes, it fails once and moves on.

---

## Summary of Key Patterns

| Pattern | Anti-pattern | Correct |
|---------|-------------|---------|
| Auth navigation | `goto(url, {waitUntil:'networkidle'})` | `gotoAndWaitForAuth(page, url)` |
| Page loads | `authenticatePage` + `goto` | `authenticatePage` + `gotoAndWaitForAuth` |
| CardTitle text | `getByRole('heading', {name:'X'})` | `getByText('X').first()` |
| FadeInSection | `expect(locator).toBeVisible()` | `scrollIntoViewIfNeeded()` first |
| Test config | `retries: 1+, workers: 3+` | `retries: 0, workers: 1` |
| Backend | Start without env var | `PLAYWRIGHT_TEST=1 npx tsx src/index.ts` |
