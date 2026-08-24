import { prisma } from '../../config/database';

class DirectorAnalyticsService {
  async getKPIs(institutionId: string) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalStudents, totalFaculty, totalDepartments,
      todayAttendance, pendingApprovals, openTickets,
      totalAdmissions, pendingAdmissions,
      totalCourses, examStats,
    ] = await Promise.all([
      prisma.student.count({ where: { institutionId, isActive: true } }),
      prisma.employee.count({ where: { institutionId, isActive: true } }),
      prisma.department.count({ where: { institutionId, isActive: true } }),
      this.getAttendanceRate(institutionId, now),
      prisma.workflow.count({ where: { institutionId, status: 'PENDING' } }),
      prisma.helpdeskTicket.count({ where: { institutionId, status: 'OPEN' } }),
      prisma.admission.count({ where: { institutionId } }),
      prisma.admission.count({ where: { institutionId, status: 'APPLIED' } }),
      prisma.course.count({ where: { institutionId, isActive: true } }),
      this.getExamStats(institutionId),
    ]);

    const lastMonthStudents = await prisma.student.count({
      where: { institutionId, isActive: true, enrollmentDate: { lt: monthStart } },
    });
    const studentGrowth = lastMonthStudents > 0 ? Math.round(((totalStudents - lastMonthStudents) / lastMonthStudents) * 100) : 0;

    const academicHealthScore = await this.calculateAcademicHealthScore(institutionId);

    return {
      totalStudents, totalFaculty, totalDepartments,
      todayAttendance, pendingApprovals, openTickets,
      totalAdmissions, pendingAdmissions, totalCourses,
      studentGrowth, academicHealthScore,
      examCompletionRate: examStats.completionRate,
      passRate: examStats.passRate,
    };
  }

  async getDepartmentPerformance(institutionId: string) {
    const departments = await prisma.department.findMany({
      where: { institutionId, isActive: true },
      include: {
        _count: { select: { students: true, employees: true } },
      },
    });

    const results = [];
    for (const dept of departments) {
      const students = await prisma.student.findMany({
        where: { departmentId: dept.id, isActive: true },
        select: { id: true },
      });
      const studentIds = students.map(s => s.id);

      const [attendanceRate, avgMarks, examCount] = await Promise.all([
        this.getDeptAttendanceRate(institutionId, dept.id),
        studentIds.length > 0 ? this.getDeptAvgMarks(studentIds) : 0,
        prisma.examination.count({ where: { departmentId: dept.id } }),
      ]);

      const performance = Math.round((attendanceRate * 0.3) + (avgMarks * 0.4) + (Math.min(examCount * 10, 100) * 0.3));

      results.push({
        id: dept.id,
        name: dept.name,
        code: dept.code,
        students: dept._count.students,
        faculty: dept._count.employees,
        attendanceRate,
        avgMarks,
        exams: examCount,
        performance: Math.min(performance, 100),
      });
    }

    return results.sort((a, b) => b.performance - a.performance);
  }

  async getFacultyAnalytics(institutionId: string) {
    const employees = await prisma.employee.findMany({
      where: { institutionId, isActive: true, department: 'ACADEMIC' },
      include: {
        user: { select: { fullName: true, avatar: true } },
        subjectAllocations: { select: { id: true } },
        timetables: { select: { id: true } },
        leaves: { where: { status: 'PENDING' }, select: { id: true } },
        performanceReviews: { select: { rating: true } },
      },
    });

    const totalFaculty = employees.length;
    const pendingLeaves = employees.reduce((sum, e) => sum + e.leaves.length, 0);

    const faculty = employees.map(emp => {
      const avgScore = emp.performanceReviews.length > 0
        ? Math.round(emp.performanceReviews.reduce((s: number, r: any) => s + (r.rating || 0), 0) / emp.performanceReviews.length)
        : 0;
      return {
        name: emp.user.fullName,
        designation: emp.designation,
        department: emp.department,
        classesPerWeek: emp.timetables.length,
        subjects: emp.subjectAllocations.length,
        pendingLeaves: emp.leaves.length,
        performanceScore: avgScore,
      };
    });

    const topPerformers = [...faculty].sort((a, b) => b.performanceScore - a.performanceScore).slice(0, 5);
    const needsImprovement = faculty.filter(f => f.performanceScore > 0 && f.performanceScore < 50).slice(0, 5);

    return { totalFaculty, pendingLeaves, faculty, topPerformers, needsImprovement };
  }

  async getStudentAnalytics(institutionId: string) {
    const [total, allStudents, lowAttendance, hostelStudents, transportStudents] = await Promise.all([
      prisma.student.count({ where: { institutionId, isActive: true } }),
      prisma.student.findMany({
        where: { institutionId, isActive: true },
        select: { departmentId: true, user: { select: { gender: true } } },
      }),
      this.getLowAttendanceStudents(institutionId),
      prisma.student.count({ where: { institutionId, isActive: true, isHostelStudent: true } }),
      prisma.student.count({ where: { institutionId, isActive: true, usesTransport: true } }),
    ]);

    const departments = await prisma.department.findMany({
      where: { institutionId, isActive: true },
      select: { id: true, name: true },
    });
    const deptMap = Object.fromEntries(departments.map(d => [d.id, d.name]));

    const genderCounts: Record<string, number> = {};
    const deptCounts: Record<string, number> = {};
    for (const s of allStudents) {
      const g = s.user?.gender || 'UNKNOWN';
      genderCounts[g] = (genderCounts[g] || 0) + 1;
      const deptName = deptMap[s.departmentId] || 'Unknown';
      deptCounts[deptName] = (deptCounts[deptName] || 0) + 1;
    }

    const byDepartment = Object.entries(deptCounts).map(([department, count]) => ({ department, count }));

    return { total, gender: genderCounts, byDepartment, lowAttendance, hostelStudents, transportStudents };
  }

  async getAdmissionAnalytics(institutionId: string) {
    const [pipeline, monthlyTrend, conversionRate] = await Promise.all([
      prisma.admission.groupBy({
        by: ['status'],
        where: { institutionId },
        _count: true,
      }),
      this.getAdmissionMonthlyTrend(institutionId),
      this.getConversionRate(institutionId),
    ]);

    const byStatus = Object.fromEntries(pipeline.map(p => [p.status, p._count]));

    return {
      pipeline: byStatus,
      monthlyTrend,
      conversionRate,
      total: Object.values(byStatus).reduce((a: number, b: any) => a + b, 0),
    };
  }

  async getExamAnalytics(institutionId: string) {
    const [total, completed, pending, results] = await Promise.all([
      prisma.examination.count({ where: { institutionId } }),
      prisma.examination.count({ where: { institutionId, endDate: { lt: new Date() } } }),
      prisma.examination.count({ where: { institutionId, endDate: { gte: new Date() } } }),
      prisma.examResult.aggregate({
        where: { examination: { institutionId } },
        _avg: { marksObtained: true },
      }),
    ]);

    const totalResults = await prisma.examResult.count({ where: { examination: { institutionId } } });
    const passedResults = await prisma.examResult.count({ where: { examination: { institutionId }, isPassed: true } });

    return {
      total, completed, pending,
      avgMarks: Number(results._avg.marksObtained) || 0,
      passRate: totalResults > 0 ? Math.round((passedResults / totalResults) * 100) : 0,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }

  async getFinanceSummary(institutionId: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todayRevenue, monthRevenue, outstanding, feeCollectionRate] = await Promise.all([
      prisma.feePayment.aggregate({
        where: { student: { institutionId }, paidAt: { gte: today }, status: 'PAID' },
        _sum: { paidAmount: true },
      }),
      prisma.feePayment.aggregate({
        where: { student: { institutionId }, paidAt: { gte: monthStart }, status: 'PAID' },
        _sum: { paidAmount: true },
      }),
      prisma.feePayment.aggregate({
        where: { student: { institutionId }, status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] } },
        _sum: { dueAmount: true },
      }),
      this.getFeeCollectionRate(institutionId),
    ]);

    return {
      todayRevenue: Number(todayRevenue._sum.paidAmount) || 0,
      monthRevenue: Number(monthRevenue._sum.paidAmount) || 0,
      outstanding: Number(outstanding._sum.dueAmount) || 0,
      feeCollectionRate,
    };
  }

  async getHRSummary(institutionId: string) {
    const [teaching, nonTeaching, pendingLeaves, activeEmployees] = await Promise.all([
      prisma.employee.count({ where: { institutionId, isActive: true, department: 'ACADEMIC' } }),
      prisma.employee.count({ where: { institutionId, isActive: true, department: { not: 'ACADEMIC' } } }),
      prisma.leave.count({ where: { employee: { institutionId }, status: 'PENDING' } }),
      prisma.employee.count({ where: { institutionId, isActive: true } }),
    ]);

    return { teaching, nonTeaching, pendingLeaves, activeEmployees };
  }

  async getCampusSummary(institutionId: string) {
    const [hostelOccupancy, libraryBooks, libraryIssued, transportStudents, vehicles] = await Promise.all([
      prisma.hostelRoom.aggregate({ where: { hostel: { institutionId } }, _sum: { capacity: true, occupied: true } }),
      prisma.libraryBook.aggregate({ where: { institutionId }, _sum: { totalCopies: true } }),
      prisma.libraryIssue.count({ where: { book: { institutionId }, status: 'issued' } }),
      prisma.student.count({ where: { institutionId, usesTransport: true, isActive: true } }),
      prisma.vehicle.count({ where: { institutionId, isActive: true } }),
    ]);

    const totalCapacity = Number(hostelOccupancy._sum.capacity) || 0;
    const totalOccupied = Number(hostelOccupancy._sum.occupied) || 0;

    return {
      hostel: { total: totalCapacity, occupied: totalOccupied, rate: totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0 },
      library: { total: Number(libraryBooks._sum.totalCopies) || 0, issued: libraryIssued },
      transport: { students: transportStudents, vehicles },
    };
  }

  async getWorkflowSummary(institutionId: string) {
    const byType = await prisma.workflow.groupBy({
      by: ['type', 'status'],
      where: { institutionId },
      _count: true,
    });

    const pending = byType.filter(w => w.status === 'PENDING');
    const approved = byType.filter(w => w.status === 'APPROVED');
    const rejected = byType.filter(w => w.status === 'REJECTED');

    return {
      pending: pending.reduce((s, w) => s + w._count, 0),
      approved: approved.reduce((s, w) => s + w._count, 0),
      rejected: rejected.reduce((s, w) => s + w._count, 0),
      byType: pending.map(w => ({ type: w.type, count: w._count })),
    };
  }

  async getRecentActivity(institutionId: string, limit = 15) {
    const activities = await prisma.auditLog.findMany({
      where: { institutionId },
      include: { user: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return activities.map(a => ({
      id: a.id,
      action: `${a.action} on ${a.entity}`,
      entity: a.entity,
      user: a.user,
      createdAt: a.createdAt.toISOString(),
    }));
  }

  private async getAttendanceRate(institutionId: string, date: Date) {
    const total = await prisma.student.count({ where: { institutionId, isActive: true } });
    if (total === 0) return 0;
    const present = await prisma.attendance.count({
      where: { student: { institutionId }, date, status: 'PRESENT' },
    });
    return Math.round((present / total) * 100);
  }

  private async getDeptAttendanceRate(institutionId: string, departmentId: string) {
    const total = await prisma.student.count({ where: { institutionId, departmentId, isActive: true } });
    if (total === 0) return 0;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const present = await prisma.attendance.count({
      where: { student: { institutionId, departmentId }, date: { gte: weekAgo }, status: 'PRESENT' },
    });
    return Math.round((present / (total * 7)) * 100);
  }

  private async getDeptAvgMarks(studentIds: string[]) {
    const results = await prisma.examResult.aggregate({
      where: { studentId: { in: studentIds }, marksObtained: { not: null } },
      _avg: { marksObtained: true },
    });
    return Number(results._avg.marksObtained) || 0;
  }

  private async getExamStats(institutionId: string) {
    const total = await prisma.examination.count({ where: { institutionId } });
    const completed = await prisma.examination.count({ where: { institutionId, endDate: { lt: new Date() } } });
    const totalResults = await prisma.examResult.count({ where: { examination: { institutionId } } });
    const passed = await prisma.examResult.count({ where: { examination: { institutionId }, isPassed: true } });

    return {
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      passRate: totalResults > 0 ? Math.round((passed / totalResults) * 100) : 0,
    };
  }

  private async getLowAttendanceStudents(institutionId: string) {
    const students = await prisma.student.findMany({
      where: { institutionId, isActive: true },
      select: { id: true, admissionNumber: true, user: { select: { fullName: true } } },
      take: 50,
    });

    const low = [];
    for (const student of students) {
      const total = await prisma.attendance.count({
        where: { studentId: student.id, date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      });
      if (total === 0) continue;
      const present = await prisma.attendance.count({
        where: { studentId: student.id, date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, status: 'PRESENT' },
      });
      const rate = Math.round((present / total) * 100);
      if (rate < 75) {
        low.push({ id: student.id, name: student.user.fullName, admissionNumber: student.admissionNumber, rate });
      }
    }

    return low.sort((a, b) => a.rate - b.rate).slice(0, 10);
  }

  private async getAdmissionMonthlyTrend(institutionId: string) {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      const count = await prisma.admission.count({
        where: { institutionId, appliedAt: { gte: date, lte: monthEnd } },
      });
      months.push({ month: date.toLocaleString('default', { month: 'short' }), count });
    }
    return months;
  }

  private async getConversionRate(institutionId: string) {
    const [total, enrolled] = await Promise.all([
      prisma.admission.count({ where: { institutionId } }),
      prisma.admission.count({ where: { institutionId, status: 'ENROLLED' } }),
    ]);
    return total > 0 ? Math.round((enrolled / total) * 100) : 0;
  }

  private async getFeeCollectionRate(institutionId: string) {
    const [total, collected] = await Promise.all([
      prisma.feePayment.aggregate({ where: { student: { institutionId } }, _sum: { amount: true } }),
      prisma.feePayment.aggregate({ where: { student: { institutionId }, status: 'PAID' }, _sum: { paidAmount: true } }),
    ]);
    const t = Number(total._sum.amount) || 0;
    const c = Number(collected._sum.paidAmount) || 0;
    return t > 0 ? Math.round((c / t) * 100) : 0;
  }

  private async calculateAcademicHealthScore(institutionId: string) {
    const [attendanceScore, feeScore, examScore] = await Promise.all([
      this.getAttendanceRate(institutionId, new Date()),
      this.getFeeCollectionRate(institutionId),
      this.getExamStats(institutionId),
    ]);

    return Math.round((attendanceScore * 0.35) + (feeScore * 0.30) + (examScore.passRate * 0.35));
  }
}

export const directorAnalyticsService = new DirectorAnalyticsService();
