# ── Backend Dockerfile (for Railway — context = repo root) ──
# Multi-stage: build TypeScript, then run with minimal deps

# ── Stage 1: Build ──
FROM node:22-alpine AS builder
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
RUN npm install
COPY backend/prisma ./prisma
RUN npx prisma generate
COPY backend/tsconfig.json ./
COPY backend/src ./src
RUN npx tsc
RUN mkdir -p /app/dist/data && cp src/data/*.json dist/data/

# ── Stage 2: Production ──
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy all built artifacts from builder (no second npm install needed)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY backend/prisma ./prisma
COPY backend/scripts ./scripts
COPY backend/package.json ./
RUN mkdir -p prisma/backups

EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1
CMD ["node", "dist/index.js"]
