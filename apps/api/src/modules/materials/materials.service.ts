import { db } from '@studyq/database';
import type { MaterialQueryDto } from '@studyq/shared';

export class MaterialsService {
  async upload(data: {
    title: string;
    description?: string;
    subject: string;
    semester?: number;
    academicYear?: number;
    fileName: string;
    fileUrl: string;
    storageKey: string;
    fileSize: number;
    fileType: string;
    tags?: string[];
  }, userId: string) {
    const material = await db.material.create({
      data: {
        title: data.title,
        description: data.description,
        subject: data.subject,
        semester: data.semester,
        academicYear: data.academicYear,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        storageKey: data.storageKey,
        fileSize: data.fileSize,
        fileType: data.fileType,
        tags: data.tags || [],
        userId,
      },
      include: { uploadedBy: { select: { name: true, email: true } } },
    });

    await db.activityLog.create({
      data: { userId, action: 'UPLOAD', target: material.id, details: `Uploaded "${data.title}"` },
    });

    return material;
  }

  async list(query: MaterialQueryDto) {
    const { subject, semester, search, page, limit } = query;

    const where: any = { isActive: true };
    if (subject) where.subject = subject;
    if (semester) where.semester = semester;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [materials, total] = await Promise.all([
      db.material.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { uploadedBy: { select: { name: true, email: true } } },
      }),
      db.material.count({ where }),
    ]);

    return { materials, total, page, totalPages: Math.ceil(total / limit) };
  }

  async download(materialId: string, userId: string) {
    const material = await db.material.findUnique({ where: { id: materialId } });
    if (!material) throw new Error('Material not found');

    await db.download.create({ data: { materialId, userId } });
    await db.material.update({
      where: { id: materialId },
      data: { downloadCount: { increment: 1 } },
    });

    return { fileUrl: material.fileUrl };
  }

  async remove(materialId: string, userId: string, userRole: string) {
    const material = await db.material.findUnique({ where: { id: materialId } });
    if (!material) throw new Error('Material not found');

    if (userRole === 'TEACHER' && material.userId !== userId) {
      throw new Error('You can only delete your own materials');
    }

    await db.material.update({
      where: { id: materialId },
      data: { isActive: false },
    });

    await db.activityLog.create({
      data: { userId, action: 'DELETE_MATERIAL', target: materialId, details: `Deleted "${material.title}"` },
    });

    return { message: 'Material deleted' };
  }
}
