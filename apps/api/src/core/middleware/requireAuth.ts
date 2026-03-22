import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '@studyq/database';

export interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  // Read JWT from HttpOnly cookie — NOT from Authorization header
  const token = req.cookies?.jwt;
  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    const user = await db.user.findUnique({
      where: { id: payload.id },
      select: { id: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    req.user = { id: user.id, role: user.role };
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Token expired or invalid' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }
    next();
  };
}
