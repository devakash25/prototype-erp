import { prisma } from '../../config/database';
import { logger } from '../../utils/logger';

export class ReportsService {
  async generateReport(institutionId: string, slug: string, params: any = {}) {
    const { from, to, departmentId } = params;

    switch (slug) {
      case 'student-enrollment': return this.studentEnrollment(institutionId, { from, to, departmentId });
      case 'faculty-performance': return this.facultyPerformance(institutionId, { from, to });
      case 'financial-summary': return this.financialSummary(institutionId, { from, to });
      case 'attendance-overview': return this.attendanceOverview(institutionId, { from, to, departmentId });
      case 'exam-results': return this.examResults(institutionId, { from, to, departmentId });
      default: throw new Error(`Unknown report: ${slug}`);
    }
  }

  private async studentEnrollment(institutionId: string, filters: any) {
    const where: any = { institutionId };
    if (filters.departmentId) where.departmentId = filters.departmentId;

    const total = await prisma.student.count({ where });
    const departments = await prisma.student.groupBy({ by: ['departmentId'], where, _count: true });
    const sessions = await prisma.student.groupBy({ by: ['academicSessionId'], where, _count: true });

    return {
      title: 'Student Enrollment Report',
      total,
      byDepartment: departments.map(d => ({ departmentId: d.departmentId, count: d._count })),
      bySession: sessions.map(s => ({ sessionId: s.academicSessionId, count: s._count })),
      generatedAt: new Date(),
    };
  }

  private async facultyPerformance(institutionId: string, filters: any) {
    const faculty = await prisma.user.findMany({
      where: { institutionId, role: { in: ['TEACHER', 'HOD'] } },
      select: { id: true, fullName: true, email: true },
    });

    return {
      title: 'Faculty Performance Report',
      totalFaculty: faculty.length,
      faculty: faculty.slice(0, 20),
      generatedAt: new Date(),
    };
  }

  private async financialSummary(institutionId: string, filters: any) {
    const where: any = { student: { institutionId } };
    if (filters.from) where.paidAt = { gte: new Date(filters.from) };
    if (filters.to) where.paidAt = { ...where.paidAt, lte: new Date(filters.to) };

    const [totalCollected, totalPending] = await Promise.all([
      prisma.feePayment.aggregate({ where: { ...where, status: 'PAID' }, _sum: { paidAmount: true } }),
      prisma.feePayment.aggregate({ where: { ...where, status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] } }, _sum: { dueAmount: true } }),
    ]);

    return {
      title: 'Financial Summary Report',
      totalCollected: totalCollected._sum.paidAmount || 0,
      totalPending: totalPending._sum.dueAmount || 0,
      generatedAt: new Date(),
    };
  }

  private async attendanceOverview(institutionId: string, filters: any) {
    const where: any = { student: { institutionId } };
    if (filters.from) where.date = { gte: new Date(filters.from) };
    if (filters.to) where.date = { ...(where.date || {}), lte: new Date(filters.to) };

    const [present, absent] = await Promise.all([
      prisma.attendance.count({ where: { ...where, status: 'PRESENT' } }),
      prisma.attendance.count({ where: { ...where, status: 'ABSENT' } }),
    ]);

    return {
      title: 'Attendance Overview Report',
      present,
      absent,
      rate: present + absent > 0 ? ((present / (present + absent)) * 100).toFixed(1) : '0',
      generatedAt: new Date(),
    };
  }

  private async examResults(institutionId: string, filters: any) {
    const where: any = { student: { institutionId } };

    const [total, passed, failed] = await Promise.all([
      prisma.examResult.count({ where }),
      prisma.examResult.count({ where: { ...where, grade: { not: 'F' } } }),
      prisma.examResult.count({ where: { ...where, grade: 'F' } }),
    ]);

    return {
      title: 'Exam Results Report',
      total,
      passed,
      failed,
      passRate: total > 0 ? ((passed / total) * 100).toFixed(1) : '0',
      generatedAt: new Date(),
    };
  }
}

export const reportsService = new ReportsService();
