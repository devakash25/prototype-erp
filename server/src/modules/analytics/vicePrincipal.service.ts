import { prisma } from '../../config/database';

class VicePrincipalService {
  async getDashboard(userId: string, institutionId: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    const [
      totalStudents,
      totalTeachers,
      todayAttendanceRecords,
      pendingApprovals,
      disciplineIssues,
      activeSubstitutions,
    ] = await Promise.all([
      prisma.student.count({ where: { institutionId, isActive: true } }),
      prisma.employee.count({ where: { institutionId, isActive: true, department: 'ACADEMIC' } }),
      prisma.attendance.findMany({
        where: {
          student: { institutionId },
          date: { gte: today, lt: tomorrow },
        },
        select: { status: true },
      }),
      prisma.studentRequest.count({
        where: {
          institutionId,
          status: { in: ['SUBMITTED', 'UNDER_REVIEW'] },
        },
      }),
      prisma.studentRequest.count({
        where: {
          institutionId,
          type: { contains: 'discipline', mode: 'insensitive' },
          status: { notIn: ['COMPLETED', 'REJECTED'] },
        },
      }),
      0,
    ]);

    const presentCount = todayAttendanceRecords.filter(
      (r) => r.status === 'PRESENT' || r.status === 'LATE'
    ).length;
    const todayAttendance = todayAttendanceRecords.length > 0
      ? Math.round((presentCount / todayAttendanceRecords.length) * 100)
      : 0;

    return {
      totalStudents,
      totalTeachers,
      todayAttendance,
      pendingApprovals,
      disciplineIssues,
      activeSubstitutions,
    };
  }

  async getAttendanceOverview(userId: string, institutionId: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    const departments = await prisma.department.findMany({
      where: { institutionId, isActive: true },
      include: {
        students: {
          where: { isActive: true },
          select: { id: true },
        },
      },
    });

    const classWiseAttendance = [];

    for (const dept of departments) {
      const studentIds = dept.students.map((s) => s.id);

      if (studentIds.length === 0) {
        classWiseAttendance.push({
          departmentId: dept.id,
          departmentName: dept.name,
          departmentCode: dept.code,
          totalStudents: 0,
          present: 0,
          absent: 0,
          late: 0,
          attendanceRate: 0,
        });
        continue;
      }

      const attendanceRecords = await prisma.attendance.findMany({
        where: {
          studentId: { in: studentIds },
          date: { gte: today, lt: tomorrow },
        },
        select: { status: true },
      });

      const dailyRecords = await prisma.dailyAttendance.findMany({
        where: {
          studentId: { in: studentIds },
          date: { gte: today, lt: tomorrow },
        },
        select: { status: true },
      });

      const allRecords = [...attendanceRecords, ...dailyRecords];
      const present = allRecords.filter((r) => r.status === 'PRESENT').length;
      const late = allRecords.filter((r) => r.status === 'LATE').length;
      const absent = allRecords.filter((r) => r.status === 'ABSENT').length;
      const total = allRecords.length;

      classWiseAttendance.push({
        departmentId: dept.id,
        departmentName: dept.name,
        departmentCode: dept.code,
        totalStudents: dept.students.length,
        present,
        absent,
        late,
        attendanceRate: total > 0 ? Math.round(((present + late) / total) * 100) : 0,
      });
    }

    return classWiseAttendance;
  }

  async getDisciplineRecords(userId: string, institutionId: string, studentId?: string) {
    const where: any = {
      institutionId,
      type: { contains: 'discipline', mode: 'insensitive' },
    };

    if (studentId) {
      where.studentId = studentId;
    }

    const disciplineRequests = await prisma.studentRequest.findMany({
      where,
      include: {
        student: {
          include: {
            user: { select: { fullName: true } },
            department: { select: { name: true } },
            course: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const behaviorRequests = await prisma.studentRequest.findMany({
      where: {
        institutionId,
        type: { contains: 'behavior', mode: 'insensitive' },
        ...(studentId ? { studentId } : {}),
      },
      include: {
        student: {
          include: {
            user: { select: { fullName: true } },
            department: { select: { name: true } },
            course: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const complaints = await prisma.complaint.findMany({
      where: {
        student: { institutionId },
        ...(studentId ? { studentId } : {}),
      },
      include: {
        student: {
          include: {
            user: { select: { fullName: true } },
            department: { select: { name: true } },
            course: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const allRecords = [
      ...disciplineRequests.map((r) => ({
        id: r.id,
        studentName: r.student.user.fullName,
        department: r.student.department?.name,
        course: r.student.course?.name,
        title: r.title,
        description: r.description,
        type: 'DISCIPLINE',
        status: r.status,
        priority: r.priority,
        createdAt: r.createdAt,
      })),
      ...behaviorRequests.map((r) => ({
        id: r.id,
        studentName: r.student.user.fullName,
        department: r.student.department?.name,
        course: r.student.course?.name,
        title: r.title,
        description: r.description,
        type: 'BEHAVIOR',
        status: r.status,
        priority: r.priority,
        createdAt: r.createdAt,
      })),
      ...complaints.map((c) => ({
        id: c.id,
        studentName: c.student.user.fullName,
        department: c.student.department?.name,
        course: c.student.course?.name,
        title: c.title,
        description: c.description,
        type: 'COMPLAINT',
        status: c.status,
        priority: 'NORMAL',
        createdAt: c.createdAt,
      })),
    ];

    allRecords.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return allRecords;
  }

  async getTeacherSubstitutions(userId: string, institutionId: string) {
    return [];
  }

  async getDailyReports(userId: string, institutionId: string) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const helpdeskTickets = await prisma.helpdeskTicket.findMany({
      where: {
        institutionId,
        category: 'academic',
        createdAt: { gte: thirtyDaysAgo },
      },
      include: {
        creator: { select: { fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return helpdeskTickets.map((ticket) => ({
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      submittedBy: ticket.creator.fullName,
      status: ticket.status,
      priority: ticket.priority,
      createdAt: ticket.createdAt,
    }));
  }

  async getClassroomInspections(userId: string, institutionId: string) {
    return [];
  }
}

export const vicePrincipalService = new VicePrincipalService();
