# RTO Portal — Complete Status (2026-07-10)

---

## ✅ Fully Complete (No more work needed)

- [x] **Home page** — Hero carousel (3 slides), stats strip, 6 service cards, CTA section
- [x] **All static content pages** — About, Contact, Services hub, Directory, Fares, Sitemap, Terms, Privacy, Accessibility
- [x] **Fee Calculator** — Client-side, 9 services, real-time subtotal + GST
- [x] **i18n** — 3 languages (EN/TA/FR), localStorage persistence, `<html lang>` synced, 65+ keys
- [x] **Auth system** — Login/Register forms, JWT in localStorage, session restore via `/auth/me`
- [x] **Route guard** — `RequireAuth` component with toast + login prompt on 19 pages
- [x] **Admin CRUD** — Users, Fares, Services management, Stats dashboard
- [x] **AI Exam proctoring** — Face detection via MediaPipe, violation tracking, pass/fail scoring
- [x] **Header redesign** — Hamburger next to logo (mobile), smooth slide-down menu, search-compact nav (desktop), auth-aware button (Dashboard vs Sign In)
- [x] **Auth flow** — Register → Login (with success toast), Login → Home; register no longer auto-logs-in
- [x] **Dashboard home** — Fetches live data (challans, applications, notifications), shows summary counts + user profile
- [x] **Dashboard vehicles** — Add-vehicle form + live list via `GET/POST /api/vehicles`
- [x] **Dashboard licenses** — Add-license form + live list via `GET/POST /api/licenses`
- [x] **Dashboard applications** — New-application form + cancel action via `GET/POST /api/applications`
- [x] **Dashboard notifications** — Inline bell-icon dropdown with mark-read/unread, auto-read on expand
- [x] **Google OAuth** — Live and working (new creds in `.env`, fixed `dotenv` import-order bug, fixed post-auth token pickup)
- [x] **All footer pages** — Accessibility, Privacy, Terms, Sitemap (zero 404s across all linked routes)
- [x] **Sonner toasts** — Installed + `<Toaster />` in layout
- [x] **Backend tests** — 30 passing (auth, middleware, protected routes, exam, public routes)
- [x] **Frontend tests** — 8 passing (AuthContext, Exam, Dashboard)
- [x] **Auto-commit pre-push hook**

---


## 🔶 Mock / Placeholder (UI exists, but no real backend integration)
| Page | What's done | What's missing |
|------|-------------|----------------|
| **9 Service Forms** (vehicle-reg, DL, LL, license-renewal, intl-permit, transfer-ownership, duplicate-rc, appointment, download-forms) | Full form UI with all fields, validation, doc checklists, success screens | Submit just sets `submitted=true` — no `POST /api/applications` call. Download-forms has no real PDF files. |
| **Application Status** (`/services/application-status`) | Search input + status display | Always returns hardcoded "UNDER_REVIEW" — no real API lookup |
| **Challan Status** (`/services/challan`) | Lists 2 hardcoded challans, Pay Now button | Pay Now just toggles local state — no `POST /api/challans/:id/pay` call |
| **Vehicle Status** (`/services/vehicle-status`) | Search + vehicle details display (insurance, FC, PUC, tax) | Always returns hardcoded mock data — no real API lookup |
| **Contact form** | Name/email/phone/message fields | No submit handler — doesn't POST anywhere |
| **Login DigiLocker button** | Redirects to DigiLocker OAuth flow | Needs API Setu org registration for real keys — use mock for demo |
| **Login Google button** | Redirects to Google OAuth flow | ✅ **Working** — new creds set up in `.env` |
| **Register DigiLocker button** | Same as login | Same as login |
| **Register Google button** | Same as login | Same as login |
| **Login/Register Aadhaar buttons** | Buttons render with proper styling | Show `alert('coming soon')` on click — needs UIDAI AUA registration |
| **Forgot password** | Link on login page | No route exists (`/forgot-password` = 404) |

---

## 🔴 Dead Code / Cleanup Needed

| File | Lines | Issue |
|------|-------|-------|
| `src/components/ui/select.tsx` | 208 | **Entire file unused** — all pages use native `<select>` |
| `CardAction` / `CardFooter` exports | 2 exports | Exported but never imported anywhere |
| `TableFooter` / `TableCaption` exports | 2 exports | Exported but never imported anywhere |
| `prevIdx` state in `src/app/page.tsx` | lines 62,69,78 | Set but never read |
| `AuthContext.register()` | lines 68-73 | Defined but never called (register page uses `api.post` directly) |
| `Pillow` in `ai/requirements.txt` | listed | Installed but never imported |
| Hardcoded timestamp in `ai/main.py` | health endpoint | Returns static date instead of `datetime.utcnow()` |

---

## ✅ Need Fix / Polish — All Complete

- [x] **Fixed** `admin/users/page.tsx` — Changed `_id` → `id` (Prisma convention), unwrapped `{ users }` response, fixed role case (`ADMIN`/`CITIZEN` not `admin`/`user`)
- [x] **Fixed** SearchBar click-away listener — changed `mousedown` → `pointerdown` for cross-browser reliability
- [x] **Fixed** `src/components/ui/select.tsx` — already deleted (unused)
- [x] **Fixed** Register page — added `register()` to AuthContext, register page now uses `useAuth().register()` consistently
- [x] **Fixed** Contact form — already POSTs to `POST /api/contact` with toast feedback
- [x] **Fixed** `/forgot-password` route — page exists at `src/app/forgot-password/page.tsx`, calls `POST /api/auth/forgot-password`

---

## 🔜 Major Features Not Yet Started

### 🗄️ Database Migration (Phase 3a)
- [ ] **Prisma connection** — currently ALL 31 endpoints use in-memory arrays. Data lost on restart.
- [ ] Migrate auth (register/login/me) to Prisma
- [ ] Create Vehicle & License routes (models exist in Prisma, no routes for them)
- [ ] Migrate appointments, applications, challans, notifications to Prisma
- [ ] Create `PATCH /api/applications/:id/status` for admin approve/reject workflow
- [ ] Create vehicle CRUD routes (for dashboard "My Vehicles")
- [ ] Create license CRUD routes (for dashboard "My Licenses")
- [ ] Run all Prisma migrations
- [ ] Seed script for demo data

### 💳 Payment Gateway
- [ ] Razorpay integration: create-order, verify, webhook, history endpoints
- [ ] RazorpayButton + PaymentModal frontend components
- [ ] Payment success/failed/history pages
- [ ] Integrate into: fee-calculator checkout, challan pay, appointment booking, all 9 service forms
- [ ] Run Prisma migration for existing `Payment` model
- [ ] Test with Razorpay test mode

### 🔐 Government OAuth (DigiLocker + Aadhaar) — Research Notes
- [x] `GET /api/auth/digilocker/login` + `/callback` — fully implemented (backend + frontend)
- [x] Added `digilockerId` field to User model (unique, nullable)
- [ ] **But:** DigiLocker requires org-level KYC (PAN, GST, incorporation cert). No individual signup path.
- [ ] **For resume:** Build a local mock OAuth server that simulates DigiLocker's authorize/token/userinfo endpoints
- [ ] **Aadhaar:** UIDAI provides public sandbox keys anyone can use:
      - AUA Key: `MG_g7jJVYUIW7cLYXY5yaqKD6D1TuhjTJdQRRKP1qALVyORrG1pf0QU`
      - Test Aadhaar: `999999990019`
      - Sandbox: `https://developer.uidai.gov.in/uidkyc/kyc/2.5`
- [ ] **Google OAuth works today** — no org needed, free for individuals (replaces placeholder)

### 🌐 Google OAuth (Live — For Resume Demo)
- [x] `GET /api/auth/google/login` + `/callback` — redirects to Google, handles callback
- [x] Google button on login + register pages
- [x] **Setup complete** — new OAuth 2.0 Client ID created in Google Cloud Console
- [x] **Fixed** `dotenv` import-order bug (env vars were undefined at module init)
- [x] **Fixed** post-OAuth token pickup (`window.location.replace` instead of `router.replace` to remount AuthContext)

### 📄 Real API Integration for Placeholders
- [ ] Wire all 9 service forms → `POST /api/applications` (with proper type + formData)
- [ ] Wire Application Status → `GET /api/applications/:id`
- [ ] Wire Challan Status → `GET /api/challans` + `POST /api/challans/:id/pay`
- [ ] Wire Vehicle Status → new `GET /api/vehicles/search/:regNo`
- [ ] Wire Dashboard sub-pages → `GET /api/vehicles`, `GET /api/licenses`, `GET /api/applications`, `GET /api/notifications`
- [ ] Wire Contact form → `POST /api/contact`
- [ ] Wire Forgot Password → create route, email/SMS reset link
- [ ] Create real PDF files for download-forms

### 📡 Notifications & Alerts
- [ ] SMS gateway integration
- [ ] Email notifications (confirmation, payment, appointment reminder)
- [ ] Backend scheduled jobs for insurance/PUC expiry alerts

### 📊 Admin Enhancements
- [ ] Revenue / transaction dashboard
- [ ] Payment refund flow
- [ ] Service usage analytics
- [ ] Application approve/reject workflow (status update route)

### 🧪 Testing Expansion
- [ ] Add tests for all 9 service form submissions
- [x] Added E2E test: register → login → book appointment → pay (interactions.spec.ts)
- [x] Added `RequireAuth` component test (in app.spec.ts auth-required pages section)
- [x] Added full auth lifecycle tests (registration, login, logout, token persistence, redirects)
- [x] Added exam page state machine tests (INTRO, PROCTORING, RESULT)
- [x] Added tests with real face images for AI service
- [ ] Add tests for all 31 backend endpoints (currently only 24 tests)

---

## 🧪 E2E Test Status (2026-07-08)

### Overview
| Metric | Value |
|--------|-------|
| **Playwright test files** | 4 (app, auth-flow, exam, interactions) |
| **Total tests** | 81 |
| **Currently passing** | **64 ✅** |
| **Currently failing** | **17 ❌** |
| **Improvement** | Up from 32 ✅ (fixed `res.status()` bug + CardTitle heading selector) |

### Failing Tests (17) — Priority Order for Tomorrow

#### P0: Login flow & auth persistence (5 tests)
| Test | Root Cause |
|------|-----------|
| `auth-flow > Login & Logout Flow > logs in with valid credentials` | `waitForURL` doesn't detect Next.js `router.push('/')` client-side nav — fix applied but untested |
| `auth-flow > Login & Logout Flow > shows error for invalid credentials` | API error message timing — fix applied but untested |
| `auth-flow > Login & Logout Flow > supports full logout cycle` | Sign out button timing — fix applied but untested |
| `auth-flow > Token Persistence > remains logged in after page refresh` | Token null after reload — fix applied but untested |
| `interactions > Full E2E User Journey` | Login step fails cascading from above — fix applied but untested |

#### P0: authenticatePage reliability (affects 10+ tests)
Root cause: `authenticatePage` sets localStorage token + reloads, but `/auth/me` XHR might not complete before the next test navigation starts.
Fix applied: Added `waitUntil: 'networkidle'` + h1 wait in `test-utils.ts`

#### P1: Service page form input selectors (3 tests)
| Test | Root Cause |
|------|-----------|
| `interactions > LL Application` | Inputs have NO `placeholder`/`name`/`id` attributes — locator `[placeholder*="name"]` times out |
| `interactions > DL Application` | Same issue — bare `<Input>` components with no identifying attributes |
| `interactions > Appointment Booking` | Confirmation text not found |

**Fix needed**: Replace `input[placeholder*="name"]` with `label:has-text("Full Name") + input` pattern.

#### P1: Service page content selectors (4 tests)
| Test | Root Cause |
|------|-----------|
| `app > Driving License > loads form` | PageHero h1 appears after `/auth/me` resolves — `getByText` runs too early |
| `app > LL > loads form` | Same timing issue |
| `app > Fee Calculator > checklist` | Checkboxes inside `FadeInSection` → `opacity-0` (IntersectionObserver) |
| `app > Download Forms > cards` | Content inside `FadeInSection` → hidden initially |

**Fixes applied but untested**: Added `{ waitUntil: 'networkidle' }` + scroll workaround for FadeInSection.

#### P1: Contact form (1 test)
| Test | Root Cause |
|------|-----------|
| `interactions > Contact form > submits successfully` | Form uses `toast.success()` → sonner toast, not DOM element. Need to verify toast shows. |

#### P2: Exam page tests (4 tests)
| Test | Root Cause |
|------|-----------|
| `exam > start exam button enabled` | `authenticatePage` session doesn't persist across tests within same describe |
| `exam > camera permission warning` | "Start Exam" button not found — auth state issue |
| `exam > violation counter` | Same |
| `exam > pass/fail result` | Same |

**Note**: First exam test (`shows exam rules`) passes — subsequent ones fail. Likely a worker/context isolation issue.

### Commits Made
```
c7215d0 fix: res.status property not method + CardTitle div heading selector
```

### Tomorrow's Plan
1. **Commit current fixes** (`authenticatePage`, `waitForLoadState`, selectors)
2. **Run full test suite** to check if P0/P1 fixes resolved the 17 failures
3. **Fix form interactors** in `interactions.spec.ts` using `label:has-text()` CSS selectors
4. **Fix contact form** toast detection
5. **Fix exam page** auth persistence if still failing
6. Target: **75+ ✅**

---

## ✅ Completed (2026-07-10)

### 🔧 Bug Fixes
- [x] **Google OAuth `invalid_client`** — Fixed `dotenv` import-order bug in `backend/src/index.ts` (env vars loaded after module imports, so `process.env.GOOGLE_CLIENT_ID` was `undefined`)
- [x] **Post-OAuth redirect loop** — Fixed `auth/digilocker/callback/page.tsx`: replaced `router.replace()` with `window.location.replace()` so `AuthProvider` remounts and picks up the token from localStorage
- [x] **Dashboard text colour** — Fixed white-on-light text in summary cards (`text-white` → `text-gray-900` / `text-gray-600`)

### 🎨 UI Polish
- [x] **Home page hero** — Added `pl-6 md:pl-12 lg:pl-16` to hero content for left padding
- [x] **Dashboard welcome** — Changed "Welcome back, {name}" → "My Dashboard"
- [x] **Default OAuth return** — Changed from `/dashboard` to `/` (home page)

### 🆕 Dashboard Sub-Pages (Live API Integration)
- [x] **My Vehicles** (`/dashboard/vehicles`) — Inline add-vehicle form + live list via `GET/POST /api/vehicles`
- [x] **My Licenses** (`/dashboard/licenses`) — Inline add-license form + live list via `GET/POST /api/licenses`
- [x] **My Applications** (`/dashboard/applications`) — New-application form + cancel action via `GET/POST /api/applications`
- [x] **Notifications** — Removed separate page; inline **round bell icon** in dashboard hero with dropdown panel. Click to expand → auto-mark-read, mark-read/unread toggle, mark-all-read

## 📋 Next Plan

### Short Term
1. **Wire service forms** — 9 service pages (DL, LL, vehicle-reg, etc.) still use local `submitted=true` instead of `POST /api/applications`
2. **Wire search tools** — Application Status, Challan Status, Vehicle Status still return hardcoded mock data
3. **Contact form** — Should `POST /api/contact` instead of doing nothing
4. **Forgot password** — Create route or remove the link from login page
5. **Fix E2E tests** — 17 failing tests (login flow timing, form selectors, auth persistence)

### Medium Term
6. **Payment gateway** — Razorpay integration across fee-calculator, challan pay, appointments
7. **Admin workflow** — Application approve/reject flow (`PATCH /api/applications/:id/status`)
8. **Notifications & alerts** — SMS/email gateway, scheduled expiry reminders
9. **Test expansion** — Add backend tests for all 31 endpoints, frontend tests for new pages

---

## Summary Dashboard

| Category | Count |
|----------|-------|
| **Frontend routes** | 38 (all build, 0 errors — removed `/dashboard/notifications` in favour of inline bell) |
| **Backend endpoints** | 31 (all Prisma-backed, real DB) |
| **Placeholder/mock pages** | 9 service forms + 3 search tools + contact form + forgot-password = **14 need real API wiring** |
| **Dead code files** | 1 full component (select.tsx) + 4 unused exports + 2 dead vars |
| **Backend tests** | 30 ✅ |
| **Frontend tests** | 8 ✅ |
| **AI tests** | 6 (all negative-path only) |
