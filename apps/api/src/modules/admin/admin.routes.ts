import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth, requireRole } from '../../core/middleware/requireAuth';
import { listUsers, getUser, createUser, updateUser, deleteUser, auditLog } from './admin.controller';

export const adminRoutes = Router();

// All admin routes require authentication + admin role
adminRoutes.use(requireAuth, requireRole('ADMIN'));

adminRoutes.use(rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many requests.' },
  standardHeaders: true,
  legacyHeaders: false,
}));

adminRoutes.get('/users', listUsers);
adminRoutes.get('/users/:id', getUser);
adminRoutes.post('/users', createUser);
adminRoutes.patch('/users/:id', updateUser);
adminRoutes.delete('/users/:id', deleteUser);
adminRoutes.get('/audit-log', auditLog);
