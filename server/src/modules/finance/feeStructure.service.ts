import { prisma } from '../../config/database';
import { NotFoundError, ConflictError } from '../../utils/errors';
import { logger } from '../../utils/logger';

interface CreateFeeStructureInput {
  name: string;
  description?: string;
  departmentId?: string;
  courseId?: string;
  academicSessionId: string;
  totalAmount: number;
  dueDate?: string;
  components?: { name: string; amount: number; type: string; isRefundable?: boolean }[];
}

interface UpdateFeeStructureInput {
  name?: string;
  description?: string;
  departmentId?: string;
  courseId?: string;
  totalAmount?: number;
  dueDate?: string;
  isActive?: boolean;
  components?: { name: string; amount: number; type: string; isRefundable?: boolean }[];
}

interface FeeStructureFilters {
  search?: string;
  departmentId?: string;
  courseId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export class FeeStructureService {
  async create(data: CreateFeeStructureInput, institutionId: string) {
    const session = await prisma.academicSession.findUnique({ where: { id: data.academicSessionId } });
    if (!session || session.institutionId !== institutionId) {
      throw new NotFoundError('Academic session');
    }

    const feeStructure = await prisma.feeStructure.create({
      data: {
        institutionId,
        name: data.name,
        description: data.description,
        departmentId: data.departmentId || undefined,
        courseId: data.courseId || undefined,
        academicSessionId: data.academicSessionId,
        totalAmount: data.totalAmount,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        components: data.components ? {
          create: data.components.map(c => ({
            name: c.name,
            amount: c.amount,
            type: c.type,
            isRefundable: c.isRefundable || false,
          })),
        } : undefined,
      },
      include: {
        components: true,
        department: { select: { name: true } },
        course: { select: { name: true } },
        academicSession: { select: { name: true } },
      },
    });

    logger.info({ feeStructureId: feeStructure.id, institutionId }, 'Fee structure created');
    return feeStructure;
  }

  async getAll(filters: FeeStructureFilters, institutionId: string) {
    const { search, departmentId, courseId, isActive, page = 1, limit = 20 } = filters;

    const where: any = {
      institutionId,
      ...(departmentId && { departmentId }),
      ...(courseId && { courseId }),
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.feeStructure.findMany({
        where,
        include: {
          components: true,
          department: { select: { name: true } },
          course: { select: { name: true } },
          academicSession: { select: { name: true } },
          _count: { select: { payments: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.feeStructure.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getById(id: string, institutionId: string) {
    const feeStructure = await prisma.feeStructure.findUnique({
      where: { id },
      include: {
        components: true,
        department: { select: { name: true } },
        course: { select: { name: true } },
        academicSession: { select: { name: true } },
        payments: {
          select: { id: true, status: true, paidAmount: true, dueAmount: true },
        },
      },
    });

    if (!feeStructure || feeStructure.institutionId !== institutionId) {
      throw new NotFoundError('Fee structure');
    }

    return feeStructure;
  }

  async update(id: string, data: UpdateFeeStructureInput, institutionId: string) {
    const existing = await prisma.feeStructure.findUnique({ where: { id } });
    if (!existing || existing.institutionId !== institutionId) {
      throw new NotFoundError('Fee structure');
    }

    const feeStructure = await prisma.feeStructure.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.departmentId !== undefined && { departmentId: data.departmentId || undefined }),
        ...(data.courseId !== undefined && { courseId: data.courseId || undefined }),
        ...(data.totalAmount !== undefined && { totalAmount: data.totalAmount }),
        ...(data.dueDate !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : undefined }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      include: {
        components: true,
        department: { select: { name: true } },
        course: { select: { name: true } },
        academicSession: { select: { name: true } },
      },
    });

    // Update components if provided
    if (data.components) {
      // Delete existing components
      await prisma.feeComponent.deleteMany({ where: { feeStructureId: id } });
      // Create new components
      if (data.components.length > 0) {
        await prisma.feeComponent.createMany({
          data: data.components.map(c => ({
            feeStructureId: id,
            name: c.name,
            amount: c.amount,
            type: c.type,
            isRefundable: c.isRefundable || false,
          })),
        });
      }
    }

    logger.info({ feeStructureId: id }, 'Fee structure updated');
    return feeStructure;
  }

  async delete(id: string, institutionId: string) {
    const existing = await prisma.feeStructure.findUnique({
      where: { id },
      include: { _count: { select: { payments: true } } },
    });

    if (!existing || existing.institutionId !== institutionId) {
      throw new NotFoundError('Fee structure');
    }

    if (existing._count.payments > 0) {
      throw new ConflictError('Cannot delete fee structure with existing payments. Deactivate it instead.');
    }

    await prisma.feeComponent.deleteMany({ where: { feeStructureId: id } });
    await prisma.feeStructure.delete({ where: { id } });

    logger.info({ feeStructureId: id }, 'Fee structure deleted');
  }

  async getStats(institutionId: string) {
    const [total, active, totalAmount, paidAmount, outstandingAmount] = await Promise.all([
      prisma.feeStructure.count({ where: { institutionId } }),
      prisma.feeStructure.count({ where: { institutionId, isActive: true } }),
      prisma.feeStructure.aggregate({ where: { institutionId }, _sum: { totalAmount: true } }),
      prisma.feePayment.aggregate({ where: { student: { institutionId }, status: 'PAID' }, _sum: { paidAmount: true } }),
      prisma.feePayment.aggregate({ where: { student: { institutionId }, status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] } }, _sum: { dueAmount: true } }),
    ]);

    return {
      totalStructures: total,
      activeStructures: active,
      totalDefined: Number(totalAmount._sum.totalAmount) || 0,
      totalCollected: Number(paidAmount._sum.paidAmount) || 0,
      totalOutstanding: Number(outstandingAmount._sum.dueAmount) || 0,
    };
  }
}

export const feeStructureService = new FeeStructureService();
