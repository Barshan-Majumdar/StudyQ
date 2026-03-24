import { Request, Response, NextFunction } from 'express';
import { RegisterSchema, LoginSchema } from '@studyq/shared';
import { AuthService } from './auth.service';
import { AuthRequest } from '../../core/middleware/requireAuth';

const svc = new AuthService();

const isProduction = process.env.NODE_ENV === 'production';

const ACCESS_COOKIE_OPTS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'strict' as const,
  maxAge: 15 * 60 * 1000, // 15 minutes
};

const REFRESH_COOKIE_OPTS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'strict' as const,
  path: '/api/auth/refresh',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const dto = RegisterSchema.parse(req.body);
    const result = await svc.register(dto);
    res.cookie('jwt', result.accessToken, ACCESS_COOKIE_OPTS);
    res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTS);
    res.status(201).json({ success: true, data: { user: result.user } });
  } catch (err) { next(err); }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const dto = LoginSchema.parse(req.body);
    const result = await svc.login(dto);
    res.cookie('jwt', result.accessToken, ACCESS_COOKIE_OPTS);
    res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTS);
    res.json({ success: true, data: { user: result.user } });
  } catch (err) { next(err); }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: 'No refresh token' });
    }

    const result = await svc.refresh(token);
    res.cookie('jwt', result.accessToken, ACCESS_COOKIE_OPTS);
    res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTS);
    res.json({ success: true, data: { user: result.user } });
  } catch {
    res.clearCookie('jwt');
    res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie('jwt');
  res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
  res.json({ success: true, message: 'Logged out' });
}

export async function getMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await svc.getMe(req.user!.id);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}
