import { Response, NextFunction } from 'express';
import { MaterialQuerySchema } from '@studyq/shared';
import { AuthRequest } from '../../core/middleware/requireAuth';
import { MaterialsService } from './materials.service';
import path from 'path';

const svc = new MaterialsService();

export async function upload(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { title, description, subject, semester, academicYear, tags } = req.body;

    if (!title || !subject) {
      return res.status(400).json({ success: false, message: 'Title and subject are required' });
    }

    const result = await svc.upload({
      title,
      description,
      subject,
      semester: semester ? Number(semester) : undefined,
      academicYear: academicYear ? Number(academicYear) : undefined,
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      storageKey: req.file.filename,
      fileSize: req.file.size,
      fileType: path.extname(req.file.originalname).slice(1),
      tags: tags ? (typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()) : tags) : [],
    }, req.user!.id);

    res.status(201).json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const query = MaterialQuerySchema.parse(req.query);
    const result = await svc.list(query);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function download(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await svc.download(req.params.id, req.user!.id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await svc.remove(req.params.id, req.user!.id, req.user!.role);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}
