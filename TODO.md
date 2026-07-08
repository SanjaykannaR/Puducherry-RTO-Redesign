# RTO Portal — Complete Status (2026-07-07)

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
| **Dashboard sub-pages** (vehicles, licenses, applications, notifications) | Full UI with cards, status badges, mark-read toggles | All use hardcoded static data — no API calls to backend |
| **Contact form** | Name/email/phone/message fields | No submit handler — doesn't POST anywhere |
| **Login Aadhaar/DigiLocker buttons** | Buttons render with proper styling | Show `alert('coming soon')` on click |
| **Register Aadhaar/DigiLocker buttons** | Same as above | Same as above |
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

## 🟡 Need Fix / Polish

- [ ] **Fixing** `admin/users/page.tsx` — frontend sends `deleteTarget._id` but backend expects `req.params.id` (MongoDB convention mismatch)
- [ ] **Fixing** SearchBar click-away listener uses `mousedown` — on some browsers this can race with the toggle click
- [ ] **Fixing** `src/components/ui/select.tsx` should either be deleted or actually used
- [ ] **Fixing** Register page uses `api.post` directly instead of `useAuth().register()` — inconsistent pattern
- [ ] **Fixing** Contact form should POST to a real endpoint
- [ ] **Fixing** `/forgot-password` route needs to be created or the link removed

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

### 🔐 DigiLocker + Aadhaar
- [ ] DigiLocker OAuth: register as requester on apisetu.gov.in
- [ ] `POST /api/auth/digilocker` backend endpoint
- [ ] `/auth/digilocker/callback` page
- [ ] Wire buttons on login/register
- [ ] Add `loginWithDigiLocker()` to AuthContext
- [ ] Aadhaar biometric integration (KUA registration with UIDAI)

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

## Summary Dashboard

| Category | Count |
|----------|-------|
| **Frontend routes** | 39 (all build, 0 errors) |
| **Backend endpoints** | 31 (all in-memory, 0 using DB) |
| **Placeholder/mock pages** | 9 service forms + 4 dashboard sub-pages + 3 search tools + contact form = **17 need real API wiring** |
| **Dead code files** | 1 full component (select.tsx) + 4 unused exports + 2 dead vars |
| **Backend tests** | 30 ✅ |
| **Frontend tests** | 8 ✅ |
| **AI tests** | 6 (all negative-path only) |
