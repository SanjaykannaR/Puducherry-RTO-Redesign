# RTO Portal — All Tasks by Priority (2026-07-12)

---

## 🔴 P1 — CRITICAL (Do First — Blocks Everything Else) ✅ COMPLETE

### 1. Fix Flaky E2E Tests → 112/112 ✅
Result: **112 passed / 0 failed / 0 did not run**

| # | Root Cause | Fix |
|---|-----------|-----|
| 1a | `System Info` missing `.first()` + timeout | Added `.first()` + 15s timeout |
| 1b | Exam "start exam" timeout too low | Bumped all exam timeouts 20s→30s |
| 1c | Admin Users page `goto` without auth wait | Switched to `gotoAndWaitForAuth()` |
| 1d | "Detailed Summary" heading not found (CardTitle) | Changed to `getByText().first()` + timeout |
| 1e | "Change Email"/"Change Password" CardTitle ≠ heading | Changed to `getByText().first()` + timeout |
| 1f | Fee Calculator checkboxes invisible (FadeInSection) | Added `scrollIntoViewIfNeeded()` |
| 1g | LL Application `networkidle` → STATUS_STACK_OVERFLOW | Switched to `gotoAndWaitForAuth()` + `waitForReactForm()` |

### 2. Create E2E Discoveries Document ✅
Created `frontend/tests/E2E-DISCOVERIES.md` with 8 documented patterns.

### 3. Seed Script for Demo Data ✅
- [x] Created `backend/seed.js` — admin, 3 citizens, 4 vehicles, 3 licenses, 5 applications, 3 appointments, 2 payments, 4 notifications
- [x] Wired to `npx prisma db seed` via `prisma.config.ts`
- [x] Idempotent — safe to re-run (uses upsert + findOrCreate + count checks)

---

## 🟠 P2 — HIGH (Core Feature Completion — Makes the App "Real")

### 4. Wire 9 Service Forms → `POST /api/applications`
All 9 service pages currently just set `submitted=true`. Need real API calls:

| Service | Route | Backend Endpoint | Status |
|---------|-------|-----------------|--------|
| Vehicle Registration | `/services/vehicle-registration` | `POST /api/applications` | ❌ Mock |
| Driving License | `/services/driving-license` | `POST /api/applications` | ❌ Mock |
| Learner's License | `/services/learners-license` | `POST /api/applications` | ❌ Mock |
| License Renewal | `/services/license-renewal` | `POST /api/applications` | ❌ Mock |
| International Permit | `/services/international-permit` | `POST /api/applications` | ❌ Mock |
| Transfer Ownership | `/services/transfer-ownership` | `POST /api/applications` | ❌ Mock |
| Duplicate RC | `/services/duplicate-rc` | `POST /api/applications` | ❌ Mock |
| Appointment | `/services/appointment` | `POST /api/appointments` | ❌ Mock |
| Download Forms | `/services/download-forms` | N/A (needs PDF files) | ❌ Mock |

### 5. Wire Search Tools → Real API Lookups
| Tool | Route | Backend Endpoint | Status |
|------|-------|-----------------|--------|
| Application Status | `/services/application-status` | `GET /api/applications/:id` | ❌ Hardcoded "UNDER_REVIEW" |
| Challan Status | `/services/challan` | `GET /api/challans` + `POST /api/challans/:id/pay` | ❌ Hardcoded data |
| Vehicle Status | `/services/vehicle-status` | `GET /api/vehicles/search/:regNo` | ❌ Hardcoded data |

### 6. Admin Application Approve/Reject Workflow
- [ ] Create `PATCH /api/applications/:id/status` endpoint
- [ ] Admin panel: add approve/reject buttons on applications list
- [ ] Status transitions: PENDING → UNDER_REVIEW → APPROVED/REJECTED
- [ ] Trigger notification to citizen on status change

### 7. Payment Gateway (GRAS — Government Receipt Accounting System) ✅
- [x] Backend: `POST /api/payments/create-challan`, `POST /api/payments/verify-challan`, `GET /api/payments/history`
- [x] Backend: GRN/BRN generation, challan creation
- [x] Frontend: `<GRASPaymentButton />` + `<GRASPaymentModal />` components
- [x] Frontend: Payment success/history pages
- [x] Wire into: fee-calculator checkout, challan pay, appointment booking
- [x] Prisma schema updated (removed razorpaySignature, added paymentMethod)
- [x] Simulates real GRAS portal flow (no API keys needed)

---

## 🟡 P3 — MEDIUM (Quality & Polish)

### 8. Dead Code Cleanup
| File | Issue |
|------|-------|
| `CardAction` / `CardFooter` exports | Exported but never imported |
| `TableFooter` / `TableCaption` exports | Exported but never imported |
| `prevIdx` state in `src/app/page.tsx` | Set but never read |
| `Pillow` in `ai/requirements.txt` | Installed but never imported |
| Hardcoded timestamp in `ai/main.py` | Should use `datetime.utcnow()` |

### 9. PDF Downloads
- [ ] Create real PDF files for all 9 service form templates
- [ ] Store in `public/downloads/` or serve via backend
- [ ] Wire download buttons to actual files

### 10. Testing Expansion

**Backend (currently 24 tests, need 31):**
- [ ] Add tests for: vehicles CRUD, licenses CRUD, applications CRUD, challans CRUD, notifications CRUD
- [ ] Add tests for: admin stats, admin users, admin reports endpoints
- [x] Add tests for: payment endpoints (GRAS integration)

**Frontend/E2E:**
- [ ] Add E2E tests for all 9 service form submissions (after wiring)
- [ ] Add E2E tests for payment flow (GRAS)
- [ ] Add E2E tests for admin approve/reject workflow

### 11. DigiLocker Mock OAuth Server
- [ ] Build local mock that simulates DigiLocker's authorize/token/userinfo endpoints
- [ ] Wire existing DigiLocker button to mock server
- [ ] Needed for: resume demo (real DigiLocker requires org KYC)

### 12. Government OAuth (Aadhaar)
- [ ] UIDAI sandbox integration (keys already researched)
- [ ] AUA Key: `MG_g7jJVYUIW7cLYXY5yaqKD6D1TuhjTJdQRRKP1qALVyORrG1pf0QU`
- [ ] Test Aadhaar: `999999990019`

---

## 🔵 P4 — LOW (Nice to Have — Future Enhancements)

### 13. Notifications & Alerts
- [ ] SMS gateway integration (confirmation, payment, appointment reminder)
- [ ] Email notifications (transactional emails)
- [ ] Backend scheduled jobs for insurance/PUC expiry alerts

### 14. Admin Enhancements
- [ ] Revenue / transaction dashboard
- [ ] Payment refund flow
- [ ] Service usage analytics
- [ ] Bulk operations (approve/reject multiple applications)

### 15. Database Improvements
- [ ] Database migrations for new fields (payment, status tracking)
- [ ] Index optimization for search queries
- [ ] Backup/restore scripts

---

## ✅ COMPLETED

### E2E Test Stabilization (Sessions 3-5 — 2026-07-12)
**Result: 91/112 passing (97 achieved in intermediate runs)**

#### Backend Fixes
- [x] Rate limiter bypass with `PLAYWRIGHT_TEST=1` env var
- [x] `adminOnly` middleware uses shared Prisma client

#### Test Infrastructure
- [x] `registerTestUser()` with retry/backoff
- [x] `authenticatePage()` waits for `/auth/me`
- [x] `waitForReactForm()` checks React hydration
- [x] `gotoAndWaitForAuth()` with proper auth listener timing

#### Config
- [x] `workers: 1` (Windows stability)
- [x] `retries: 0` (prevents STATUS_STACK_OVERFLOW cascade)
- [x] `timeout: 60000`

#### Test Fixes
- [x] admin.spec.ts: KPI `.first()`, CardTitle text selectors
- [x] auth-flow.spec.ts: Login/logout/error tests, dashboard redirect
- [x] interactions.spec.ts: Fee calculator, LL/DL, dashboard, admin, Full E2E
- [x] exam.spec.ts: PROCTORING tests use `networkidle`
- [x] app.spec.ts: Forgot Password + authenticated service pages

### Features Complete
- [x] Home page (hero carousel, stats, service cards, CTA)
- [x] All static content pages (About, Contact, Services, Directory, Fares, Sitemap, Terms, Privacy, Accessibility)
- [x] Fee Calculator (client-side, 9 services, real-time subtotal + GST)
- [x] i18n (3 languages, localStorage persistence)
- [x] Auth system (Login/Register, JWT, session restore)
- [x] Route guard (RequireAuth with toast + login prompt)
- [x] Admin CRUD (Users, Fares, Services, Stats dashboard)
- [x] AI Exam proctoring (MediaPipe face detection, violation tracking)
- [x] Header redesign (hamburger menu, auth-aware button)
- [x] Dashboard (vehicles, licenses, applications, notifications)
- [x] Google OAuth (live and working)
- [x] Contact form (wired to API)
- [x] Forgot password (wired to API)
- [x] Backend tests (30 passing)
- [x] Frontend tests (8 passing)

---

## Summary Dashboard

| Category | Count |
|----------|-------|
| **Frontend routes** | 38 (all build, 0 errors) |
| **Backend endpoints** | 31 (all Prisma-backed) |
| **Mock/placeholder pages** | **12 need real API wiring** |
| **Backend tests** | 30 ✅ |
| **Frontend tests** | 8 ✅ |
| **E2E tests** | **112 passing ✅** |
| **AI tests** | 6 (negative-path only) |

---

## Quick Reference: What to Do Tomorrow

**Morning (30 min):**
1. Fix 2 flaky tests → 112/112
2. Create E2E discoveries document
3. Create seed script for demo data

**Afternoon (2-3 hours):**
4. Wire first service form → `POST /api/applications` (start with Driving License)
5. Wire Application Status search tool
6. Add admin approve/reject endpoint

**Evening (1-2 hours):**
7. Clean up dead code
8. Commit and test full workflow
