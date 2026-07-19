# Puducherry RTO Modernization Portal

A comprehensive digital transformation of the Office of the Transport Commissioner, Puducherry — built with Next.js 16, Express + Prisma, and AI-powered proctoring.

## Live Deployments

| Service | URL | Platform |
|---------|-----|----------|
| **Frontend** | [puducherry-rto-redesign.vercel.app](https://puducherry-rto-redesign.vercel.app) | Vercel |
| **Backend API** | [puducherry-rto-redesign-production.up.railway.app](https://puducherry-rto-redesign-production.up.railway.app) | Railway |
| **AI Proctoring** | [ai-production-0b0f.up.railway.app](https://ai-production-0b0f.up.railway.app) | Railway |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Lucide Icons, Recharts |
| **Backend** | Express.js 5, TypeScript, Prisma ORM, Turso (SQLite cloud), bcryptjs, JWT |
| **AI Proctoring** | Python FastAPI, TensorFlow Lite (BlazeFace), pytest |
| **Chatbot** | Google Gemini AI (`@google/generative-ai`) with local knowledge base fallback |
| **Auth** | Email/password + Google OAuth + DigiLocker OAuth (via Supabase) |
| **Database** | Turso (edge-hosted SQLite) with Prisma ORM |
| **CI/CD** | GitHub Actions, Docker multi-stage builds |
| **Standards** | GIGW 3.0, WCAG 2.1 Level AA |

## Architecture

Three independently deployed services:

```
Browser (User)
     |
     v
[Vercel] Frontend (Next.js 16)
  |          \
  |           \--> [Railway] AI Proctoring (FastAPI)
  |                   - /api/detect-face
  |                   - BlazeFace TFLite model
  |
  v
[Railway] Backend API (Express.js 5)
  |--- /api/auth/*       (register, login, OAuth)
  |--- /api/admin/*      (users, applications, stats)
  |--- /api/exam/*       (learner license quiz)
  |--- /api/chat         (Gemini AI chatbot + KB fallback)
  \--- Prisma ORM --> Turso (SQLite cloud)
```

### Project Structure

```
rto/
+-- frontend/          # Next.js 16 app (Vercel)
|   +-- src/app/       # Pages (App Router)
|   +-- src/components/
|   +-- tests/         # Playwright E2E tests
+-- backend/           # Express.js API (Railway)
|   +-- src/routes/    # API routes
|   +-- src/middleware/ # Auth, admin guards
|   +-- src/services/  # Prisma client, OAuth
|   +-- tests/         # Jest + Supertest (101 tests)
+-- ai/                # FastAPI AI Proctoring (Railway)
|   +-- routes/        # /api/detect-face
|   +-- services/      # BlazeFace detection
|   +-- tests/         # pytest (7 tests)
+-- Dockerfile         # Root Dockerfile (used by Railway)
+-- docker-compose.yml
+-- .github/workflows/ # CI pipeline
```

## Quick Start

### Prerequisites
- Node.js >= 18
- Python >= 3.10

### Run Everything at Once
```bash
npm install            # Install root deps
npm run dev            # Starts frontend + backend + AI together
```

### Run Individually

#### Frontend
```bash
cd frontend
npm install
npm run dev        # -> http://localhost:3000
```

#### Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev        # -> http://localhost:5000
```

#### AI Proctoring
```bash
cd ai
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

## Features

### Citizen Portal
- Online vehicle registration and driving license applications
- Learner license application with AI-proctored exam
- Challan (traffic fine) lookup and payment
- Fee calculators and fare structure lookup
- Office directory with contact information
- Multi-language support (English, Tamil, French)

### AI Chatbot
- Google Gemini AI integration with 3-model fallback chain (`gemini-2.0-flash` -> `1.5-flash` -> `1.5-flash-8b`)
- Local knowledge base fallback when all Gemini models are unavailable
- Covers 15+ RTO topics: licenses, registration, fees, documents, transfer, etc.
- Navigation intent detection
- Formatted, readable responses in English, Tamil, and French

### AI-Proctored Learner License Exam
- Camera-based face detection using TensorFlow Lite (BlazeFace model)
- Violation tracking: no face, multiple faces, tab switches, fullscreen exits
- Auto-termination at violation limit (5 violations)
- 5 theory questions with 60% pass threshold (Indian RTO standards)

### Admin Panel
- Inline admin login form (no redirect to citizen login)
- Dashboard with real-time statistics
- Application management: view, approve, reject with notifications
- **Staff & Admin account management** (create, edit, role assignment)
- Fare structure and service catalog management
- Office directory management
- **Settings page**: two-column layout with email/password change + account creation form

## Staff & Admin Management (Recent Work)

The admin panel supports a three-role system (ADMIN, STAFF, CITIZEN):

- **STAFF role** added to authentication system with appropriate access
- Admin users page shows only ADMIN/STAFF users with role badges
- Settings page redesigned with two-column layout + "Create Account" form
- AdminOnly middleware allows both ADMIN and STAFF roles
- `POST /admin/users` creates staff/admin accounts with role selection

## Chatbot Implementation

The chatbot uses a layered approach for reliability:

1. **Gemini AI**: Primary model (`gemini-2.0-flash`) with automatic fallback to `1.5-flash` and `1.5-flash-8b`
2. **Knowledge Base**: 15+ RTO topics with word-overlap scoring and intent matching
3. **Formatted Answers**: `formatTopicForUser()` renders clean, readable text

## CI/CD Pipeline

- **Trigger**: Push to `main` branch
- **Backend**: `npm install` -> `prisma generate` -> Jest (101 tests)
- **Frontend E2E**: Playwright tests in 2 shards against live Vercel/Railway
- **Deploy**: Auto-deploy to Vercel (frontend) and Railway (backend + AI)

## Testing

```bash
# Backend (Jest) - 101 tests, 12 suites
cd backend && npm test

# AI (pytest) - 7 tests
cd ai && python -m pytest tests/ -v

# Frontend E2E (Playwright) - requires dev servers
cd frontend && npx playwright test
```

| Component | Framework | Tests | Status |
|-----------|-----------|-------|--------|
| Backend API | Jest + Supertest | 101 tests, 12 suites | ALL PASSING |
| AI Proctoring | pytest | 7 tests | ALL PASSING |
| Frontend E2E | Playwright | ~50 tests | PASSING on CI |

## AI Proctoring Violation State Machine

| Event | Points | Condition |
|-------|--------|-----------|
| Tab switch / fullscreen exit | +3 | Immediate |
| 3 consecutive face mismatches | +2 | Accumulated |
| No face for 3+ frames | +2 | Accumulated |
| Multiple faces detected | +3 | Immediate |
| **Termination** | >= 5 | **Auto-fail** |

- Frames sent every **3 seconds** to AI service
- Detection confidence threshold: **0.60**

## Branch Strategy

- `main` — Production-ready code (auto-deploys to Vercel + Railway)
- `sanjay` — Active development branch
- Feature branches -> PR to `sanjay` -> merge to `main` when stable

## License

Government of Puducherry — Transport Department
