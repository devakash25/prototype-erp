import { prisma } from '../../config/database';

class TeacherAnalyticsService {
  private async resolve(userId: string) {
    const employee = await prisma.employee.findFirst({
      where: { userId, isActive: true },
      select: { id: true, departmentId: true, designation: true, institutionId: true },
    });
    if (!employee) throw new Error('Employee record not found');
    return { employeeId: employee.id, departmentId: employee.departmentId, designation: employee.designation, institutionId: employee.institutionId };
  }

  private async getAssignedSubjectIds(employeeId: string) {
    const entries = await prisma.timetableEntry.findMany({
      where: { employeeId },
      select: { subjectId: true },
      distinct: ['subjectId'],
    });
    return entries.map(e => e.subjectId);
  }

  private async getAssignedCourseIds(employeeId: string) {
    const entries = await prisma.timetableEntry.findMany({
      where: { employeeId },
      select: { courseId: true },
      distinct: ['courseId'],
    });
    return entries.map(e => e.courseId);
  }

  async getKPIs(userId: string) {
    const { employeeId } = await this.resolve(userId);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayNum = now.getDay();

    const subjectIds = await this.getAssignedSubjectIds(employeeId);
    const courseIds = await this.getAssignedCourseIds(employeeId);

    const [todayClasses, pendingAssignments, pendingEvaluations, studentMessages] = await Promise.all([
      prisma.timetableEntry.count({ where: { employeeId, timetable: { dayOfWeek: dayNum } } }),
      prisma.assignment.count({ where: { subjectId: { in: subjectIds }, isActive: true } }),
      prisma.assignmentSubmission.count({ where: { assignment: { subjectId: { in: subjectIds } }, marksObtained: null } }),
      prisma.helpdeskTicket.count({ where: { creatorId: userId, status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
    ]);

    const totalStudents = courseIds.length > 0 ? await prisma.student.count({
      where: { courseId: { in: courseIds }, isActive: true },
    }) : 0;

    return {
      todayClasses, assignedSubjects: subjectIds.length,
      pendingAssignments, pendingEvaluations,
      studentMessages, totalStudents,
    };
  }

  async getTodaySchedule(userId: string) {
    const { employeeId } = await this.resolve(userId);
    const dayNum = new Date().getDay();
    const entries = await prisma.timetableEntry.findMany({
      where: { employeeId, timetable: { dayOfWeek: dayNum } },
      include: {
        subject: { select: { name: true, code: true } },
        course: { select: { name: true, code: true } },
        timetable: { select: { name: true } },
      },
      orderBy: { startTime: 'asc' },
    });
    return entries;
  }

  async getSubjects(userId: string) {
    const { employeeId } = await this.resolve(userId);
    const subjectIds = await this.getAssignedSubjectIds(employeeId);
    return prisma.subject.findMany({
      where: { id: { in: subjectIds } },
      include: {
        course: { select: { name: true, code: true } },
        _count: { select: { assignments: true, studyMaterials: true } },
      },
    });
  }

  async getAssignedClasses(userId: string) {
    const { employeeId } = await this.resolve(userId);
    const entries = await prisma.timetableEntry.findMany({
      where: { employeeId },
      include: {
        subject: { select: { name: true, code: true } },
        course: { select: { name: true, code: true } },
        timetable: { select: { name: true, departmentId: true } },
      },
      orderBy: { startTime: 'asc' },
    });

    const courseMap = new Map<string, { name: string; code: string; subjects: string[] }>();
    for (const e of entries) {
      const key = e.courseId;
      if (!courseMap.has(key)) courseMap.set(key, { name: e.course.name, code: e.course.code, subjects: [] });
      const c = courseMap.get(key)!;
      if (!c.subjects.includes(e.subject.name)) c.subjects.push(e.subject.name);
    }
    return Array.from(courseMap.entries()).map(([id, data]) => ({ id, ...data }));
  }

  async getStudentList(userId: string, search?: string, page = 1, limit = 20) {
    const { employeeId } = await this.resolve(userId);
    const courseIds = await this.getAssignedCourseIds(employeeId);
    const where: any = { courseId: { in: courseIds }, isActive: true };
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
          user: { select: { fullName: true, email: true, phone: true } },
          course: { select: { name: true } },
        },
        orderBy: { enrollmentDate: 'desc' },
      }),
      prisma.student.count({ where }),
    ]);
    return { students: students.map(s => ({ id: s.id, admissionNumber: s.admissionNumber, name: s.user.fullName, email: s.user.email, phone: s.user.phone, course: s.course.name })), total, page, limit };
  }

  async getStudentPerformance(userId: string) {
    const { employeeId } = await this.resolve(userId);
    const subjectIds = await this.getAssignedSubjectIds(employeeId);
    const courseIds = await this.getAssignedCourseIds(employeeId);

    const students = await prisma.student.findMany({
      where: { courseId: { in: courseIds }, isActive: true },
      include: {
        user: { select: { fullName: true } },
        examResults: { where: { subjectId: { in: subjectIds } }, select: { marksObtained: true, isPassed: true } },
        attendance: { where: { subjectId: { in: subjectIds } }, select: { status: true } },
        submissions: { where: { assignment: { subjectId: { in: subjectIds } } }, select: { marksObtained: true, status: true } },
      },
    });

    return students.map(s => {
      const totalExams = s.examResults.length;
      const passed = s.examResults.filter(r => r.isPassed).length;
      const totalAtt = s.attendance.length;
      const present = s.attendance.filter(a => a.status === 'PRESENT').length;
      const avgMarks = totalExams > 0 ? Math.round(s.examResults.reduce((sum, r) => sum + Number(r.marksObtained || 0), 0) / totalExams) : 0;
      return {
        id: s.id, name: s.user.fullName,
        attendanceRate: totalAtt > 0 ? Math.round((present / totalAtt) * 100) : 0,
        avgMarks, passRate: totalExams > 0 ? Math.round((passed / totalExams) * 100) : 0,
        assignments: s.submissions.length, atRisk: totalAtt > 0 && (present / totalAtt) < 0.75,
      };
    });
  }

  async getAttendanceStatus(userId: string) {
    const { employeeId } = await this.resolve(userId);
    const subjectIds = await this.getAssignedSubjectIds(employeeId);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const todayEntries = await prisma.timetableEntry.findMany({
      where: { employeeId, timetable: { dayOfWeek: now.getDay() } },
      include: { subject: { select: { name: true } }, course: { select: { name: true } } },
    });

    const attendanceStatus = [];
    for (const entry of todayEntries) {
      const totalStudents = await prisma.student.count({ where: { courseId: entry.courseId, isActive: true } });
      const marked = await prisma.attendance.count({
        where: { subjectId: entry.subjectId, date: today, student: { courseId: entry.courseId } },
      });
      attendanceStatus.push({
        entryId: entry.id, subject: entry.subject.name, course: entry.course.name,
        time: entry.startTime, totalStudents, marked,
        isMarked: marked > 0, pending: totalStudents - marked,
      });
    }
    return attendanceStatus;
  }

  async getAssignments(userId: string) {
    const { employeeId } = await this.resolve(userId);
    const subjectIds = await this.getAssignedSubjectIds(employeeId);
    return prisma.assignment.findMany({
      where: { subjectId: { in: subjectIds }, isActive: true },
      include: {
        subject: { select: { name: true, code: true } },
        _count: { select: { submissions: true } },
      },
      orderBy: { dueDate: 'desc' },
    });
  }

  async getLMSOverview(userId: string) {
    const { employeeId } = await this.resolve(userId);
    const subjectIds = await this.getAssignedSubjectIds(employeeId);
    const [assignments, materials, submissions, pendingEval] = await Promise.all([
      prisma.assignment.count({ where: { subjectId: { in: subjectIds } } }),
      prisma.studyMaterial.count({ where: { subjectId: { in: subjectIds } } }),
      prisma.assignmentSubmission.count({ where: { assignment: { subjectId: { in: subjectIds } } } }),
      prisma.assignmentSubmission.count({ where: { assignment: { subjectId: { in: subjectIds } }, marksObtained: null } }),
    ]);
    return { assignments, materials, submissions, pendingEvaluation: pendingEval };
  }

  async getExaminationStatus(userId: string) {
    const { employeeId } = await this.resolve(userId);
    const subjectIds = await this.getAssignedSubjectIds(employeeId);
    const { departmentId } = await this.resolve(userId);

    const exams = await prisma.examination.findMany({
      where: { departmentId, subjects: { some: { subjectId: { in: subjectIds } } } },
      include: {
        results: { select: { marksObtained: true, isPassed: true } },
        subjects: { include: { subject: { select: { name: true } } } },
      },
      orderBy: { startDate: 'desc' },
    });

    return exams.map(e => {
      const total = e.results.length;
      const entered = e.results.filter(r => r.marksObtained !== null).length;
      const passed = e.results.filter(r => r.isPassed).length;
      return {
        id: e.id, name: e.name, type: e.type, startDate: e.startDate, endDate: e.endDate,
        totalResults: total, entered, pending: total - entered,
        passRate: total > 0 ? Math.round((passed / total) * 100) : 0,
      };
    });
  }

  async getMarksEntryStatus(userId: string) {
    const { employeeId } = await this.resolve(userId);
    const subjectIds = await this.getAssignedSubjectIds(employeeId);
    const { departmentId } = await this.resolve(userId);

    const exams = await prisma.examination.findMany({
      where: { departmentId, subjects: { some: { subjectId: { in: subjectIds } } } },
      include: { results: { select: { id: true, marksObtained: true } } },
    });

    return exams.map(e => {
      const total = e.results.length;
      const entered = e.results.filter(r => r.marksObtained !== null).length;
      return { id: e.id, name: e.name, totalResults: total, entered, pending: total - entered, entryRate: total > 0 ? Math.round((entered / total) * 100) : 0 };
    });
  }

  async getLeaveRequests(userId: string) {
    const { employeeId } = await this.resolve(userId);
    return prisma.leave.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async applyLeave(userId: string, data: { type: string; startDate: string; endDate: string; reason: string }) {
    const { employeeId } = await this.resolve(userId);
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return prisma.leave.create({
      data: { employeeId, type: data.type, startDate: start, endDate: end, totalDays, reason: data.reason },
    });
  }

  async getCalendarEvents(userId: string) {
    const { employeeId, departmentId } = await this.resolve(userId);
    const now = new Date();
    const subjectIds = await this.getAssignedSubjectIds(employeeId);

    const [exams, leaves, workflows] = await Promise.all([
      prisma.examination.findMany({
        where: { departmentId, startDate: { gte: now } },
        select: { id: true, name: true, startDate: true, endDate: true, type: true },
        orderBy: { startDate: 'asc' }, take: 10,
      }),
      prisma.leave.findMany({
        where: { employeeId, status: 'pending' },
        select: { id: true, type: true, startDate: true, endDate: true, status: true },
        orderBy: { startDate: 'asc' }, take: 5,
      }),
      prisma.assignment.findMany({
        where: { subjectId: { in: subjectIds }, isActive: true },
        select: { id: true, title: true, dueDate: true },
        orderBy: { dueDate: 'asc' }, take: 10,
      }),
    ]);

    const events: any[] = [];
    exams.forEach(e => events.push({ id: e.id, title: e.name, type: 'exam', date: e.startDate, endDate: e.endDate, status: e.type }));
    leaves.forEach(l => events.push({ id: l.id, title: `Leave: ${l.type}`, type: 'leave', date: l.startDate, endDate: l.endDate, status: l.status }));
    workflows.forEach(w => events.push({ id: w.id, title: `Assignment: ${w.title}`, type: 'assignment', date: w.dueDate, status: 'due' }));
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return { events };
  }

  async getNotifications(userId: string) {
    const userNotifs = await prisma.userNotification.findMany({
      where: { userId, isRead: false },
      include: { notification: true },
      orderBy: { notification: { createdAt: 'desc' } },
      take: 20,
    });
    return userNotifs.map(un => ({ ...un.notification, isRead: un.isRead }));
  }

  async getRecentActivity(userId: string, limit = 10) {
    return prisma.auditLog.findMany({
      where: { userId },
      include: { user: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    }).then(logs => logs.map(a => ({ id: a.id, action: `${a.action} on ${a.entity}`, entity: a.entity, createdAt: a.createdAt.toISOString() })));
  }

  async getReports(userId: string) {
    const { employeeId } = await this.resolve(userId);
    const subjectIds = await this.getAssignedSubjectIds(employeeId);
    const courseIds = await this.getAssignedCourseIds(employeeId);

    const [totalStudents, assignments, materials, submissions, pendingEval, exams] = await Promise.all([
      prisma.student.count({ where: { courseId: { in: courseIds }, isActive: true } }),
      prisma.assignment.count({ where: { subjectId: { in: subjectIds } } }),
      prisma.studyMaterial.count({ where: { subjectId: { in: subjectIds } } }),
      prisma.assignmentSubmission.count({ where: { assignment: { subjectId: { in: subjectIds } } } }),
      prisma.assignmentSubmission.count({ where: { assignment: { subjectId: { in: subjectIds } }, marksObtained: null } }),
      prisma.examination.count({ where: { departmentId: (await this.resolve(userId)).departmentId } }),
    ]);

    return {
      totalStudents, assignedSubjects: subjectIds.length,
      assignments, studyMaterials: materials, submissions, pendingEvaluation: pendingEval, exams,
    };
  }

  async getCoordinatorCourses(userId: string) {
    const { employeeId, institutionId } = await this.resolve(userId);
    const courses = await prisma.course.findMany({
      where: { institutionId, classCoordinatorId: employeeId, isActive: true },
      include: {
        department: { select: { name: true } },
        subjects: { select: { id: true, name: true, code: true } },
        _count: { select: { students: true } },
      },
    });

    return courses.map(c => ({
      id: c.id,
      name: c.name,
      code: c.code,
      level: c.level,
      department: c.department.name,
      studentCount: c._count.students,
      subjectCount: c.subjects.length,
      subjects: c.subjects,
    }));
  }

  async getCoordinatorStudents(userId: string, courseId: string, search?: string, page = 1, limit = 20) {
    const { employeeId, institutionId } = await this.resolve(userId);

    const course = await prisma.course.findFirst({
      where: { id: courseId, institutionId, classCoordinatorId: employeeId },
    });
    if (!course) throw new Error('You are not the coordinator of this course');

    const where: any = { courseId, isActive: true };
    if (search) {
      where.OR = [
        { user: { fullName: { contains: search, mode: 'insensitive' } } },
        { admissionNumber: { contains: search, mode: 'insensitive' } },
        { rollNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { fullName: true, email: true, phone: true } },
        },
        orderBy: { enrollmentDate: 'desc' },
      }),
      prisma.student.count({ where }),
    ]);

    return {
      students: students.map(s => ({
        id: s.id,
        admissionNumber: s.admissionNumber,
        rollNumber: s.rollNumber,
        name: s.user.fullName,
        email: s.user.email,
        phone: s.user.phone,
        enrollmentDate: s.enrollmentDate,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getCoordinatorAcademics(userId: string, courseId: string) {
    const { employeeId, institutionId } = await this.resolve(userId);

    const course = await prisma.course.findFirst({
      where: { id: courseId, institutionId, classCoordinatorId: employeeId },
    });
    if (!course) throw new Error('You are not the coordinator of this course');

    const subjectIds = (await prisma.subject.findMany({
      where: { courseId },
      select: { id: true },
    })).map(s => s.id);

    const students = await prisma.student.findMany({
      where: { courseId, isActive: true },
      include: {
        user: { select: { fullName: true } },
        examResults: { select: { marksObtained: true, isPassed: true, subjectId: true } },
      },
    });

    const subjectPerformance = subjectIds.map(sId => {
      const sub = students.flatMap(s =>
        s.examResults.filter(r => r.subjectId === sId).map(r => ({ marks: Number(r.marksObtained || 0), passed: r.isPassed }))
      );
      const totalMarks = sub.reduce((sum, r) => sum + r.marks, 0);
      const avgMarks = sub.length > 0 ? Math.round(totalMarks / sub.length) : 0;
      const passCount = sub.filter(r => r.passed).length;
      const passRate = sub.length > 0 ? Math.round((passCount / sub.length) * 100) : 0;
      return { subjectId: sId, avgMarks, passRate, totalResults: sub.length };
    });

    const overallAvgMarks = students.length > 0
      ? Math.round(students.reduce((sum, s) => {
          const avg = s.examResults.length > 0
            ? s.examResults.reduce((rSum, r) => rSum + Number(r.marksObtained || 0), 0) / s.examResults.length
            : 0;
          return sum + avg;
        }, 0) / students.length)
      : 0;

    const overallPassRate = students.length > 0
      ? Math.round(students.filter(s => s.examResults.length === 0 || s.examResults.some(r => r.isPassed)).length / students.length * 100)
      : 0;

    return {
      courseId,
      courseName: course.name,
      totalStudents: students.length,
      overallAvgMarks,
      overallPassRate,
      subjectPerformance,
    };
  }

  async getCoordinatorAttendance(userId: string, courseId: string, days = 30) {
    const { employeeId, institutionId } = await this.resolve(userId);

    const course = await prisma.course.findFirst({
      where: { id: courseId, institutionId, classCoordinatorId: employeeId },
    });
    if (!course) throw new Error('You are not the coordinator of this course');

    const since = new Date();
    since.setDate(since.getDate() - days);

    const students = await prisma.student.findMany({
      where: { courseId, isActive: true },
      include: {
        user: { select: { fullName: true } },
        attendance: {
          where: { date: { gte: since } },
          select: { status: true, date: true },
        },
      },
    });

    const attendanceList = students.map(s => {
      const totalDays = s.attendance.length;
      const presentDays = s.attendance.filter(a => a.status === 'PRESENT').length;
      const absentDays = s.attendance.filter(a => a.status === 'ABSENT').length;
      const lateDays = s.attendance.filter(a => a.status === 'LATE').length;
      const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
      return {
        studentId: s.id,
        name: s.user.fullName,
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        attendanceRate,
        atRisk: totalDays > 0 && (presentDays / totalDays) < 0.75,
      };
    });

    const totalStudents = students.length;
    const avgAttendance = totalStudents > 0
      ? Math.round(attendanceList.reduce((sum, s) => sum + s.attendanceRate, 0) / totalStudents)
      : 0;
    const atRiskStudents = attendanceList.filter(s => s.atRisk).length;

    return {
      courseId,
      courseName: course.name,
      totalStudents,
      avgAttendance,
      atRiskStudents,
      periodDays: days,
      attendanceList,
    };
  }
}

export const teacherAnalyticsService = new TeacherAnalyticsService();
