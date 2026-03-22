import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from '../config/env.js';
import { Material } from '../models/Material.js';
import { Download } from '../models/Download.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Ensure upload directory exists
if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, config.uploadDir),
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: config.maxFileSize },
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

// GET /api/materials — List with filters
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { semester, subject, search, page = '1', limit = '20', sort = '-createdAt' } = req.query;

    const filter: Record<string, any> = { isActive: true };
    if (semester) filter.semester = Number(semester);
    if (subject) filter.subject = subject;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [materials, total] = await Promise.all([
      Material.find(filter)
        .populate('uploadedBy', 'name email')
        .sort(sort as string)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Material.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: { materials, total, page: pageNum, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('Get materials error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/materials — Upload (teacher/admin only)
router.post('/', authenticate, authorize('teacher', 'admin'), upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { title, description, subject, semester, academicYear, tags } = req.body;

    if (!title || !subject || !semester || !academicYear) {
      return res.status(400).json({ success: false, message: 'Title, subject, semester and academic year are required' });
    }

    const material = await Material.create({
      title,
      description,
      subject,
      semester: Number(semester),
      academicYear: Number(academicYear),
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      fileSize: req.file.size,
      fileType: path.extname(req.file.originalname).slice(1),
      uploadedBy: req.user!._id,
      tags: tags ? (typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()) : tags) : [],
    });

    await ActivityLog.create({
      userId: req.user!._id,
      action: 'UPLOAD',
      target: material._id.toString(),
      details: `Uploaded "${title}"`,
    });

    return res.status(201).json({ success: true, data: material });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/materials/:id/download — Track download
router.post('/:id/download', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    await Download.create({ userId: req.user!._id, materialId: material._id });
    material.downloadCount += 1;
    await material.save();

    return res.json({ success: true, data: { fileUrl: material.fileUrl } });
  } catch (error) {
    console.error('Download error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/materials/:id
router.delete('/:id', authenticate, authorize('teacher', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    if (req.user!.role === 'teacher' && material.uploadedBy.toString() !== req.user!._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only delete your own materials' });
    }

    material.isActive = false;
    await material.save();

    await ActivityLog.create({
      userId: req.user!._id,
      action: 'DELETE_MATERIAL',
      target: material._id.toString(),
      details: `Deleted "${material.title}"`,
    });

    return res.json({ success: true, message: 'Material deleted' });
  } catch (error) {
    console.error('Delete material error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
