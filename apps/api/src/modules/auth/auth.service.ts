import { db } from '@studyq/database';
import type { RegisterDto, LoginDto } from '@studyq/shared';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class AuthService {
  async register(dto: RegisterDto) {
    const existing = await db.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new Error('Email already in use');

    const hashed = await bcrypt.hash(dto.password, 12);
    const user = await db.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashed,
        role: 'STUDENT', // Public registration is always student
      },
      select: { id: true, name: true, email: true, role: true },
    });

    await db.activityLog.create({
      data: { userId: user.id, action: 'REGISTER', details: `New student registered` },
    });

    return {
      user,
      accessToken: this.signAccessToken(user.id),
      refreshToken: this.signRefreshToken(user.id),
    };
  }

  async login(dto: LoginDto) {
    const user = await db.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new Error('Invalid credentials');

    if (!user.isActive) throw new Error('Account is deactivated');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new Error('Invalid credentials');

    await db.activityLog.create({
      data: { userId: user.id, action: 'LOGIN', details: 'User logged in' },
    });

    const { password: _, ...safeUser } = user;
    return {
      user: { id: safeUser.id, name: safeUser.name, email: safeUser.email, role: safeUser.role },
      accessToken: this.signAccessToken(user.id),
      refreshToken: this.signRefreshToken(user.id),
    };
  }

  async refresh(refreshToken: string) {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { id: string };
    const user = await db.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) throw new Error('Invalid refresh token');

    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      accessToken: this.signAccessToken(user.id),
      refreshToken: this.signRefreshToken(user.id),
    };
  }

  async getMe(userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true },
    });
    if (!user) throw new Error('User not found');
    return user;
  }

  private signAccessToken(id: string) {
    return jwt.sign({ id }, process.env.JWT_SECRET!, { expiresIn: '15m' });
  }

  private signRefreshToken(id: string) {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });
  }
}
