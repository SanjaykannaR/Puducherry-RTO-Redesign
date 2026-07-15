#!/bin/bash
# ── RTO Portal — Initial Server Setup ──
# Run this ONCE on your VPS (Ubuntu 22.04+) to prepare for CD deployments.
# Usage: ssh into your VPS, then: bash setup-server.sh

set -e

echo "=== RTO Portal — Server Setup ==="

# ── 1. System updates ──
echo "[1/6] Updating system..."
sudo apt update && sudo apt upgrade -y

# ── 2. Install Docker ──
echo "[2/6] Installing Docker..."
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com | sudo sh
  sudo usermod -aG docker $USER
  echo "Docker installed. You may need to log out and back in for group changes."
else
  echo "Docker already installed"
fi

# ── 3. Install Docker Compose ──
echo "[3/6] Installing Docker Compose..."
if ! command -v docker compose &> /dev/null; then
  sudo apt install -y docker-compose-plugin
else
  echo "Docker Compose already installed"
fi

# ── 4. Install Node.js (for Prisma migrations) ──
echo "[4/6] Installing Node.js..."
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt install -y nodejs
else
  echo "Node.js already installed: $(node -v)"
fi

# ── 5. Install Git ──
echo "[5/6] Installing Git..."
if ! command -v git &> /dev/null; then
  sudo apt install -y git
else
  echo "Git already installed"
fi

# ── 6. Create project directory ──
echo "[6/6] Setting up project directory..."
sudo mkdir -p /opt/rto
sudo chown $USER:$USER /opt/rto
cd /opt/rto

# Clone or pull the repo
if [ -d ".git" ]; then
  echo "Repository already cloned, pulling latest..."
  git pull origin main
else
  echo "Cloning repository..."
  git clone https://github.com/SanjaykannaR/Puducherry-RTO-Redesign.git .
  git checkout main
fi

# Create production env if it doesn't exist
if [ ! -f "backend/.env.production" ]; then
  echo ""
  echo "⚠️  Creating backend/.env.production from template..."
  cp backend/.env.production.example backend/.env.production
  echo "📝 Edit backend/.env.production with your real values:"
  echo "   - JWT_SECRET (generate with: openssl rand -hex 32)"
  echo "   - CORS_ORIGIN (your domain)"
  echo "   - OAuth keys (when available)"
fi

# Create Docker network
docker network create rto-network 2>/dev/null || true

echo ""
echo "=== Server Setup Complete ==="
echo ""
echo "Next steps:"
echo "1. Edit backend/.env.production with real values"
echo "2. Set up GitHub repository secrets for CD:"
echo "   - DEPLOY_HOST: your server IP"
echo "   - DEPLOY_USER: your SSH username"
echo "   - DEPLOY_KEY: your SSH private key"
echo "3. Push to main branch — CD will自动 deploy!"
echo ""
echo "To deploy manually:"
echo "  cd /opt/rto && bash deploy.sh"
