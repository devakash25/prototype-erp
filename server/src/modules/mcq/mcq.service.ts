import { prisma } from '../../config/database';
import { NotFoundError, ForbiddenError, ConflictError } from '../../utils/errors';

class McqService {
  // ===================== TEACHER =====================

  async createTest(userId: string, data: any) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true, institutionId: true } });
    if (!user) throw new NotFoundError('User not found');
    if (!user.institutionId) throw new NotFoundError('Institution not found');

    const emp = await prisma.employee.findFirst({ where: { userId, isActive: true }, select: { id: true } });
    if (!emp) throw new ForbiddenError('Employee profile not found');

    const totalMarks = data.questions.reduce((sum: number, q: any) => sum + (q.marks || 1), 0);

    const test = await prisma.$transaction(async (tx) => {
      const t = await tx.mcqTest.create({
        data: {
          institutionId: user.institutionId!,
          classId: data.classId,
          subjectId: data.subjectId,
          teacherId: emp.id,
          title: data.title,
          chapter: data.chapter,
          instructions: data.instructions,
          duration: data.duration,
          totalQuestions: data.questions.length,
          totalMarks,
          startTime: new Date(data.startTime),
          endTime: new Date(data.endTime),
          allowReattempt: data.allowReattempt,
          randomizeQuestions: data.randomizeQuestions,
          randomizeOptions: data.randomizeOptions,
        },
      });

      await tx.mcqQuestion.createMany({
        data: data.questions.map((q: any, i: number) => ({
          testId: t.id,
          question: q.question,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctAnswer: q.correctAnswer,
          marks: q.marks || 1,
          sortOrder: i + 1,
        })),
      });

      return t;
    });

    return test;
  }

  async publishTest(userId: string, testId: string) {
    const test = await this.getTestAsTeacher(userId, testId);
    if (test.status === 'PUBLISHED') throw new ConflictError('Test already published');
    if (test.status === 'ARCHIVED') throw new ConflictError('Cannot publish archived test');
    return prisma.mcqTest.update({ where: { id: testId }, data: { status: 'PUBLISHED' } });
  }

  async archiveTest(userId: string, testId: string) {
    await this.getTestAsTeacher(userId, testId);
    return prisma.mcqTest.update({ where: { id: testId }, data: { status: 'ARCHIVED' } });
  }

  async deleteTest(userId: string, testId: string) {
    await this.getTestAsTeacher(userId, testId);
    await prisma.mcqAnswer.deleteMany({ where: { submission: { testId } } });
    await prisma.mcqSubmission.deleteMany({ where: { testId } });
    await prisma.mcqQuestion.deleteMany({ where: { testId } });
    await prisma.mcqTest.delete({ where: { id: testId } });
    return { deleted: true };
  }

  async getTestById(userId: string, testId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (!user) throw new NotFoundError('User not found');

    const test = await prisma.mcqTest.findUnique({
      where: { id: testId },
      include: {
        questions: { orderBy: { sortOrder: 'asc' } },
        course: { select: { name: true, code: true } },
        subject: { select: { name: true, code: true } },
        teacher: { include: { user: { select: { fullName: true } } } },
      },
    });
    if (!test) throw new NotFoundError('Test not found');
    return test;
  }

  async getTeacherTests(userId: string, status?: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, institutionId: true } });
    if (!user) throw new NotFoundError('User not found');

    const emp = await prisma.employee.findFirst({ where: { userId, isActive: true }, select: { id: true } });
    if (!emp) throw new ForbiddenError('Employee profile not found');

    const where: any = { teacherId: emp.id };
    if (status) where.status = status;

    return prisma.mcqTest.findMany({
      where,
      include: {
        course: { select: { name: true, code: true } },
        subject: { select: { name: true, code: true } },
        _count: { select: { submissions: true, questions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTestAnalytics(userId: string, testId: string) {
    const test = await this.getTestAsTeacher(userId, testId);

    const submissions = await prisma.mcqSubmission.findMany({
      where: { testId },
      include: {
        student: {
          include: { user: { select: { fullName: true } } },
        },
        answers: { include: { question: true } },
      },
      orderBy: { submittedAt: 'desc' },
    });

    const totalSubmissions = submissions.length;
    const avgScore = totalSubmissions > 0 ? submissions.reduce((sum, s) => sum + s.percentage, 0) / totalSubmissions : 0;
    const highestScore = totalSubmissions > 0 ? Math.max(...submissions.map((s) => s.percentage)) : 0;
    const lowestScore = totalSubmissions > 0 ? Math.min(...submissions.map((s) => s.percentage)) : 0;
    const avgTime = totalSubmissions > 0 ? submissions.filter((s) => s.timeTaken).reduce((sum, s) => sum + (s.timeTaken || 0), 0) / submissions.filter((s) => s.timeTaken).length : 0;

    // Per-question analytics
    const questions = await prisma.mcqQuestion.findMany({
      where: { testId },
      orderBy: { sortOrder: 'asc' },
    });

    const questionAnalytics = questions.map((q) => {
      const answers = submissions.flatMap((s) => s.answers.filter((a) => a.questionId === q.id));
      const totalAnswers = answers.length;
      const correctAnswers = answers.filter((a) => a.isCorrect).length;
      const optionCounts = { A: 0, B: 0, C: 0, D: 0 };
      answers.forEach((a) => { optionCounts[a.selectedOption as keyof typeof optionCounts]++; });

      return {
        questionId: q.id,
        question: q.question,
        correctAnswer: q.correctAnswer,
        totalAnswers,
        correctRate: totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0,
        optionCounts,
      };
    });

    return {
      test: {
        id: test.id,
        title: test.title,
        totalQuestions: test.totalQuestions,
        totalMarks: test.totalMarks,
        duration: test.duration,
        status: test.status,
      },
      summary: {
        totalSubmissions,
        avgScore: Math.round(avgScore * 10) / 10,
        highestScore: Math.round(highestScore * 10) / 10,
        lowestScore: Math.round(lowestScore * 10) / 10,
        avgTime: Math.round(avgTime),
        passRate: totalSubmissions > 0 ? Math.round((submissions.filter((s) => s.percentage >= 40).length / totalSubmissions) * 100) : 0,
      },
      questionAnalytics,
      submissions: submissions.map((s) => ({
        studentId: s.studentId,
        studentName: s.student.user.fullName,
        score: s.score,
        total: s.total,
        percentage: s.percentage,
        timeTaken: s.timeTaken,
        submittedAt: s.submittedAt,
      })),
    };
  }

  // ===================== STUDENT =====================

  async getAvailableTests(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true, institutionId: true } });
    if (!user) throw new NotFoundError('User not found');

    const stu = await prisma.student.findFirst({ where: { userId, isActive: true }, select: { id: true, courseId: true } });
    if (!stu) throw new ForbiddenError('Only students can access this');

    const now = new Date();

    return prisma.mcqTest.findMany({
      where: {
        classId: stu.courseId,
        status: 'PUBLISHED',
        startTime: { lte: now },
        endTime: { gte: now },
      },
      include: {
        subject: { select: { name: true, code: true } },
        teacher: { include: { user: { select: { fullName: true } } } },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async getUpcomingTests(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true, institutionId: true } });
    if (!user) throw new NotFoundError('User not found');

    const stu = await prisma.student.findFirst({ where: { userId, isActive: true }, select: { id: true, courseId: true } });
    if (!stu) throw new ForbiddenError('Only students can access this');

    const now = new Date();

    return prisma.mcqTest.findMany({
      where: {
        classId: stu.courseId,
        status: 'PUBLISHED',
        startTime: { gt: now },
      },
      include: {
        subject: { select: { name: true, code: true } },
        teacher: { include: { user: { select: { fullName: true } } } },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async getStudentHistory(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true, institutionId: true } });
    if (!user) throw new NotFoundError('User not found');

    const stu = await prisma.student.findFirst({ where: { userId, isActive: true }, select: { id: true } });
    if (!stu) throw new ForbiddenError('Only students can access this');

    return prisma.mcqSubmission.findMany({
      where: { studentId: stu.id },
      include: {
        test: {
          include: {
            subject: { select: { name: true, code: true } },
            teacher: { include: { user: { select: { fullName: true } } } },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async startTest(userId: string, testId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
    if (!user) throw new NotFoundError('User not found');

    const stu = await prisma.student.findFirst({ where: { userId, isActive: true }, select: { id: true, courseId: true } });
    if (!stu) throw new ForbiddenError('Only students can access this');

    const test = await prisma.mcqTest.findUnique({ where: { id: testId }, include: { questions: true } });
    if (!test) throw new NotFoundError('Test not found');
    if (test.status !== 'PUBLISHED') throw new ConflictError('Test is not published');
    if (test.classId !== stu.courseId) throw new ForbiddenError('This test is not for your class');

    const now = new Date();
    if (now < test.startTime) throw new ConflictError('Test has not started yet');
    if (now > test.endTime) throw new ConflictError('Test has ended');

    // Check for existing submission
    const existing = await prisma.mcqSubmission.findUnique({
      where: { testId_studentId: { testId, studentId: stu.id } },
    });
    if (existing && !test.allowReattempt) throw new ConflictError('You have already taken this test');

    // Return questions WITHOUT correct answers
    const questions = test.questions.map((q) => ({
      id: q.id,
      question: q.question,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      marks: q.marks,
      sortOrder: q.sortOrder,
    }));

    return {
      test: {
        id: test.id,
        title: test.title,
        chapter: test.chapter,
        instructions: test.instructions,
        duration: test.duration,
        totalQuestions: test.totalQuestions,
        totalMarks: test.totalMarks,
        endTime: test.endTime,
      },
      questions,
      existingSubmission: existing ? {
        score: existing.score,
        total: existing.total,
        percentage: existing.percentage,
      } : null,
    };
  }

  async submitTest(userId: string, testId: string, answers: { questionId: string; selectedOption: string }[], timeTaken?: number) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
    if (!user) throw new NotFoundError('User not found');

    const stu = await prisma.student.findFirst({ where: { userId, isActive: true }, select: { id: true } });
    if (!stu) throw new ForbiddenError('Only students can access this');

    const test = await prisma.mcqTest.findUnique({ where: { id: testId }, include: { questions: true } });
    if (!test) throw new NotFoundError('Test not found');
    if (test.status !== 'PUBLISHED') throw new ConflictError('Test is not published');

    const now = new Date();
    if (now > test.endTime) throw new ConflictError('Test has ended');

    // Check existing submission
    if (!test.allowReattempt) {
      const existing = await prisma.mcqSubmission.findUnique({
        where: { testId_studentId: { testId, studentId: stu.id } },
      });
      if (existing) throw new ConflictError('You have already taken this test');
    }

    // Grade
    let score = 0;
    const questionMap = new Map(test.questions.map((q) => [q.id, q]));
    const answerData = answers.map((a) => {
      const q = questionMap.get(a.questionId);
      if (!q) return null;
      const isCorrect = q.correctAnswer === a.selectedOption;
      if (isCorrect) score += q.marks;
      return {
        questionId: a.questionId,
        selectedOption: a.selectedOption,
        isCorrect,
        marks: isCorrect ? q.marks : 0,
      };
    }).filter(Boolean) as { questionId: string; selectedOption: string; isCorrect: boolean; marks: number }[];

    const percentage = test.totalMarks > 0 ? Math.round((score / test.totalMarks) * 1000) / 10 : 0;

    const submission = await prisma.$transaction(async (tx) => {
      const sub = await tx.mcqSubmission.create({
        data: {
          testId,
          studentId: stu.id,
          score,
          total: test.totalMarks,
          percentage,
          timeTaken: timeTaken || null,
        },
      });

      await tx.mcqAnswer.createMany({
        data: answerData.map((a) => ({
          submissionId: sub.id,
          questionId: a.questionId,
          selectedOption: a.selectedOption,
          isCorrect: a.isCorrect,
          marks: a.marks,
        })),
      });

      return sub;
    });

    // Return detailed result
    const fullSubmission = await prisma.mcqSubmission.findUnique({
      where: { id: submission.id },
      include: {
        answers: {
          include: { question: true },
          orderBy: { question: { sortOrder: 'asc' } },
        },
      },
    });

    return {
      submissionId: submission.id,
      score,
      total: test.totalMarks,
      percentage,
      timeTaken,
      questions: fullSubmission?.answers.map((a) => ({
        question: a.question.question,
        optionA: a.question.optionA,
        optionB: a.question.optionB,
        optionC: a.question.optionC,
        optionD: a.question.optionD,
        selectedOption: a.selectedOption,
        correctAnswer: a.question.correctAnswer,
        isCorrect: a.isCorrect,
        marks: a.marks,
      })),
    };
  }

  async getStudentResult(userId: string, submissionId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
    if (!user) throw new NotFoundError('User not found');

    const stu = await prisma.student.findFirst({ where: { userId, isActive: true }, select: { id: true } });
    if (!stu) throw new ForbiddenError('Only students can access this');

    const submission = await prisma.mcqSubmission.findFirst({
      where: { id: submissionId, studentId: stu.id },
      include: {
        test: {
          include: {
            subject: { select: { name: true, code: true } },
            questions: { orderBy: { sortOrder: 'asc' } },
          },
        },
        answers: {
          include: { question: true },
          orderBy: { question: { sortOrder: 'asc' } },
        },
      },
    });
    if (!submission) throw new NotFoundError('Submission not found');

    return submission;
  }

  // ===================== HELPERS =====================

  private async getTestAsTeacher(userId: string, testId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, institutionId: true } });
    if (!user) throw new NotFoundError('User not found');

    const emp = await prisma.employee.findFirst({ where: { userId, isActive: true }, select: { id: true } });
    if (!emp) throw new ForbiddenError('Employee profile not found');

    const test = await prisma.mcqTest.findUnique({ where: { id: testId } });
    if (!test) throw new NotFoundError('Test not found');
    if (test.teacherId !== emp.id) throw new ForbiddenError('Not your test');

    return test;
  }
}

export const mcqService = new McqService();
