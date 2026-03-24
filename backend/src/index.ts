import express from 'express';
import cors from 'cors';
import path from 'path';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import materialRoutes from './routes/materials.js';
import analyticsRoutes from './routes/analytics.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// ── Security Middleware ────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,    // required for cookies
}));
app.use(cookieParser(config.cookieSecret));
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
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// ── API Routes ─────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/analytics', analyticsRoutes);

// ── Health check ───────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Start ──────────────────────────────────────────────────────
async function start() {
  await connectDB();
  app.listen(5000, () => {
    console.log(`🚀 StudyQ API running on http://localhost:5000`);
  });
}

start();
