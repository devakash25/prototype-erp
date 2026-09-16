import { prisma } from '../../config/database';
import { NotFoundError, ForbiddenError, ConflictError, ValidationError } from '../../utils/errors';
import { logger } from '../../utils/logger';

interface DailyAttendanceInput {
  studentId: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  remarks?: string;
}

interface SubjectAttendanceInput {
  studentId: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
}

class AttendanceService {
  private isToday(dateStr: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  }

  private validateToday(dateStr: string): void {
    if (!this.isToday(dateStr)) {
      throw new ConflictError('Attendance can only be marked for today. Past dates are read-only.');
    }
  }

  private async resolve(userId: string) {
    const employee = await prisma.employee.findFirst({
      where: { userId, isActive: true },
      select: { id: true, institutionId: true, userId: true },
    });
    if (!employee) throw new NotFoundError('Employee record not found');
    return { employeeId: employee.id, institutionId: employee.institutionId };
  }

  private async getEmployeeName(userId: string): Promise<string> {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { fullName: true } });
    return user?.fullName || 'Unknown';
  }

  private async getActiveSessionId(institutionId: string): Promise<string> {
    const session = await prisma.academicSession.findFirst({
      where: { institutionId, isActive: true },
      select: { id: true },
    });
    if (!session) throw new NotFoundError('No active academic session');
    return session.id;
  }

  private async validateCoordinator(userId: string, courseId: string) {
    const { employeeId, institutionId } = await this.resolve(userId);
    const course = await prisma.course.findFirst({
      where: { id: courseId, institutionId, classCoordinatorId: employeeId, isActive: true },
    });
    if (!course) throw new ForbiddenError('You are not the coordinator of this course');
    return { employeeId, institutionId, course };
  }

  private async validateSubjectTeacher(userId: string, timetableEntryId: string) {
    const { employeeId, institutionId } = await this.resolve(userId);
    const entry = await prisma.timetableEntry.findFirst({
      where: { id: timetableEntryId, employeeId },
      include: { subject: { select: { name: true } }, course: { select: { name: true, classCoordinatorId: true } } },
    });
    if (!entry) throw new ForbiddenError('You are not assigned to this timetable period');
    return { employeeId, institutionId, entry };
  }

  async getCourses(userId: string) {
    const { employeeId, institutionId } = await this.resolve(userId);
    const courses = await prisma.course.findMany({
      where: { institutionId, classCoordinatorId: employeeId, isActive: true },
      include: {
        _count: { select: { students: true } },
        subjects: { select: { id: true, name: true, code: true } },
      },
    });
    return courses.map(c => ({
      id: c.id,
      name: c.name,
      code: c.code,
      studentCount: c._count.students,
      subjects: c.subjects,
    }));
  }

  async getClassStatus(userId: string, courseId: string, date: string) {
    await this.validateCoordinator(userId, courseId);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const mode = await prisma.attendanceMode.findUnique({
      where: { classId_date: { classId: courseId, date: targetDate } },
      include: {
        enabler: { include: { user: { select: { fullName: true } } } },
        _count: { select: { dailyAttendance: true, subjectAttendance: true } },
      },
    });

    const students = await prisma.student.count({
      where: { courseId, isActive: true },
    });

    let morningMarked = 0;
    let eveningMarked = 0;
    let periodStatus: any[] = [];

    if (mode) {
      if (mode.mode === 'COORDINATOR') {
        [morningMarked, eveningMarked] = await Promise.all([
          prisma.dailyAttendance.count({
            where: { classId: courseId, date: targetDate, session: 'MORNING' },
          }),
          prisma.dailyAttendance.count({
            where: { classId: courseId, date: targetDate, session: 'EVENING' },
          }),
        ]);
      } else {
        const entries = await prisma.timetableEntry.findMany({
          where: { courseId },
          include: {
            subject: { select: { name: true, code: true } },
            timetable: { select: { dayOfWeek: true } },
          },
        });
        const today = new Date().getDay();
        const todayEntries = entries.filter(e => e.timetable.dayOfWeek === today);

        for (const entry of todayEntries) {
          const marked = await prisma.subjectAttendance.count({
            where: { timetableEntryId: entry.id, date: targetDate },
          });
          periodStatus.push({
            entryId: entry.id,
            subject: entry.subject.name,
            subjectCode: entry.subject.code,
            time: `${entry.startTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} – ${entry.endTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`,
            room: entry.room,
            marked,
            total: students,
            completed: marked === students,
          });
        }
      }
    }

    return {
      courseId,
      date,
      students,
      mode: mode?.mode || null,
      enabledBy: mode ? mode.enabler.user.fullName : null,
      locked: mode?.locked || false,
      lockedAt: mode?.lockedAt,
      lockedBy: mode?.lockedBy,
      morningMarked,
      eveningMarked,
      periodStatus,
      hasMode: !!mode,
    };
  }

  async enableSubjectMode(userId: string, courseId: string, date: string) {
    this.validateToday(date);
    const { employeeId, institutionId } = await this.validateCoordinator(userId, courseId);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const existing = await prisma.attendanceMode.findUnique({
      where: { classId_date: { classId: courseId, date: targetDate } },
    });

    if (existing?.locked) {
      throw new ConflictError('Attendance is locked for this date. Cannot change mode.');
    }

    if (existing?.mode === 'COORDINATOR') {
      const hasDaily = await prisma.dailyAttendance.count({
        where: { classId: courseId, date: targetDate },
      });
      if (hasDaily > 0) {
        throw new ConflictError('Coordinator attendance already recorded for this date. Cannot switch to subject mode.');
      }
    }

    const mode = await prisma.attendanceMode.upsert({
      where: { classId_date: { classId: courseId, date: targetDate } },
      create: {
        classId: courseId,
        date: targetDate,
        mode: 'SUBJECT',
        enabledBy: employeeId,
      },
      update: { mode: 'SUBJECT', enabledBy: employeeId },
    });

    const className = (await prisma.course.findUnique({ where: { id: courseId }, select: { name: true } }))?.name;

    await this.sendNotification(
      userId,
      institutionId,
      `Subject attendance enabled for ${className}`,
      `Class Coordinator enabled subject-wise attendance for ${className} on ${date}. Subject teachers can now mark attendance during their periods.`,
      'TEACHERS'
    );

    logger.info({ userId, courseId, date, mode: 'SUBJECT' }, 'Subject attendance mode enabled');
    return mode;
  }

  async disableSubjectMode(userId: string, courseId: string, date: string) {
    this.validateToday(date);
    const { employeeId, institutionId } = await this.validateCoordinator(userId, courseId);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const existing = await prisma.attendanceMode.findUnique({
      where: { classId_date: { classId: courseId, date: targetDate } },
    });

    if (existing?.locked) {
      throw new ConflictError('Attendance is locked. Cannot change mode.');
    }

    if (existing?.mode === 'SUBJECT') {
      const hasSubject = await prisma.subjectAttendance.count({
        where: { classId: courseId, date: targetDate },
      });
      if (hasSubject > 0) {
        throw new ConflictError('Subject attendance already recorded. Cannot switch to coordinator mode.');
      }
    }

    const mode = await prisma.attendanceMode.upsert({
      where: { classId_date: { classId: courseId, date: targetDate } },
      create: {
        classId: courseId,
        date: targetDate,
        mode: 'COORDINATOR',
        enabledBy: employeeId,
      },
      update: { mode: 'COORDINATOR', enabledBy: employeeId },
    });

    logger.info({ userId, courseId, date, mode: 'COORDINATOR' }, 'Coordinator attendance mode enabled');
    return mode;
  }

  async getStudentsForCourse(userId: string, courseId: string) {
    await this.validateCoordinator(userId, courseId);
    const students = await prisma.student.findMany({
      where: { courseId, isActive: true },
      include: { user: { select: { fullName: true, email: true } } },
      orderBy: { rollNumber: 'asc' },
    });
    return students.map(s => ({
      id: s.id,
      admissionNumber: s.admissionNumber,
      rollNumber: s.rollNumber,
      name: s.user.fullName,
      email: s.user.email,
    }));
  }

  async markDailyAttendance(userId: string, courseId: string, date: string, session: 'MORNING' | 'EVENING', records: DailyAttendanceInput[]) {
    this.validateToday(date);
    const { employeeId, institutionId } = await this.validateCoordinator(userId, courseId);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const mode = await prisma.attendanceMode.findUnique({
      where: { classId_date: { classId: courseId, date: targetDate } },
    });

    if (mode?.mode === 'SUBJECT') {
      throw new ConflictError('This class is in subject-wise attendance mode. Cannot mark coordinator attendance.');
    }
    if (mode?.locked) {
      throw new ConflictError('Attendance is locked for this date.');
    }

    if (!mode) {
      await prisma.attendanceMode.create({
        data: { classId: courseId, date: targetDate, mode: 'COORDINATOR', enabledBy: employeeId },
      });
    }

    const results = [];
    for (const record of records) {
      const upserted = await prisma.dailyAttendance.upsert({
        where: { studentId_classId_date_session: { studentId: record.studentId, classId: courseId, date: targetDate, session } },
        create: {
          studentId: record.studentId,
          classId: courseId,
          attendanceModeId: (await this.getModeId(courseId, targetDate)),
          date: targetDate,
          session,
          status: record.status,
          markedBy: employeeId,
          remarks: record.remarks,
        },
        update: { status: record.status, markedBy: employeeId, remarks: record.remarks },
      });
      results.push({ studentId: record.studentId, action: 'saved', attendanceId: upserted.id });
    }

    logger.info({ userId, courseId, date, session, count: records.length }, 'Daily attendance marked');
    return {
      courseId, date, session,
      totalProcessed: records.length,
      details: results,
    };
  }

  async getDailyAttendance(userId: string, courseId: string, date: string, session: 'MORNING' | 'EVENING') {
    await this.validateCoordinator(userId, courseId);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const records = await prisma.dailyAttendance.findMany({
      where: { classId: courseId, date: targetDate, session },
      include: {
        student: { include: { user: { select: { fullName: true } } } },
        marker: { include: { user: { select: { fullName: true } } } },
      },
    });

    return records.map(r => ({
      id: r.id,
      studentId: r.studentId,
      studentName: r.student.user.fullName,
      rollNumber: r.student.rollNumber,
      admissionNumber: r.student.admissionNumber,
      status: r.status,
      remarks: r.remarks,
      markedBy: r.marker.user.fullName,
      createdAt: r.createdAt,
    }));
  }

  async getTimetableForTeacher(userId: string) {
    const { employeeId } = await this.resolve(userId);
    const today = new Date().getDay();

    const entries = await prisma.timetableEntry.findMany({
      where: { employeeId, timetable: { dayOfWeek: today } },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        course: { select: { id: true, name: true, code: true } },
        timetable: { select: { dayOfWeek: true } },
      },
      orderBy: { startTime: 'asc' },
    });

    return entries.map(e => ({
      entryId: e.id,
      subjectId: e.subject.id,
      subject: e.subject.name,
      subjectCode: e.subject.code,
      courseId: e.course.id,
      course: e.course.name,
      courseCode: e.course.code,
      startTime: e.startTime,
      endTime: e.endTime,
      room: e.room,
      periodNumber: entries.indexOf(e) + 1,
    }));
  }

  async getTeacherAttendanceStatus(userId: string) {
    const { employeeId } = await this.resolve(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = new Date().getDay();

    const entries = await prisma.timetableEntry.findMany({
      where: { employeeId, timetable: { dayOfWeek } },
      include: {
        subject: { select: { name: true, code: true } },
        course: { select: { id: true, name: true } },
      },
      orderBy: { startTime: 'asc' },
    });

    const results = [];
    for (const entry of entries) {
      const mode = await prisma.attendanceMode.findUnique({
        where: { classId_date: { classId: entry.course.id, date: today } },
      });

      const students = await prisma.student.count({
        where: { courseId: entry.course.id, isActive: true },
      });

      let marked = 0;
      if (mode?.mode === 'SUBJECT') {
        marked = await prisma.subjectAttendance.count({
          where: { timetableEntryId: entry.id, date: today },
        });
      }

      results.push({
        entryId: entry.id,
        subject: entry.subject.name,
        subjectCode: entry.subject.code,
        course: entry.course.name,
        courseId: entry.course.id,
        time: `${entry.startTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} – ${entry.endTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`,
        room: entry.room,
        totalStudents: students,
        marked,
        delegated: mode?.mode === 'SUBJECT' || false,
        locked: mode?.locked || false,
      });
    }

    return results;
  }

  async markSubjectAttendance(userId: string, timetableEntryId: string, date: string, records: SubjectAttendanceInput[]) {
    this.validateToday(date);
    const { employeeId, institutionId, entry } = await this.validateSubjectTeacher(userId, timetableEntryId);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const mode = await prisma.attendanceMode.findUnique({
      where: { classId_date: { classId: entry.courseId, date: targetDate } },
    });

    if (!mode || mode.mode !== 'SUBJECT') {
      throw new ConflictError('Subject-wise attendance is not enabled for this class on this date.');
    }
    if (mode.locked) {
      throw new ConflictError('Attendance is locked for this date.');
    }

    const results = [];
    for (const record of records) {
      const upserted = await prisma.subjectAttendance.upsert({
        where: { studentId_classId_subjectId_date: { studentId: record.studentId, classId: entry.courseId, subjectId: entry.subjectId, date: targetDate } },
        create: {
          studentId: record.studentId,
          classId: entry.courseId,
          subjectId: entry.subjectId,
          timetableEntryId,
          teacherId: employeeId,
          attendanceModeId: mode.id,
          date: targetDate,
          status: record.status,
        },
        update: { status: record.status, teacherId: employeeId },
      });
      results.push({ studentId: record.studentId, action: 'saved', attendanceId: upserted.id });
    }

    const teacherName = await this.getEmployeeName(userId);
    const className = entry.course.name;
    const subjectName = entry.subject.name;

    await this.sendNotification(
      userId,
      institutionId,
      `${subjectName} attendance submitted for ${className}`,
      `${teacherName} submitted ${subjectName} attendance for ${className} on ${date}.`,
      'SPECIFIC_USERS',
      [entry.course.classCoordinatorId!].filter(Boolean)
    );

    logger.info({ userId, timetableEntryId, date, count: records.length }, 'Subject attendance marked');
    return {
      timetableEntryId,
      courseId: entry.courseId,
      subjectId: entry.subjectId,
      date,
      totalProcessed: records.length,
      details: results,
    };
  }

  async getStudentsForPeriod(userId: string, timetableEntryId: string, date: string) {
    const { entry } = await this.validateSubjectTeacher(userId, timetableEntryId);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const mode = await prisma.attendanceMode.findUnique({
      where: { classId_date: { classId: entry.courseId, date: targetDate } },
    });

    if (!mode || mode.mode !== 'SUBJECT') {
      throw new ConflictError('Subject-wise attendance is not enabled for this class on this date.');
    }

    const students = await prisma.student.findMany({
      where: { courseId: entry.courseId, isActive: true },
      include: {
        user: { select: { fullName: true } },
        subjectAttendance: {
          where: { timetableEntryId, date: targetDate },
          select: { id: true, status: true, markedAt: true },
        },
      },
      orderBy: { rollNumber: 'asc' },
    });

    return {
      entryId: timetableEntryId,
      subject: entry.subject.name,
      course: entry.course.name,
      date,
      students: (students as any[]).map(s => ({
        id: s.id,
        rollNumber: s.rollNumber,
        admissionNumber: s.admissionNumber,
        name: s.user.fullName,
        attendance: s.subjectAttendance[0] || null,
      })),
    };
  }

  async lockAttendance(userId: string, courseId: string, date: string) {
    this.validateToday(date);
    const { employeeId } = await this.validateCoordinator(userId, courseId);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const mode = await prisma.attendanceMode.findUnique({
      where: { classId_date: { classId: courseId, date: targetDate } },
    });

    if (!mode) throw new NotFoundError('Attendance mode not set for this date');
    if (mode.locked) throw new ConflictError('Attendance is already locked');

    const updated = await prisma.attendanceMode.update({
      where: { id: mode.id },
      data: { locked: true, lockedAt: new Date(), lockedBy: employeeId },
    });

    logger.info({ userId, courseId, date }, 'Attendance locked');
    return updated;
  }

  async unlockAttendance(userId: string, courseId: string, date: string) {
    this.validateToday(date);
    const { employeeId } = await this.validateCoordinator(userId, courseId);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const mode = await prisma.attendanceMode.findUnique({
      where: { classId_date: { classId: courseId, date: targetDate } },
    });

    if (!mode) throw new NotFoundError('Attendance mode not set for this date');
    if (!mode.locked) throw new ConflictError('Attendance is not locked');

    const updated = await prisma.attendanceMode.update({
      where: { id: mode.id },
      data: { locked: false, lockedAt: null, lockedBy: null },
    });

    logger.info({ userId, courseId, date }, 'Attendance unlocked');
    return updated;
  }

  private async getModeId(courseId: string, date: Date): Promise<string> {
    const mode = await prisma.attendanceMode.findUnique({
      where: { classId_date: { classId: courseId, date } },
      select: { id: true },
    });
    if (!mode) throw new NotFoundError('Attendance mode not initialized');
    return mode.id;
  }

  private async sendNotification(senderId: string, institutionId: string, title: string, message: string, target: string, targetUserIds?: string[]) {
    let userIds: string[] = [];

    if (target === 'SPECIFIC_USERS' && targetUserIds?.length) {
      userIds = targetUserIds;
    } else {
      const roleMap: Record<string, string[]> = {
        TEACHERS: ['TEACHER'],
      };
      const roles = roleMap[target] || [];
      if (roles.length) {
        const users = await prisma.user.findMany({
          where: { institutionId, role: { in: roles as any[] }, isActive: true },
          select: { id: true },
        });
        userIds = users.map(u => u.id);
      }
    }

    if (userIds.length === 0) return;

    await prisma.notification.create({
      data: {
        institutionId,
        senderId,
        title,
        message,
        type: 'INFO',
        target: target as any,
        priority: 'NORMAL',
        isSent: true,
        sentAt: new Date(),
        recipients: { create: userIds.map(id => ({ userId: id })) },
      },
    });
  }

  async getMonthlyOverview(userId: string, courseId: string, year: number, month: number) {
    await this.validateCoordinator(userId, courseId);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const modes = await prisma.attendanceMode.findMany({
      where: { classId: courseId, date: { gte: start, lte: end } },
      select: { date: true, mode: true, locked: true },
    });

    const dailyRecords = await prisma.dailyAttendance.groupBy({
      by: ['date', 'session'],
      where: { classId: courseId, date: { gte: start, lte: end } },
      _count: { id: true },
    });

    const totalStudents = await prisma.student.count({
      where: { courseId, isActive: true },
    });

    const dateMap = new Map<string, any>();
    for (const m of modes) {
      const key = m.date.toISOString().split('T')[0];
      dateMap.set(key, { date: key, mode: m.mode, locked: m.locked, morning: 0, evening: 0, totalStudents });
    }

    for (const r of dailyRecords) {
      const key = r.date.toISOString().split('T')[0];
      if (!dateMap.has(key)) {
        dateMap.set(key, { date: key, mode: null, locked: false, morning: 0, evening: 0, totalStudents });
      }
      const entry = dateMap.get(key)!;
      if (r.session === 'MORNING') entry.morning = r._count.id;
      else entry.evening = r._count.id;
    }

    return {
      year,
      month,
      totalStudents,
      dates: Array.from(dateMap.values()),
    };
  }
}

export const attendanceService = new AttendanceService();
