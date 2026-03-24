import { Router } from 'express';
import { requireAuth } from '../../core/middleware/requireAuth';
import { getStats, getDownloadTrend, getSubjectStats } from './analytics.controller';

export const analyticsRoutes = Router();

analyticsRoutes.get('/stats', requireAuth, getStats);
analyticsRoutes.get('/downloads', requireAuth, getDownloadTrend);
analyticsRoutes.get('/subjects', requireAuth, getSubjectStats);
