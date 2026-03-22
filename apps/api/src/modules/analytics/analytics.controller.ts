import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../core/middleware/requireAuth';
import { AnalyticsService } from './analytics.service';

const svc = new AnalyticsService();

export async function getStats(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await svc.getStats(req.user!.id, req.user!.role);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function getDownloadTrend(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await svc.getDownloadTrend();
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function getSubjectStats(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await svc.getSubjectStats();
    res.json({ success: true, data });
  } catch (err) { next(err); }
}
