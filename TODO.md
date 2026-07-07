# RTO Portal — TODO

## ✅ Completed
- [x] PageHero + FadeInSection reusable components
- [x] SearchBar in Header (search across 16+ services)
- [x] 39 routes, 0 build errors, 0 404s (all service + footer pages created)
- [x] Modernized all 22+ pages (GIGW/WCAG compliant gradient cards)
- [x] Footer cleaned: "Powered by OpenCode" removed
- [x] Login page: Aadhaar + DigiLocker buttons, inline icons, full-viewport centered card, RTO logo (links to `/`)
- [x] Register page: centered card with RTO logo, benefits badge strip, Aadhaar/DigiLocker buttons
- [x] Auth pages (login/register): no navbar/footer — clean full-screen layout
- [x] RequireAuth guard on all 19 service/dashboard/exam pages (toast + login prompt card)
- [x] Sonner toast library installed + `<Toaster />` in global layout
- [x] Auto-commit `pre-push` git hook (commits uncommitted changes before `git push`)
- [x] Vehicle Status page: PUC Certificate section, renamed "Fitness" to "Fitness Certificate (FC)"
- [x] All 8 frontend tests pass, backend 30 tests pass
- [x] Prisma `Payment` model defined (unused, waiting for gateway)

## 🔜 Backlog

### 🔐 Authentication & Identity
- [ ] DigiLocker OAuth integration
  - [ ] Apply as Requester on [apisetu.gov.in](https://apisetu.gov.in/digilocker) (4-8 week approval, free)
  - [ ] Add `digilockerId` field to Prisma User model + migrate
  - [ ] Create `POST /api/auth/digilocker` backend endpoint (code exchange + upsert)
  - [ ] Create `/auth/digilocker/callback` frontend page
  - [ ] Wire "Sign in with DigiLocker" buttons on login/register pages
  - [ ] Add `loginWithDigiLocker()` to AuthContext
  - [ ] Sandbox testing → production switch
- [ ] Aadhaar API for physical RTO counters (biometric)
  - [ ] Register as KUA with UIDAI (free for government)
  - [ ] Set up ASA (Authentication Service Agency)
  - [ ] Implement XML-based auth + encryption

### 💳 Payment Gateway
- [ ] Razorpay integration (all flows)
  - [ ] Add `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` to backend/.env
  - [ ] Create `POST /api/payments/create-order`
  - [ ] Create `POST /api/payments/verify`
  - [ ] Create `POST /api/payments/webhook` (Razorpay webhook handler)
  - [ ] Create `GET /api/payments/history`
  - [ ] Create `RazorpayButton` + `PaymentModal` frontend components
  - [ ] Create `/payment/success`, `/payment/failed`, `/payment/history` pages
  - [ ] Integrate payment into: fee-calculator checkout, challan pay, appointment booking, all service applications (registration, license, renewal, etc.)
  - [ ] Run Prisma migration for existing `Payment` model
  - [ ] Test with Razorpay test mode

### 🗄️ Database & Infrastructure
- [ ] Migrate auth routes from in-memory array to Prisma/Postgres
- [ ] Run all Prisma migrations (User, Payment, etc.)
- [ ] Add proper error logging/monitoring
- [ ] Rate limiting tuning per endpoint type

### 📊 Admin & Reports
- [ ] Revenue/transaction dashboard (admin panel)
- [ ] Payment refund flow in admin panel
- [ ] Service usage analytics

### 📄 Document Handling
- [ ] PDF download for certificates (RC, DL, PUC, Fitness)
- [ ] Bulk download forms
- [ ] Upload validation (file size, type, virus scan)

### 📨 Notifications
- [ ] SMS gateway for application status updates
- [ ] Email notifications (registration confirmation, payment receipt, appointment reminder)

### 🧪 Testing
- [ ] Add DigiLocker callback component test
- [ ] Add Razorpay order/verify API test
- [ ] Add `RequireAuth` component test
- [ ] E2E test: full registration → login → book appointment flow
