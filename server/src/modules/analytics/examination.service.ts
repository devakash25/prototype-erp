import { prisma } from '../../config/database';
import { logger } from '../../utils/logger';

class ExaminationAnalyticsService {
  async getStats(institutionId: string) {
    const now = new Date();
    const currentYear = now.getFullYear();

    const [exams, totalResults, passed, failed] = await Promise.all([
      prisma.examination.count({ where: { institutionId } }),
      prisma.examResult.count({ where: { examination: { institutionId } } }),
      prisma.examResult.count({ where: { examination: { institutionId }, isPassed: true } }),
      prisma.examResult.count({ where: { examination: { institutionId }, isPassed: false } }),
    ]);

    const avgMarks = await prisma.examResult.aggregate({
      where: { examination: { institutionId }, marksObtained: { not: null } },
      _avg: { marksObtained: true },
    });

    return {
      totalExams: exams,
      totalResults,
      passPercentage: totalResults > 0 ? Math.round((passed / totalResults) * 100 * 10) / 10 : 0,
      averageMarks: Number(avgMarks._avg.marksObtained) || 0,
      topPerformers: await prisma.examResult.groupBy({
        by: ['studentId'],
        where: { examination: { institutionId }, isPassed: true },
        _count: { studentId: true },
        orderBy: { _count: { studentId: 'desc' } },
        take: 1,
      }).then(r => r.length > 0 ? r[0]._count.studentId : 0),
      failedStudents: failed,
    };
  }

  async getSubjectPerformance(institutionId: string) {
    const subjects = await prisma.subject.findMany({
      where: { institutionId },
      include: {
        examResults: {
          select: { marksObtained: true, isPassed: true },
        },
      },
    });

    return subjects.map((subject) => {
      const results = subject.examResults;
      const total = results.length;
      const avg = total > 0
        ? Math.round(results.reduce((sum, r) => sum + Number(r.marksObtained || 0), 0) / total * 10) / 10
        : 0;
      const passed = results.filter((r) => r.isPassed).length;
      const pass = total > 0 ? Math.round((passed / total) * 100) : 0;

      return {
        id: subject.id,
        name: subject.name,
        code: subject.code,
        avg,
        pass,
        total,
      };
    });
  }

  async getSemesterComparison(institutionId: string) {
    const sessions = await prisma.academicSession.findMany({
      where: { institutionId },
      orderBy: { startDate: 'asc' },
      include: {
        examinations: {
          include: {
            results: { select: { marksObtained: true, isPassed: true } },
          },
        },
      },
    });

    return sessions.map((session, index) => {
      const allResults = session.examinations.flatMap((e) => e.results);
      const total = allResults.length;
      const avg = total > 0
        ? Math.round(allResults.reduce((sum, r) => sum + Number(r.marksObtained || 0), 0) / total * 10) / 10
        : 0;
      const passed = allResults.filter((r) => r.isPassed).length;
      const pass = total > 0 ? Math.round((passed / total) * 100) : 0;

      return { semester: `Sem ${index + 1}`, avg, pass };
    });
  }

  async getGradeDistribution(institutionId: string) {
    const results = await prisma.examResult.findMany({
      where: { examination: { institutionId }, marksObtained: { not: null } },
      select: { marksObtained: true },
    });

    const grades = [
      { grade: 'A+', min: 90, max: 101, color: '#10b981' },
      { grade: 'A', min: 80, max: 90, color: '#6366f1' },
      { grade: 'B+', min: 70, max: 80, color: '#8b5cf6' },
      { grade: 'B', min: 60, max: 70, color: '#f59e0b' },
      { grade: 'C', min: 50, max: 60, color: '#f97316' },
      { grade: 'F', min: 0, max: 50, color: '#ef4444' },
    ];

    return grades.map((g) => ({
      grade: g.grade,
      count: results.filter((r) => {
        const marks = Number(r.marksObtained);
        return marks >= g.min && marks < g.max;
      }).length,
      color: g.color,
    }));
  }

  async getDepartmentRankings(institutionId: string) {
    const departments = await prisma.department.findMany({
      where: { institutionId, isActive: true },
      include: {
        students: {
          include: {
            examResults: {
              select: { marksObtained: true, isPassed: true },
            },
          },
        },
      },
    });

    const rankings = departments.map((dept) => {
      const allResults = dept.students.flatMap((s) => s.examResults);
      const total = allResults.length;
      const avg = total > 0
        ? Math.round(allResults.reduce((sum, r) => sum + Number(r.marksObtained || 0), 0) / total * 10) / 10
        : 0;
      const passed = allResults.filter((r) => r.isPassed).length;
      const pass = total > 0 ? Math.round((passed / total) * 100) : 0;

      return { id: dept.id, name: dept.name, avg, pass, trend: 'up' as const };
    });

    return rankings.sort((a, b) => b.avg - a.avg).map((r, i) => ({ ...r, rank: i + 1 }));
  }

  async getTopPerformers(institutionId: string, limit = 10) {
    const students = await prisma.student.findMany({
      where: { institutionId, isActive: true },
      include: {
        user: { select: { fullName: true } },
        department: { select: { name: true } },
        examResults: {
          select: { marksObtained: true },
        },
      },
      take: 100,
    });

    const performers = students
      .map((s) => {
        const results = s.examResults;
        const total = results.length;
        const avg = total > 0
          ? results.reduce((sum, r) => sum + Number(r.marksObtained || 0), 0) / total
          : 0;
        return {
          id: s.id,
          name: s.user.fullName,
          dept: s.department.name,
          cgpa: Math.round(avg / 10 * 10) / 10,
        };
      })
      .sort((a, b) => b.cgpa - a.cgpa)
      .slice(0, limit)
      .map((s, i) => ({ ...s, rank: i + 1 }));

    return performers;
  }
}

export const examinationAnalyticsService = new ExaminationAnalyticsService();
