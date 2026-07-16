# ── Backend Dockerfile ──
# Multi-stage: build TypeScript, then run with minimal deps

# ── Stage 1: Build ──
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY prisma ./prisma
RUN npx prisma generate
COPY tsconfig.json ./
COPY src ./src
RUN npx tsc

# ── Stage 2: Production ──
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy all built artifacts from builder (no second npm install needed)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY prisma ./prisma
COPY scripts ./scripts
COPY package.json ./
RUN mkdir -p prisma/backups

EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1
CMD ["node", "dist/index.js"]
