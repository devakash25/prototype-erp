import { prisma } from '../../config/database';
import bcrypt from 'bcrypt';
import { NotFoundError, ConflictError } from '../../utils/errors';
import { logger } from '../../utils/logger';
import { Prisma, UserRole } from '@prisma/client';

interface CreateAuthorityInput {
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  departmentId?: string;
  designation?: string;
  employeeCode?: string;
  dateOfJoining?: Date;
}

interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  secondaryPhone?: string;
  avatar?: string;
  isActive?: boolean;
}

interface UserFilters {
  role?: UserRole;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export class UserService {
  async createAuthority(data: CreateAuthorityInput, createdBy: string) {
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
        institutionId: createdBy,
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
        isActive: true,
        createdAt: true,
      },
    });

    // If role is employee-type, create employee record with auto-generated profile ID
    const employeeRoles = [
      'DIRECTOR', 'PRINCIPAL', 'HOD', 'TEACHER', 'ACCOUNTANT',
      'ADMISSION_COUNSELLOR', 'LIBRARIAN', 'HOSTEL_WARDEN',
      'TRANSPORT_MANAGER', 'ADMINISTRATIVE_STAFF',
    ];

    if (employeeRoles.includes(data.role)) {
      const employeeCode = data.employeeCode || this.generateEmployeeCode(data.role);
      let departmentId = data.departmentId;

      // If no department specified, find a default one
      if (!departmentId) {
        const defaultDept = await prisma.department.findFirst({
          where: { institutionId: createdBy, isActive: true },
          orderBy: { createdAt: 'asc' },
        });
        departmentId = defaultDept?.id;
      }

      // Must have a department - find any active one as last resort
      if (!departmentId) {
        const anyDept = await prisma.department.findFirst({ where: { isActive: true } });
        departmentId = anyDept?.id;
      }

      if (departmentId) {
        const employee = await prisma.employee.create({
          data: {
            institutionId: createdBy,
            departmentId,
            userId: user.id,
            employeeCode,
            designation: data.designation || data.role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
            department: this.mapRoleToDepartment(data.role),
            dateOfJoining: data.dateOfJoining || new Date(),
          },
        });

        logger.info({ userId: user.id, employeeCode: employee.employeeCode, role: user.role }, 'Employee profile created');
        return { ...user, employeeCode: employee.employeeCode, employeeId: employee.id };
      }
    }

    logger.info({ userId: user.id, role: user.role, createdBy }, 'Authority created');
    return user;
  }

  async getUsers(filters: UserFilters, institutionId: string) {
    const { role, isActive, search, page = 1, limit = 20 } = filters;

    const where: Prisma.UserWhereInput = {
      institutionId,
      ...(role && { role }),
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          role: true,
          firstName: true,
          lastName: true,
          fullName: true,
          phone: true,
          avatar: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          employee: {
            select: {
              id: true,
              employeeCode: true,
              designation: true,
              department: true,
              dateOfJoining: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
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
        isActive: true,
        lastLoginAt: true,
        loginCount: true,
        createdAt: true,
        updatedAt: true,
        employee: {
          select: {
            id: true,
            employeeCode: true,
            designation: true,
            department: true,
            dateOfJoining: true,
            salary: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    return user;
  }

  async updateUser(id: string, data: UpdateUserInput) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundError('User');
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...data,
        ...(data.firstName || data.lastName) && {
          fullName: `${data.firstName || user.firstName} ${data.lastName || user.lastName}`,
        },
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
        isActive: true,
      },
    });

    logger.info({ userId: id }, 'User updated');
    return updatedUser;
  }

  async toggleUserStatus(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundError('User');
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    logger.info({ userId: id, isActive: updatedUser.isActive }, 'User status toggled');
    return updatedUser;
  }

  async resetPassword(id: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundError('User');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
      },
    });

    // Invalidate all refresh tokens
    await prisma.refreshToken.deleteMany({ where: { userId: id } });

    logger.info({ userId: id }, 'Password reset');
  }

  async getUserStats(institutionId: string) {
    const [total, byRole, active, inactive] = await Promise.all([
      prisma.user.count({ where: { institutionId } }),
      prisma.user.groupBy({
        by: ['role'],
        where: { institutionId },
        _count: { role: true },
      }),
      prisma.user.count({ where: { institutionId, isActive: true } }),
      prisma.user.count({ where: { institutionId, isActive: false } }),
    ]);

    const roleDistribution = byRole.reduce((acc, item) => {
      acc[item.role] = item._count.role;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      active,
      inactive,
      roleDistribution,
    };
  }

  private generateEmployeeCode(role: string): string {
    const prefix = role.replace(/_/g, '').substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  private mapRoleToDepartment(role: UserRole): any {
    const mapping: Record<string, any> = {
      DIRECTOR: 'ADMINISTRATION',
      PRINCIPAL: 'ADMINISTRATION',
      HOD: 'ACADEMIC',
      TEACHER: 'ACADEMIC',
      ACCOUNTANT: 'FINANCE',
      ADMISSION_COUNSELLOR: 'ADMINISTRATION',
      LIBRARIAN: 'LIBRARY',
      HOSTEL_WARDEN: 'HOSTEL',
      TRANSPORT_MANAGER: 'TRANSPORT',
      ADMINISTRATIVE_STAFF: 'ADMINISTRATION',
    };
    return mapping[role] || 'ADMINISTRATION';
  }
}

export const userService = new UserService();
