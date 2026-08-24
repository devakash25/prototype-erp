import { prisma } from '../../config/database';
import { NotFoundError, ConflictError } from '../../utils/errors';
import { logger } from '../../utils/logger';

interface CreateFeeStructureInput {
  name: string;
  description?: string;
  departmentId?: string | null;
  courseId?: string | null;
  academicSessionId: string;
  totalAmount: number;
  dueDate?: string | null;
  components?: Array<{
    name: string;
    amount: number;
    type: string;
    isRefundable?: boolean;
  }>;
}

interface UpdateFeeStructureInput {
  name?: string;
  description?: string | null;
  departmentId?: string | null;
  courseId?: string | null;
  totalAmount?: number;
  dueDate?: string | null;
  isActive?: boolean;
  components?: Array<{
    id?: string;
    name: string;
    amount: number;
    type: string;
    isRefundable?: boolean;
  }>;
}

export class FeeService {
  async create(data: CreateFeeStructureInput, institutionId: string) {
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
        _count: { select: { payments: true } },
      },
    });

    logger.info({ feeStructureId: feeStructure.id }, 'Fee structure created');
    return feeStructure;
  }

  async getAll(institutionId: string, filters?: { departmentId?: string; isActive?: boolean; search?: string }) {
    const where: any = { institutionId };
    if (filters?.departmentId) where.departmentId = filters.departmentId;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const items = await prisma.feeStructure.findMany({
      where,
      include: {
        components: true,
        department: { select: { name: true } },
        course: { select: { name: true } },
        academicSession: { select: { name: true } },
        _count: { select: { payments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return items;
  }

  async getById(id: string, institutionId: string) {
    const item = await prisma.feeStructure.findFirst({
      where: { id, institutionId },
      include: {
        components: true,
        department: { select: { name: true } },
        course: { select: { name: true } },
        academicSession: { select: { name: true } },
        payments: {
          select: {
            id: true,
            amount: true,
            paidAmount: true,
            dueAmount: true,
            status: true,
            paidAt: true,
            student: { select: { admissionNumber: true, user: { select: { fullName: true } } } },
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        _count: { select: { payments: true } },
      },
    });

    if (!item) throw new NotFoundError('Fee structure');
    return item;
  }

  async update(id: string, data: UpdateFeeStructureInput, institutionId: string) {
    const existing = await prisma.feeStructure.findFirst({ where: { id, institutionId } });
    if (!existing) throw new NotFoundError('Fee structure');

    // If components provided, replace them
    if (data.components) {
      await prisma.feeComponent.deleteMany({ where: { feeStructureId: id } });
    }

    const updated = await prisma.feeStructure.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.departmentId !== undefined && { departmentId: data.departmentId || undefined }),
        ...(data.courseId !== undefined && { courseId: data.courseId || undefined }),
        ...(data.totalAmount !== undefined && { totalAmount: data.totalAmount }),
        ...(data.dueDate !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : undefined }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.components && {
          components: {
            create: data.components.map(c => ({
              name: c.name,
              amount: c.amount,
              type: c.type,
              isRefundable: c.isRefundable || false,
            })),
          },
        }),
      },
      include: {
        components: true,
        department: { select: { name: true } },
        course: { select: { name: true } },
        academicSession: { select: { name: true } },
        _count: { select: { payments: true } },
      },
    });

    logger.info({ feeStructureId: id }, 'Fee structure updated');
    return updated;
  }

  async delete(id: string, institutionId: string) {
    const existing = await prisma.feeStructure.findFirst({
      where: { id, institutionId },
      include: { _count: { select: { payments: true } } },
    });
    if (!existing) throw new NotFoundError('Fee structure');
    if (existing._count.payments > 0) {
      throw new ConflictError('Cannot delete fee structure with existing payments. Deactivate it instead.');
    }

    await prisma.feeComponent.deleteMany({ where: { feeStructureId: id } });
    await prisma.feeStructure.delete({ where: { id } });

    logger.info({ feeStructureId: id }, 'Fee structure deleted');
  }

  async toggleActive(id: string, institutionId: string) {
    const existing = await prisma.feeStructure.findFirst({ where: { id, institutionId } });
    if (!existing) throw new NotFoundError('Fee structure');

    const updated = await prisma.feeStructure.update({
      where: { id },
      data: { isActive: !existing.isActive },
      include: { components: true },
    });

    logger.info({ feeStructureId: id, isActive: updated.isActive }, 'Fee structure toggled');
    return updated;
  }

  async getSummary(institutionId: string) {
    const [totalStructures, activeStructures, totalPayments, collectedAmount, pendingAmount] = await Promise.all([
      prisma.feeStructure.count({ where: { institutionId } }),
      prisma.feeStructure.count({ where: { institutionId, isActive: true } }),
      prisma.feePayment.count({ where: { student: { institutionId } } }),
      prisma.feePayment.aggregate({
        where: { student: { institutionId }, status: 'PAID' },
        _sum: { paidAmount: true },
      }),
      prisma.feePayment.aggregate({
        where: { student: { institutionId }, status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] } },
        _sum: { dueAmount: true },
      }),
    ]);

    return {
      totalStructures,
      activeStructures,
      totalPayments,
      collectedAmount: Number(collectedAmount._sum.paidAmount) || 0,
      pendingAmount: Number(pendingAmount._sum.dueAmount) || 0,
    };
  }
}

export const feeService = new FeeService();
