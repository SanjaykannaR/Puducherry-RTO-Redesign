// ──────────────────────────────────────────────
// Entry point for the Puducherry RTO backend API
// ──────────────────────────────────────────────

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import cron from 'node-cron';
import { execSync } from 'child_process';
// dotenv MUST be loaded before ANY local module imports
// because those modules read process.env at module-init time
import 'dotenv/config';

import infoRoutes from './routes/info';
import directoryRoutes from './routes/directory';
import faresRoutes from './routes/fares';
import servicesRoutes from './routes/services';
import authRoutes from './routes/auth';
import appointmentRoutes from './routes/appointments';
import applicationRoutes from './routes/applications';
import calculatorRoutes from './routes/calculator';
import challanRoutes from './routes/challan';
import notificationRoutes from './routes/notifications';
import examRoutes from './routes/exam';
import adminRoutes from './routes/admin';
import vehicleRoutes from './routes/vehicles';
import licenseRoutes from './routes/licenses';
import contactRoutes from './routes/contact';
import rtoRoutes from './routes/rto';
import digilockerRoutes from './routes/digilocker';
import googleRoutes from './routes/google';
import paymentRoutes from './routes/payments';
import schedulerRoutes from './routes/scheduler';
import chatRoutes from './routes/chat';
import { sanitizeInput } from './middleware/sanitize';

// ── Environment setup ──
// .env loaded at top of file via `import 'dotenv/config'` — must happen before module imports
const app = express();
const PORT = process.env.PORT || 5000;

// ── Global middleware stack ──
// Security: sets HTTP headers (X-Frame-Options, CSP, etc.) to prevent common attacks
app.use(helmet());
// CORS: supports multiple origins (comma-separated in CORS_ORIGIN env var)
// In production, lock to your actual domain; in dev, localhost:3000 is fine.
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
// Request logging in 'dev' format (method, url, status, response-time) for debugging
app.use(morgan('dev'));
// Cookie parsing: needed for OAuth state management (DigiLocker)
app.use(cookieParser());
// Body parsing: JSON payloads up to 10 MB (enough for form uploads) + URL-encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
// Sanitize user input — strips HTML tags from strings to prevent stored XSS
app.use(sanitizeInput);

// ── Rate limiting (per-endpoint tuned) ──
// Skipped entirely when PLAYWRIGHT_TEST is set (E2E suites make hundreds of
// requests in a short burst which would hit the limit instantly).
if (!process.env.PLAYWRIGHT_TEST) {
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const baseOpts = { standardHeaders: true, legacyHeaders: false };

  // ── Strict: auth endpoints (brute-force protection) ──
  const authLimiter = rateLimit({
    ...baseOpts,
    windowMs,
    max: 15,
    skip: (req) => req.path === '/health',
  });

  // ── Public reads: generous for citizen browsing ──
  const publicReadLimiter = rateLimit({
    ...baseOpts,
    windowMs,
    max: 300,
  });

  // ── Contact form: spam prevention ──
  const contactLimiter = rateLimit({
    ...baseOpts,
    windowMs,
    max: 5,
  });

  // ── Protected writes: moderate for logged-in actions ──
  const writeLimiter = rateLimit({
    ...baseOpts,
    windowMs,
    max: 80,
  });

  // ── Admin: generous for admin workflow ──
  const adminLimiter = rateLimit({
    ...baseOpts,
    windowMs,
    max: 200,
  });

  // ── Default: catch-all for anything not explicitly covered ──
  const defaultLimiter = rateLimit({
    ...baseOpts,
    windowMs,
    max: 100,
    skip: (req) => req.path === '/health',
  });

  // Apply per-route limiters
  app.use('/api/auth', authLimiter);                // 15/15min — brute-force protection
  app.use('/api/auth/digilocker', authLimiter);     // same bucket
  app.use('/api/auth/google', authLimiter);         // same bucket
  app.use('/api/info', publicReadLimiter);           // 300/15min
  app.use('/api/directory', publicReadLimiter);      // 300/15min
  app.use('/api/fares', publicReadLimiter);          // 300/15min
  app.use('/api/services', publicReadLimiter);       // 300/15min
  app.use('/api/calculator', publicReadLimiter);     // 300/15min
  app.use('/api/contact', contactLimiter);           // 5/15min — spam prevention
  app.use('/api/applications', writeLimiter);        // 80/15min
  app.use('/api/appointments', writeLimiter);        // 80/15min
  app.use('/api/vehicles', writeLimiter);            // 80/15min
  app.use('/api/licenses', writeLimiter);            // 80/15min
  app.use('/api/challans', writeLimiter);            // 80/15min
  app.use('/api/exam', writeLimiter);                // 80/15min
  app.use('/api/payments', writeLimiter);            // 80/15min
  app.use('/api/notifications', defaultLimiter);     // 100/15min
  app.use('/api/admin', adminLimiter);               // 200/15min
  app.use('/api/admin/scheduler', adminLimiter);     // same bucket
  app.use('/api/chat', writeLimiter);                // 80/15min — AI chat
  app.use('/api/rto', defaultLimiter);               // 100/15min
  app.use('/api', defaultLimiter);                   // global fallback
}

// ── Health check ──
// Lightweight endpoint for monitoring / load balancer probes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Route groups ──
// Each group is prefixed under /api/<resource> and handled by its own router file
app.use('/api/info', infoRoutes);           // Public: about, FAQ
app.use('/api/directory', directoryRoutes); // Public: office listings
app.use('/api/fares', faresRoutes);         // Public: fee structure
app.use('/api/services', servicesRoutes);   // Public: service catalogue
app.use('/api/auth', authRoutes);           // Public: register/login; GET /me requires auth
app.use('/api/appointments', appointmentRoutes); // Protected: CRUD appointments
app.use('/api/applications', applicationRoutes); // Protected: CRUD applications
app.use('/api/calculator', calculatorRoutes);     // Public: fee + GST calculator
app.use('/api/challans', challanRoutes);          // Protected: challan listing + mock payment
app.use('/api/notifications', notificationRoutes); // Protected: user notifications
app.use('/api/exam', examRoutes);                 // Protected: driving test (quiz) flow
app.use('/api/vehicles', vehicleRoutes);           // Protected: user vehicles
app.use('/api/licenses', licenseRoutes);           // Protected: user licenses
app.use('/api/contact', contactRoutes);           // Public: contact form submissions
app.use('/api/rto', rtoRoutes);                   // Public: AI assistant + document verification
app.use('/api/auth/digilocker', digilockerRoutes); // Public: DigiLocker OAuth flow
app.use('/api/auth/google', googleRoutes);         // Public: Google OAuth flow
app.use('/api/payments', paymentRoutes);            // Protected: GRAS payments
app.use('/api/admin', adminRoutes);               // Protected + admin-only: system management
app.use('/api/admin/scheduler', schedulerRoutes); // Protected + admin-only: scheduler
app.use('/api', chatRoutes);                       // Public: AI chatbot (GEMINI_API_KEY required)

// ── 404 fallback ──
// Catch-all for unmatched routes — return JSON error (not HTML)
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ── Server start ──
// Skip listener during tests (supertest runs its own server)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`RTO Backend running on port ${PORT}`);

    // ── Cron: Daily expiry alerts at 8:00 AM IST (2:30 UTC) ──
    // Checks licenses/vehicles expiring within 30 days and creates notifications.
    // Only runs in development/production, not during tests.
    cron.schedule('30 2 * * *', async () => {
      console.log('[CRON] Running daily expiry alert check...');
      try {
        const { createExpiryAlerts } = await import('./services/notifications');
        const result = await createExpiryAlerts();
        console.log(`[CRON] Expiry check done: ${result.alertsCreated} alerts, ${result.usersNotified} users notified`);
      } catch (err) {
        console.error('[CRON] Expiry check failed:', err);
      }
    }, { timezone: 'Asia/Kolkata' });
    console.log('[CRON] Scheduled daily expiry alerts at 08:00 IST');

    // ── Cron: Daily database backup at 03:00 AM IST (21:30 UTC prev day) ──
    cron.schedule('30 21 * * *', () => {
      console.log('[CRON] Running daily database backup...');
      try {
        execSync('node scripts/backup-db.js', { cwd: __dirname + '/..', stdio: 'inherit' });
        console.log('[CRON] Database backup completed');
      } catch (err) {
        console.error('[CRON] Database backup failed:', err);
      }
    }, { timezone: 'Asia/Kolkata' });
    console.log('[CRON] Scheduled daily DB backup at 03:00 IST');
  });
}

export default app;
