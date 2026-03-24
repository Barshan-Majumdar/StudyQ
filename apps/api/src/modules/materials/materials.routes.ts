import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { requireAuth, requireRole } from '../../core/middleware/requireAuth';
import { upload, list, download, remove } from './materials.controller';

const uploadDir = process.env.UPLOAD_DIR || path.resolve(process.cwd(), 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const multerUpload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt', '.zip'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${ext} not allowed`));
    }
  },
});

export const materialsRoutes = Router();

materialsRoutes.get('/', requireAuth, list);
materialsRoutes.post('/', requireAuth, requireRole('TEACHER', 'ADMIN'), multerUpload.single('file'), upload);
materialsRoutes.post('/:id/download', requireAuth, download);
materialsRoutes.delete('/:id', requireAuth, requireRole('TEACHER', 'ADMIN'), remove);
