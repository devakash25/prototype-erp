import { prisma } from '../../config/database';

class HODAnalyticsService {
  private async resolve(userId: string) {
    const employee = await prisma.employee.findFirst({
      where: { userId, isActive: true },
      select: { id: true, departmentId: true },
    });
    if (!employee) throw new Error('Employee record not found');
    return { employeeId: employee.id, departmentId: employee.departmentId };
  }

  async getKPIs(userId: string) {
    const { departmentId } = await this.resolve(userId);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayNum = now.getDay();

    const [
      totalStudents, totalFaculty,
      todayClasses, facultyPresent, facultyTotal,
      studentPresent, studentTotal,
      pendingEvaluations,
    ] = await Promise.all([
      prisma.student.count({ where: { departmentId, isActive: true } }),
      prisma.employee.count({ where: { departmentId, isActive: true } }),
      prisma.timetableEntry.count({ where: { timetable: { departmentId, dayOfWeek: dayNum } } }),
      prisma.employeeAttendance.count({ where: { employee: { departmentId }, date: today, status: 'PRESENT' } }),
      prisma.employee.count({ where: { departmentId, isActive: true } }),
      prisma.attendance.count({
        where: { student: { departmentId }, date: today, status: 'PRESENT' },
      }),
      prisma.student.count({ where: { departmentId, isActive: true } }),
      prisma.assignmentSubmission.count({
        where: { assignment: { subject: { departmentId } }, marksObtained: null },
      }),
    ]);

    const facultyAttendanceRate = facultyTotal > 0 ? Math.round((facultyPresent / facultyTotal) * 100) : 0;
    const studentAttendanceRate = studentTotal > 0 ? Math.round((studentPresent / studentTotal) * 100) : 0;

    return {
      totalStudents, totalFaculty, todayClasses,
      facultyAttendanceRate, studentAttendanceRate,
      pendingEvaluations,
      departmentScore: Math.round((facultyAttendanceRate + studentAttendanceRate) / 2),
    };
  }

  async getDepartmentOverview(userId: string) {
    const { departmentId } = await this.resolve(userId);
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      include: {
        hod: { include: { user: { select: { fullName: true, email: true } } } },
        _count: { select: { courses: true, subjects: true, students: true, employees: true } },
        courses: { where: { isActive: true }, select: { id: true, name: true, code: true, _count: { select: { subjects: true } } } },
      },
    });
    return department;
  }

  async getFacultyList(userId: string) {
    const { departmentId } = await this.resolve(userId);
    const today = new Date();
    const dayNum = new Date().getDay();

    const employees = await prisma.employee.findMany({
      where: { departmentId, isActive: true },
      include: {
        user: { select: { fullName: true, email: true, phone: true } },
        attendances: { where: { date: today }, select: { status: true } },
        leaves: { where: { status: 'pending' }, select: { id: true } },
        timetables: { where: { timetable: { dayOfWeek: dayNum } }, select: { id: true } },
        performanceReviews: { select: { rating: true } },
      },
    });

    return employees.map(emp => {
      const todayStatus = emp.attendances[0]?.status || 'NO_RECORD';
      const avgScore = emp.performanceReviews.length > 0
        ? Math.round(emp.performanceReviews.reduce((s, r) => s + (r.rating || 0), 0) / emp.performanceReviews.length * 20)
        : 0;
      return {
        id: emp.id, employeeCode: emp.employeeCode, designation: emp.designation,
        qualification: emp.qualification, experience: emp.experience,
        name: emp.user.fullName, email: emp.user.email, phone: emp.user.phone,
        todayStatus, pendingLeaves: emp.leaves.length,
        classesToday: emp.timetables.length, performanceScore: avgScore,
      };
    });
  }

  async getFacultyWorkload(userId: string) {
    const { departmentId } = await this.resolve(userId);
    const employees = await prisma.employee.findMany({
      where: { departmentId, isActive: true },
      include: {
        user: { select: { fullName: true } },
        timetables: {
          include: {
            subject: { select: { name: true, code: true } },
            timetable: { select: { dayOfWeek: true } },
          },
        },
      },
    });

    return employees.map(emp => {
      const subjects = [...new Set(emp.timetables.map(t => t.subject.name))];
      const classesPerWeek = emp.timetables.length;
      const hoursPerWeek = emp.timetables.length * 1; // ~1 hour per class
      return {
        id: emp.id, name: emp.user.fullName, designation: emp.designation,
        subjects, classesPerWeek, hoursPerWeek,
        utilization: Math.min(100, Math.round((classesPerWeek / 30) * 100)),
      };
    });
  }

  async getFacultyAttendance(userId: string, days = 7) {
    const { departmentId } = await this.resolve(userId);
    const trends = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayEnd = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      const total = await prisma.employee.count({ where: { departmentId, isActive: true } });
      const present = await prisma.employeeAttendance.count({
        where: { employee: { departmentId }, date: { gte: date, lt: dayEnd }, status: 'PRESENT' },
      });
      trends.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleString('default', { weekday: 'short' }),
        rate: total > 0 ? Math.round((present / total) * 100) : 0,
        present, total,
      });
    }
    return trends;
  }

  async getFacultyPerformance(userId: string) {
    const { departmentId } = await this.resolve(userId);
    const employees = await prisma.employee.findMany({
      where: { departmentId, isActive: true },
      include: {
        user: { select: { fullName: true } },
        performanceReviews: { select: { rating: true, period: true } },
        _count: { select: { timetables: true, leaves: true } },
      },
    });

    return employees.map(emp => {
      const avgRating = emp.performanceReviews.length > 0
        ? emp.performanceReviews.reduce((s, r) => s + (r.rating || 0), 0) / emp.performanceReviews.length
        : 0;
      return {
        id: emp.id, name: emp.user.fullName, designation: emp.designation,
        averageRating: Math.round(avgRating * 10) / 10,
        reviewCount: emp.performanceReviews.length,
        classesPerWeek: emp._count.timetables,
        pendingLeaves: emp._count.leaves,
      };
    });
  }

  async getStudentList(userId: string, search?: string, page = 1, limit = 20) {
    const { departmentId } = await this.resolve(userId);
    const where: any = { departmentId, isActive: true };
    if (search) {
      where.OR = [
        { user: { fullName: { contains: search, mode: 'insensitive' } } },
        { admissionNumber: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where, skip: (page - 1) * limit, take: limit,
        include: {
          user: { select: { fullName: true, email: true } },
          course: { select: { name: true, code: true } },
        },
        orderBy: { enrollmentDate: 'desc' },
      }),
      prisma.student.count({ where }),
    ]);
    return {
      students: students.map(s => ({
        id: s.id, admissionNumber: s.admissionNumber, rollNumber: s.rollNumber,
        name: s.user.fullName, email: s.user.email,
        course: s.course.name, courseCode: s.course.code,
        enrollmentDate: s.enrollmentDate, isActive: s.isActive,
        isHostelStudent: s.isHostelStudent, usesTransport: s.usesTransport,
      })),
      total, page, limit,
    };
  }

  async getStudentPerformance(userId: string) {
    const { departmentId } = await this.resolve(userId);
    const students = await prisma.student.findMany({
      where: { departmentId, isActive: true },
      include: {
        user: { select: { fullName: true } },
        examResults: { select: { marksObtained: true, isPassed: true } },
        attendance: { select: { status: true } },
      },
    });

    const performance = students.map(s => {
      const totalExams = s.examResults.length;
      const passed = s.examResults.filter(r => r.isPassed).length;
      const totalAttendance = s.attendance.length;
      const present = s.attendance.filter(a => a.status === 'PRESENT').length;
      const avgMarks = totalExams > 0
        ? Math.round(s.examResults.reduce((sum, r) => sum + Number(r.marksObtained || 0), 0) / totalExams)
        : 0;
      return {
        id: s.id, name: s.user.fullName,
        totalExams, passed, passRate: totalExams > 0 ? Math.round((passed / totalExams) * 100) : 0,
        attendanceRate: totalAttendance > 0 ? Math.round((present / totalAttendance) * 100) : 0,
        avgMarks, atRisk: totalAttendance > 0 && (present / totalAttendance) < 0.75,
      };
    });

    const atRisk = performance.filter(p => p.atRisk);
    const topPerformers = performance.filter(p => p.attendanceRate >= 85 && p.passRate >= 80).sort((a, b) => b.avgMarks - a.avgMarks).slice(0, 10);

    return { performance, atRisk, topPerformers, total: performance.length };
  }

  async getStudentAttendance(userId: string, days = 7) {
    const { departmentId } = await this.resolve(userId);
    const trends = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayEnd = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      const total = await prisma.student.count({ where: { departmentId, isActive: true } });
      const present = await prisma.attendance.count({
        where: { student: { departmentId }, date: { gte: date, lt: dayEnd }, status: 'PRESENT' },
      });
      trends.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleString('default', { weekday: 'short' }),
        rate: total > 0 ? Math.round((present / total) * 100) : 0,
        present, total,
      });
    }
    return trends;
  }

  async getCourses(userId: string) {
    const { departmentId } = await this.resolve(userId);
    return prisma.course.findMany({
      where: { departmentId, isActive: true },
      include: {
        _count: { select: { subjects: true, students: true } },
        subjects: { where: { isActive: true }, select: { id: true, name: true, code: true } },
      },
    });
  }

  async getSubjects(userId: string) {
    const { departmentId } = await this.resolve(userId);
    return prisma.subject.findMany({
      where: { departmentId, isActive: true },
      include: {
        course: { select: { name: true, code: true } },
        _count: { select: { assignments: true, studyMaterials: true } },
      },
    });
  }

  async getTimetable(userId: string) {
    const { departmentId } = await this.resolve(userId);
    const dayNum = new Date().getDay();
    const entries = await prisma.timetableEntry.findMany({
      where: { timetable: { departmentId, dayOfWeek: dayNum } },
      include: {
        employee: { include: { user: { select: { fullName: true } } } },
        subject: { select: { name: true, code: true } },
        course: { select: { name: true } },
      },
      orderBy: { startTime: 'asc' },
    });
    return { entries, dayOfWeek: dayNum, totalEntries: entries.length };
  }

  async getLMSOverview(userId: string) {
    const { departmentId } = await this.resolve(userId);
    const [assignments, submissions, materials, pendingEvaluation] = await Promise.all([
      prisma.assignment.count({ where: { subject: { departmentId } } }),
      prisma.assignmentSubmission.count({ where: { assignment: { subject: { departmentId } } } }),
      prisma.studyMaterial.count({ where: { subject: { departmentId } } }),
      prisma.assignmentSubmission.count({ where: { assignment: { subject: { departmentId } }, marksObtained: null } }),
    ]);
    return { assignments, submissions, materials, pendingEvaluation };
  }

  async getAssignments(userId: string) {
    const { departmentId } = await this.resolve(userId);
    return prisma.assignment.findMany({
      where: { subject: { departmentId }, isActive: true },
      include: {
        subject: { select: { name: true, code: true } },
        _count: { select: { submissions: true } },
      },
      orderBy: { dueDate: 'desc' },
    });
  }

  async getExaminationStatus(userId: string) {
    const { departmentId } = await this.resolve(userId);
    const [active, upcoming, completed] = await Promise.all([
      prisma.examination.count({ where: { departmentId, startDate: { lte: new Date() }, endDate: { gte: new Date() } } }),
      prisma.examination.count({ where: { departmentId, startDate: { gt: new Date() } } }),
      prisma.examination.count({ where: { departmentId, endDate: { lt: new Date() } } }),
    ]);

    const exams = await prisma.examination.findMany({
      where: { departmentId },
      include: {
        results: { select: { marksObtained: true, isPassed: true } },
      },
      orderBy: { startDate: 'desc' },
      take: 10,
    });

    const totalResults = exams.reduce((s, e) => s + e.results.length, 0);
    const passedResults = exams.reduce((s, e) => s + e.results.filter(r => r.isPassed).length, 0);

    return {
      active, upcoming, completed,
      passRate: totalResults > 0 ? Math.round((passedResults / totalResults) * 100) : 0,
      totalResults, exams: exams.map(e => ({
        id: e.id, name: e.name, type: e.type, startDate: e.startDate, endDate: e.endDate,
        totalResults: e.results.length, passedResults: e.results.filter(r => r.isPassed).length,
      })),
    };
  }

  async getMarksEntryStatus(userId: string) {
    const { departmentId } = await this.resolve(userId);
    const exams = await prisma.examination.findMany({
      where: { departmentId },
      include: {
        results: { select: { id: true, marksObtained: true } },
        subjects: { include: { subject: { select: { name: true } } } },
      },
    });
    return exams.map(e => {
      const totalResults = e.results.length;
      const entered = e.results.filter(r => r.marksObtained !== null).length;
      return {
        id: e.id, name: e.name, totalResults, entered,
        pending: totalResults - entered,
        entryRate: totalResults > 0 ? Math.round((entered / totalResults) * 100) : 0,
      };
    });
  }

  async getNotices(userId: string) {
    const { departmentId } = await this.resolve(userId);
    const dept = await prisma.department.findUnique({ where: { id: departmentId }, select: { institutionId: true } });
    if (!dept) return [];
    return prisma.notification.findMany({
      where: { institutionId: dept.institutionId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async getWorkflowSummary(userId: string) {
    const { departmentId } = await this.resolve(userId);
    const dept = await prisma.department.findUnique({ where: { id: departmentId }, select: { institutionId: true } });
    if (!dept) return { pending: 0, byType: [], all: [] };
    const byType = await prisma.workflow.groupBy({
      by: ['type', 'status'],
      where: { institutionId: dept.institutionId },
      _count: true,
    });
    const pending = byType.filter(w => w.status === 'PENDING');
    return {
      pending: pending.reduce((s, w) => s + w._count, 0),
      byType: pending.map(w => ({ type: w.type, count: w._count })),
      all: byType.map(w => ({ type: w.type, status: w.status, count: w._count })),
    };
  }

  async getHelpdeskTickets(userId: string, status?: string, page = 1, limit = 20) {
    const { departmentId } = await this.resolve(userId);
    const dept = await prisma.department.findUnique({ where: { id: departmentId }, select: { institutionId: true } });
    if (!dept) return { tickets: [], total: 0, page, limit, summary: [] };
    const where: any = { institutionId: dept.institutionId };
    if (status && status !== 'all') where.status = status.toUpperCase();

    const [tickets, total] = await Promise.all([
      prisma.helpdeskTicket.findMany({
        where, skip: (page - 1) * limit, take: limit,
        include: { creator: { select: { fullName: true } }, assignee: { select: { fullName: true } }, _count: { select: { comments: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.helpdeskTicket.count({ where }),
    ]);
    const summary = await prisma.helpdeskTicket.groupBy({
      by: ['status'], where: { institutionId: dept!.institutionId }, _count: true,
    });
    return { tickets, total, page, limit, summary };
  }

  async getWorkflowActions(userId: string, status?: string, page = 1, limit = 20) {
    const { departmentId } = await this.resolve(userId);
    const dept = await prisma.department.findUnique({ where: { id: departmentId }, select: { institutionId: true } });
    if (!dept) return { workflows: [], total: 0, page, limit };
    const where: any = { institutionId: dept.institutionId };
    if (status && status !== 'all') where.status = status.toUpperCase();

    const [workflows, total] = await Promise.all([
      prisma.workflow.findMany({
        where, skip: (page - 1) * limit, take: limit,
        include: { creator: { select: { fullName: true } }, actions: { include: { user: { select: { fullName: true } } } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.workflow.count({ where }),
    ]);
    return { workflows, total, page, limit };
  }

  async handleWorkflowAction(workflowId: string, userId: string, action: string, comments?: string) {
    const workflowAction = await prisma.workflowAction.create({
      data: { workflowId, userId, action, comments: comments || null, status: 'completed' },
    });
    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
    const updated = await prisma.workflow.update({
      where: { id: workflowId },
      data: { status: newStatus as any },
      include: { creator: { select: { fullName: true } }, actions: { include: { user: { select: { fullName: true } } } } },
    });
    return { workflowAction, workflow: updated };
  }

  async handleHelpdeskAction(ticketId: string, action: string) {
    const data: any = {};
    if (action === 'resolve') { data.status = 'RESOLVED'; data.resolvedAt = new Date(); }
    else if (action === 'close') data.status = 'CLOSED';
    else if (action === 'assign') data.status = 'IN_PROGRESS';
    return prisma.helpdeskTicket.update({ where: { id: ticketId }, data });
  }

  async getDepartmentAnalytics(userId: string) {
    const { departmentId } = await this.resolve(userId);
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [studentCount, facultyCount, totalExams, passedExams, totalAttendance, presentAttendance] = await Promise.all([
      prisma.student.count({ where: { departmentId, isActive: true } }),
      prisma.employee.count({ where: { departmentId, isActive: true } }),
      prisma.examResult.count({ where: { examination: { departmentId } } }),
      prisma.examResult.count({ where: { examination: { departmentId }, isPassed: true } }),
      prisma.attendance.count({ where: { student: { departmentId }, date: { gte: monthAgo } } }),
      prisma.attendance.count({ where: { student: { departmentId }, date: { gte: monthAgo }, status: 'PRESENT' } }),
    ]);

    return {
      studentCount, facultyCount,
      passPercentage: totalExams > 0 ? Math.round((passedExams / totalExams) * 100) : 0,
      attendanceRate: totalAttendance > 0 ? Math.round((presentAttendance / totalAttendance) * 100) : 0,
      totalExams, passedExams,
    };
  }

  async getReports(userId: string) {
    const { departmentId } = await this.resolve(userId);
    const [students, activeStudents, faculty, activeFaculty, exams, pendingEvals, assignments] = await Promise.all([
      prisma.student.count({ where: { departmentId } }),
      prisma.student.count({ where: { departmentId, isActive: true } }),
      prisma.employee.count({ where: { departmentId } }),
      prisma.employee.count({ where: { departmentId, isActive: true } }),
      prisma.examination.count({ where: { departmentId } }),
      prisma.assignmentSubmission.count({ where: { assignment: { subject: { departmentId } }, marksObtained: null } }),
      prisma.assignment.count({ where: { subject: { departmentId } } }),
    ]);
    return { students: { total: students, active: activeStudents, inactive: students - activeStudents }, faculty: { total: faculty, active: activeFaculty }, exams, pendingEvaluations: pendingEvals, assignments };
  }

  async getCalendarEvents(userId: string) {
    const { departmentId } = await this.resolve(userId);
    const now = new Date();
    const dept = await prisma.department.findUnique({ where: { id: departmentId }, select: { institutionId: true } });
    const institutionId = dept?.institutionId || '';
    const [exams, workflows] = await Promise.all([
      prisma.examination.findMany({
        where: { departmentId, startDate: { gte: now } },
        select: { id: true, name: true, startDate: true, endDate: true, type: true },
        orderBy: { startDate: 'asc' }, take: 10,
      }),
      prisma.workflow.findMany({
        where: { institutionId },
        select: { id: true, title: true, type: true, status: true, createdAt: true },
        orderBy: { createdAt: 'desc' }, take: 10,
      }),
    ]);
    const events: any[] = [];
    exams.forEach(e => events.push({ id: e.id, title: e.name, type: 'exam', date: e.startDate, endDate: e.endDate, status: e.type }));
    workflows.forEach(w => events.push({ id: w.id, title: w.title || `${w.type} workflow`, type: 'workflow', date: w.createdAt, status: w.status }));
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return { events };
  }

  async getRecentActivity(userId: string, limit = 15) {
    const { departmentId } = await this.resolve(userId);
    const deptUserIds = (await prisma.employee.findMany({
      where: { departmentId, isActive: true },
      select: { userId: true },
    })).map(e => e.userId);

    const activities = await prisma.auditLog.findMany({
      where: { userId: { in: deptUserIds } },
      include: { user: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return activities.map(a => ({
      id: a.id, action: `${a.action} on ${a.entity}`, entity: a.entity,
      user: a.user, createdAt: a.createdAt.toISOString(),
    }));
  }
}

export const hodAnalyticsService = new HODAnalyticsService();
