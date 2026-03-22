import { db } from '@studyq/database';

export class AnalyticsService {
  async getStats(userId: string, role: string) {
    if (role === 'ADMIN') {
      const [totalUsers, totalMaterials, totalDownloads, activeStudents, usersByRole, recentAdminActions] = await Promise.all([
        db.user.count(),
        db.material.count({ where: { isActive: true } }),
        db.download.count(),
        db.user.count({ where: { role: 'STUDENT', isActive: true } }),
        db.user.groupBy({ by: ['role'], _count: true }),
        db.activityLog.findMany({
          where: { action: { startsWith: 'ADMIN_' } },
          orderBy: { createdAt: 'desc' },
          take: 8,
        }),
      ]);

      const roleBreakdown: Record<string, number> = {};
      usersByRole.forEach((r) => { roleBreakdown[r.role] = r._count; });

      return {
        role: 'admin',
        totalUsers,
        totalMaterials,
        totalDownloads,
        activeStudents,
        usersByRole: roleBreakdown,
        recentAdminActions,
      };
    }

    if (role === 'TEACHER') {
      const [myUploadCount, myMaterials, activeStudents, recentUploads] = await Promise.all([
        db.material.count({ where: { userId, isActive: true } }),
        db.material.findMany({ where: { userId, isActive: true }, select: { downloadCount: true } }),
        db.user.count({ where: { role: 'STUDENT', isActive: true } }),
        db.material.findMany({
          where: { userId, isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 6,
          select: { title: true, subject: true, semester: true, downloadCount: true, createdAt: true },
        }),
      ]);

      const myDownloadTotal = myMaterials.reduce((sum, m) => sum + (m.downloadCount || 0), 0);

      return {
        role: 'teacher',
        myUploadCount,
        myDownloadTotal,
        activeStudents,
        recentUploads,
      };
    }

    // Student
    const [materialCount, myDownloadCount, subjects, recentDownloads] = await Promise.all([
      db.material.count({ where: { isActive: true } }),
      db.download.count({ where: { userId } }),
      db.material.groupBy({ by: ['subject'], where: { isActive: true } }),
      db.download.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 6,
        include: { material: { select: { title: true, subject: true, semester: true } } },
      }),
    ]);

    return {
      role: 'student',
      materialCount,
      myDownloadCount,
      subjectCount: subjects.length,
      recentDownloads,
    };
  }

  async getDownloadTrend() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const downloads = await db.download.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    });

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = new Array(7).fill(0);
    downloads.forEach((d) => {
      const day = d.createdAt.getDay();
      counts[day]++;
    });

    return dayNames.map((name, i) => ({ name, downloads: counts[i] }));
  }

  async getSubjectStats() {
    const subjects = await db.material.groupBy({
      by: ['subject'],
      where: { isActive: true },
      _count: true,
      orderBy: { _count: { subject: 'desc' } },
      take: 10,
    });

    return subjects.map((s) => ({ name: s.subject, files: s._count }));
  }
}
