# Puducherry RTO Modernization Portal

A comprehensive digital transformation of the Office of the Transport Commissioner, Puducherry — built with Next.js 16, Express + Prisma, and AI-powered proctoring.

## Tech Stack

| Layer | Technology | Port |
|-------|-----------|------|
| **Frontend** | Next.js 16 + TypeScript + Tailwind CSS v4 + shadcn/ui + Lucide Icons | 3000 |
| **Backend** | Express + TypeScript + Prisma ORM (PostgreSQL) | 5000 |
| **AI Proctoring** | Python FastAPI + OpenCV + MediaPipe | 8000 |
| **Font** | Noto Sans + Noto Sans Tamil (GIGW 3.0 bilingual) | — |
| **Standards** | GIGW 3.0, WCAG 2.1 Level AA, DBIM Blue #0B3D91 | — |
| **Test Framework** | Jest (backend), Vitest + React Testing Library (frontend), pytest (AI) | — |

## Architecture

The project is a monorepo with **3 independent sub-projects**, each runnable in its own VS Code window:

```
D:\rto\
├── frontend\          # Next.js portal — open in VS Code Window 1
├── backend\           # Express API server — open in VS Code Window 2
├── ai\                # Python FastAPI proctoring — open in VS Code Window 3
├── docs\              # Project documentation
├── puzzle
  ├── packages.json
  ├── dbim.pdf / dbim.txt
  ├── pdf1.pdf / pdf1.txt   # AI proctoring PDF spec
  └── pdf2.pdf / pdf2.txt   # Audit/blueprint PDF
```

## Quick Start

### Prerequisites
- Node.js >= 18 (v25.2.1 used)
- Python >= 3.10 (3.14.0 used)
- PostgreSQL (for Prisma — or use SQLite for dev)

### Run Everything at Once
```bash
npm install            # Install root deps (concurrently)
npm run dev            # Starts frontend + backend + AI together
```

| Command | What it runs |
|---------|-------------|
| `npm run dev` | All 3 services (frontend + backend + AI) |
| `npm run dev:frontend` | Frontend only → http://localhost:3000 |
| `npm run dev:backend` | Backend only → http://localhost:5000 |
| `npm run dev:ai` | AI proctoring only → http://localhost:8000 |

### Run Individually

#### 1. Frontend
```bash
cd frontend
npm install
npm run dev        # → http://localhost:3000
```

#### 2. Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev        # → http://localhost:5000
```

#### 3. AI Proctoring
```bash
cd ai
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
# → http://localhost:8000
```

## Project Structure

### Frontend (30+ pages)

```
src/app/
├── page.tsx                    # Home
├── about/page.tsx              # About Us
├── contact/page.tsx            # Contact + form
├── directory/page.tsx          # RTO office directory
├── fares/page.tsx              # Fee structure tables
├── services/page.tsx           # Services listing
├── services/vehicle-registration/page.tsx
├── services/driving-license/page.tsx
├── services/appointment/page.tsx
├── services/fee-calculator/page.tsx
├── services/application-status/page.tsx
├── services/challan/page.tsx   # Traffic challan payment
├── services/vehicle-status/page.tsx
├── login/page.tsx              # Auth
├── register/page.tsx
├── dashboard/page.tsx          # Citizen dashboard
├── dashboard/vehicles/page.tsx
├── dashboard/licenses/page.tsx
├── dashboard/applications/page.tsx
├── dashboard/notifications/page.tsx
├── exam/page.tsx               # AI-proctored exam
```

### Backend (14 route modules)

```
src/
├── index.ts                    # Express app entry
├── routes/
│   ├── info.ts                 # About + FAQ
│   ├── directory.ts            # Office directory
│   ├── fares.ts                # Fee structure
│   ├── services.ts             # Services catalog
│   ├── auth.ts                 # Register, login, JWT
│   ├── appointments.ts         # CRUD appointments
│   ├── applications.ts         # Application tracking
│   ├── calculator.ts           # Fee calculator
│   ├── challan.ts              # Challan payment
│   ├── notifications.ts        # Lifecycle alerts
│   ├── exam.ts                 # Exam Q&A + scoring
│   └── payments.ts             # GRAS payment flow
├── middleware/auth.ts           # JWT middleware
├── services/auth.ts            # Password hashing, tokens
└── prisma/schema.prisma        # 8 database models
```

### AI Proctoring

```
routes/detect.py         # POST /api/detect-face (threshold 0.60)
services/face_utils.py   # MediaPipe face detection
main.py                  # FastAPI app (port 8000)
```

## AI Proctoring — Violation State Machine

| Event | Points | Condition |
|-------|--------|-----------|
| Tab switch / fullscreen exit | +3 | Immediate |
| 3 consecutive face mismatches | +2 | Accumulated |
| No face for 3+ frames | +2 | Accumulated |
| Multiple faces detected | +3 | Immediate |
| **Termination** | ≥5 | **Auto-fail** |

- Frames sent every **3 seconds** to `ai:8000/api/detect-face`
- Detection confidence threshold: **0.60**

## Testing

```bash
# Backend (Jest)
cd backend && npm test

# Frontend (Vitest)
cd frontend && npx vitest run

# AI (pytest)
cd ai && pytest -v
```

## Code Documentation Convention

Every source file has a companion `*.doc.md` file explaining:
- Why the file was created
- What problem it solves
- Key decisions made
- Dependencies and related files

## Agent System

Built with OpenCode multi-agent orchestration:
- **Athena-god** — Meta-agent (default)
- **backend** — API + Prisma + .doc.md
- **frontend** — UI components + .doc.md
- **testing** — Tests + .doc.md
- **explore** — Codebase research
- **hermes** — General tasks

## Sitemap Overview

- **11 Public pages**: Home, About, Contact, Directory, Fares, Services, Vehicle Status, etc.
- **9 Auth pages**: Login, Register, Dashboard + sub-pages
- **7 Admin pages**: (Phase 6)
- **4 API/Doc pages**: API reference, sitemap

## Standards Compliance

- **GIGW 3.0**: Language switcher, skip-to-content, semantic HTML, keyboard navigation
- **WCAG 2.1 Level AA**: Color contrast (4.5:1+), focus indicators, ARIA labels, heading hierarchy
- **DBIM Blue**: Primary color #0B3D91, accent #E8A317

## Branch Strategy

- `main` — Production-ready code
- `sanjay` — Active development branch (default for now)
- Feature branches → PR to `sanjay` → merge to `main` when stable
