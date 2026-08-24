import { prisma } from '../../config/database';

class WorkflowAnalyticsService {
  async getStats(institutionId: string) {
    const [pending, inProgress, approved, rejected] = await Promise.all([
      prisma.workflow.count({ where: { institutionId, status: 'PENDING' } }),
      prisma.workflow.count({ where: { institutionId, status: 'IN_PROGRESS' } }),
      prisma.workflow.count({ where: { institutionId, status: 'APPROVED' } }),
      prisma.workflow.count({ where: { institutionId, status: 'REJECTED' } }),
    ]);

    const resolved = await prisma.workflow.findMany({
      where: { institutionId, status: { in: ['APPROVED', 'REJECTED'] } },
      select: { createdAt: true, updatedAt: true },
      take: 100,
    });

    const avgApprovalTime = resolved.length > 0
      ? Math.round(resolved.reduce((sum, w) =>
        sum + (w.updatedAt.getTime() - w.createdAt.getTime()) / (1000 * 60 * 60 * 24), 0
      ) / resolved.length * 10) / 10
      : 0;

    return { pending, inProgress, approved, rejected, avgApprovalTime };
  }

  async getByType(institutionId: string) {
    const workflows = await prisma.workflow.groupBy({
      by: ['type', 'status'],
      where: { institutionId },
      _count: { type: true },
    });

    const types = ['ADMISSION', 'FEE_WAIVER', 'REFUND', 'LEAVE_REQUEST', 'DOCUMENT_REQUEST', 'CERTIFICATE_REQUEST'];
    return types.map((type) => {
      const byStatus = workflows.filter((w) => w.type === type);
      return {
        type: type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
        pending: byStatus.find((w) => w.status === 'PENDING')?._count.type || 0,
        approved: byStatus.find((w) => w.status === 'APPROVED')?._count.type || 0,
        rejected: byStatus.find((w) => w.status === 'REJECTED')?._count.type || 0,
      };
    });
  }

  async getApprovalTrend(institutionId: string) {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      const [submitted, approved, rejected] = await Promise.all([
        prisma.workflow.count({ where: { institutionId, createdAt: { gte: date, lte: monthEnd } } }),
        prisma.workflow.count({ where: { institutionId, status: 'APPROVED', updatedAt: { gte: date, lte: monthEnd } } }),
        prisma.workflow.count({ where: { institutionId, status: 'REJECTED', updatedAt: { gte: date, lte: monthEnd } } }),
      ]);
      months.push({ month: date.toLocaleString('default', { month: 'short' }), submitted, approved, rejected });
    }
    return months;
  }

  async getRecent(institutionId: string, limit = 10) {
    const workflows = await prisma.workflow.findMany({
      where: { institutionId },
      include: { creator: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return workflows.map((w) => ({
      id: w.id.slice(0, 8),
      type: w.type,
      title: w.title,
      status: w.status,
      submittedBy: w.creator.fullName,
      submittedAt: w.createdAt.toISOString(),
    }));
  }
}

export const workflowAnalyticsService = new WorkflowAnalyticsService();
