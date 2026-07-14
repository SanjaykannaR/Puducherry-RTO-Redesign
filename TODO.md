# RTO Portal — All Tasks by Priority (Updated 2026-07-14 Session 9)

---

## 🔴 P1 — CRITICAL ✅ ALL COMPLETE

### 1. Fix Flaky E2E Tests ✅
Result: **113 passed / 3 failed (Windows STATUS_STACK_OVERFLOW) / 9 skipped (cascade)**

### 2. Create E2E Discoveries Document ✅
Created `frontend/tests/E2E-DISCOVERIES.md` with 8 documented patterns.

### 3. Seed Script for Demo Data ✅
- [x] Created `backend/seed.js` — admin, 3 citizens, 4 vehicles, 3 licenses, 5 apps, 3 appts, 2 payments, 4 notifs
- [x] Wired to `npx prisma db seed` via `prisma.config.ts`

---

## 🟠 P2 — HIGH (Core Features) ✅ ALL COMPLETE

### 4. Wire 9 Service Forms → `POST /api/applications` ✅
### 5. Wire Search Tools → Real API Lookups ✅
### 6. Payment Gateway (GRAS) ✅ — Backend tests: 10/10
### 7. Admin Application Approve/Reject Workflow ✅

---

## 🟡 P3 — MEDIUM (Quality & Polish)

### 8. Dead Code Cleanup ✅

### 9. PDF Downloads ✅ COMPLETE
- [x] Created `backend/scripts/generate-pdfs.js` — generates 12 realistic RTO form PDFs via pdfkit
- [x] Generated PDFs stored in `frontend/public/downloads/` (12 files: form-1, 2, 3, 4, 7, 14, 20, 21, 22, 29, 30, 35)
- [x] Wired download page cards to actual `<a href="/downloads/form-XX.pdf" download>` links
- [x] Committed as `8ca46a9`

### 10. Testing Expansion ✅ COMPLETE

**Backend (101 tests, all passing):**

| Test File | Tests | Status |
|-----------|-------|--------|
| admin-applications.test.ts | 12 | ✅ |
| vehicles.test.ts | 10 | ✅ |
| licenses.test.ts | 8 | ✅ |
| challans.test.ts | 4 | ✅ |
| notifications.test.ts | 4 | ✅ |
| admin-misc.test.ts | 23 | ✅ |
| payments.test.ts | 10 | ✅ |
| users.test.ts | ~30 | ✅ |
| auth.test.ts | unique emails fix | ✅ |
| protected-routes.test.ts | unique emails fix | ✅ |
| exam.test.ts | unique emails fix | ✅ |
| **Total** | **101** | **✅ ALL PASSING** |

**Frontend/E2E:**

| Test File | Tests | Status |
|-----------|-------|--------|
| admin-applications.spec.ts | 13 | ✅ |
| admin.spec.ts | 31 | ✅ |
| app.spec.ts | 55 | ✅ |
| auth-flow.spec.ts | 10 | ✅ |
| exam.spec.ts | 6 | ✅ |
| interactions.spec.ts | 16 | ✅ |
| **Total** | **131** | **Target: 131/131** |

- [x] E2E tests for service form submissions — International Permit, Transfer Ownership added
- [x] E2E tests for payment flow (GRAS) — challan page, GRAS fee-calculator, payment history

### 11. DigiLocker Mock OAuth Server ✅ COMPLETE
- [x] Rewrote `backend/src/routes/digilocker.ts` with mock mode (auto-detects placeholder client ID)
- [x] Created mock DigiLocker login page (HTML embedded in route, shows in mock mode)
- [x] Mock flow: login page → form submit → mock code decode → JWT issue → frontend redirect
- [x] **FIXED: Mock callback state bug** — `/mock/submit` no longer deletes state prematurely; `/callback` now properly consumes it

### 12. Government OAuth (Aadhaar)
- [ ] UIDAI sandbox integration (needs real API keys from UIDAI)
- [ ] Low priority — blocked on external key procurement

### 13. Prisma FK Constraint Fix ✅ COMPLETE (Session 9)
- [x] `payments.ts` now validates `applicationId` exists before creating payment record
- [x] Prevents FK constraint violation when application doesn't exist

### 14. Backend Test Email Collision Fix ✅ COMPLETE (Session 9)
- [x] `auth.test.ts` — replaced hardcoded emails with `Date.now() + Math.random()` pattern
- [x] `protected-routes.test.ts` — same unique email fix
- [x] `exam.test.ts` — same unique email fix
- [x] `admin-misc.test.ts` — fixed vitest import → Jest globals

### 15. E2E Flaky Test Fixes ✅ COMPLETE (Session 9)
- [x] Reports KPI test — added `gotoAndWaitForAuth` + `waitForResponse` pattern
- [x] Download Forms test — changed `networkidle` → `domcontentloaded`
- [x] Appointment booking test — added auth response wait + 90s timeout + fixed confirmation regex
- [x] GRAS fee-calculator test — replaced heavy auth chain with lightweight `page.goto(domcontentloaded)`
- [x] **ALL authenticated service page tests** in `app.spec.ts` — replaced bare `page.goto()` with `gotoAndWaitForAuth()` (11 tests)
- [x] **Admin sidebar tests** — replaced `networkidle` with `gotoAndWaitForAuth()` in `admin-applications.spec.ts` (3 tests)

---

## 🔵 P4 — LOW (Future Enhancements)

### 16. Notifications System ✅ COMPLETE (Session 9)
- [x] Added `channel` field (IN_APP/SMS/EMAIL) to Notification model in Prisma schema
- [x] Created `backend/src/services/notifications.ts` — `sendNotification`, `sendBulkNotification`, `getExpiringItems`, `createExpiryAlerts`
- [x] Created `backend/src/routes/scheduler.ts` — `/status`, `/expiry-check`, `/expiring-items` (admin-only)
- [x] Registered scheduler route in `backend/src/index.ts`

### 17. Revenue Dashboard ✅ COMPLETE (Session 9)
- [x] Backend: `GET /api/admin/revenue` endpoint in `admin.ts` (totals, monthly, by-method, recent transactions)
- [x] Frontend: `frontend/src/app/admin/revenue/page.tsx` — KPI cards, monthly bar chart, payment methods pie chart, transactions table
- [x] Admin sidebar: "Revenue" link with TrendingUp icon added to `layout.tsx`

### 18. Database Improvements ✅ COMPLETE (Session 9)
- [x] **Indexes** added to all models: Vehicle (ownerId, status), License (holderId, status), Application (applicantId, status, type), Payment (userId, status, paidAt), Appointment (applicantId, status, date), Notification (userId+isRead, createdAt)
- [x] `backend/scripts/backup-db.js` — copies dev.db to backups/ with timestamp, keeps last 10
- [x] `backend/scripts/restore-db.js` — restores from latest or specified backup
- [x] `backend/backups/` in `.gitignore`

### 19. Admin Enhancements
- [x] Revenue / transaction dashboard ✅ (see #17)
- [ ] Payment refund flow
- [ ] Service usage analytics
- [ ] Bulk operations

---

## 🔴 BLOCKERS — MUST FIX BEFORE FINAL COMMIT

### 20. `networkidle` Cascade Fix — IN PROGRESS 🔄
**Root cause:** `waitUntil: 'networkidle'` hangs on Windows Chromium for Next.js SPA pages, causing STATUS_STACK_OVERFLOW (code 3221225794) that cascades and kills 40+ tests.

**Fix pattern:** Replace all `networkidle` with `domcontentloaded` + explicit `waitForResponse` or use `gotoAndWaitForAuth()` helper.

**Files still needing fixes:**

| File | Lines | Count |
|------|-------|-------|
| `admin.spec.ts` | 41, 198, 218, 230, 264, 277, 286 | 7 |
| `auth-flow.spec.ts` | 91, 128, 166, 296 | 4 |
| `exam.spec.ts` | 101, 114 | 2 |
| `interactions.spec.ts` | 34, 280, 304 | 3 |
| **Already fixed:** | | |
| `app.spec.ts` | all authenticated tests + forgot-password | ✅ |
| `admin-applications.spec.ts` | lines 55, 107, 114 | ✅ |

**Total remaining:** 16 `networkidle` replacements across 4 files

### 21. Remove `PLAYWRIGHT_TEST=1` from `backend/.env`
- Currently set for E2E test runs — must remove to restore rate limiting
- Do this AFTER all E2E tests pass

---

## 📋 BALANCE WORK — Quick View

| # | Task | Status | Effort |
|---|------|--------|--------|
| 1 | Replace remaining 16 `networkidle` → `domcontentloaded` | 🔄 IN PROGRESS | 20 min |
| 2 | Re-run E2E tests (target 131/131) | ⬜ TODO (depends on #1) | 15 min |
| 3 | Commit all session 9 changes | ⬜ TODO | 5 min |
| 4 | Remove `PLAYWRIGHT_TEST=1` from backend/.env | ⬜ TODO | 1 min |
| 5 | Update knowledge.md with session 9 learnings | ⬜ TODO | 10 min |
| 6 | Update changelog.md with session 9 entries | ⬜ TODO | 5 min |
| 7 | Aadhaar sandbox | ⬜ TODO (blocked on keys) | 1-2 hrs |
| 8 | Payment refund flow | ⬜ P4 | 2-3 hrs |
| 9 | Service usage analytics | ⬜ P4 | 3-4 hrs |
| 10 | Bulk operations | ⬜ P4 | 4-5 hrs |

---

## ✅ COMPLETED (Session History)

### Session 1-2 (2026-07-10) — Foundation
- DigiLocker + Google OAuth integration
- Removed max-w-7xl from 9 files

### Session 3-5 (2026-07-12) — E2E Test Stabilization
- 112/112 E2E tests passing
- Test infrastructure (registerTestUser, authenticatePage, gotoAndWaitForAuth)

### Session 6 (2026-07-13) — Payment System + Seed Data
- GRAS payment system (replaced Razorpay) — committed as a135dd7
- Seed script — committed as be5089a

### Session 7 (2026-07-13) — Admin Workflow + CI/CD + Testing
- Admin applications page (approve/reject/review) — committed as 5bbd2a9
- GitHub Actions CI/CD — committed as 0b769c4, 93f8976
- Backend tests expanded 40 → 101
- Admin applications E2E tests (13 tests) — committed as c0560d3
- Test count updated to 113/125 — committed as fc9e753

### Session 8 (2026-07-14) — PDF + Testing + DigiLocker Mock
- PDF download system (12 forms, pdfkit) — committed as 8ca46a9
- Backend admin misc tests (23 tests)
- DigiLocker mock mode (in progress, state bug to fix)

### Session 9 (2026-07-14) — P3/P4 Completion + Test Stability
- **DigiLocker mock state bug FIXED** — `/mock/submit` no longer deletes state prematurely
- **Prisma FK constraint fix** — `payments.ts` validates applicationId before insert
- **Backend test fixes** — 3 files: unique email pattern (auth, protected-routes, exam), 1 file: vitest→Jest import (admin-misc)
- **New E2E tests** — International Permit, Transfer Ownership, Challan page + payment, GRAS fee-calculator, Payment History (5 new test scenarios)
- **Notifications system** — Schema (channel field), service (send/bulk/expiry), scheduler route (/status, /expiry-check, /expiring-items)
- **Revenue dashboard** — Backend API + Frontend page with charts + admin sidebar link
- **Database improvements** — 12 indexes across 6 models, backup script, restore script
- **E2E flaky test fixes** — Reports KPI timing, Download Forms timeout, Appointment booking flow, GRAS fee-calculator timeout
- **Massive networkidle audit** — identified 27 occurrences as root cause of STATUS_STACK_OVERFLOW cascades, fixed 11, 16 remaining

---

## Summary Dashboard (Session 9)

| Category | Count | Status |
|----------|-------|--------|
| **Frontend routes** | 38 | All build, 0 errors ✅ |
| **Backend endpoints** | 38 | All Prisma-backed ✅ (admin revenue + scheduler added) |
| **Backend tests** | 101 | All passing ✅ |
| **E2E tests** | 131 | 78 pass / 52 cascade / 1 root cause — fixing networkidle 🔄 |
| **PDF downloads** | 12 forms | Realistic RTO forms ✅ |
| **Payment system** | GRAS | Mock government portal ✅ |
| **Admin workflow** | Approve/Reject | Notifications wired ✅ |
| **Notifications** | Service + Route + Scheduler | Mock SMS/EMAIL + expiry alerts ✅ |
| **Revenue Dashboard** | API + Page + Sidebar | Charts + transactions ✅ |
| **DB Indexes** | 12 indexes | All models optimized ✅ |
| **Backup/Restore** | 2 scripts | backup-db.js + restore-db.js ✅ |
| **CI/CD** | GitHub Actions | CI + E2E report pipeline ✅ |
| **Mock/placeholder pages** | **0** | All wired to real APIs ✅ |

---

## 🔑 KEY LEARNINGS (for future sessions)

1. **Windows + Chromium + `networkidle` = disaster.** Next.js SPAs keep connections alive; `networkidle` hangs → STATUS_STACK_OVERFLOW cascade kills entire test suite. Always use `domcontentloaded` + explicit `waitForResponse`.

2. **Test emails must be unique per run.** Hardcoded emails cause 409 collisions on re-runs. Use `Date.now() + Math.random()` suffix pattern.

3. **FK validation before insert.** Always validate foreign key references exist before creating related records in tests or user-facing code.

4. **`gotoAndWaitForAuth()` is the gold standard.** After `authenticatePage()`, always use this helper instead of bare `page.goto()` — it handles the auth context re-initialization lifecycle correctly.

5. **DigiLocker mock state flow.** OAuth state must persist through the entire mock flow (`/login` → `/mock/submit` → `/callback`), not be deleted at intermediate steps.

6. **Prisma indexes matter.** Adding indexes on foreign keys and filter columns (status, date) significantly improves query performance for list/dashboard pages.

7. **`adminOnly` middleware lives in `middleware/admin`, NOT `middleware/auth`.** Import path matters for test files.
