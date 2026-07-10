# RTO Project Notes — Playwright E2E Tests

## Project Stack
- Frontend: Next.js App Router (port 3000)
- Backend: Express + Prisma + SQLite (port 5000)
- Auth: JWT in localStorage, AuthContext + RequireAuth component
- i18n: 3 languages (EN/TA/FR)
- Testing: Playwright with 4 test files, 81 tests

## Critical Knowledge

### CardTitle renders as `<div>` NOT `<h1-h6>`
`src/components/ui/card.tsx` — `CardTitle` is a `<div data-slot="card-title">`.
- `getByRole('heading')` will NEVER match it
- Use `getByText()` instead

### Header has an `<h1>` element
`src/components/layout/Header.tsx:72` renders `<h1>Puducherry RTO</h1>`.
- `page.locator('h1').first()` finds THIS h1 on any non-auth page
- The actual page content h1 (from PageHero) appears LATER after RequireAuth resolves
- Always wait for network idle before checking page-specific h1 text

### FadeInSection uses IntersectionObserver
`src/components/ui/fade-in-section.tsx` — starts with `opacity-0 translate-y-8`.
- Elements inside it are invisible to Playwright's `toBeVisible()` until scrolled into view
- Workaround: `page.evaluate(() => window.scrollTo(0, 300))` + `page.waitForTimeout(1000)`

### Form inputs lack identifying attributes
Service pages (LL, DL, etc.) use bare `<Input>` with NO `name`, `placeholder`, or `id`.
- Labels are plain `<label>` without `htmlFor`
- Use `label:has-text("Full Name") + input` CSS selector to target them

### Login flow uses client-side navigation
`router.push('/')` in Next.js App Router doesn't trigger a full page navigation.
- `page.waitForURL(..., { timeout: 10000 })` with default `'load'` event times out
- Use `page.waitForLoadState('networkidle')` then check `page.url()` instead

## Test Files
| File | Purpose | Tests |
|------|---------|-------|
| `tests/app.spec.ts` | 37 page-load smoke tests (public + auth-required) | 42 |
| `tests/auth-flow.spec.ts` | Auth lifecycle: register, login, logout, persistence, redirects | 10 |
| `tests/exam.spec.ts` | Exam state machine: INTRO, PROCTORING, RESULT | 6 |
| `tests/interactions.spec.ts` | Forms, dashboard, admin gate, full journey | 11 |

## Test Utilities
`tests/test-utils.ts`:
- `registerTestUser()` — POSTs to `localhost:5000/api/auth/register`, returns session
- `authenticatePage()` — sets localStorage token + reloads, waits for auth to resolve
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — pre-seeded admin credentials

## Current Status (2026-07-08)
- 64 ✅ / 17 ❌ (up from 32 ✅ after fixing `res.status()` bug)
- Main remaining issues: form input locators, login flow timing, auth persistence across tests
- See TODO.md for detailed breakdown

## OAuth Issue (2026-07-10)
- Google OAuth returned `401 invalid_client: The OAuth client was not found` — old credentials referred to a deleted client
- **FIXED**: Updated `backend/.env` with new Google OAuth credentials
  - Client ID: `1096842073969-7d7dm60f4qeok6a6h44lpa01lggbr1al.apps.googleusercontent.com`
  - Redirect URI: `http://localhost:5000/api/auth/google/callback` (must match Google Cloud Console)
- Code in `backend/src/routes/google.ts` is correct — only credentials were replaced
