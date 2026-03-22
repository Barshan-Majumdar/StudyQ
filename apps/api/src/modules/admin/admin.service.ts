import { db } from '@studyq/database';
import type { CreateUserDto, UpdateUserDto } from '@studyq/shared';
import bcrypt from 'bcryptjs';

export class AdminService {
  async listUsers(query: { role?: string; search?: string; status?: string; page: number; limit: number }) {
    const { role, search, status, page, limit } = query;

    const where: any = {};
    if (role && ['student', 'teacher', 'admin'].includes(role)) {
      where.role = role.toUpperCase();
    }
    if (status === 'active') where.isActive = true;
    if (status === 'inactive') where.isActive = false;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.user.count({ where }),
    ]);

    return { users, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getUser(id: string) {
    const user = await db.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    });
    if (!user) throw new Error('User not found');
    return user;
  }

  async createUser(dto: CreateUserDto, adminId: string, ip?: string) {
    const existing = await db.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new Error('Email already registered');

    const hashed = await bcrypt.hash(dto.password, 12);
    const user = await db.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashed,
        role: dto.role.toUpperCase() as any,
      },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    await db.activityLog.create({
      data: {
        userId: adminId,
        action: 'ADMIN_CREATE_USER',
        target: user.id,
        details: `Admin created ${dto.role}: ${dto.name} (${dto.email})`,
        performedBy: adminId,
        targetUserId: user.id,
        ipAddress: ip,
      },
    });

    return user;
  }

  async updateUser(id: string, dto: UpdateUserDto, adminId: string, ip?: string) {
    const user = await db.user.findUnique({ where: { id } });
    if (!user) throw new Error('User not found');

    // Prevent modifying other admins
    if (user.role === 'ADMIN' && user.id !== adminId) {
      throw new Error('Cannot modify another admin');
    }

    const data: any = {};
    const changes: string[] = [];

    if (dto.name && dto.name !== user.name) {
      data.name = dto.name;
      changes.push(`name: ${user.name} → ${dto.name}`);
    }
    if (dto.email && dto.email !== user.email) {
      const emailExists = await db.user.findFirst({ where: { email: dto.email, NOT: { id } } });
      if (emailExists) throw new Error('Email already in use');
      data.email = dto.email;
      changes.push(`email: ${user.email} → ${dto.email}`);
    }
    if (dto.role && dto.role.toUpperCase() !== user.role) {
      data.role = dto.role.toUpperCase();
      changes.push(`role: ${user.role} → ${dto.role.toUpperCase()}`);
    }
    if (typeof dto.isActive === 'boolean' && dto.isActive !== user.isActive) {
      data.isActive = dto.isActive;
      changes.push(`status: ${user.isActive ? 'active' : 'inactive'} → ${dto.isActive ? 'active' : 'inactive'}`);
    }

    if (changes.length === 0) {
      return { id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive };
    }

    const updated = await db.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    await db.activityLog.create({
      data: {
        userId: adminId,
        action: 'ADMIN_UPDATE_USER',
        target: id,
        details: `Updated ${user.name}: ${changes.join('; ')}`,
        performedBy: adminId,
        targetUserId: id,
        ipAddress: ip,
      },
    });

    return updated;
  }

  async deleteUser(id: string, adminId: string, ip?: string) {
    const user = await db.user.findUnique({ where: { id } });
    if (!user) throw new Error('User not found');

    if (user.role === 'ADMIN') {
      throw new Error('Cannot delete an admin account');
    }

    await db.user.update({ where: { id }, data: { isActive: false } });

    await db.activityLog.create({
      data: {
        userId: adminId,
        action: 'ADMIN_DEACTIVATE_USER',
        target: id,
        details: `Deactivated ${user.role.toLowerCase()}: ${user.name} (${user.email})`,
        performedBy: adminId,
        targetUserId: id,
        ipAddress: ip,
      },
    });

    return { message: 'User deactivated' };
  }

  async auditLog(page: number, limit: number) {
    const where = { action: { startsWith: 'ADMIN_' } };

    const [logs, total] = await Promise.all([
      db.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.activityLog.count({ where }),
    ]);

    return { logs, total, page, totalPages: Math.ceil(total / limit) };
  }
}
