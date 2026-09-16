import { prisma } from '../../config/database';
import { logger } from '../../utils/logger';

export class SearchService {
  async search(institutionId: string, query: string, type?: string) {
    if (!query || query.length < 2) return [];

    const results: any[] = [];
    const q = query;

    if (!type || type === 'students') {
      const students = await prisma.student.findMany({
        where: {
          institutionId,
          OR: [
            { user: { fullName: { contains: q, mode: 'insensitive' } } },
            { user: { email: { contains: q, mode: 'insensitive' } } },
            { admissionNumber: { contains: q, mode: 'insensitive' } },
          ],
        },
        include: { user: { select: { fullName: true, email: true } }, department: { select: { name: true } } },
        take: 10,
      });
      students.forEach(s => results.push({
        id: s.id, type: 'student', title: s.user.fullName,
        subtitle: `${s.admissionNumber} - ${s.department?.name || 'No Department'}`,
        route: `/students/${s.id}`,
      }));
    }

    if (!type || type === 'faculty') {
      const faculty = await prisma.user.findMany({
        where: {
          institutionId,
          role: { in: ['TEACHER', 'PRINCIPAL'] },
          OR: [
            { fullName: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 10,
      });
      faculty.forEach(f => results.push({
        id: f.id, type: 'faculty', title: f.fullName,
        subtitle: `${f.role} - ${f.email}`,
        route: `/faculty/${f.id}`,
      }));
    }

    if (!type || type === 'finance') {
      const payments = await prisma.feePayment.findMany({
        where: {
          student: { institutionId },
          OR: [
            { transactionId: { contains: q, mode: 'insensitive' } },
            { student: { user: { fullName: { contains: q, mode: 'insensitive' } } } },
          ],
        },
        include: { student: { include: { user: { select: { fullName: true } } } } },
        take: 10,
      });
      payments.forEach(p => results.push({
        id: p.id, type: 'finance', title: `Payment - ₹${p.amount}`,
        subtitle: `${p.student.user.fullName} - ${p.status}`,
        route: `/finance/payments`,
      }));
    }

    return results;
  }

  async searchNotifications(institutionId: string, query: string) {
    if (!query || query.length < 2) return [];
    const notifications = await prisma.notification.findMany({
      where: {
        institutionId,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { message: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
    });
    return notifications.map(n => ({
      id: n.id, type: 'notification', title: n.title,
      subtitle: n.message?.substring(0, 100) || '',
      route: `/notifications`,
    }));
  }

  async searchAnnouncements(institutionId: string, query: string) {
    if (!query || query.length < 2) return [];
    const announcements = await prisma.announcement.findMany({
      where: {
        institutionId,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
    });
    return announcements.map(a => ({
      id: a.id, type: 'announcement', title: a.title,
      subtitle: a.content?.substring(0, 100) || '',
      route: `/announcements`,
    }));
  }
}

export const searchService = new SearchService();
