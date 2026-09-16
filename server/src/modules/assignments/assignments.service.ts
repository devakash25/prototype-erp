import { prisma } from '../../config/database';
import { NotFoundError, ForbiddenError, ConflictError } from '../../utils/errors';
import { logger } from '../../utils/logger';

class AssignmentService {
  private async resolve(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, institutionId: true },
    });
    if (!user) throw new NotFoundError('User');
    if (!user.institutionId) throw new NotFoundError('Institution');

    let employeeId: string | null = null;
    let studentId: string | null = null;

    if (user.role === 'TEACHER') {
      const emp = await prisma.employee.findFirst({
        where: { userId, isActive: true },
        select: { id: true },
      });
      employeeId = emp?.id || null;
    }

    if (user.role === 'STUDENT') {
      const stu = await prisma.student.findFirst({
        where: { userId, isActive: true },
        select: { id: true, courseId: true, academicSessionId: true },
      });
      studentId = stu?.id || null;
    }

    return { user, employeeId, studentId };
  }

  async getTeacherSubjects(userId: string) {
    const { user, employeeId } = await this.resolve(userId);
    if (!employeeId) throw new NotFoundError('Employee profile');

    const allocations = await prisma.subjectAllocation.findMany({
      where: {
        employeeId,
        subject: { isActive: true },
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
            credits: true,
            course: { select: { id: true, name: true, code: true } },
          },
        },
        academicSession: {
          select: { id: true, name: true, isActive: true },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    const subjects = allocations.map((a) => ({
      allocationId: a.id,
      subjectId: a.subject.id,
      subjectName: a.subject.name,
      subjectCode: a.subject.code,
      subjectType: a.subject.type,
      credits: a.subject.credits,
      course: a.subject.course,
      session: a.academicSession,
      assignedAt: a.assignedAt,
    }));

    return subjects;
  }

  async getSubjectAssignments(userId: string, subjectId: string) {
    const { user, employeeId } = await this.resolve(userId);
    if (!employeeId) throw new NotFoundError('Employee profile');

    const allocation = await prisma.subjectAllocation.findFirst({
      where: { employeeId, subjectId },
    });
    if (!allocation) throw new ForbiddenError('You are not assigned to this subject');

    const assignments = await prisma.assignment.findMany({
      where: { subjectId, isActive: true },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        submissions: {
          select: {
            id: true,
            studentId: true,
            marksObtained: true,
            status: true,
            submittedAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return assignments.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      totalMarks: a.totalMarks,
      dueDate: a.dueDate,
      attachments: a.attachments,
      subject: a.subject,
      createdAt: a.createdAt,
      submissionCount: a.submissions.length,
      submissions: a.submissions,
    }));
  }

  async createAssignment(userId: string, data: {
    subjectId: string;
    title: string;
    description?: string;
    totalMarks: number;
    dueDate: string;
    attachments?: { url: string; name: string; type: string }[];
  }) {
    const { user, employeeId } = await this.resolve(userId);
    if (!employeeId) throw new NotFoundError('Employee profile');

    const allocation = await prisma.subjectAllocation.findFirst({
      where: { employeeId, subjectId: data.subjectId },
    });
    if (!allocation) throw new ForbiddenError('You are not assigned to this subject');

    const assignment = await prisma.assignment.create({
      data: {
        subjectId: data.subjectId,
        title: data.title,
        description: data.description,
        totalMarks: data.totalMarks,
        dueDate: new Date(data.dueDate),
        attachments: data.attachments || [],
        createdBy: userId,
      },
      include: {
        subject: { select: { id: true, name: true, code: true } },
      },
    });

    return assignment;
  }

  async getAssignmentSubmissions(userId: string, assignmentId: string) {
    const { user, employeeId } = await this.resolve(userId);
    if (!employeeId) throw new NotFoundError('Employee profile');

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            courseId: true,
          },
        },
      },
    });
    if (!assignment) throw new NotFoundError('Assignment');

    const allocation = await prisma.subjectAllocation.findFirst({
      where: { employeeId, subjectId: assignment.subjectId },
    });
    if (!allocation) throw new ForbiddenError('You are not assigned to this subject');

    const courseId = assignment.subject.courseId;
    if (!courseId) throw new NotFoundError('Subject is not linked to a course');

    const students = await prisma.student.findMany({
      where: {
        courseId,
        isActive: true,
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        submissions: {
          where: { assignmentId },
          select: {
            id: true,
            content: true,
            attachments: true,
            marksObtained: true,
            feedback: true,
            status: true,
            submittedAt: true,
            gradedAt: true,
          },
        },
      },
      orderBy: { admissionNumber: 'asc' },
    });

    const submitted = students.filter((s) => s.submissions.length > 0);
    const notSubmitted = students.filter((s) => s.submissions.length === 0);

    return {
      assignment: {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        totalMarks: assignment.totalMarks,
        dueDate: assignment.dueDate,
        subject: assignment.subject,
        createdAt: assignment.createdAt,
      },
      stats: {
        totalStudents: students.length,
        submitted: submitted.length,
        notSubmitted: notSubmitted.length,
      },
      submitted: submitted.map((s) => ({
        studentId: s.id,
        admissionNumber: s.admissionNumber,
        rollNumber: s.rollNumber,
        name: `${(s as any).user.firstName} ${(s as any).user.lastName}`,
        email: (s as any).user.email,
        submission: (s as any).submissions[0],
      })),
      notSubmitted: notSubmitted.map((s) => ({
        studentId: s.id,
        admissionNumber: s.admissionNumber,
        rollNumber: s.rollNumber,
        name: `${(s as any).user.firstName} ${(s as any).user.lastName}`,
        email: (s as any).user.email,
      })),
    };
  }

  async gradeSubmission(userId: string, assignmentId: string, studentId: string, marksObtained: number, feedback?: string) {
    const { user, employeeId } = await this.resolve(userId);
    if (!employeeId) throw new NotFoundError('Employee profile');

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });
    if (!assignment) throw new NotFoundError('Assignment');

    const allocation = await prisma.subjectAllocation.findFirst({
      where: { employeeId, subjectId: assignment.subjectId },
    });
    if (!allocation) throw new ForbiddenError('You are not assigned to this subject');

    const submission = await prisma.assignmentSubmission.findFirst({
      where: { assignmentId, studentId },
    });
    if (!submission) throw new NotFoundError('Submission');

    const updated = await prisma.assignmentSubmission.update({
      where: { id: submission.id },
      data: {
        marksObtained,
        feedback,
        status: 'graded',
        gradedAt: new Date(),
      },
    });

    return updated;
  }
}

export const assignmentService = new AssignmentService();
