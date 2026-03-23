import { Router, Response } from 'express';
import { Material } from '../models/Material.js';
import { Download } from '../models/Download.js';
import { User } from '../models/User.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// ── GET /api/analytics/stats — Role-aware dashboard KPIs ───────
router.get('/stats', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!._id;
    const role = req.user!.role;

    if (role === 'admin') {
      const [totalUsers, totalMaterials, totalDownloads, activeStudents, usersByRole, recentAdminActions] = await Promise.all([
        User.countDocuments(),
        Material.countDocuments({ isActive: true }),
        Download.countDocuments(),
        User.countDocuments({ role: 'student', isActive: true }),
        User.aggregate([
          { $group: { _id: '$role', count: { $sum: 1 } } },
        ]),
        ActivityLog.find({ action: { $regex: /^ADMIN_/ } })
          .populate('performedBy', 'name')
          .populate('targetUserId', 'name email')
          .sort('-createdAt')
          .limit(8)
          .lean(),
      ]);

      const roleBreakdown: Record<string, number> = {};
      usersByRole.forEach((r: { _id: string; count: number }) => {
        roleBreakdown[r._id] = r.count;
      });

      return res.json({
        success: true,
        data: {
          role: 'admin',
          totalUsers,
          totalMaterials,
          totalDownloads,
          activeStudents,
          usersByRole: roleBreakdown,
          recentAdminActions,
        },
      });
    }

    if (role === 'teacher') {
      const [myUploadCount, myMaterials, activeStudents, recentUploads] = await Promise.all([
        Material.countDocuments({ uploadedBy: userId, isActive: true }),
        Material.find({ uploadedBy: userId, isActive: true }).select('downloadCount').lean(),
        User.countDocuments({ role: 'student', isActive: true }),
        Material.find({ uploadedBy: userId, isActive: true })
          .sort('-createdAt')
          .limit(6)
          .select('title subject semester downloadCount createdAt')
          .lean(),
      ]);

      const myDownloadTotal = myMaterials.reduce((sum, m) => sum + (m.downloadCount || 0), 0);

      return res.json({
        success: true,
        data: {
          role: 'teacher',
          myUploadCount,
          myDownloadTotal,
          activeStudents,
          recentUploads,
        },
      });
    }

    // Student
    const [materialCount, myDownloadCount, subjectAgg, recentDownloads] = await Promise.all([
      Material.countDocuments({ isActive: true }),
      Download.countDocuments({ userId }),
      Material.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$subject' } },
        { $count: 'total' },
      ]),
      Download.find({ userId })
        .populate('materialId', 'title subject semester')
        .sort('-createdAt')
        .limit(6)
        .lean(),
    ]);

    const subjectCount = subjectAgg.length > 0 ? subjectAgg[0].total : 0;

    return res.json({
      success: true,
      data: {
        role: 'student',
        materialCount,
        myDownloadCount,
        subjectCount,
        recentDownloads,
      },
    });
  } catch (error) {
    console.error('Stats error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/analytics/downloads — Download trend (last 7 days)
router.get('/downloads', authenticate, async (_req: AuthRequest, res: Response) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const downloads = await Download.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const trend = dayNames.map((name, i) => {
      const found = downloads.find((d) => d._id === i + 1);
      return { name, downloads: found ? found.count : 0 };
    });

    return res.json({ success: true, data: trend });
  } catch (error) {
    console.error('Download trend error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/analytics/subjects — Materials per subject
router.get('/subjects', authenticate, async (_req: AuthRequest, res: Response) => {
  try {
    const subjects = await Material.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$subject', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const data = subjects.map((s) => ({ name: s._id, files: s.count }));
    return res.json({ success: true, data });
  } catch (error) {
    console.error('Subject stats error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
