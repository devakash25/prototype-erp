import { prisma } from '../../config/database';
import { logger } from '../../utils/logger';

export class DashboardService {
  async getExecutiveSummary(institutionId: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const [
      totalStudents,
      activeStudents,
      totalEmployees,
      todayAttendance,
      todayRevenue,
      pendingApprovals,
      openTickets,
      totalAdmissions,
      pendingAdmissions,
      departmentStats,
    ] = await Promise.all([
      prisma.student.count({ where: { institutionId, isActive: true } }),
      prisma.student.count({ where: { institutionId, isActive: true } }),
      prisma.employee.count({ where: { institutionId, isActive: true } }),
      this.getTodayAttendancePercentage(institutionId, today),
      this.getTodayRevenue(institutionId, today),
      prisma.workflow.count({ where: { institutionId, status: 'PENDING' } }),
      prisma.helpdeskTicket.count({ where: { institutionId, status: 'OPEN' } }),
      prisma.admission.count({ where: { institutionId } }),
      prisma.admission.count({ where: { institutionId, status: 'APPLIED' } }),
      this.getDepartmentStats(institutionId),
    ]);

    return {
      totalStudents,
      activeStudents,
      totalEmployees,
      todayAttendance,
      todayRevenue,
      pendingApprovals,
      openTickets,
      totalAdmissions,
      pendingAdmissions,
      departmentStats,
    };
  }

  async getRevenueAnalytics(institutionId: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const [todayRevenue, monthRevenue, yearRevenue, totalOutstanding] = await Promise.all([
      this.getRevenueByDateRange(institutionId, today, now),
      this.getRevenueByDateRange(institutionId, monthStart, now),
      this.getRevenueByDateRange(institutionId, yearStart, now),
      this.getOutstandingFees(institutionId),
    ]);

    const revenueByType = await this.getRevenueByType(institutionId, yearStart, now);
    const monthlyTrend = await this.getMonthlyRevenueTrend(institutionId);
    const feeCollectionRate = await this.getFeeCollectionRate(institutionId);

    return {
      today: todayRevenue,
      monthly: monthRevenue,
      yearly: yearRevenue,
      outstanding: totalOutstanding,
      byType: revenueByType,
      monthlyTrend,
      feeCollectionRate,
    };
  }

  async getAttendanceAnalytics(institutionId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [studentAttendance, employeeAttendance, lowAttendanceStudents, monthlyTrend] = await Promise.all([
      this.getStudentAttendanceStats(institutionId, today),
      this.getEmployeeAttendanceStats(institutionId, today),
      this.getLowAttendanceStudents(institutionId),
      this.getAttendanceTrend(institutionId, 30),
    ]);

    return {
      student: studentAttendance,
      employee: employeeAttendance,
      lowAttendanceStudents,
      monthlyTrend,
    };
  }

  async getAdmissionAnalytics(institutionId: string) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [pipeline, monthlyTrend, conversionRate] = await Promise.all([
      this.getAdmissionPipeline(institutionId),
      this.getAdmissionMonthlyTrend(institutionId),
      this.getAdmissionConversionRate(institutionId),
    ]);

    return {
      pipeline,
      monthlyTrend,
      conversionRate,
    };
  }

  async getAcademicAnalytics(institutionId: string) {
    const [departmentRankings, examStats, subjectPerformance] = await Promise.all([
      this.getDepartmentRankings(institutionId),
      this.getExamStats(institutionId),
      this.getSubjectPerformance(institutionId),
    ]);

    return {
      departmentRankings,
      examStats,
      subjectPerformance,
    };
  }

  async getHRAnalytics(institutionId: string) {
    const [employeeStats, leaveStats, departmentWise] = await Promise.all([
      this.getEmployeeStats(institutionId),
      this.getLeaveStats(institutionId),
      this.getDepartmentWiseEmployees(institutionId),
    ]);

    return {
      employeeStats,
      leaveStats,
      departmentWise,
    };
  }

  async getHostelAnalytics(institutionId: string) {
    const [occupancy, feeCollection, maintenanceRequests] = await Promise.all([
      this.getHostelOccupancy(institutionId),
      this.getHostelFeeCollection(institutionId),
      this.getHostelMaintenanceRequests(institutionId),
    ]);

    return {
      occupancy,
      feeCollection,
      maintenanceRequests,
    };
  }

  async getTransportAnalytics(institutionId: string) {
    const [vehicles, routes, students] = await Promise.all([
      prisma.vehicle.count({ where: { institutionId, isActive: true } }),
      prisma.route.count({ where: { institutionId, isActive: true } }),
      prisma.student.count({ where: { institutionId, usesTransport: true, isActive: true } }),
    ]);

    return { vehicles, routes, students };
  }

  async getLibraryAnalytics(institutionId: string) {
    const [totalBooks, issued, overdue, fines] = await Promise.all([
      prisma.libraryBook.aggregate({
        where: { institutionId },
        _sum: { totalCopies: true },
      }),
      prisma.libraryIssue.count({ where: { book: { institutionId }, status: 'issued' } }),
      prisma.libraryIssue.count({
        where: {
          book: { institutionId },
          status: 'issued',
          dueDate: { lt: new Date() },
        },
      }),
      prisma.libraryIssue.aggregate({
        where: { book: { institutionId }, finePaid: false },
        _sum: { fine: true },
      }),
    ]);

    return {
      totalBooks: totalBooks._sum.totalCopies || 0,
      issued,
      overdue,
      pendingFines: Number(fines._sum.fine) || 0,
    };
  }

  async getHelpdeskAnalytics(institutionId: string) {
    const [total, open, resolved, avgResolutionTime] = await Promise.all([
      prisma.helpdeskTicket.count({ where: { institutionId } }),
      prisma.helpdeskTicket.count({ where: { institutionId, status: 'OPEN' } }),
      prisma.helpdeskTicket.count({ where: { institutionId, status: 'RESOLVED' } }),
      this.getAverageResolutionTime(institutionId),
    ]);

    return { total, open, resolved, avgResolutionTime };
  }

  async getWorkflowAnalytics(institutionId: string) {
    const [pending, approved, rejected, byType] = await Promise.all([
      prisma.workflow.count({ where: { institutionId, status: 'PENDING' } }),
      prisma.workflow.count({ where: { institutionId, status: 'APPROVED' } }),
      prisma.workflow.count({ where: { institutionId, status: 'REJECTED' } }),
      prisma.workflow.groupBy({
        by: ['type'],
        where: { institutionId },
        _count: { type: true },
      }),
    ]);

    return {
      pending,
      approved,
      rejected,
      byType: byType.reduce((acc, item) => {
        acc[item.type] = item._count.type;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  async getNotificationAnalytics(institutionId: string) {
    const [total, sent, byType] = await Promise.all([
      prisma.notification.count({ where: { institutionId } }),
      prisma.notification.count({ where: { institutionId, isSent: true } }),
      prisma.notification.groupBy({
        by: ['type'],
        where: { institutionId },
        _count: { type: true },
      }),
    ]);

    return { total, sent, byType };
  }

  async getInstitutionHealthScore(institutionId: string) {
    const metrics = await Promise.all([
      this.getStudentAttendanceScore(institutionId),
      this.getFeeCollectionScore(institutionId),
      this.getAcademicPerformanceScore(institutionId),
      this.getHelpdeskResolutionScore(institutionId),
      this.getFacultyAttendanceScore(institutionId),
    ]);

    const weights = [0.2, 0.25, 0.25, 0.15, 0.15];
    const score = metrics.reduce((sum, metric, index) => {
      return sum + metric.score * weights[index];
    }, 0);

    return {
      score: Math.round(score),
      metrics: metrics.map((m, i) => ({
        name: m.name,
        score: m.score,
        weight: weights[i],
      })),
    };
  }

  async getRecentActivity(institutionId: string, limit = 20) {
    const activities = await prisma.auditLog.findMany({
      where: { institutionId },
      include: {
        user: {
          select: { id: true, fullName: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return activities;
  }

  // Helper methods
  private async getTodayAttendancePercentage(institutionId: string, date: Date) {
    const total = await prisma.student.count({
      where: { institutionId, isActive: true },
    });
    if (total === 0) return 0;

    const present = await prisma.attendance.count({
      where: {
        student: { institutionId },
        date,
        status: 'PRESENT',
      },
    });

    return Math.round((present / total) * 100 * 10) / 10;
  }

  private async getTodayRevenue(institutionId: string, date: Date) {
    const result = await prisma.feePayment.aggregate({
      where: {
        student: { institutionId },
        paidAt: { gte: date },
        status: 'PAID',
      },
      _sum: { paidAmount: true },
    });
    return Number(result._sum.paidAmount) || 0;
  }

  private async getRevenueByDateRange(institutionId: string, start: Date, end: Date) {
    const result = await prisma.feePayment.aggregate({
      where: {
        student: { institutionId },
        paidAt: { gte: start, lte: end },
        status: 'PAID',
      },
      _sum: { paidAmount: true },
      _count: true,
    });
    return {
      amount: Number(result._sum.paidAmount) || 0,
      transactions: result._count,
    };
  }

  private async getOutstandingFees(institutionId: string) {
    const result = await prisma.feePayment.aggregate({
      where: {
        student: { institutionId },
        status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] },
      },
      _sum: { dueAmount: true },
    });
    return Number(result._sum.dueAmount) || 0;
  }

  private async getRevenueByType(institutionId: string, start: Date, end: Date) {
    const payments = await prisma.feePayment.findMany({
      where: {
        student: { institutionId },
        paidAt: { gte: start, lte: end },
        status: 'PAID',
      },
      include: {
        feeStructure: {
          include: { components: true },
        },
      },
    });

    const byType: Record<string, number> = {};
    payments.forEach((payment) => {
      payment.feeStructure.components.forEach((comp) => {
        byType[comp.type] = (byType[comp.type] || 0) + Number(comp.amount);
      });
    });

    return byType;
  }

  private async getMonthlyRevenueTrend(institutionId: string) {
    const months = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const result = await prisma.feePayment.aggregate({
        where: {
          student: { institutionId },
          paidAt: { gte: date, lte: monthEnd },
          status: 'PAID',
        },
        _sum: { paidAmount: true },
      });

      months.push({
        month: date.toLocaleString('default', { month: 'short' }),
        year: date.getFullYear(),
        amount: Number(result._sum.paidAmount) || 0,
      });
    }

    return months;
  }

  private async getFeeCollectionRate(institutionId: string) {
    const [total, collected] = await Promise.all([
      prisma.feePayment.aggregate({
        where: { student: { institutionId } },
        _sum: { amount: true },
      }),
      prisma.feePayment.aggregate({
        where: { student: { institutionId }, status: 'PAID' },
        _sum: { paidAmount: true },
      }),
    ]);

    const totalAmount = Number(total._sum.amount) || 0;
    const collectedAmount = Number(collected._sum.paidAmount) || 0;

    return totalAmount > 0 ? Math.round((collectedAmount / totalAmount) * 100) : 0;
  }

  private async getDepartmentStats(institutionId: string) {
    const departments = await prisma.department.findMany({
      where: { institutionId, isActive: true },
      include: {
        _count: {
          select: { students: true, employees: true },
        },
      },
    });

    return departments.map((dept) => ({
      id: dept.id,
      name: dept.name,
      students: dept._count.students,
      employees: dept._count.employees,
    }));
  }

  private async getStudentAttendanceStats(institutionId: string, date: Date) {
    const total = await prisma.student.count({
      where: { institutionId, isActive: true },
    });
    const present = await prisma.attendance.count({
      where: { student: { institutionId }, date, status: 'PRESENT' },
    });
    const absent = await prisma.attendance.count({
      where: { student: { institutionId }, date, status: 'ABSENT' },
    });
    const late = await prisma.attendance.count({
      where: { student: { institutionId }, date, status: 'LATE' },
    });

    return {
      total,
      present,
      absent,
      late,
      percentage: total > 0 ? Math.round((present / total) * 100 * 10) / 10 : 0,
    };
  }

  private async getEmployeeAttendanceStats(institutionId: string, date: Date) {
    const total = await prisma.employee.count({
      where: { institutionId, isActive: true },
    });
    const present = await prisma.employeeAttendance.count({
      where: { employee: { institutionId }, date, status: 'PRESENT' },
    });

    return {
      total,
      present,
      percentage: total > 0 ? Math.round((present / total) * 100 * 10) / 10 : 0,
    };
  }

  private async getLowAttendanceStudents(institutionId: string) {
    // Get students with less than 75% attendance
    const students = await prisma.student.findMany({
      where: { institutionId, isActive: true },
      include: {
        attendance: {
          select: { status: true },
        },
        user: {
          select: { fullName: true, email: true },
        },
        department: {
          select: { name: true },
        },
      },
      take: 10,
    });

    return students
      .map((student) => {
        const total = student.attendance.length;
        const present = student.attendance.filter((a) => a.status === 'PRESENT').length;
        const percentage = total > 0 ? Math.round((present / total) * 100 * 10) / 10 : 0;
        return {
          id: student.id,
          name: student.user.fullName,
          email: student.user.email,
          department: student.department.name,
          percentage,
        };
      })
      .filter((s) => s.percentage < 75)
      .sort((a, b) => a.percentage - b.percentage);
  }

  private async getAttendanceTrend(institutionId: string, days: number) {
    const trend = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const present = await prisma.attendance.count({
        where: {
          student: { institutionId },
          date,
          status: 'PRESENT',
        },
      });

      const total = await prisma.student.count({
        where: { institutionId, isActive: true },
      });

      trend.push({
        date: date.toISOString().split('T')[0],
        percentage: total > 0 ? Math.round((present / total) * 100 * 10) / 10 : 0,
      });
    }

    return trend;
  }

  private async getAdmissionPipeline(institutionId: string) {
    const [applied, underReview, approved, rejected, enrolled] = await Promise.all([
      prisma.admission.count({ where: { institutionId, status: 'APPLIED' } }),
      prisma.admission.count({ where: { institutionId, status: 'UNDER_REVIEW' } }),
      prisma.admission.count({ where: { institutionId, status: 'APPROVED' } }),
      prisma.admission.count({ where: { institutionId, status: 'REJECTED' } }),
      prisma.admission.count({ where: { institutionId, status: 'ENROLLED' } }),
    ]);

    return { applied, underReview, approved, rejected, enrolled };
  }

  private async getAdmissionMonthlyTrend(institutionId: string) {
    const months = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const count = await prisma.admission.count({
        where: {
          institutionId,
          appliedAt: { gte: date, lte: monthEnd },
        },
      });

      months.push({
        month: date.toLocaleString('default', { month: 'short' }),
        year: date.getFullYear(),
        count,
      });
    }

    return months;
  }

  private async getAdmissionConversionRate(institutionId: string) {
    const [total, enrolled] = await Promise.all([
      prisma.admission.count({ where: { institutionId } }),
      prisma.admission.count({ where: { institutionId, status: 'ENROLLED' } }),
    ]);

    return total > 0 ? Math.round((enrolled / total) * 100) : 0;
  }

  private async getDepartmentRankings(institutionId: string) {
    const departments = await prisma.department.findMany({
      where: { institutionId, isActive: true },
      include: {
        _count: { select: { students: true } },
      },
    });

    return departments.map((dept) => ({
      id: dept.id,
      name: dept.name,
      students: dept._count.students,
    }));
  }

  private async getExamStats(institutionId: string) {
    const examinations = await prisma.examination.findMany({
      where: { institutionId },
      include: {
        results: {
          select: { isPassed: true, marksObtained: true },
        },
      },
    });

    let totalResults = 0;
    let passed = 0;
    let totalMarks = 0;

    examinations.forEach((exam) => {
      exam.results.forEach((result) => {
        totalResults++;
        if (result.isPassed) passed++;
        if (result.marksObtained) totalMarks += Number(result.marksObtained);
      });
    });

    return {
      totalExams: examinations.length,
      totalResults,
      passPercentage: totalResults > 0 ? Math.round((passed / totalResults) * 100) : 0,
      averageMarks: totalResults > 0 ? Math.round(totalMarks / totalResults) : 0,
    };
  }

  private async getSubjectPerformance(institutionId: string) {
    return prisma.subject.findMany({
      where: { institutionId },
      select: {
        id: true,
        name: true,
        code: true,
      },
      take: 10,
    });
  }

  private async getEmployeeStats(institutionId: string) {
    const [total, byDepartment] = await Promise.all([
      prisma.employee.count({ where: { institutionId, isActive: true } }),
      prisma.employee.groupBy({
        by: ['department'],
        where: { institutionId, isActive: true },
        _count: { department: true },
      }),
    ]);

    return {
      total,
      byDepartment: byDepartment.reduce((acc, item) => {
        acc[item.department] = item._count.department;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  private async getLeaveStats(institutionId: string) {
    const [pending, approved, rejected] = await Promise.all([
      prisma.leave.count({ where: { employee: { institutionId }, status: 'pending' } }),
      prisma.leave.count({ where: { employee: { institutionId }, status: 'approved' } }),
      prisma.leave.count({ where: { employee: { institutionId }, status: 'rejected' } }),
    ]);

    return { pending, approved, rejected };
  }

  private async getDepartmentWiseEmployees(institutionId: string) {
    return prisma.employee.groupBy({
      by: ['department'],
      where: { institutionId, isActive: true },
      _count: { department: true },
    });
  }

  private async getHostelOccupancy(institutionId: string) {
    const hostels = await prisma.hostel.findMany({
      where: { institutionId },
      include: {
        rooms: {
          select: { capacity: true, occupied: true },
        },
      },
    });

    let totalCapacity = 0;
    let totalOccupied = 0;

    hostels.forEach((hostel) => {
      hostel.rooms.forEach((room) => {
        totalCapacity += room.capacity;
        totalOccupied += room.occupied;
      });
    });

    return {
      totalCapacity,
      totalOccupied,
      vacant: totalCapacity - totalOccupied,
      occupancyPercentage: totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0,
    };
  }

  private async getHostelFeeCollection(institutionId: string) {
    const result = await prisma.feePayment.aggregate({
      where: {
        student: { institutionId, isHostelStudent: true },
        status: 'PAID',
      },
      _sum: { paidAmount: true },
    });
    return Number(result._sum.paidAmount) || 0;
  }

  private async getHostelMaintenanceRequests(institutionId: string) {
    return prisma.helpdeskTicket.count({
      where: {
        institutionId,
        category: 'hostel',
        status: { in: ['OPEN', 'IN_PROGRESS'] },
      },
    });
  }

  private async getAverageResolutionTime(institutionId: string) {
    const tickets = await prisma.helpdeskTicket.findMany({
      where: {
        institutionId,
        status: 'RESOLVED',
        resolvedAt: { not: null },
      },
      select: {
        createdAt: true,
        resolvedAt: true,
      },
      take: 100,
    });

    if (tickets.length === 0) return 0;

    const totalHours = tickets.reduce((sum, ticket) => {
      const hours = (ticket.resolvedAt!.getTime() - ticket.createdAt.getTime()) / (1000 * 60 * 60);
      return sum + hours;
    }, 0);

    return Math.round(totalHours / tickets.length * 10) / 10;
  }

  private async getStudentAttendanceScore(institutionId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const percentage = await this.getTodayAttendancePercentage(institutionId, today);
    return { name: 'Student Attendance', score: Math.min(percentage, 100) };
  }

  private async getFeeCollectionScore(institutionId: string) {
    const rate = await this.getFeeCollectionRate(institutionId);
    return { name: 'Fee Collection', score: rate };
  }

  private async getAcademicPerformanceScore(institutionId: string) {
    const stats = await this.getExamStats(institutionId);
    return { name: 'Academic Performance', score: stats.passPercentage };
  }

  private async getHelpdeskResolutionScore(institutionId: string) {
    const avgTime = await this.getAverageResolutionTime(institutionId);
    // Score based on resolution time (lower is better)
    // 24 hours = 100 score, 48 hours = 50 score, 72+ hours = 0 score
    const score = Math.max(0, Math.min(100, 100 - ((avgTime - 24) / 48) * 100));
    return { name: 'Helpdesk Resolution', score: Math.round(score) };
  }

  private async getFacultyAttendanceScore(institutionId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const stats = await this.getEmployeeAttendanceStats(institutionId, today);
    return { name: 'Faculty Attendance', score: Math.min(stats.percentage, 100) };
  }
}

export const dashboardService = new DashboardService();
