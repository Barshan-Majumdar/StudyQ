import { Response, NextFunction } from 'express';
import { CreateUserSchema, UpdateUserSchema } from '@studyq/shared';
import { AuthRequest } from '../../core/middleware/requireAuth';
import { AdminService } from './admin.service';

const svc = new AdminService();

export async function listUsers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { role, search, status, page = '1', limit = '20' } = req.query;
    const result = await svc.listUsers({
      role: role as string,
      search: search as string,
      status: status as string,
      page: Math.max(1, parseInt(page as string, 10)),
      limit: Math.min(50, Math.max(1, parseInt(limit as string, 10))),
    });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function getUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await svc.getUser(req.params.id);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

export async function createUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const dto = CreateUserSchema.parse(req.body);
    const user = await svc.createUser(dto, req.user!.id, req.ip);
    res.status(201).json({ success: true, data: user });
  } catch (err) { next(err); }
}

export async function updateUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const dto = UpdateUserSchema.parse(req.body);
    const user = await svc.updateUser(req.params.id, dto, req.user!.id, req.ip);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

export async function deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await svc.deleteUser(req.params.id, req.user!.id, req.ip);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function auditLog(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { page = '1', limit = '20' } = req.query;
    const result = await svc.auditLog(
      Math.max(1, parseInt(page as string, 10)),
      Math.min(50, Math.max(1, parseInt(limit as string, 10))),
    );
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}
