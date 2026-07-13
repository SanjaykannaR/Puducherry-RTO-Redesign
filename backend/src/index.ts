// ──────────────────────────────────────────────
// Entry point for the Puducherry RTO backend API
// ──────────────────────────────────────────────

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
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

// ── Environment setup ──
// .env loaded at top of file via `import 'dotenv/config'` — must happen before module imports
const app = express();
const PORT = process.env.PORT || 5000;

// ── Global middleware stack ──
// Security: sets HTTP headers (X-Frame-Options, CSP, etc.) to prevent common attacks
app.use(helmet());
// CORS: allows the frontend (default localhost:3000) to call this API
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
// Request logging in 'dev' format (method, url, status, response-time) for debugging
app.use(morgan('dev'));
// Cookie parsing: needed for OAuth state management (DigiLocker)
app.use(cookieParser());
// Body parsing: JSON payloads up to 10 MB (enough for form uploads) + URL-encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Rate limiting ──
// Throttle /api endpoints to 100 requests per 15-minute window per IP
// Prevents abuse / brute-force attacks on auth endpoints.
// Skipped when PLAYWRIGHT_TEST is set (E2E suites make hundreds of
// requests in a short burst which would hit the limit instantly).
// To start backend for E2E: PLAYWRIGHT_TEST=1 npx tsx watch src/index.ts
if (!process.env.PLAYWRIGHT_TEST) {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting for health checks (used by Playwright and load balancers)
    skip: (req) => req.path === '/health',
  });
  app.use('/api', limiter);
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
  });
}

export default app;
