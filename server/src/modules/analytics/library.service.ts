import { prisma } from '../../config/database';

class LibraryAnalyticsService {
  async getStats(institutionId: string) {
    const [bookCount, issued, overdue, fines, members] = await Promise.all([
      prisma.libraryBook.aggregate({ where: { institutionId }, _sum: { totalCopies: true } }),
      prisma.libraryIssue.count({ where: { book: { institutionId }, status: 'issued' } }),
      prisma.libraryIssue.count({
        where: { book: { institutionId }, status: 'issued', dueDate: { lt: new Date() } },
      }),
      prisma.libraryIssue.aggregate({
        where: { book: { institutionId }, finePaid: false }, _sum: { fine: true },
      }),
      prisma.student.count({ where: { institutionId, isActive: true } }),
    ]);

    return {
      totalBooks: Number(bookCount._sum.totalCopies) || 0,
      issued,
      overdue,
      pendingFines: Number(fines._sum.fine) || 0,
      members,
    };
  }

  async getCategoryDistribution(institutionId: string) {
    const books = await prisma.libraryBook.findMany({
      where: { institutionId },
      select: { category: true, totalCopies: true },
    });

    const counts: Record<string, number> = {};
    books.forEach((b) => { counts[b.category] = (counts[b.category] || 0) + Number(b.totalCopies); });

    const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f59e0b'];
    return Object.entries(counts).map(([category, count], i) => ({
      category, books: count, color: colors[i % colors.length],
    }));
  }

  async getIssueReturnTrend(institutionId: string) {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      const [issuedCount, returnedCount] = await Promise.all([
        prisma.libraryIssue.count({ where: { book: { institutionId }, issueDate: { gte: date, lte: monthEnd } } }),
        prisma.libraryIssue.count({ where: { book: { institutionId }, returnDate: { gte: date, lte: monthEnd } } }),
      ]);
      months.push({ month: date.toLocaleString('default', { month: 'short' }), issued: issuedCount, returned: returnedCount });
    }
    return months;
  }

  async getMostReadBooks(institutionId: string, limit = 10) {
    const books = await prisma.libraryBook.findMany({
      where: { institutionId },
      include: { issues: { select: { id: true } } },
      orderBy: { issues: { _count: 'desc' } },
      take: limit,
    });

    return books.map((b, i) => ({
      rank: i + 1,
      title: b.title,
      author: b.author,
      issues: b.issues.length,
    }));
  }
}

export const libraryAnalyticsService = new LibraryAnalyticsService();
