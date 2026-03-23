import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { User } from '../models/User.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { createUserSchema, updateUserSchema } from '../middleware/schemas.js';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, authorize('admin'));

const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many requests.' },
  standardHeaders: true,
  legacyHeaders: false,
});
router.use(adminLimiter);

// ── GET /api/admin/users ───────────────────────────────────────
router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const { role, search, status, page = '1', limit = '20' } = req.query;

    const filter: Record<string, any> = {};
    if (role && ['student', 'teacher', 'admin'].includes(role as string)) {
      filter.role = role;
    }
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort('-createdAt')
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: { users, total, page: pageNum, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('Admin list users error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/admin/users/:id ───────────────────────────────────
router.get('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password').lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json({ success: true, data: user });
  } catch (error) {
    console.error('Admin get user error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── POST /api/admin/users ──────────────────────────────────────
router.post('/users', validateBody(createUserSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
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

    await ActivityLog.create({
      userId: req.user!._id,
      action: 'ADMIN_CREATE_USER',
      target: user._id.toString(),
      details: `Admin created ${role}: ${name} (${email})`,
      performedBy: req.user!._id,
      targetUserId: user._id,
      ipAddress: req.ip,
    });

    return res.status(201).json({
      success: true,
      data: { id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive },
    });
  } catch (error) {
    console.error('Admin create user error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── PATCH /api/admin/users/:id ─────────────────────────────────
router.patch('/users/:id', validateBody(updateUserSchema), async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent modifying other admins
    if (user.role === 'admin' && user._id.toString() !== req.user!._id.toString()) {
      return res.status(403).json({ success: false, message: 'Cannot modify another admin' });
    }

    const updates = req.body;
    const changes: string[] = [];

    if (updates.name && updates.name !== user.name) {
      changes.push(`name: ${user.name} → ${updates.name}`);
      user.name = updates.name;
    }
    if (updates.email && updates.email !== user.email) {
      const emailExists = await User.findOne({ email: updates.email, _id: { $ne: user._id } });
      if (emailExists) {
        return res.status(409).json({ success: false, message: 'Email already in use' });
      }
      changes.push(`email: ${user.email} → ${updates.email}`);
      user.email = updates.email;
    }
    if (updates.role && updates.role !== user.role) {
      changes.push(`role: ${user.role} → ${updates.role}`);
      user.role = updates.role;
    }
    if (typeof updates.isActive === 'boolean' && updates.isActive !== user.isActive) {
      changes.push(`status: ${user.isActive ? 'active' : 'inactive'} → ${updates.isActive ? 'active' : 'inactive'}`);
      user.isActive = updates.isActive;
    }

    if (changes.length > 0) {
      await user.save();
      await ActivityLog.create({
        userId: req.user!._id,
        action: 'ADMIN_UPDATE_USER',
        target: user._id.toString(),
        details: `Updated ${user.name}: ${changes.join('; ')}`,
        performedBy: req.user!._id,
        targetUserId: user._id,
        ipAddress: req.ip,
      });
    }

    return res.json({
      success: true,
      data: { id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive },
    });
  } catch (error) {
    console.error('Admin update user error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── DELETE /api/admin/users/:id (soft delete) ──────────────────
router.delete('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Cannot delete yourself or other admins
    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot delete an admin account' });
    }

    user.isActive = false;
    await user.save();

    await ActivityLog.create({
      userId: req.user!._id,
      action: 'ADMIN_DEACTIVATE_USER',
      target: user._id.toString(),
      details: `Deactivated ${user.role}: ${user.name} (${user.email})`,
      performedBy: req.user!._id,
      targetUserId: user._id,
      ipAddress: req.ip,
    });

    return res.json({ success: true, message: 'User deactivated' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/admin/audit-log ───────────────────────────────────
router.get('/audit-log', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter = {
      action: { $regex: /^ADMIN_/ },
    };

    const [logs, total] = await Promise.all([
      ActivityLog.find(filter)
        .populate('performedBy', 'name email')
        .populate('targetUserId', 'name email')
        .sort('-createdAt')
        .skip(skip)
        .limit(limitNum)
        .lean(),
      ActivityLog.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: { logs, total, page: pageNum, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('Admin audit log error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
