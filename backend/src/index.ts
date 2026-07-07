import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/info', infoRoutes);
app.use('/api/directory', directoryRoutes);
app.use('/api/fares', faresRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/calculator', calculatorRoutes);
app.use('/api/challans', challanRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/exam', examRoutes);
app.use('/api/admin', adminRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`RTO Backend running on port ${PORT}`);
  });
}

export default app;
