#!/bin/bash
# ── RTO Portal — Manual Deploy ──
# Run this on the server to deploy the latest version.
# Usage: bash deploy.sh [commit-sha]

set -e

COMMIT_SHA="${1:-latest}"
REGISTRY="ghcr.io"
REPO="SanjaykannaR/Puducherry-RTO-Redesign"

echo "=== RTO Portal — Deploying ${COMMIT_SHA} ==="
cd /opt/rto

# ── 1. Pull latest code ──
echo "[1/4] Pulling latest code..."
git fetch origin main
git reset --hard origin/main

# ── 2. Pull Docker images ──
echo "[2/4] Pulling Docker images..."
if [ "$COMMIT_SHA" = "latest" ]; then
  docker pull ${REGISTRY}/${REPO}/backend:latest
  docker pull ${REGISTRY}/${REPO}/frontend:latest
else
  docker pull ${REGISTRY}/${REPO}/backend:${COMMIT_SHA}
  docker pull ${REGISTRY}/${REPO}/frontend:${COMMIT_SHA}
  docker tag ${REGISTRY}/${REPO}/backend:${COMMIT_SHA} rto-backend:latest
  docker tag ${REGISTRY}/${REPO}/frontend:${COMMIT_SHA} rto-frontend:latest
fi

# ── 3. Run database migrations ──
echo "[3/4] Running database setup..."
docker compose exec -T backend npx prisma migrate deploy 2>/dev/null || \
  docker compose exec -T backend npx prisma db push

# ── 4. Restart services ──
echo "[4/4] Restarting services..."
docker compose down
docker compose up -d

# ── Wait for health ──
echo "Waiting for services to start..."
sleep 10

# ── Verify ──
echo ""
echo "=== Health Checks ==="
if curl -sf http://localhost:5000/api/health > /dev/null 2>&1; then
  echo "✅ Backend: http://localhost:5000"
else
  echo "❌ Backend failed to start"
  docker compose logs backend --tail=20
fi

if curl -sf http://localhost:3000 > /dev/null 2>&1; then
  echo "✅ Frontend: http://localhost:3000"
else
  echo "❌ Frontend failed to start"
  docker compose logs frontend --tail=20
fi

echo ""
echo "=== Deploy Complete ==="
echo "Backend: http://$(hostname -I | awk '{print $1}'):5000"
echo "Frontend: http://$(hostname -I | awk '{print $1}'):3000"
