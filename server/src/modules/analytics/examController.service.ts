import { prisma } from '../../config/database';

class ExamControllerService {
  async getDashboard(userId: string, institutionId: string) {
    const now = new Date();

    const [totalExams, upcomingExams, pendingResults, publishedResults, avgResult] = await Promise.all([
      prisma.examination.count({ where: { institutionId, isActive: true } }),
      prisma.examination.count({ where: { institutionId, startDate: { gt: now }, isActive: true } }),
      prisma.examResult.count({ where: { examination: { institutionId }, marksObtained: null } }),
      prisma.examResult.count({ where: { examination: { institutionId }, marksObtained: { not: null } } }),
      prisma.examResult.aggregate({
        where: { examination: { institutionId }, marksObtained: { not: null } },
        _avg: { marksObtained: true },
      }),
    ]);

    return {
      totalExams,
      upcomingExams,
      pendingResults,
      publishedResults,
      averageScore: Number(avgResult._avg.marksObtained) || 0,
    };
  }

  async getExams(userId: string, institutionId: string) {
    return prisma.examination.findMany({
      where: { institutionId, isActive: true },
      include: {
        subjects: {
          include: {
            subject: { select: { id: true, name: true, code: true } },
          },
        },
        _count: { select: { results: true } },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async createExam(userId: string, institutionId: string, data: {
    name: string;
    type: string;
    departmentId: string;
    academicSessionId: string;
    startDate: string;
    endDate: string;
    maxMarks?: number;
    passingMarks?: number;
    subjects?: Array<{
      subjectId: string;
      examDate: string;
      maxMarks: number;
      passingMarks: number;
      startTime?: string;
      endTime?: string;
      room?: string;
    }>;
  }) {
    return prisma.examination.create({
      data: {
        institutionId,
        name: data.name,
        type: data.type as any,
        departmentId: data.departmentId,
        academicSessionId: data.academicSessionId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        maxMarks: data.maxMarks ?? 100,
        passingMarks: data.passingMarks ?? 33,
        subjects: data.subjects
          ? {
              create: data.subjects.map((s) => ({
                subjectId: s.subjectId,
                examDate: new Date(s.examDate),
                maxMarks: s.maxMarks,
                passingMarks: s.passingMarks,
                startTime: s.startTime ? new Date(s.startTime) : null,
                endTime: s.endTime ? new Date(s.endTime) : null,
                room: s.room ?? null,
              })),
            }
          : undefined,
      },
      include: {
        subjects: {
          include: {
            subject: { select: { id: true, name: true, code: true } },
          },
        },
      },
    });
  }

  async getExamResults(userId: string, institutionId: string, examId?: string) {
    const where: any = { examination: { institutionId } };
    if (examId) where.examinationId = examId;

    const results = await prisma.examResult.findMany({
      where,
      include: {
        examination: { select: { id: true, name: true, type: true, maxMarks: true } },
        student: {
          include: {
            user: { select: { fullName: true } },
          },
        },
        subject: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const grouped: Record<string, any[]> = {};
    for (const r of results) {
      const key = r.examinationId;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push({
        id: r.id,
        studentName: r.student.user.fullName,
        studentId: r.studentId,
        subject: r.subject.name,
        subjectCode: r.subject.code,
        marksObtained: r.marksObtained,
        grade: r.grade,
        gradePoints: r.gradePoints,
        isPassed: r.isPassed,
        remarks: r.remarks,
        examName: r.examination.name,
        maxMarks: r.examination.maxMarks,
      });
    }

    return Object.entries(grouped).map(([examId, results]) => ({
      examId,
      examName: results[0]?.examName,
      examType: results[0]?.examination?.type,
      results,
    }));
  }

  async publishResults(userId: string, institutionId: string, examId: string) {
    const exam = await prisma.examination.findFirst({
      where: { id: examId, institutionId },
    });
    if (!exam) throw new Error('Examination not found');

    await prisma.examination.update({
      where: { id: examId },
      data: { resultDate: new Date() },
    });

    return { examId, publishedAt: new Date(), message: 'Results published successfully' };
  }

  async getSeatingPlan(userId: string, institutionId: string, examId?: string) {
    return [];
  }

  async getMeritList(userId: string, institutionId: string) {
    const results = await prisma.examResult.findMany({
      where: { examination: { institutionId }, marksObtained: { not: null } },
      include: {
        student: {
          include: {
            user: { select: { fullName: true } },
            department: { select: { name: true } },
          },
        },
        examination: { select: { id: true, name: true } },
      },
    });

    const studentMap: Record<string, {
      studentId: string;
      name: string;
      department: string;
      totalMarks: number;
      examCount: number;
      exams: { examId: string; examName: string; marks: number }[];
    }> = {};

    for (const r of results) {
      const sid = r.studentId;
      if (!studentMap[sid]) {
        studentMap[sid] = {
          studentId: sid,
          name: r.student.user.fullName,
          department: r.student.department?.name || 'N/A',
          totalMarks: 0,
          examCount: 0,
          exams: [],
        };
      }
      const marks = Number(r.marksObtained) || 0;
      studentMap[sid].totalMarks += marks;
      studentMap[sid].examCount += 1;
      studentMap[sid].exams.push({
        examId: r.examination.id,
        examName: r.examination.name,
        marks,
      });
    }

    const meritList = Object.values(studentMap)
      .map((s) => ({
        ...s,
        averageMarks: s.examCount > 0 ? Math.round((s.totalMarks / s.examCount) * 10) / 10 : 0,
      }))
      .sort((a, b) => b.totalMarks - a.totalMarks)
      .map((s, i) => ({ ...s, rank: i + 1 }));

    return meritList;
  }

  async calculateGrades(userId: string, institutionId: string, examId: string) {
    const results = await prisma.examResult.findMany({
      where: { examinationId: examId, examination: { institutionId } },
      include: {
        examination: { select: { maxMarks: true } },
      },
    });

    const gradeScale = [
      { grade: 'A+', min: 91, max: 100, points: 10 },
      { grade: 'A', min: 81, max: 90, points: 9 },
      { grade: 'B+', min: 71, max: 80, points: 8 },
      { grade: 'B', min: 61, max: 70, points: 7 },
      { grade: 'C+', min: 51, max: 60, points: 6 },
      { grade: 'C', min: 41, max: 50, points: 5 },
      { grade: 'D', min: 33, max: 40, points: 4 },
      { grade: 'F', min: 0, max: 32, points: 0 },
    ];

    const updates: Promise<any>[] = [];

    for (const result of results) {
      if (result.marksObtained === null) continue;

      const maxMarks = result.examination.maxMarks || 100;
      const percentage = (Number(result.marksObtained) / maxMarks) * 100;

      const matched = gradeScale.find((g) => percentage >= g.min && percentage <= g.max) || gradeScale[7];
      const isPassed = matched.grade !== 'F';

      updates.push(
        prisma.examResult.update({
          where: { id: result.id },
          data: {
            grade: matched.grade,
            gradePoints: matched.points,
            isPassed,
          },
        })
      );
    }

    await Promise.all(updates);

    return { examId, updatedResults: updates.length, message: 'Grades calculated successfully' };
  }
}

export const examControllerService = new ExamControllerService();
