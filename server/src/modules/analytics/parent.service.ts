import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ParentService {
  private static async resolveChildren(userId: string, institutionId: string) {
    const parent = await prisma.parent.findFirst({
      where: { userId, institutionId },
    });
    if (!parent) throw new Error('Parent record not found');

    const parentStudents = await prisma.parentStudent.findMany({
      where: { parentId: parent.id },
      include: {
        student: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, fullName: true, avatar: true, email: true, phone: true } },
            department: { select: { id: true, name: true, code: true } },
            course: { select: { id: true, name: true, code: true } },
          },
        },
      },
    });

    if (parentStudents.length > 0) {
      return parentStudents.map((ps) => ps.student);
    }

    const students = await prisma.student.findMany({
      where: { parentId: parent.id, institutionId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, fullName: true, avatar: true, email: true, phone: true } },
        department: { select: { id: true, name: true, code: true } },
        course: { select: { id: true, name: true, code: true } },
      },
    });

    return students;
  }

  private static async resolveStudent(userId: string, institutionId: string, studentId?: string) {
    const children = await this.resolveChildren(userId, institutionId);
    if (children.length === 0) throw new Error('No children found for this parent');

    if (studentId) {
      const child = children.find((c) => c.id === studentId);
      if (!child) throw new Error('Student not found among your children');
      return child;
    }

    return children[0];
  }

  private static async getSubjectIdsForCourse(courseId: string): Promise<string[]> {
    const subjects = await prisma.subject.findMany({
      where: { courseId, isActive: true },
      select: { id: true },
    });
    return subjects.map((s) => s.id);
  }

  static async getParentChildren(userId: string, institutionId: string) {
    return this.resolveChildren(userId, institutionId);
  }

  static async getDashboard(userId: string, institutionId: string, childId?: string) {
    const student = await this.resolveStudent(userId, institutionId, childId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const fourteenDaysLater = new Date(today);
    fourteenDaysLater.setDate(fourteenDaysLater.getDate() + 14);
    const subjectIds = await this.getSubjectIdsForCourse(student.courseId);

    const dayNum = today.getDay();

    const [
      todayAttendanceRecords,
      todayDailyRecords,
      totalAttendanceRecords,
      presentRecords,
      totalDailyRecords,
      presentDailyRecords,
      pendingAssignments,
      upcomingExams,
      feeDue,
      examResults,
      newNotices,
      teacherNotifications,
      todaySchedule,
      recentNotices,
    ] = await Promise.all([
      prisma.attendance.findMany({
        where: { studentId: student.id, date: { gte: today, lt: tomorrow } },
      }),
      prisma.dailyAttendance.findMany({
        where: { studentId: student.id, date: { gte: today, lt: tomorrow } },
      }),
      prisma.attendance.count({ where: { studentId: student.id } }),
      prisma.attendance.count({ where: { studentId: student.id, status: 'PRESENT' } }),
      prisma.dailyAttendance.count({ where: { studentId: student.id } }),
      prisma.dailyAttendance.count({ where: { studentId: student.id, status: 'PRESENT' } }),
      prisma.assignmentSubmission.count({
        where: {
          studentId: student.id,
          status: 'submitted',
          assignment: { subjectId: { in: subjectIds }, isActive: true },
        },
      }),
      prisma.examination.findMany({
        where: {
          institutionId,
          startDate: { gte: today, lte: fourteenDaysLater },
          subjects: { some: { subjectId: { in: subjectIds } } },
        },
        include: { subjects: { include: { subject: { select: { name: true } } } } },
        orderBy: { startDate: 'asc' },
      }),
      prisma.feePayment.aggregate({
        where: { studentId: student.id, status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] } },
        _sum: { dueAmount: true },
      }),
      prisma.examResult.findMany({
        where: { studentId: student.id, marksObtained: { not: null } },
        include: {
          subject: { select: { credits: true } },
          examination: { select: { maxMarks: true } },
        },
      }),
      prisma.userNotification.count({
        where: { userId, isRead: false },
      }),
      prisma.userNotification.findMany({
        where: { userId, isRead: false },
        include: { notification: { select: { title: true, type: true, priority: true, createdAt: true } } },
        orderBy: { notification: { createdAt: 'desc' } },
        take: 5,
      }),
      prisma.timetableEntry.findMany({
        where: {
          timetable: { institutionId, departmentId: student.departmentId, dayOfWeek: dayNum },
          courseId: student.courseId,
        },
        include: {
          subject: { select: { name: true, code: true } },
          employee: { include: { user: { select: { fullName: true } } } },
        },
        orderBy: { startTime: 'asc' },
      }),
      prisma.announcement.findMany({
        where: { institutionId, isPublished: true },
        include: { author: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const todayPresentCount = todayAttendanceRecords.filter(
      (r) => r.status === 'PRESENT' || r.status === 'LATE'
    ).length + todayDailyRecords.filter(
      (r) => r.status === 'PRESENT' || r.status === 'LATE'
    ).length;
    const todayTotalCount = todayAttendanceRecords.length + todayDailyRecords.length;

    const totalAll = totalAttendanceRecords + totalDailyRecords;
    const presentAll = presentRecords + presentDailyRecords;
    const overallAttendance =
      totalAll > 0
        ? Math.round((presentAll / totalAll) * 100)
        : 0;

    let cgpa = 0;
    if (examResults.length > 0) {
      const totalCredits = examResults.reduce((s, r) => s + (r.subject.credits || 0), 0);
      const weightedSum = examResults.reduce((s, r) => {
        const marks = Number(r.marksObtained);
        const total = r.examination.maxMarks;
        const gradePoint = total > 0 ? (marks / total) * 10 : 0;
        return s + gradePoint * (r.subject.credits || 0);
      }, 0);
      cgpa = totalCredits > 0 ? Math.round((weightedSum / totalCredits) * 100) / 100 : 0;
    }

    const alerts: string[] = [];

    if (todayTotalCount > 0 && todayPresentCount < todayTotalCount) {
      const absentCount = todayTotalCount - todayPresentCount;
      alerts.push(`Your child was absent for ${absentCount} period(s) today`);
    }

    if (overallAttendance < 75 && totalAttendanceRecords > 0) {
      alerts.push(`Overall attendance is ${overallAttendance}%, which is below 75%`);
    }

    const pendingAssignmentCount = subjectIds.length > 0
      ? await prisma.assignment.count({
          where: { subjectId: { in: subjectIds }, isActive: true },
        }) - pendingAssignments
      : 0;

    if (pendingAssignmentCount > 0) {
      alerts.push(`${pendingAssignmentCount} assignment(s) pending submission`);
    }

    const pendingFee = Number(feeDue._sum.dueAmount) || 0;
    if (pendingFee > 0) {
      alerts.push(`₹${pendingFee} fee payment pending`);
    }

    if (upcomingExams.length > 0) {
      alerts.push(`${upcomingExams.length} exam(s) approaching in the next 14 days`);
    }

    return {
      summary: {
        todayAttendance: { present: todayPresentCount, total: todayTotalCount },
        overallAttendance,
        pendingAssignments: pendingAssignmentCount,
        upcomingExams: upcomingExams.length,
        feeDue: pendingFee,
        cgpa,
        newNotices,
        teacherMessages: teacherNotifications.length,
      },
      todaySchedule,
      recentNotices,
      alerts,
      childInfo: {
        id: student.id,
        name: student.user.fullName,
        photo: student.user.avatar,
        admissionNumber: student.admissionNumber,
        rollNumber: student.rollNumber,
        course: student.course?.name,
        department: student.department?.name,
        class: student.course?.code,
      },
    };
  }

  static async getAttendance(userId: string, institutionId: string, studentId?: string) {
    const student = await this.resolveStudent(userId, institutionId, studentId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

    const subjectIds = await this.getSubjectIdsForCourse(student.courseId);

    const [todayRecords, monthlyRecords, allRecords, todayDaily, monthlyDaily, allDaily] = await Promise.all([
      prisma.attendance.findMany({
        where: {
          studentId: student.id,
          date: { gte: today, lt: tomorrow },
          subjectId: { in: subjectIds },
        },
        include: { subject: { select: { name: true, code: true } } },
      }),
      prisma.attendance.findMany({
        where: {
          studentId: student.id,
          date: { gte: monthStart, lte: monthEnd },
        },
      }),
      prisma.attendance.findMany({
        where: {
          studentId: student.id,
          date: { gte: thirtyDaysAgo },
        },
        include: { subject: { select: { name: true, code: true } } },
        orderBy: { date: 'desc' },
        take: 10,
      }),
      prisma.dailyAttendance.findMany({
        where: { studentId: student.id, date: { gte: today, lt: tomorrow } },
        include: { class: { select: { name: true, code: true } } },
      }),
      prisma.dailyAttendance.findMany({
        where: { studentId: student.id, date: { gte: monthStart, lte: monthEnd } },
      }),
      prisma.dailyAttendance.findMany({
        where: { studentId: student.id, date: { gte: thirtyDaysAgo } },
        include: { class: { select: { name: true, code: true } } },
        orderBy: { date: 'desc' },
        take: 10,
      }),
    ]);

    const todayAllRecords = [...todayRecords, ...todayDaily];
    let todayStatus = 'NO_RECORD';
    if (todayAllRecords.length > 0) {
      const statuses = todayAllRecords.map((r) => r.status);
      if (statuses.includes('PRESENT')) todayStatus = 'PRESENT';
      else if (statuses.includes('LATE')) todayStatus = 'LATE';
      else if (statuses.includes('EXCUSED')) todayStatus = 'EXCUSED';
      else if (statuses.includes('ABSENT')) todayStatus = 'ABSENT';
    }

    const monthlyStats = {
      present: monthlyRecords.filter((r) => r.status === 'PRESENT').length + monthlyDaily.filter((r) => r.status === 'PRESENT').length,
      absent: monthlyRecords.filter((r) => r.status === 'ABSENT').length + monthlyDaily.filter((r) => r.status === 'ABSENT').length,
      late: monthlyRecords.filter((r) => r.status === 'LATE').length + monthlyDaily.filter((r) => r.status === 'LATE').length,
      excused: monthlyRecords.filter((r) => r.status === 'EXCUSED').length + monthlyDaily.filter((r) => r.status === 'EXCUSED').length,
      total: monthlyRecords.length + monthlyDaily.length,
    };

    const subjectMap = new Map<string, { subject: string; present: number; total: number }>();
    // Include subject-level attendance
    for (const r of allRecords) {
      const key = r.subjectId;
      if (!subjectMap.has(key)) subjectMap.set(key, { subject: r.subject.name, present: 0, total: 0 });
      const s = subjectMap.get(key)!;
      s.total++;
      if (r.status === 'PRESENT' || r.status === 'LATE') s.present++;
    }
    // Include coordinator daily attendance
    for (const r of allDaily) {
      const key = `daily-${r.classId}`;
      if (!subjectMap.has(key)) subjectMap.set(key, { subject: r.class.name, present: 0, total: 0 });
      const s = subjectMap.get(key)!;
      s.total++;
      if (r.status === 'PRESENT' || r.status === 'LATE') s.present++;
    }

    const subjectWise = Array.from(subjectMap.entries()).map(([id, data]) => ({
      subjectId: id,
      subject: data.subject,
      present: data.present,
      total: data.total,
      percentage: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0,
    }));

    const allMerged = [...allRecords, ...allDaily];
    const calendar: { date: string; status: string }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayRecords = allMerged.filter(
        (r) => r.date.toISOString().split('T')[0] === dateStr
      );
      if (dayRecords.length > 0) {
        const statuses = dayRecords.map((r) => r.status);
        let dayStatus = 'ABSENT';
        if (statuses.includes('PRESENT')) dayStatus = 'PRESENT';
        else if (statuses.includes('LATE')) dayStatus = 'LATE';
        else if (statuses.includes('EXCUSED')) dayStatus = 'EXCUSED';
        calendar.push({ date: dateStr, status: dayStatus });
      } else {
        const dayOfWeek = d.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          calendar.push({ date: dateStr, status: 'NO_RECORD' });
        }
      }
    }

    return {
      todayStatus,
      monthlyStats,
      subjectWise,
      recentAttendance: allMerged.map((r) => ({
        id: r.id,
        date: r.date,
        status: r.status,
        subject: (r as any).subject?.name || (r as any).class?.name || 'Unknown',
        subjectCode: (r as any).subject?.code || (r as any).class?.code || '',
        remarks: r.remarks,
      })),
      calendar,
    };
  }

  static async getTimetable(userId: string, institutionId: string, studentId?: string) {
    const student = await this.resolveStudent(userId, institutionId, studentId);

    const entries = await prisma.timetableEntry.findMany({
      where: {
        timetable: { institutionId, departmentId: student.departmentId },
        courseId: student.courseId,
      },
      include: {
        subject: { select: { name: true, code: true, credits: true } },
        employee: { include: { user: { select: { fullName: true } } } },
        timetable: { select: { dayOfWeek: true, name: true } },
      },
      orderBy: { startTime: 'asc' },
    });

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const grouped: Record<string, any[]> = {};

    for (const dayNum of [1, 2, 3, 4, 5, 6, 0]) {
      grouped[dayNames[dayNum]] = [];
    }

    for (const entry of entries) {
      const dayName = dayNames[entry.timetable.dayOfWeek];
      grouped[dayName].push({
        id: entry.id,
        subject: entry.subject.name,
        subjectCode: entry.subject.code,
        credits: entry.subject.credits,
        teacher: entry.employee.user.fullName,
        room: entry.room,
        startTime: entry.startTime,
        endTime: entry.endTime,
        type: entry.type,
      });
    }

    return {
      student: {
        id: student.id,
        name: student.user.fullName,
        course: student.course?.name,
        department: student.department?.name,
      },
      timetable: grouped,
    };
  }

  static async getPerformance(userId: string, institutionId: string, studentId?: string) {
    const student = await this.resolveStudent(userId, institutionId, studentId);
    const subjectIds = await this.getSubjectIdsForCourse(student.courseId);

    const results = await prisma.examResult.findMany({
      where: {
        studentId: student.id,
        marksObtained: { not: null },
        subjectId: { in: subjectIds },
      },
      include: {
        subject: { select: { name: true, code: true, credits: true } },
        examination: { select: { name: true, type: true, maxMarks: true, startDate: true } },
      },
      orderBy: { examination: { startDate: 'desc' } },
    });

    const subjectMap = new Map<
      string,
      { subject: string; code: string; marks: number; totalMarks: number; grade: string | null }
    >();
    for (const r of results) {
      const key = r.subjectId;
      if (!subjectMap.has(key)) {
        subjectMap.set(key, {
          subject: r.subject.name,
          code: r.subject.code,
          marks: 0,
          totalMarks: 0,
          grade: r.grade,
        });
      }
      const s = subjectMap.get(key)!;
      s.marks += Number(r.marksObtained);
      s.totalMarks += r.examination.maxMarks;
      if (r.grade) s.grade = r.grade;
    }

    const subjectWise = Array.from(subjectMap.entries()).map(([id, data]) => ({
      subjectId: id,
      subject: data.subject,
      code: data.code,
      marks: data.marks,
      totalMarks: data.totalMarks,
      percentage: data.totalMarks > 0 ? Math.round((data.marks / data.totalMarks) * 100) : 0,
      grade: data.grade,
    }));

    const examGroups = new Map<string, { name: string; type: string; results: any[]; semester: string }>();
    for (const r of results) {
      const key = r.examinationId;
      if (!examGroups.has(key)) {
        const examDate = r.examination.startDate;
        const month = examDate.getMonth();
        const year = examDate.getFullYear();
        const semester = month < 6 ? `S2 ${year}` : `S1 ${year}`;
        examGroups.set(key, {
          name: r.examination.name,
          type: r.examination.type,
          results: [],
          semester,
        });
      }
      examGroups.get(key)!.results.push({
        subject: r.subject.name,
        marks: Number(r.marksObtained),
        totalMarks: r.examination.maxMarks,
        grade: r.grade,
        gradePoints: r.gradePoints ? Number(r.gradePoints) : null,
      });
    }

    const trend: { semester: string; gpa: number }[] = [];
    const semesterMap = new Map<string, { totalGradePoints: number; totalCredits: number }>();
    for (const r of results) {
      const examDate = r.examination.startDate;
      const month = examDate.getMonth();
      const year = examDate.getFullYear();
      const semester = month < 6 ? `S2 ${year}` : `S1 ${year}`;
      if (!semesterMap.has(semester)) semesterMap.set(semester, { totalGradePoints: 0, totalCredits: 0 });
      const s = semesterMap.get(semester)!;
      if (r.gradePoints) {
        s.totalGradePoints += Number(r.gradePoints) * (r.subject.credits || 1);
        s.totalCredits += r.subject.credits || 1;
      }
    }
    for (const [semester, data] of semesterMap) {
      const gpa = data.totalCredits > 0 ? Math.round((data.totalGradePoints / data.totalCredits) * 100) / 100 : 0;
      trend.push({ semester, gpa });
    }
    trend.sort((a, b) => a.semester.localeCompare(b.semester));

    const overallCGPA =
      trend.length > 0
        ? Math.round((trend.reduce((s, t) => s + t.gpa, 0) / trend.length) * 100) / 100
        : 0;

    const semesterGPA = trend.length > 0 ? trend[trend.length - 1].gpa : 0;

    const teacherRemarks = results
      .filter((r) => r.remarks)
      .slice(0, 10)
      .map((r) => ({
        subject: r.subject.name,
        examName: r.examination.name,
        remark: r.remarks,
        date: r.examination.startDate,
      }));

    return {
      subjectWise,
      semesterGPA,
      overallCGPA,
      trend,
      teacherRemarks,
    };
  }

  static async getAssignments(userId: string, institutionId: string, studentId?: string) {
    const student = await this.resolveStudent(userId, institutionId, studentId);
    const subjectIds = await this.getSubjectIdsForCourse(student.courseId);

    const assignments = await prisma.assignment.findMany({
      where: { subjectId: { in: subjectIds }, isActive: true },
      include: {
        subject: { select: { name: true, code: true } },
        submissions: {
          where: { studentId: student.id },
          select: { id: true, status: true, marksObtained: true, feedback: true, submittedAt: true, gradedAt: true },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    const now = new Date();

    return assignments.map((a) => {
      const submission = a.submissions[0] || null;
      const isOverdue = !submission && new Date(a.dueDate) < now;
      return {
        id: a.id,
        title: a.title,
        description: a.description,
        totalMarks: a.totalMarks,
        dueDate: a.dueDate,
        subject: a.subject.name,
        subjectCode: a.subject.code,
        status: submission ? submission.status : isOverdue ? 'overdue' : 'pending',
        submission: submission
          ? {
              id: submission.id,
              marksObtained: submission.marksObtained,
              feedback: submission.feedback,
              submittedAt: submission.submittedAt,
              gradedAt: submission.gradedAt,
            }
          : null,
      };
    });
  }

  static async getExams(userId: string, institutionId: string, studentId?: string) {
    const student = await this.resolveStudent(userId, institutionId, studentId);
    const subjectIds = await this.getSubjectIdsForCourse(student.courseId);
    const now = new Date();

    const [upcomingExams, pastExams] = await Promise.all([
      prisma.examination.findMany({
        where: {
          institutionId,
          startDate: { gte: now },
          subjects: { some: { subjectId: { in: subjectIds } } },
        },
        include: {
          subjects: {
            include: { subject: { select: { name: true, code: true } } },
          },
        },
        orderBy: { startDate: 'asc' },
      }),
      prisma.examination.findMany({
        where: {
          institutionId,
          endDate: { lt: now },
          subjects: { some: { subjectId: { in: subjectIds } } },
        },
        include: {
          subjects: { include: { subject: { select: { name: true, code: true } } } },
          results: {
            where: { studentId: student.id },
            select: { marksObtained: true, grade: true, isPassed: true, remarks: true },
          },
        },
        orderBy: { startDate: 'desc' },
      }),
    ]);

    const internalMarks = await prisma.examResult.findMany({
      where: {
        studentId: student.id,
        subjectId: { in: subjectIds },
        examination: { type: 'INTERNAL' },
      },
      include: {
        subject: { select: { name: true, code: true } },
        examination: { select: { name: true, maxMarks: true } },
      },
    });

    return {
      upcoming: upcomingExams.map((e) => ({
        id: e.id,
        name: e.name,
        type: e.type,
        startDate: e.startDate,
        endDate: e.endDate,
        maxMarks: e.maxMarks,
        passingMarks: e.passingMarks,
        subjects: e.subjects.map((s) => ({
          name: s.subject.name,
          code: s.subject.code,
          examDate: s.examDate,
          maxMarks: s.maxMarks,
          startTime: s.startTime,
          endTime: s.endTime,
          room: s.room,
        })),
      })),
      results: pastExams.map((e) => ({
        id: e.id,
        name: e.name,
        type: e.type,
        startDate: e.startDate,
        endDate: e.endDate,
        maxMarks: e.maxMarks,
        subjects: e.subjects.map((s) => ({
          name: s.subject.name,
          code: s.subject.code,
          maxMarks: s.maxMarks,
        })),
        result: e.results[0] || null,
      })),
      internalMarks: internalMarks.map((r) => ({
        subject: r.subject.name,
        subjectCode: r.subject.code,
        examName: r.examination.name,
        marksObtained: r.marksObtained ? Number(r.marksObtained) : null,
        totalMarks: r.examination.maxMarks,
        grade: r.grade,
        remarks: r.remarks,
      })),
    };
  }

  static async getFees(userId: string, institutionId: string, studentId?: string) {
    const student = await this.resolveStudent(userId, institutionId, studentId);

    const payments = await prisma.feePayment.findMany({
      where: { studentId: student.id },
      include: {
        feeStructure: {
          select: {
            name: true,
            totalAmount: true,
            academicSession: { select: { name: true } },
            components: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let totalPaid = 0;
    let totalPending = 0;
    let totalDue = 0;

    for (const p of payments) {
      const paid = Number(p.paidAmount);
      const due = Number(p.dueAmount);
      totalPaid += paid;
      if (p.status === 'PENDING' || p.status === 'PARTIAL' || p.status === 'OVERDUE') {
        totalPending += due;
      }
      totalDue += Number(p.amount);
    }

    const structureMap = new Map<string, { name: string; totalAmount: number; session: string; components: any[] }>();
    for (const p of payments) {
      const key = p.feeStructureId;
      if (!structureMap.has(key)) {
        structureMap.set(key, {
          name: p.feeStructure.name,
          totalAmount: Number(p.feeStructure.totalAmount),
          session: p.feeStructure.academicSession?.name || '',
          components: p.feeStructure.components.map((c) => ({
            name: c.name,
            amount: Number(c.amount),
            type: c.type,
          })),
        });
      }
    }

    return {
      structure: Array.from(structureMap.values()),
      payments: payments.map((p) => ({
        id: p.id,
        amount: Number(p.amount),
        paidAmount: Number(p.paidAmount),
        dueAmount: Number(p.dueAmount),
        status: p.status,
        paymentMethod: p.paymentMethod,
        receiptNumber: p.receiptNumber,
        transactionId: p.transactionId,
        paidAt: p.paidAt,
        dueDate: p.dueDate,
        lateFee: Number(p.lateFee || 0),
        feeName: p.feeStructure.name,
        session: p.feeStructure.academicSession?.name,
      })),
      dues: payments
        .filter((p) => p.status === 'PENDING' || p.status === 'PARTIAL' || p.status === 'OVERDUE')
        .map((p) => ({
          id: p.id,
          feeName: p.feeStructure.name,
          amount: Number(p.amount),
          dueAmount: Number(p.dueAmount),
          dueDate: p.dueDate,
          status: p.status,
          isOverdue: p.dueDate ? new Date(p.dueDate) < new Date() : false,
        })),
      totalPaid,
      totalPending,
      totalDue,
    };
  }

  static async getTransport(userId: string, institutionId: string, studentId?: string) {
    const student = await this.resolveStudent(userId, institutionId, studentId);

    if (!student.usesTransport || !student.transportRouteId) {
      return { isTransportStudent: false, route: null, vehicle: null, feeStatus: null };
    }

    const route = await prisma.route.findUnique({
      where: { id: student.transportRouteId },
      include: {
        stops: { orderBy: { sequence: 'asc' } },
        vehicles: {
          include: {
            vehicle: {
              select: {
                id: true,
                registrationNumber: true,
                type: true,
                model: true,
                manufacturer: true,
                color: true,
                capacity: true,
                status: true,
              },
            },
          },
        },
        manager: { include: { user: { select: { fullName: true, phone: true } } } },
      },
    });

    if (!route) {
      return { isTransportStudent: true, route: null, vehicle: null, feeStatus: null };
    }

    const vehicleRoutes = route.vehicles.map((vr) => ({
      vehicle: vr.vehicle,
      shift: vr.shift,
      departureTime: vr.departureTime,
      arrivalTime: vr.arrivalTime,
    }));

    const driverInfo =
      vehicleRoutes.length > 0 && vehicleRoutes[0].vehicle
        ? await prisma.vehicle.findUnique({
            where: { id: vehicleRoutes[0].vehicle.id },
            include: { driver: { include: { user: { select: { fullName: true, phone: true } } } } },
          })
        : null;

    const transportFee = await prisma.feePayment.findFirst({
      where: {
        studentId: student.id,
        feeStructure: { components: { some: { type: 'transport' } } },
      },
      select: { status: true, amount: true, paidAmount: true, dueAmount: true },
    });

    return {
      isTransportStudent: true,
      route: {
        id: route.id,
        name: route.name,
        code: route.code,
        stops: route.stops.map((s) => ({
          name: s.name,
          address: s.address,
          sequence: s.sequence,
          estimatedTime: s.estimatedTime,
        })),
        manager: route.manager?.user?.fullName || null,
      },
      vehicle: vehicleRoutes.map((vr) => ({
        registrationNumber: vr.vehicle?.registrationNumber,
        type: vr.vehicle?.type,
        model: vr.vehicle?.model,
        color: vr.vehicle?.color,
        shift: vr.shift,
        departureTime: vr.departureTime,
        arrivalTime: vr.arrivalTime,
      })),
      driver: driverInfo?.driver
        ? { name: driverInfo.driver.user.fullName, phone: driverInfo.driver.user.phone }
        : null,
      feeStatus: transportFee
        ? {
            status: transportFee.status,
            amount: Number(transportFee.amount),
            paidAmount: Number(transportFee.paidAmount),
            dueAmount: Number(transportFee.dueAmount),
          }
        : null,
    };
  }

  static async getHostel(userId: string, institutionId: string, studentId?: string) {
    const student = await this.resolveStudent(userId, institutionId, studentId);

    if (!student.isHostelStudent || !student.hostelId) {
      return { isHostelStudent: false, hostel: null, feeStatus: null };
    }

    const hostel = await prisma.hostel.findUnique({
      where: { id: student.hostelId },
      include: {
        rooms: {
          where: { isActive: true },
          select: { roomNumber: true, floor: true, type: true, capacity: true, occupied: true },
        },
        warden: { include: { user: { select: { fullName: true, phone: true, email: true } } } },
      },
    });

    if (!hostel) {
      return { isHostelStudent: true, hostel: null, feeStatus: null };
    }

    const room = hostel.rooms[0] || null;

    const hostelFee = await prisma.feePayment.findFirst({
      where: {
        studentId: student.id,
        feeStructure: { components: { some: { type: 'hostel' } } },
      },
      select: { status: true, amount: true, paidAmount: true, dueAmount: true },
    });

    return {
      isHostelStudent: true,
      hostel: {
        id: hostel.id,
        name: hostel.name,
        type: hostel.type,
        room: room
          ? { roomNumber: room.roomNumber, floor: room.floor, type: room.type, capacity: room.capacity }
          : null,
        warden: hostel.warden
          ? {
              name: hostel.warden.user.fullName,
              phone: hostel.warden.user.phone,
              email: hostel.warden.user.email,
            }
          : null,
        phone: hostel.phone,
        address: hostel.address,
      },
      feeStatus: hostelFee
        ? {
            status: hostelFee.status,
            amount: Number(hostelFee.amount),
            paidAmount: Number(hostelFee.paidAmount),
            dueAmount: Number(hostelFee.dueAmount),
          }
        : null,
    };
  }

  static async createMaintenanceRequest(
    userId: string,
    institutionId: string,
    studentId: string | undefined,
    data: { title: string; description: string; priority: string }
  ) {
    const student = await this.resolveStudent(userId, institutionId, studentId);
    const parent = await prisma.parent.findFirst({ where: { userId, institutionId } });

    return prisma.helpdeskTicket.create({
      data: {
        institutionId,
        creatorId: userId,
        title: data.title,
        description: `[Hostel Maintenance] Student: ${student.user.fullName}\n\n${data.description}`,
        category: 'hostel',
        priority: (data.priority as any) || 'NORMAL',
        status: 'OPEN',
      },
    });
  }

  static async getLibrary(userId: string, institutionId: string, studentId?: string) {
    const student = await this.resolveStudent(userId, institutionId, studentId);

    const issues = await prisma.libraryIssue.findMany({
      where: { studentId: student.id },
      include: {
        book: {
          select: { title: true, author: true, isbn: true, category: true, publisher: true },
        },
      },
      orderBy: { issueDate: 'desc' },
    });

    const currentlyIssued = issues.filter((i) => i.status === 'issued' || i.status === 'overdue');
    const returnedBooks = issues.filter((i) => i.status === 'returned');
    const totalFines = issues.reduce((sum, i) => sum + Number(i.fine || 0), 0);
    const pendingFines = issues
      .filter((i) => !i.finePaid && Number(i.fine || 0) > 0)
      .reduce((sum, i) => sum + Number(i.fine || 0), 0);

    return {
      currentlyIssued: currentlyIssued.map((i) => ({
        id: i.id,
        title: i.book.title,
        author: i.book.author,
        isbn: i.book.isbn,
        category: i.book.category,
        issueDate: i.issueDate,
        dueDate: i.dueDate,
        isOverdue: i.dueDate < new Date(),
        fine: Number(i.fine || 0),
      })),
      readingHistory: returnedBooks.map((i) => ({
        id: i.id,
        title: i.book.title,
        author: i.book.author,
        issueDate: i.issueDate,
        returnDate: i.returnDate,
        fine: Number(i.fine || 0),
        finePaid: i.finePaid,
      })),
      stats: {
        totalIssued: issues.length,
        currentlyIssued: currentlyIssued.length,
        returned: returnedBooks.length,
        totalFines,
        pendingFines,
      },
    };
  }

  static async getNotices(userId: string, institutionId: string) {
    const notices = await prisma.announcement.findMany({
      where: { institutionId, isPublished: true },
      include: { author: { select: { firstName: true, lastName: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return notices.map((n) => ({
      id: n.id,
      title: n.title,
      content: n.content,
      type: n.type,
      priority: n.priority,
      target: n.target,
      author: `${n.author.firstName} ${n.author.lastName}`,
      authorRole: n.author.role,
      publishedAt: n.publishedAt,
      expiresAt: n.expiresAt,
      attachments: n.attachments,
      createdAt: n.createdAt,
    }));
  }

  static async getPTM(userId: string, institutionId: string) {
    const meetings = await prisma.meeting.findMany({
      where: { institutionId, type: 'PARENT' },
      orderBy: { meetingDate: 'desc' },
    });

    const now = new Date();

    return {
      upcomingPTMs: meetings
        .filter((m) => new Date(m.meetingDate) >= now && m.status === 'SCHEDULED')
        .map((m) => ({
          id: m.id,
          title: m.title,
          description: m.description,
          date: m.meetingDate,
          time: m.startTime ? `${new Date(m.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}${m.endTime ? ' - ' + new Date(m.endTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}` : '',
          location: m.location,
          status: m.status,
          teacherName: (m.attendees as any)?.teacherName || '—',
          subject: m.title,
        })),
      pastPTMs: meetings
        .filter((m) => new Date(m.meetingDate) < now || m.status === 'COMPLETED')
        .map((m) => ({
          id: m.id,
          title: m.title,
          description: m.description,
          date: m.meetingDate,
          time: m.startTime ? `${new Date(m.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}${m.endTime ? ' - ' + new Date(m.endTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}` : '',
          location: m.location,
          status: m.status,
          summary: m.minutes,
          teacherName: (m.attendees as any)?.teacherName || '—',
          subject: m.title,
        })),
    };
  }

  static async requestPTM(userId: string, institutionId: string, data: { subject: string; reason: string; preferredDate: string }) {
    const parent = await prisma.parent.findFirst({ where: { userId, institutionId } });
    if (!parent) throw new Error('Parent record not found');

    const meetingDate = new Date(data.preferredDate);
    meetingDate.setHours(10, 0, 0, 0);

    return prisma.meeting.create({
      data: {
        institutionId,
        organizerId: userId,
        title: data.subject,
        description: data.reason,
        type: 'PARENT',
        meetingDate,
        startTime: meetingDate,
        status: 'SCHEDULED',
        attendees: { parentId: parent.id, requestType: 'PTM_REQUEST' },
      },
    });
  }

  static async getLeaveRequests(userId: string, institutionId: string, studentId?: string) {
    const student = await this.resolveStudent(userId, institutionId, studentId);

    const requests = await prisma.studentRequest.findMany({
      where: { studentId: student.id, type: 'LEAVE_DOCUMENT' },
      orderBy: { createdAt: 'desc' },
    });

    return requests.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      status: r.status,
      priority: r.priority,
      reviewerComments: r.reviewerComments,
      requestDate: r.requestDate,
      resolvedDate: r.resolvedDate,
      createdAt: r.createdAt,
    }));
  }

  static async createLeaveRequest(
    userId: string,
    institutionId: string,
    studentId: string,
    data: { startDate: Date; endDate: Date; reason: string; totalDays: number }
  ) {
    const student = await this.resolveStudent(userId, institutionId, studentId);

    return prisma.studentRequest.create({
      data: {
        institutionId,
        studentId: student.id,
        type: 'LEAVE_DOCUMENT',
        title: `Leave Request - ${data.totalDays} day(s)`,
        description: `From ${new Date(data.startDate).toLocaleDateString()} to ${new Date(data.endDate).toLocaleDateString()}\n\nReason: ${data.reason}`,
        status: 'SUBMITTED',
        priority: 'NORMAL',
      },
    });
  }

  static async getComplaints(userId: string, institutionId: string, studentId?: string) {
    const student = await this.resolveStudent(userId, institutionId, studentId);

    const complaints = await prisma.complaint.findMany({
      where: { studentId: student.id },
      include: {
        ticket: {
          include: {
            creator: { select: { firstName: true, lastName: true } },
            assignee: { select: { firstName: true, lastName: true } },
            comments: {
              include: { user: { select: { firstName: true, lastName: true } } },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return complaints.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      category: c.category,
      status: c.status,
      resolvedAt: c.resolvedAt,
      createdAt: c.createdAt,
      ticket: c.ticket
        ? {
            id: c.ticket.id,
            status: c.ticket.status,
            priority: c.ticket.priority,
            assignee: c.ticket.assignee
              ? `${c.ticket.assignee.firstName} ${c.ticket.assignee.lastName}`
              : null,
            comments: c.ticket.comments.map((cm) => ({
              content: cm.content,
              author: `${cm.user.firstName} ${cm.user.lastName}`,
              createdAt: cm.createdAt,
            })),
          }
        : null,
    }));
  }

  static async raiseComplaint(
    userId: string,
    institutionId: string,
    studentId: string,
    data: { title: string; description: string; category: string; priority?: string }
  ) {
    const student = await this.resolveStudent(userId, institutionId, studentId);

    const ticket = await prisma.helpdeskTicket.create({
      data: {
        institutionId,
        creatorId: userId,
        title: data.title,
        description: data.description,
        category: data.category,
        priority: (data.priority as any) || 'NORMAL',
        status: 'OPEN',
      },
    });

    const complaint = await prisma.complaint.create({
      data: {
        studentId: student.id,
        ticketId: ticket.id,
        title: data.title,
        description: data.description,
        category: data.category,
        status: 'open',
      },
    });

    return { ticket, complaint };
  }

  static async getDocuments(userId: string, institutionId: string, studentId?: string) {
    const student = await this.resolveStudent(userId, institutionId, studentId);

    const [documents, certificates] = await Promise.all([
      prisma.document.findMany({
        where: {
          institutionId,
          entityType: 'student',
          entityId: student.id,
        },
        include: { uploader: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.certificate.findMany({
        where: { studentId: student.id },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      documents: documents.map((d) => ({
        id: d.id,
        name: d.name,
        originalName: d.originalName,
        mimeType: d.mimeType,
        size: d.size,
        url: d.url,
        category: d.category,
        uploadedBy: `${d.uploader.firstName} ${d.uploader.lastName}`,
        createdAt: d.createdAt,
      })),
      certificates: certificates.map((c) => ({
        id: c.id,
        type: c.type,
        title: c.title,
        status: c.status,
        requestDate: c.requestDate,
        issuedDate: c.issuedDate,
        purpose: c.purpose,
        remarks: c.remarks,
        createdAt: c.createdAt,
      })),
    };
  }

  static async getActivityTimeline(userId: string, institutionId: string, studentId?: string) {
    const student = await this.resolveStudent(userId, institutionId, studentId);
    const subjectIds = await this.getSubjectIdsForCourse(student.courseId);

    const [attendanceRecords, submissions, examResults, feePayments, complaints] =
      await Promise.all([
        prisma.attendance.findMany({
          where: { studentId: student.id },
          include: { subject: { select: { name: true } } },
          orderBy: { date: 'desc' },
          take: 15,
        }),
        prisma.assignmentSubmission.findMany({
          where: { studentId: student.id },
          include: {
            assignment: { select: { title: true, totalMarks: true } },
          },
          orderBy: { submittedAt: 'desc' },
          take: 10,
        }),
        prisma.examResult.findMany({
          where: { studentId: student.id, marksObtained: { not: null } },
          include: {
            subject: { select: { name: true } },
            examination: { select: { name: true, type: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }),
        prisma.feePayment.findMany({
          where: { studentId: student.id, status: 'PAID' },
          include: { feeStructure: { select: { name: true } } },
          orderBy: { paidAt: 'desc' },
          take: 10,
        }),
        prisma.complaint.findMany({
          where: { studentId: student.id },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
      ]);

    const timeline: any[] = [];

    for (const r of attendanceRecords) {
      timeline.push({
        type: 'attendance',
        title: `${r.status} - ${r.subject.name}`,
        detail: r.status === 'PRESENT' ? 'Attended class' : r.status === 'ABSENT' ? 'Missed class' : `Marked ${r.status.toLowerCase()}`,
        date: r.date,
        icon: r.status === 'PRESENT' ? 'check-circle' : r.status === 'ABSENT' ? 'x-circle' : 'alert-circle',
      });
    }

    for (const s of submissions) {
      timeline.push({
        type: 'assignment',
        title: `Assignment: ${s.assignment.title}`,
        detail: s.status === 'GRADED'
          ? `Graded: ${s.marksObtained}/${s.assignment.totalMarks}`
          : `Submitted - ${s.status}`,
        date: s.submittedAt,
        icon: 'file-text',
      });
    }

    for (const r of examResults) {
      const total = r.examination.type === 'INTERNAL' ? 100 : 100;
      timeline.push({
        type: 'exam',
        title: `${r.examination.name} - ${r.subject.name}`,
        detail: `Scored ${Number(r.marksObtained)} marks ${r.grade ? `(${r.grade})` : ''}`,
        date: r.createdAt,
        icon: 'award',
      });
    }

    for (const p of feePayments) {
      timeline.push({
        type: 'fee',
        title: `Fee Payment: ${p.feeStructure.name}`,
        detail: `Paid ₹${Number(p.paidAmount)} ${p.receiptNumber ? `(Receipt: ${p.receiptNumber})` : ''}`,
        date: p.paidAt || p.createdAt,
        icon: 'credit-card',
      });
    }

    for (const c of complaints) {
      timeline.push({
        type: 'complaint',
        title: `Complaint: ${c.title}`,
        detail: `${c.status === 'resolved' ? 'Resolved' : 'Submitted'} - ${c.category}`,
        date: c.createdAt,
        icon: 'message-square',
      });
    }

    timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return timeline.slice(0, 50);
  }

  static async getMessages(userId: string, institutionId: string) {
    const notifications = await prisma.userNotification.findMany({
      where: { userId },
      include: {
        notification: {
          select: {
            id: true,
            title: true,
            message: true,
            type: true,
            priority: true,
            createdAt: true,
          },
        },
      },
      orderBy: { notification: { createdAt: 'desc' } },
      take: 50,
    });

    return {
      messages: notifications.map((n) => ({
        id: n.id,
        notificationId: n.notificationId,
        title: n.notification.title,
        message: n.notification.message,
        type: n.notification.type,
        priority: n.notification.priority,
        isRead: n.isRead,
        readAt: n.readAt,
        createdAt: n.notification.createdAt,
      })),
      unreadCount: notifications.filter((n) => !n.isRead).length,
    };
  }
}
