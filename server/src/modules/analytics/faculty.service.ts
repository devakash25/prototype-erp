import { prisma } from '../../config/database';

class FacultyAnalyticsService {
  async getStats(institutionId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [total, present, onLeave] = await Promise.all([
      prisma.employee.count({ where: { institutionId, isActive: true } }),
      prisma.employeeAttendance.count({
        where: { employee: { institutionId }, date: today, status: 'PRESENT' },
      }),
      prisma.leave.count({
        where: { employee: { institutionId }, status: 'approved', startDate: { lte: today }, endDate: { gte: today } },
      }),
    ]);

    const feedback = await prisma.performanceReview.aggregate({
      where: { employee: { institutionId } },
      _avg: { rating: true },
    });

    return {
      total,
      present,
      onLeave,
      avgStudentFeedback: Number(feedback._avg.rating) || 0,
    };
  }

  async getDepartmentWise(institutionId: string) {
    const departments = await prisma.department.findMany({
      where: { institutionId, isActive: true },
      include: {
        employees: {
          select: { id: true, isActive: true },
        },
      },
    });

    return departments.map((dept) => ({
      dept: dept.name,
      count: dept.employees.length,
      present: dept.employees.filter((e) => e.isActive).length,
    }));
  }

  async getLeaveTrend(institutionId: string) {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const [casual, sick, earned] = await Promise.all([
        prisma.leave.count({
          where: { employee: { institutionId }, type: 'casual', startDate: { gte: date, lte: monthEnd } },
        }),
        prisma.leave.count({
          where: { employee: { institutionId }, type: 'sick', startDate: { gte: date, lte: monthEnd } },
        }),
        prisma.leave.count({
          where: { employee: { institutionId }, type: 'earned', startDate: { gte: date, lte: monthEnd } },
        }),
      ]);

      months.push({
        month: date.toLocaleString('default', { month: 'short' }),
        casual, sick, earned,
      });
    }

    return months;
  }

  async getWorkload(institutionId: string) {
    const employees = await prisma.employee.findMany({
      where: { institutionId, isActive: true, department: 'ACADEMIC' },
      include: {
        user: { select: { fullName: true } },
        subjectAllocations: { select: { id: true } },
        timetables: { select: { id: true } },
      },
      take: 20,
    });

    return employees.map((emp) => ({
      name: emp.user?.fullName || emp.employeeCode,
      classes: emp.timetables.length,
      assignments: emp.subjectAllocations.length,
      students: 0, // Would need enrollment data
    }));
  }

  async getFeedbackDistribution(institutionId: string) {
    const reviews = await prisma.performanceReview.findMany({
      where: { employee: { institutionId } },
      select: { rating: true },
    });

    const distribution = [
      { rating: '5 Stars', count: 0, color: '#10b981' },
      { rating: '4 Stars', count: 0, color: '#6366f1' },
      { rating: '3 Stars', count: 0, color: '#f59e0b' },
      { rating: '2 Stars', count: 0, color: '#f97316' },
      { rating: '1 Star', count: 0, color: '#ef4444' },
    ];

    reviews.forEach((r) => {
      const index = 5 - r.rating;
      if (index >= 0 && index < 5) {
        distribution[index].count++;
      }
    });

    return distribution;
  }

  async getHiringTrend(institutionId: string) {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const [joining, leaving] = await Promise.all([
        prisma.employee.count({
          where: { institutionId, dateOfJoining: { gte: date, lte: monthEnd } },
        }),
        prisma.employee.count({
          where: { institutionId, dateOfLeaving: { gte: date, lte: monthEnd } },
        }),
      ]);

      months.push({
        month: date.toLocaleString('default', { month: 'short' }),
        joining, leaving,
      });
    }

    return months;
  }
}

export const facultyAnalyticsService = new FacultyAnalyticsService();
