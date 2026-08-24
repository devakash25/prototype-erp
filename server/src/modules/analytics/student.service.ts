import { prisma } from '../../config/database';

class StudentAnalyticsService {
  private async resolve(userId: string) {
    const student = await prisma.student.findFirst({
      where: { userId, isActive: true },
      select: {
        id: true, institutionId: true, courseId: true, departmentId: true,
        admissionNumber: true, rollNumber: true, enrollmentDate: true,
        isHostelStudent: true, usesTransport: true, transportRouteId: true, hostelId: true,
      },
    });
    if (!student) throw new Error('Student record not found');
    return student;
  }

  async getKPIs(userId: string) {
    const student = await this.resolve(userId);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayNum = now.getDay();

    const subjectIds = (await prisma.subject.findMany({
      where: { courseId: student.courseId }, select: { id: true },
    })).map(s => s.id);

    const [todayAttendance, totalAssignments, pendingAssignments, pendingFees, upcomingExams, newNotices, libraryIssues] = await Promise.all([
      prisma.attendance.count({
        where: { studentId: student.id, date: today, status: 'PRESENT' },
      }),
      prisma.assignment.count({ where: { subjectId: { in: subjectIds }, isActive: true } }),
      prisma.assignmentSubmission.count({
        where: { assignment: { subjectId: { in: subjectIds }, isActive: true }, studentId: student.id, status: 'submitted' },
      }),
      prisma.feePayment.count({
        where: { studentId: student.id, status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] } },
      }),
      prisma.examination.count({
        where: { institutionId: student.institutionId, startDate: { gte: now, lte: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000) } },
      }),
      prisma.userNotification.count({
        where: { userId, isRead: false },
      }),
      prisma.libraryIssue.count({
        where: { studentId: student.id, status: { in: ['issued', 'overdue'] } },
      }),
    ]);

    // Attendance rate
    const totalDays = await prisma.attendance.count({ where: { studentId: student.id } });
    const presentDays = await prisma.attendance.count({ where: { studentId: student.id, status: 'PRESENT' } });
    const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    // Today's classes
    const todayClasses = await prisma.timetableEntry.count({
      where: { timetable: { institutionId: student.institutionId, departmentId: student.departmentId, dayOfWeek: dayNum } },
    });

    return {
      todayClasses,
      attendanceRate,
      pendingAssignments,
      pendingFees,
      upcomingExams,
      newNotices,
      libraryIssues,
      totalSubjects: subjectIds.length,
    };
  }

  async getTodaySchedule(userId: string) {
    const student = await this.resolve(userId);
    const dayNum = new Date().getDay();

    return prisma.timetableEntry.findMany({
      where: {
        timetable: { institutionId: student.institutionId, departmentId: student.departmentId, dayOfWeek: dayNum },
        courseId: student.courseId,
      },
      include: {
        subject: { select: { name: true, code: true } },
        employee: { include: { user: { select: { fullName: true } } } },
        course: { select: { name: true, code: true } },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async getSubjects(userId: string) {
    const student = await this.resolve(userId);
    const subjects = await prisma.subject.findMany({
      where: { courseId: student.courseId, isActive: true },
      include: {
        _count: { select: { assignments: true, studyMaterials: true } },
      },
    });

    // Get teacher for each subject via timetable
    const subjectsWithTeachers = await Promise.all(subjects.map(async (s) => {
      const entry = await prisma.timetableEntry.findFirst({
        where: { subjectId: s.id, courseId: student.courseId },
        include: { employee: { include: { user: { select: { fullName: true } } } } },
      });
      return {
        id: s.id,
        name: s.name,
        code: s.code,
        credits: s.credits,
        type: s.type,
        totalMarks: s.totalMarks,
        passingMarks: s.passingMarks,
        teacher: entry?.employee?.user?.fullName || 'Not Assigned',
        assignmentCount: s._count.assignments,
        materialCount: s._count.studyMaterials,
      };
    }));

    return subjectsWithTeachers;
  }

  async getAttendance(userId: string, subjectId?: string, days = 30) {
    const student = await this.resolve(userId);
    const since = new Date();
    since.setDate(since.getDate() - days);

    const where: any = { studentId: student.id, date: { gte: since } };
    if (subjectId) where.subjectId = subjectId;

    const records = await prisma.attendance.findMany({
      where,
      include: {
        subject: { select: { name: true, code: true } },
      },
      orderBy: { date: 'desc' },
    });

    // Subject-wise summary
    const subjectMap = new Map<string, { name: string; code: string; present: number; absent: number; late: number; total: number }>();
    for (const r of records) {
      const key = r.subjectId;
      if (!subjectMap.has(key)) subjectMap.set(key, { name: r.subject.name, code: r.subject.code, present: 0, absent: 0, late: 0, total: 0 });
      const s = subjectMap.get(key)!;
      s.total++;
      if (r.status === 'PRESENT') s.present++;
      else if (r.status === 'ABSENT') s.absent++;
      else if (r.status === 'LATE') s.late++;
    }

    const totalPresent = records.filter(r => r.status === 'PRESENT').length;
    const totalLate = records.filter(r => r.status === 'LATE').length;
    const overallRate = records.length > 0 ? Math.round(((totalPresent + totalLate) / records.length) * 100) : 0;

    return {
      overallRate,
      totalDays: records.length,
      present: totalPresent,
      absent: records.filter(r => r.status === 'ABSENT').length,
      late: totalLate,
      subjectWise: Array.from(subjectMap.entries()).map(([id, data]) => ({
        subjectId: id,
        ...data,
        rate: data.total > 0 ? Math.round(((data.present + data.late) / data.total) * 100) : 0,
      })),
      records: records.map(r => ({
        id: r.id,
        date: r.date,
        status: r.status,
        subject: r.subject.name,
        subjectCode: r.subject.code,
        remarks: r.remarks,
      })),
    };
  }

  async getAttendanceCalendar(userId: string, month: number, year: number) {
    const student = await this.resolve(userId);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const records = await prisma.attendance.findMany({
      where: { studentId: student.id, date: { gte: start, lte: end } },
      include: { subject: { select: { name: true } } },
    });

    const calendar: Record<string, { status: string; subject: string }[]> = {};
    for (const r of records) {
      const day = r.date.toISOString().split('T')[0];
      if (!calendar[day]) calendar[day] = [];
      calendar[day].push({ status: r.status, subject: r.subject.name });
    }
    return calendar;
  }

  async getAssignments(userId: string) {
    const student = await this.resolve(userId);
    const subjectIds = (await prisma.subject.findMany({
      where: { courseId: student.courseId }, select: { id: true },
    })).map(s => s.id);

    const assignments = await prisma.assignment.findMany({
      where: { subjectId: { in: subjectIds }, isActive: true },
      include: {
        subject: { select: { name: true, code: true } },
        submissions: { where: { studentId: student.id }, select: { id: true, status: true, marksObtained: true, submittedAt: true } },
      },
      orderBy: { dueDate: 'asc' },
    });

    return assignments.map(a => ({
      id: a.id,
      title: a.title,
      description: a.description,
      dueDate: a.dueDate,
      maxMarks: a.totalMarks,
      subject: a.subject.name,
      subjectCode: a.subject.code,
      status: a.submissions.length > 0 ? a.submissions[0].status : 'pending',
      marksObtained: a.submissions.length > 0 ? a.submissions[0].marksObtained : null,
      submittedAt: a.submissions.length > 0 ? a.submissions[0].submittedAt : null,
    }));
  }

  async submitAssignment(userId: string, assignmentId: string, fileUrl?: string, notes?: string) {
    const student = await this.resolve(userId);
    const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
    if (!assignment) throw new Error('Assignment not found');
    if (!assignment.isActive) throw new Error('Assignment is no longer active');

    const existing = await prisma.assignmentSubmission.findUnique({
      where: { assignmentId_studentId: { assignmentId, studentId: student.id } },
    });
    if (existing) throw new Error('You have already submitted this assignment');

    return prisma.assignmentSubmission.create({
      data: {
        assignmentId,
        studentId: student.id,
        content: notes || null,
        attachments: fileUrl ? { fileUrl } : undefined,
        status: 'submitted',
        submittedAt: new Date(),
      },
    });
  }

  async getReports(userId: string) {
    const student = await this.resolve(userId);
    const subjectIds = (await prisma.subject.findMany({
      where: { courseId: student.courseId }, select: { id: true },
    })).map(s => s.id);

    const [totalPresent, totalDays, totalAssignments, submittedAssignments, totalExams, passedExams, totalPaid, totalDue] = await Promise.all([
      prisma.attendance.count({ where: { studentId: student.id, status: 'PRESENT' } }),
      prisma.attendance.count({ where: { studentId: student.id } }),
      prisma.assignment.count({ where: { subjectId: { in: subjectIds }, isActive: true } }),
      prisma.assignmentSubmission.count({ where: { studentId: student.id, status: { in: ['SUBMITTED', 'GRADED'] } } }),
      prisma.examResult.count({ where: { studentId: student.id, marksObtained: { not: null } } }),
      prisma.examResult.count({ where: { studentId: student.id, isPassed: true } }),
      prisma.feePayment.aggregate({ where: { studentId: student.id, status: 'PAID' }, _sum: { paidAmount: true } }),
      prisma.feePayment.aggregate({ where: { studentId: student.id, status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] } }, _sum: { dueAmount: true } }),
    ]);

    return {
      attendance: { present: totalPresent, total: totalDays, rate: totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : 0 },
      assignments: { submitted: submittedAssignments, total: totalAssignments, rate: totalAssignments > 0 ? Math.round((submittedAssignments / totalAssignments) * 100) : 0 },
      exams: { passed: passedExams, total: totalExams, passRate: totalExams > 0 ? Math.round((passedExams / totalExams) * 100) : 0 },
      fees: { paid: Number(totalPaid._sum.paidAmount) || 0, due: Number(totalDue._sum.dueAmount) || 0 },
    };
  }

  async getStudyMaterials(userId: string) {
    const student = await this.resolve(userId);
    const subjectIds = (await prisma.subject.findMany({
      where: { courseId: student.courseId }, select: { id: true },
    })).map(s => s.id);

    return prisma.studyMaterial.findMany({
      where: { subjectId: { in: subjectIds } },
      include: { subject: { select: { name: true, code: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getExaminations(userId: string) {
    const student = await this.resolve(userId);
    const subjectIds = (await prisma.subject.findMany({
      where: { courseId: student.courseId }, select: { id: true },
    })).map(s => s.id);

    const exams = await prisma.examination.findMany({
      where: {
        institutionId: student.institutionId,
        subjects: { some: { subjectId: { in: subjectIds } } },
      },
      include: {
        subjects: { include: { subject: { select: { name: true, code: true } } } },
        results: { where: { studentId: student.id }, select: { marksObtained: true, isPassed: true, grade: true } },
      },
      orderBy: { startDate: 'desc' },
    });

    return exams.map(e => ({
      id: e.id,
      name: e.name,
      type: e.type,
      startDate: e.startDate,
      endDate: e.endDate,
      totalMarks: e.maxMarks,
      passingMarks: e.passingMarks,
      subjects: e.subjects.map(s => ({
        name: s.subject.name,
        code: s.subject.code,
        marks: s.maxMarks,
      })),
      result: e.results[0] || null,
      status: e.results.length > 0 ? (e.results[0].isPassed ? 'PASSED' : 'FAILED') : 'PENDING',
    }));
  }

  async getResults(userId: string) {
    const student = await this.resolve(userId);
    const results = await prisma.examResult.findMany({
      where: { studentId: student.id, marksObtained: { not: null } },
      include: {
        examination: true,
        subject: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const examMap = new Map<string, { name: string; type: string; results: any[] }>();
    for (const r of results) {
      const key = r.examinationId;
      if (!examMap.has(key)) examMap.set(key, { name: r.examination.name, type: r.examination.type, results: [] });
      examMap.get(key)!.results.push({
        subject: r.subject.name,
        code: r.subject.code,
        credits: r.subject.credits,
        marks: Number(r.marksObtained),
        totalMarks: r.examination.maxMarks,
        isPassed: r.isPassed,
        grade: r.grade,
      });
    }

    const exams = Array.from(examMap.entries()).map(([id, data]) => {
      const totalMarks = data.results.reduce((s, r) => s + r.marks, 0);
      const totalMax = data.results.reduce((s, r) => s + r.totalMarks, 0);
      const percentage = totalMax > 0 ? Math.round((totalMarks / totalMax) * 100) : 0;
      const passed = data.results.every(r => r.isPassed);
      return { id, ...data, totalMarks, totalMax, percentage, passed };
    });

    const totalCredits = results.reduce((s, r) => s + (r.subject.credits || 0), 0);
    const weightedSum = results.reduce((s, r) => {
      const marks = Number(r.marksObtained);
      const total = r.examination.maxMarks;
      const gradePoint = total > 0 ? (marks / total) * 10 : 0;
      return s + gradePoint * (r.subject.credits || 0);
    }, 0);
    const cgpa = totalCredits > 0 ? Math.round((weightedSum / totalCredits) * 100) / 100 : 0;

    return { exams, cgpa, totalCredits };
  }

  async getFees(userId: string) {
    const student = await this.resolve(userId);
    const payments = await prisma.feePayment.findMany({
      where: { studentId: student.id },
      include: {
        feeStructure: {
          select: {
            name: true,
            academicSession: { select: { name: true } },
            components: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let totalDue = 0;
    let totalPaid = 0;
    for (const p of payments) {
      totalDue += Number(p.dueAmount);
      totalPaid += Number(p.paidAmount);
    }

    return {
      totalDue,
      totalPaid,
      payments: payments.map(p => ({
        id: p.id,
        amount: Number(p.amount),
        paidAmount: Number(p.paidAmount),
        dueAmount: Number(p.dueAmount),
        status: p.status,
        paymentMethod: p.paymentMethod,
        receiptNumber: p.receiptNumber,
        paidAt: p.paidAt,
        dueDate: p.dueDate,
        lateFee: Number(p.lateFee || 0),
        feeName: p.feeStructure.name,
        session: p.feeStructure.academicSession?.name,
      })),
    };
  }

  async getLibrary(userId: string) {
    const student = await this.resolve(userId);
    const issues = await prisma.libraryIssue.findMany({
      where: { studentId: student.id },
      include: { book: { select: { title: true, author: true, isbn: true } } },
      orderBy: { issueDate: 'desc' },
    });

    return issues.map(i => ({
      id: i.id,
      bookTitle: i.book.title,
      author: i.book.author,
      isbn: i.book.isbn,
      issueDate: i.issueDate,
      dueDate: i.dueDate,
      returnDate: i.returnDate,
      fine: Number(i.fine || 0),
      status: i.status,
    }));
  }

  async getNotices(userId: string) {
    const notifications = await prisma.userNotification.findMany({
      where: { userId },
      include: { notification: true },
      orderBy: { notification: { createdAt: 'desc' } },
      take: 30,
    });
    return notifications.map(n => ({
      id: n.notification.id,
      title: n.notification.title,
      message: n.notification.message,
      type: n.notification.type,
      priority: n.notification.priority,
      isRead: n.isRead,
      createdAt: n.notification.createdAt,
    }));
  }

  async getCalendarEvents(userId: string) {
    const student = await this.resolve(userId);
    const now = new Date();

    const [exams, assignments] = await Promise.all([
      prisma.examination.findMany({
        where: { institutionId: student.institutionId, startDate: { gte: now } },
        select: { id: true, name: true, startDate: true, endDate: true, type: true },
        orderBy: { startDate: 'asc' }, take: 10,
      }),
      prisma.assignment.findMany({
        where: {
          subject: { courseId: student.courseId },
          isActive: true,
          dueDate: { gte: now },
        },
        select: { id: true, title: true, dueDate: true },
        orderBy: { dueDate: 'asc' }, take: 10,
      }),
    ]);

    const events: any[] = [];
    exams.forEach(e => events.push({ id: e.id, title: e.name, type: 'exam', date: e.startDate, endDate: e.endDate }));
    assignments.forEach(a => events.push({ id: a.id, title: a.title, type: 'assignment', date: a.dueDate }));
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return { events };
  }

  async getProfile(userId: string) {
    const student = await this.resolve(userId);
    const full = await prisma.student.findUnique({
      where: { id: student.id },
      include: {
        user: { select: { fullName: true, email: true, phone: true, firstName: true, lastName: true, avatar: true, dateOfBirth: true, gender: true } },
        course: { select: { name: true, code: true } },
        department: { select: { name: true } },
        academicSession: { select: { name: true } },
        parent: { include: { user: { select: { fullName: true, phone: true, email: true } } } },
        hostel: { select: { name: true } },
        transportRoute: { select: { name: true, code: true } },
      },
    });
    if (!full) throw new Error('Student not found');
    return {
      personal: {
        name: full.user.fullName,
        email: full.user.email,
        phone: full.user.phone,
        firstName: full.user.firstName,
        lastName: full.user.lastName,
        avatar: full.user.avatar,
        dateOfBirth: full.user.dateOfBirth,
        gender: full.user.gender,
        admissionNumber: full.admissionNumber,
        rollNumber: full.rollNumber,
        enrollmentDate: full.enrollmentDate,
        admissionType: full.admissionType,
        category: full.category,
        nationality: full.nationality,
      },
      academic: {
        course: full.course?.name,
        courseCode: full.course?.code,
        department: full.department?.name,
        session: full.academicSession?.name,
        isHostelStudent: full.isHostelStudent,
        usesTransport: full.usesTransport,
      },
      parent: full.parent ? {
        name: full.parent.user.fullName,
        phone: full.parent.user.phone,
        email: full.parent.user.email,
      } : null,
      hostel: full.hostel?.name || null,
      transport: full.transportRoute ? { name: full.transportRoute.name, code: full.transportRoute.code } : null,
    };
  }

  async getPerformance(userId: string) {
    const student = await this.resolve(userId);
    const subjectIds = (await prisma.subject.findMany({
      where: { courseId: student.courseId }, select: { id: true },
    })).map(s => s.id);

    const [results, attendance, submissions] = await Promise.all([
      prisma.examResult.findMany({
        where: { studentId: student.id, marksObtained: { not: null } },
        include: {
          examination: { select: { name: true, startDate: true } },
          subject: { select: { name: true, code: true, credits: true } },
        },
        orderBy: { examination: { startDate: 'asc' } },
      }),
      prisma.attendance.findMany({
        where: { studentId: subjectIds.length > 0 ? student.id : 'none' },
        select: { status: true, date: true },
      }),
      prisma.assignmentSubmission.findMany({
        where: { studentId: student.id },
        include: { assignment: { select: { title: true, totalMarks: true } } },
      }),
    ]);

    // Attendance trend (monthly)
    const attByMonth: Record<string, { present: number; total: number }> = {};
    for (const a of attendance) {
      const month = a.date.toISOString().slice(0, 7);
      if (!attByMonth[month]) attByMonth[month] = { present: 0, total: 0 };
      attByMonth[month].total++;
      if (a.status === 'PRESENT' || a.status === 'LATE') attByMonth[month].present++;
    }
    const attendanceTrend = Object.entries(attByMonth).map(([month, data]) => ({
      month,
      rate: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0,
    }));

    // Assignment completion
    const totalAssignments = submissions.length;
    const completed = submissions.filter(s => s.status === 'SUBMITTED' || s.status === 'GRADED').length;

    return {
      attendanceTrend,
      assignmentCompletion: { total: totalAssignments, completed, rate: totalAssignments > 0 ? Math.round((completed / totalAssignments) * 100) : 0 },
      resultsCount: results.length,
      subjectsCount: subjectIds.length,
    };
  }

  async getRequests(userId: string) {
    const student = await this.resolve(userId);
    const complaints = await prisma.complaint.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return complaints.map(c => ({
      id: c.id,
      title: c.title,
      description: c.description,
      category: c.category,
      status: c.status,
      createdAt: c.createdAt,
    }));
  }

  async getRecentActivity(userId: string, limit = 10) {
    return prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    }).then(logs => logs.map(a => ({
      id: a.id,
      action: `${a.action} on ${a.entity}`,
      entity: a.entity,
      createdAt: a.createdAt.toISOString(),
    })));
  }
}

export const studentAnalyticsService = new StudentAnalyticsService();
