# RTO Portal — Deployment Guide

## Quick Start (First Deploy)

### 1. Set Up Your VPS

```bash
# SSH into your server (Ubuntu 22.04+)
ssh root@your-server-ip

# Download and run setup script
curl -sL https://raw.githubusercontent.com/SanjaykannaR/Puducherry-RTO-Redesign/main/scripts/setup-server.sh | bash
```

### 2. Configure GitHub Secrets

Go to your repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret | Value |
|--------|-------|
| `DEPLOY_HOST` | Your server IP (e.g., `203.0.113.50`) |
| `DEPLOY_USER` | SSH username (e.g., `ubuntu`) |
| `DEPLOY_KEY` | Private SSH key (contents of `~/.ssh/id_ed25519`) |

Also set **Variables** (Settings → Secrets → Actions → Variables tab):

| Variable | Value |
|----------|-------|
| `DEPLOY_PATH` | `/opt/rto` |
| `DEPLOY_URL` | `http://your-server-ip:3000` |

### 3. Configure Production Environment

```bash
# On the server
cd /opt/rto
nano backend/.env.production
```

Fill in:
- `JWT_SECRET` — Generate with: `openssl rand -hex 32`
- `CORS_ORIGIN` — Your domain (e.g., `https://rto.puducherry.gov.in`)
- OAuth keys (when available)

### 4. Deploy!

Just push to `main` — CD自动 triggers:

```bash
git push origin main
```

Or deploy manually from the server:

```bash
cd /opt/rto && bash scripts/deploy.sh
```

---

## How CD Works

```
git push origin main
  → CI runs (backend tests + frontend build + E2E tests)
  → If CI passes → CD triggers
    → Builds Docker images (backend + frontend)
    → Pushes to GitHub Container Registry (ghcr.io)
    → SSHs into server
    → Pulls new images
    → Runs database migrations
    → Restarts services
    → Verifies health checks
```

### Manual Deploy

```bash
# On the server
cd /opt/rto
bash scripts/deploy.sh              # Deploy latest
bash scripts/deploy.sh abc1234      # Deploy specific commit
```

### View Logs

```bash
cd /opt/rto
docker compose logs -f backend      # Backend logs
docker compose logs -f frontend     # Frontend logs
docker compose logs -f              # All logs
```

### Check Status

```bash
docker compose ps                   # Container status
curl http://localhost:5000/api/health  # Backend health
```

### Restart Services

```bash
docker compose restart              # Restart all
docker compose restart backend      # Restart backend only
```

### Rollback

```bash
# Deploy previous commit
cd /opt/rto
git log --oneline -5                # Find the commit
bash scripts/deploy.sh <commit-sha>
```

---

## Architecture

```
┌─────────────────────────────────────────────┐
│                  VPS                         │
│                                              │
│  ┌──────────────┐    ┌──────────────────┐   │
│  │   Frontend   │    │     Backend      │   │
│  │  (Next.js)   │    │   (Express)      │   │
│  │   :3000      │───▶│    :5000         │   │
│  └──────────────┘    └────────┬─────────┘   │
│                               │              │
│                       ┌───────▼───────┐     │
│                       │  SQLite DB    │     │
│                       │  (Docker vol) │     │
│                       └───────────────┘     │
└─────────────────────────────────────────────┘
         ▲
         │ CD (auto-deploy on push to main)
         │
┌────────┴────────┐
│ GitHub Actions  │
│ CI → CD → ghcr  │
└─────────────────┘
```

---

## Troubleshooting

### Backend won't start
```bash
docker compose logs backend --tail=50
# Common: DB not migrated, .env missing, port conflict
```

### Frontend can't reach backend
```bash
docker compose exec frontend wget -qO- http://backend:5000/api/health
# Should return {"status":"ok"}
```

### Database issues
```bash
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma db push
```

### Reset everything
```bash
docker compose down -v    # Remove containers + volumes
docker compose up --build # Rebuild from scratch
```
