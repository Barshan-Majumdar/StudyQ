import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, refresh, logout, getMe } from './auth.controller';
import { requireAuth } from '../../core/middleware/requireAuth';

export const authRoutes = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { success: false, message: 'Too many registrations. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const refreshLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many refresh requests.' },
  standardHeaders: true,
  legacyHeaders: false,
});

authRoutes.post('/register', registerLimiter, register);
authRoutes.post('/login', loginLimiter, login);
authRoutes.post('/refresh', refreshLimiter, refresh);
authRoutes.post('/logout', logout);
authRoutes.get('/me', requireAuth, getMe);
