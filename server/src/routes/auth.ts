import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { User } from '../models/User.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { loginSchema, registerSchema } from '../middleware/schemas.js';
import rateLimit from 'express-rate-limit';

const router = Router();

// ── Rate limiters ──────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: { success: false, message: 'Too many registrations. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const refreshLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { success: false, message: 'Too many refresh requests.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Helper: set refresh token cookie ───────────────────────────
function setRefreshCookie(res: Response, token: string) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'strict',
    path: '/api/auth/refresh',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'strict',
    path: '/api/auth/refresh',
  });
}

// ── POST /api/auth/register ────────────────────────────────────
router.post('/register', registerLimiter, validateBody(registerSchema), async (req, res: Response) => {
  try {
    const { name, email, password } = req.body;
    // Role is always 'student' for public registration — no escalation
    const role = 'student';

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await ActivityLog.create({ userId: user._id, action: 'REGISTER', details: `New ${role} registered` });

    const accessToken = jwt.sign({ userId: user._id }, config.jwtSecret, { expiresIn: config.jwtExpiry });
    const refreshToken = jwt.sign({ userId: user._id }, config.jwtRefreshSecret, { expiresIn: config.jwtRefreshExpiry });

    setRefreshCookie(res, refreshToken);

    return res.status(201).json({
      success: true,
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        accessToken,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── POST /api/auth/login ───────────────────────────────────────
router.post('/login', loginLimiter, validateBody(loginSchema), async (req, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    await ActivityLog.create({ userId: user._id, action: 'LOGIN', details: 'User logged in' });

    const accessToken = jwt.sign({ userId: user._id }, config.jwtSecret, { expiresIn: config.jwtExpiry });
    const refreshToken = jwt.sign({ userId: user._id }, config.jwtRefreshSecret, { expiresIn: config.jwtRefreshExpiry });

    setRefreshCookie(res, refreshToken);

    return res.json({
      success: true,
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        accessToken,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── POST /api/auth/refresh ─────────────────────────────────────
router.post('/refresh', refreshLimiter, async (req, res: Response) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: 'No refresh token' });
    }

    const decoded = jwt.verify(token, config.jwtRefreshSecret) as { userId: string };
    const user = await User.findById(decoded.userId).select('-password');
    if (!user || !user.isActive) {
      clearRefreshCookie(res);
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const accessToken = jwt.sign({ userId: user._id }, config.jwtSecret, { expiresIn: config.jwtExpiry });
    const newRefreshToken = jwt.sign({ userId: user._id }, config.jwtRefreshSecret, { expiresIn: config.jwtRefreshExpiry });

    setRefreshCookie(res, newRefreshToken);

    return res.json({
      success: true,
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        accessToken,
      },
    });
  } catch {
    clearRefreshCookie(res);
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
});

// ── POST /api/auth/logout ──────────────────────────────────────
router.post('/logout', (_req, res: Response) => {
  clearRefreshCookie(res);
  return res.json({ success: true, message: 'Logged out' });
});

// ── GET /api/auth/me ───────────────────────────────────────────
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  return res.json({
    success: true,
    data: { id: req.user!._id, name: req.user!.name, email: req.user!.email, role: req.user!.role },
  });
});

export default router;
