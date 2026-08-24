import { prisma } from '../../config/database';

class NotificationAnalyticsService {
  async getStats(institutionId: string) {
    const [total, sent, scheduled, failed] = await Promise.all([
      prisma.notification.count({ where: { institutionId } }),
      prisma.notification.count({ where: { institutionId, isSent: true } }),
      prisma.notification.count({ where: { institutionId, isScheduled: true, isSent: false } }),
      0, // Track failed separately
    ]);

    const totalRecipients = await prisma.userNotification.count({
      where: { notification: { institutionId } },
    });
    const readCount = await prisma.userNotification.count({
      where: { notification: { institutionId }, isRead: true },
    });

    return {
      total, sent, scheduled, failed,
      readRate: totalRecipients > 0 ? Math.round((readCount / totalRecipients) * 100) : 0,
    };
  }

  async getByType(institutionId: string) {
    const notifications = await prisma.notification.groupBy({
      by: ['type'],
      where: { institutionId },
      _count: { type: true },
    });

    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#dc2626'];
    return notifications.map((n, i) => ({
      type: n.type,
      count: n._count.type,
      color: colors[i % colors.length],
    }));
  }

  async getMonthlyTrend(institutionId: string) {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const [sentCount, readCount] = await Promise.all([
        prisma.notification.count({
          where: { institutionId, isSent: true, sentAt: { gte: date, lte: monthEnd } },
        }),
        prisma.userNotification.count({
          where: { notification: { institutionId, sentAt: { gte: date, lte: monthEnd } }, isRead: true },
        }),
      ]);
      months.push({ month: date.toLocaleString('default', { month: 'short' }), sent: sentCount, read: readCount });
    }
    return months;
  }

  async getRecent(institutionId: string, limit = 10) {
    const notifications = await prisma.notification.findMany({
      where: { institutionId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return notifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      target: n.target,
      sent: n.isSent,
      createdAt: n.createdAt.toISOString(),
    }));
  }

  async getDeliveryChannels(institutionId: string) {
    // Stub - would track actual delivery channels
    return [
      { channel: 'Email', sent: 8500, color: 'text-blue-600' },
      { channel: 'SMS', sent: 3200, color: 'text-green-600' },
      { channel: 'Push', sent: 12000, color: 'text-purple-600' },
    ];
  }
}

export const notificationAnalyticsService = new NotificationAnalyticsService();
