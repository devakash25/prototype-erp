import { prisma } from '../../config/database';

class HelpdeskAnalyticsService {
  async getStats(institutionId: string) {
    const [total, open, inProgress, resolved, closed] = await Promise.all([
      prisma.helpdeskTicket.count({ where: { institutionId } }),
      prisma.helpdeskTicket.count({ where: { institutionId, status: 'OPEN' } }),
      prisma.helpdeskTicket.count({ where: { institutionId, status: 'IN_PROGRESS' } }),
      prisma.helpdeskTicket.count({ where: { institutionId, status: 'RESOLVED' } }),
      prisma.helpdeskTicket.count({ where: { institutionId, status: 'CLOSED' } }),
    ]);

    const resolvedTickets = await prisma.helpdeskTicket.findMany({
      where: { institutionId, status: 'RESOLVED', resolvedAt: { not: null } },
      select: { createdAt: true, resolvedAt: true },
      take: 100,
    });

    const avgResolutionTime = resolvedTickets.length > 0
      ? Math.round(resolvedTickets.reduce((sum, t) =>
        sum + (t.resolvedAt!.getTime() - t.createdAt.getTime()) / (1000 * 60 * 60), 0
      ) / resolvedTickets.length * 10) / 10
      : 0;

    return { total, open, inProgress, resolved, closed, avgResolutionTime };
  }

  async getCategoryDistribution(institutionId: string) {
    const tickets = await prisma.helpdeskTicket.groupBy({
      by: ['category'],
      where: { institutionId },
      _count: { category: true },
    });

    const colors = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#a855f7'];
    return tickets.map((t, i) => ({
      category: t.category.charAt(0).toUpperCase() + t.category.slice(1),
      count: t._count.category,
      color: colors[i % colors.length],
    }));
  }

  async getResolutionTrend(institutionId: string) {
    const weeks = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i * 7 + 6));
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() - i * 7);

      const [opened, resolved] = await Promise.all([
        prisma.helpdeskTicket.count({
          where: { institutionId, createdAt: { gte: weekStart, lte: weekEnd } },
        }),
        prisma.helpdeskTicket.count({
          where: { institutionId, status: 'RESOLVED', resolvedAt: { gte: weekStart, lte: weekEnd } },
        }),
      ]);
      weeks.push({ week: `W${6 - i}`, opened, resolved });
    }
    return weeks;
  }

  async getPriorityBreakdown(institutionId: string) {
    const tickets = await prisma.helpdeskTicket.groupBy({
      by: ['priority'],
      where: { institutionId, status: { in: ['OPEN', 'IN_PROGRESS'] } },
      _count: { priority: true },
    });

    const colors = ['#ef4444', '#f97316', '#6366f1', '#10b981'];
    return tickets.map((t, i) => ({
      priority: t.priority,
      count: t._count.priority,
      color: colors[i % colors.length],
    }));
  }

  async getRecentTickets(institutionId: string, limit = 10) {
    const tickets = await prisma.helpdeskTicket.findMany({
      where: { institutionId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return tickets.map((t) => ({
      id: t.id.slice(0, 8),
      title: t.title,
      category: t.category,
      status: t.status,
      priority: t.priority,
      created: t.createdAt.toISOString(),
    }));
  }
}

export const helpdeskAnalyticsService = new HelpdeskAnalyticsService();
