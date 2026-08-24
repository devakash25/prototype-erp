import { prisma } from '../../config/database';

class CalendarAnalyticsService {
  async getStats(institutionId: string) {
    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [totalEvents, upcoming, thisWeek] = await Promise.all([
      prisma.calendarEvent.count({ where: { institutionId } }),
      prisma.calendarEvent.count({ where: { institutionId, startDate: { gte: now } } }),
      prisma.calendarEvent.count({ where: { institutionId, startDate: { gte: now, lte: weekEnd } } }),
    ]);

    return { totalEvents, upcoming, thisWeek };
  }

  async getEventsByType(institutionId: string) {
    const events = await prisma.calendarEvent.groupBy({
      by: ['type'],
      where: { institutionId },
      _count: { type: true },
    });

    const colorMap: Record<string, string> = {
      exam: '#6366f1', holiday: '#10b981', meeting: '#f59e0b',
      event: '#8b5cf6', class: '#3b82f6', other: '#6b7280',
    };
    return events.map((e) => ({
      type: e.type.charAt(0).toUpperCase() + e.type.slice(1),
      count: e._count.type,
      color: colorMap[e.type] || '#6b7280',
    }));
  }

  async getMonthlyEvents(institutionId: string) {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      const [examCount, holidayCount, eventCount] = await Promise.all([
        prisma.calendarEvent.count({ where: { institutionId, type: 'exam', startDate: { gte: date, lte: monthEnd } } }),
        prisma.calendarEvent.count({ where: { institutionId, type: 'holiday', startDate: { gte: date, lte: monthEnd } } }),
        prisma.calendarEvent.count({ where: { institutionId, type: { in: ['event', 'meeting'] }, startDate: { gte: date, lte: monthEnd } } }),
      ]);
      months.push({ month: date.toLocaleString('default', { month: 'short' }), exams: examCount, holidays: holidayCount, events: eventCount });
    }
    return months;
  }

  async getUpcoming(institutionId: string, limit = 10) {
    const events = await prisma.calendarEvent.findMany({
      where: { institutionId, startDate: { gte: new Date() } },
      orderBy: { startDate: 'asc' },
      take: limit,
    });

    return events.map((e) => ({
      id: e.id,
      title: e.title,
      date: e.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      type: e.type.toUpperCase(),
      allDay: e.allDay || false,
      location: e.location || 'TBD',
      attendees: 0,
    }));
  }
}

export const calendarAnalyticsService = new CalendarAnalyticsService();
