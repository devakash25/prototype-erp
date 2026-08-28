import { prisma } from '../../config/database';
import bcrypt from 'bcrypt';
import { AppError, ConflictError, NotFoundError, UnauthorizedError } from '../../utils/errors';
import { generateTokens, verifyRefreshToken } from '../../middleware/auth';
import { safeSetex, safeDel } from '../../config/redis';
import { logger } from '../../utils/logger';
import { Prisma, UserRole } from '@prisma/client';

interface CreateUserInput {
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  institutionId?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  async createUser(data: CreateUserInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName,
        fullName: `${data.firstName} ${data.lastName}`,
        phone: data.phone,
        institutionId: data.institutionId,
      },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        fullName: true,
        phone: true,
        avatar: true,
        institutionId: true,
        createdAt: true,
      },
    });

    logger.info({ userId: user.id, role: user.role }, 'User created');
    return user;
  }

  async login(data: LoginInput, ip?: string, userAgent?: string) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Enabled roles
    if (!['CEO', 'CHIEF_HEAD', 'DIRECTOR', 'MANAGER', 'VICE_MANAGER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'HOD', 'TEACHER', 'STUDENT', 'ACCOUNTANT', 'ADMISSION_COUNSELLOR', 'TRANSPORT_MANAGER', 'ADMINISTRATIVE_STAFF', 'PARENT', 'LIBRARIAN', 'HOSTEL_WARDEN'].includes(user.role)) {
      throw new UnauthorizedError('Your role is not yet active. Contact your administrator.');
    }

    // Fetch institution type for non-CEO users
    let institutionType: string | null = null;
    if (user.institutionId) {
      const inst = await prisma.institution.findUnique({ where: { id: user.institutionId }, select: { type: true } });
      institutionType = inst?.type || null;
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      institutionId: user.institutionId || '',
      institutionType: institutionType || '',
    };

    const { accessToken, refreshToken } = generateTokens(payload);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        ip,
        userAgent,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        loginCount: { increment: 1 },
      },
    });

    // Cache user session
    await safeSetex(`session:${user.id}`, 900, JSON.stringify(payload));

    logger.info({ userId: user.id, email: user.email }, 'User logged in');

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        phone: user.phone,
        avatar: user.avatar,
        institutionId: user.institutionId,
        institutionType,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(token: string) {
    const payload = verifyRefreshToken(token);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    // Delete old refresh token
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    // Generate new tokens
    const newPayload = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      institutionId: payload.institutionId,
      institutionType: payload.institutionType || '',
    };

    const tokens = generateTokens(newPayload);

    // Store new refresh token
    await prisma.refreshToken.create({
      data: {
        userId: payload.userId,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return tokens;
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: { userId, token: refreshToken },
      });
    } else {
      await prisma.refreshToken.deleteMany({
        where: { userId },
      });
    }

    await safeDel(`session:${userId}`);
    logger.info({ userId }, 'User logged out');
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
      },
    });

    // Invalidate all refresh tokens
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });

    await safeDel(`session:${userId}`);

    logger.info({ userId }, 'Password changed');
  }

  async updateProfile(userId: string, data: { phone?: string; avatar?: string; email?: string; firstName?: string; lastName?: string }) {
    // Check email uniqueness if changing
    if (data.email) {
      const existing = await prisma.user.findFirst({ where: { email: data.email, id: { not: userId } } });
      if (existing) throw new UnauthorizedError('Email already in use');
    }
    const updateData: any = {};
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.firstName !== undefined) {
      updateData.firstName = data.firstName;
      if (data.lastName) {
        updateData.fullName = `${data.firstName} ${data.lastName}`;
      } else {
        updateData.fullName = data.firstName;
      }
    }
    if (data.lastName !== undefined) {
      updateData.lastName = data.lastName;
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { firstName: true } });
      if (user) updateData.fullName = `${data.firstName || user.firstName} ${data.lastName}`;
    }
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        fullName: true,
        phone: true,
        avatar: true,
        institutionId: true,
      },
    });

    return user;
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        fullName: true,
        phone: true,
        secondaryPhone: true,
        avatar: true,
        dateOfBirth: true,
        gender: true,
        bloodGroup: true,
        address: true,
        city: true,
        state: true,
        country: true,
        pincode: true,
        institutionId: true,
        lastLoginAt: true,
        createdAt: true,
        institution: { select: { type: true } },
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    const { institution, ...userData } = user;
    return { ...userData, institutionType: institution?.type || null };
  }

  async getActiveFeatures(): Promise<string[]> {
    try {
      const activePlan = await prisma.subscriptionPlan.findFirst({
        where: { isActive: true },
      });
      if (!activePlan) {
        // No plan active - return empty array (client will use fallback)
        return [];
      }
      return (activePlan.modules as string[]) || [];
    } catch {
      return [];
    }
  }
}

export const authService = new AuthService();
