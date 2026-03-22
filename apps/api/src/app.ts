import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { errorHandler } from './core/middleware/errorHandler';
import { authRoutes } from './modules/auth/auth.routes';
import { materialsRoutes } from './modules/materials/materials.routes';
import { adminRoutes } from './modules/admin/admin.routes';
import { analyticsRoutes } from './modules/analytics/analytics.routes';

export const app = express();

// ── Security ───────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.WEB_URL, credentials: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Global Rate Limiter ────────────────────────────────────────
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests. Slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
}));

// ── Serve uploaded files ───────────────────────────────────────
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

// ── API Routes ─────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/analytics', analyticsRoutes);

// ── Health check ───────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Error Handler (must be last) ───────────────────────────────
app.use(errorHandler);
