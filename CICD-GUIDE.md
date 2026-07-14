# CI/CD with GitHub Actions — Puducherry RTO Portal

## Overview

This guide covers setting up GitHub Actions for the RTO project with three workflows:
1. **CI** — runs on every push/PR: lint, type-check, backend tests, frontend tests, E2E tests
2. **E2E Results** — publishes Playwright report to GitHub for easy viewing
3. **Deploy** — (optional) deploy to production on push to `main`

---

## Step 1: Create the Workflow Directory

```bash
mkdir -p .github/workflows
```

---

## Step 2: Create `.github/workflows/ci.yml`

This is the main CI pipeline. It runs backend tests, frontend build + tests, and Playwright E2E tests.

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [sanjay, main]
  pull_request:
    branches: [sanjay, main]

jobs:
  # ──────────────────────────────────────────
  # JOB 1: Backend Tests
  # ──────────────────────────────────────────
  backend-tests:
    name: Backend Tests
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Setup Prisma
        run: npx prisma generate

      - name: Run backend tests
        run: npm test
        env:
          PLAYWRIGHT_TEST: 1  # Skip rate limiter during tests

  # ──────────────────────────────────────────
  # JOB 2: Frontend Build + Lint + Unit Tests
  # ──────────────────────────────────────────
  frontend-build:
    name: Frontend Build & Tests
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npx tsc --noEmit

      - name: Lint
        run: npm run lint --if-present

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_API_URL: http://localhost:5000/api

  # ──────────────────────────────────────────
  # JOB 3: Playwright E2E Tests
  # ──────────────────────────────────────────
  e2e-tests:
    name: E2E Tests (Playwright)
    runs-on: ubuntu-latest
    needs: [backend-tests, frontend-build]  # Only run if backend + frontend pass
    defaults:
      run:
        working-directory: frontend

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/checkout@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: frontend/package-lock.json

      - name: Install frontend dependencies
        run: npm ci

      - name: Install backend dependencies
        run: npm ci
        working-directory: backend

      - name: Setup Prisma + Seed database
        working-directory: backend
        run: |
          npx prisma generate
          npx prisma db push
          node seed.js
        env:
          DATABASE_URL: "file:./test.db"

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Start backend server
        working-directory: backend
        run: |
          npx tsx src/index.ts &
          npx tsx -e "
            const http = require('http');
            const check = () => {
              http.get('http://localhost:5000/api/health', (res) => {
                process.exit(res.statusCode === 200 ? 0 : 1);
              }).on('error', () => {
                setTimeout(check, 1000);
              });
            };
            check();
          "
        env:
          PORT: 5000
          DATABASE_URL: "file:./test.db"
          PLAYWRIGHT_TEST: 1

      - name: Start frontend server
        run: |
          npm run build
          npx next start -p 3000 &
          npx -y wait-on http://localhost:3000 --timeout 60000
        env:
          NEXT_PUBLIC_API_URL: http://localhost:5000/api

      - name: Run Playwright tests
        run: npx playwright test
        env:
          CI: true

      - name: Upload Playwright Report
        if: always()  # Upload even if tests fail
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: frontend/playwright-report/
          retention-days: 14

      - name: Upload Test Results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: frontend/test-results/
          retention-days: 14

      - name: Summary
        if: always()
        run: |
          echo "## E2E Test Results" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "Playwright report uploaded as artifact." >> $GITHUB_STEP_SUMMARY
          echo "Download it from the Actions tab → this run → Artifacts → playwright-report." >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "To view locally: \`npx playwright show-report\`" >> $GITHUB_STEP_SUMMARY
```

---

## Step 3: (Optional) Publish E2E Report to GitHub Pages

If you want the Playwright HTML report **viewable directly in GitHub** (not just as a download):

```yaml
# .github/workflows/publish-report.yml
name: Publish E2E Report

on:
  workflow_run:
    workflows: ["CI"]
    types: [completed]

permissions:
  pages: write
  id-token: write

jobs:
  publish-report:
    name: Publish Playwright Report
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion != 'cancelled' }}

    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    steps:
      - name: Download Playwright Report artifact
        uses: actions/download-artifact@v4
        with:
          name: playwright-report
          run-id: ${{ github.event.workflow_run.id }}
          github-token: ${{ secrets.GITHUB_TOKEN }}

      - name: Add index redirect
        run: |
          if [ -f index.html ]; then
            echo "Report already has index.html"
          else
            echo '<meta http-equiv="refresh" content="0;url=./index.html">' > index.html
          fi

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload Pages Artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: .

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**To enable GitHub Pages:**
1. Go to repo Settings → Pages
2. Source: "GitHub Actions"
3. The report will be live at `https://<username>.github.io/rto/`

---

## Step 4: (Optional) Deploy on Push to `main`

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [backend-tests, frontend-build]  # Reference ci.yml jobs if using reusable workflows

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      # ── Option A: Deploy to a VPS (SSH) ──
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          username: ${{ secrets.DEPLOY_USER }}
          key: ${{ secrets.DEPLOY_KEY }}
          script: |
            cd /opt/rto
            git pull origin main
            cd backend && npm ci && npx prisma generate && npx prisma db push
            cd ../frontend && npm ci && npm run build
            pm2 restart rto-backend rto-frontend

      # ── Option B: Deploy to Vercel (frontend) ──
      # - name: Deploy to Vercel
      #   uses: amondnet/vercel-action@v25
      #   with:
      #     vercel-token: ${{ secrets.VERCEL_TOKEN }}
      #     vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
      #     vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
      #     working-directory: frontend

      # ── Option C: Docker ──
      # - name: Build & Push Docker Image
      #   uses: docker/build-push-action@v5
      #   with:
      #     push: true
      #     tags: ghcr.io/${{ github.repository }}:latest
```

---

## Step 5: Environment Variables / Secrets

Go to **repo Settings → Secrets and variables → Actions** and add:

| Secret | Purpose | Example |
|--------|---------|---------|
| `DEPLOY_HOST` | VPS IP or hostname | `203.0.113.50` |
| `DEPLOY_USER` | SSH username | `deploy` |
| `DEPLOY_KEY` | SSH private key | `-----BEGIN OPENSSH...` |
| `VERCEL_TOKEN` | Vercel deploy token | (from vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Vercel org | (from `.vercel/project.json`) |
| `VERCEL_PROJECT_ID` | Vercel project | (from `.vercel/project.json`) |

---

## Step 6: How to See E2E Results in GitHub

There are **3 ways** to see test results:

### Option A: Artifacts (Simplest)
1. Go to **Actions** tab → click the workflow run
2. Scroll to **Artifacts** section at the bottom
3. Download `playwright-report.zip`
4. Extract and open `index.html` in a browser

### Option B: GitHub Pages (Best UX)
1. Set up the `publish-report.yml` workflow (Step 3)
2. Enable GitHub Pages (Settings → Pages → Source: GitHub Actions)
3. Report is live at `https://<username>.github.io/rto/`
4. Auto-updates on every CI run

### Option C: Step Summary (Quick Glance)
The CI workflow already writes a summary to `$GITHUB_STEP_SUMMARY`.
After each run, scroll down in the Actions tab to see the summary card.

### Option D: PR Comment (Optional)
Add this to the CI workflow to post results as a PR comment:

```yaml
      - name: Comment on PR
        if: github.event_name == 'pull_request' && always()
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const results = fs.existsSync('frontend/test-results.json')
              ? JSON.parse(fs.readFileSync('frontend/test-results.json'))
              : null;
            const summary = results
              ? `✅ ${results.passed} passed | ❌ ${results.failed} failed`
              : 'E2E tests completed. Check artifacts for details.';
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## Playwright E2E Results\n${summary}\n\nDownload full report from Artifacts.`
            });
```

---

## Step 7: Local Testing of the CI Pipeline

Before pushing, validate locally:

```bash
# Backend tests
cd backend
npm ci
npx prisma generate
npx prisma db push
npm test

# Frontend build + lint + type check
cd frontend
npm ci
npx tsc --noEmit
npm run build

# E2E tests (start servers first in separate terminals)
# Terminal 1: cd backend && npm run dev
# Terminal 2: cd frontend && npm run dev
# Terminal 3:
cd frontend
npx playwright test
```

---

## Step 8: Badge for README

Add this to your `README.md` to show build status:

```markdown
[![CI](https://github.com/<your-username>/rto/actions/workflows/ci.yml/badge.svg)](https://github.com/<your-username>/rto/actions/workflows/ci.yml)
```

---

## File Structure

```
.github/
  workflows/
    ci.yml              # Main CI pipeline
    publish-report.yml  # (Optional) E2E report → GitHub Pages
    deploy.yml          # (Optional) Deploy on push to main
```

---

## Quick Start (Minimal Setup)

If you just want the basics — run tests on push, see results as artifacts:

1. Create `.github/workflows/ci.yml` with the content from Step 2
2. Commit and push
3. Go to **Actions** tab → see the pipeline running
4. After it finishes, download the `playwright-report` artifact

That's it. Add the optional steps later as needed.
