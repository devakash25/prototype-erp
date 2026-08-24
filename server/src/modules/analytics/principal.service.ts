import { prisma } from '../../config/database';

class PrincipalAnalyticsService {
  async getKPIs(institutionId: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayNum = now.getDay();

    const [
      totalStudents, totalTeachers, totalHODs,
      todayAttendanceStudents, todayAttendanceTeachers,
      pendingAdmissions, todayClasses, pendingLeaves,
      openComplaints, upcomingExams, pendingWorkflows,
    ] = await Promise.all([
      prisma.student.count({ where: { institutionId, isActive: true } }),
      prisma.employee.count({ where: { institutionId, isActive: true, department: 'ACADEMIC' } }),
      prisma.employee.count({ where: { institutionId, isActive: true, user: { role: 'HOD' } } }),
      this.getTodayAttendanceRate(institutionId, today),
      this.getTeacherAttendanceRate(institutionId, today),
      prisma.admission.count({ where: { institutionId, status: 'APPLIED' } }),
      prisma.timetableEntry.count({ where: { timetable: { institutionId, dayOfWeek: dayNum } } }),
      prisma.leave.count({ where: { employee: { institutionId }, status: 'PENDING' } }),
      prisma.helpdeskTicket.count({ where: { institutionId, status: 'OPEN' } }),
      prisma.examination.count({ where: { institutionId, startDate: { gte: now, lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) } } }),
      prisma.workflow.count({ where: { institutionId, status: 'PENDING' } }),
    ]);

    const studentAttendanceRate = todayAttendanceStudents;
    const teacherAttendanceRate = todayAttendanceTeachers;
    const teachersPresent = Math.round(totalTeachers * teacherAttendanceRate / 100);
    const studentsPresent = Math.round(totalStudents * studentAttendanceRate / 100);

    return {
      studentAttendanceRate, teacherAttendanceRate,
      teachersPresent, teachersTotal: totalTeachers,
      studentsPresent, studentsTotal: totalStudents,
      pendingAdmissions, todayClasses, pendingLeaves,
      openComplaints, upcomingExams, pendingWorkflows,
      totalStudents, totalTeachers, totalHODs,
    };
  }

  async getCampusStatus(institutionId: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayNum = now.getDay();

    const [classesRunning, teachersPresent, freeRooms, absentTeachers, activeComplaints] = await Promise.all([
      prisma.timetableEntry.count({ where: { timetable: { institutionId, dayOfWeek: dayNum } } }),
      prisma.employeeAttendance.count({ where: { employee: { institutionId }, date: today, status: 'PRESENT' } }),
      prisma.timetableEntry.aggregate({ where: { timetable: { institutionId, dayOfWeek: dayNum } }, _count: true }),
      prisma.employeeAttendance.count({ where: { employee: { institutionId }, date: today, status: 'ABSENT' } }),
      prisma.helpdeskTicket.count({ where: { institutionId, status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
    ]);

    return {
      classesRunning, teachersTeaching: teachersPresent, freeRooms: Math.max(0, 20 - classesRunning),
      absentTeachers, activeComplaints,
    };
  }

  async getDepartments(institutionId: string) {
    const departments = await prisma.department.findMany({
      where: { institutionId, isActive: true },
      include: { _count: { select: { students: true, employees: true } } },
    });

    const results = [];
    for (const dept of departments) {
      const studentIds = (await prisma.student.findMany({
        where: { departmentId: dept.id, isActive: true },
        select: { id: true },
      })).map(s => s.id);

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const totalAtt = studentIds.length > 0 ? await prisma.attendance.count({
        where: { studentId: { in: studentIds }, date: { gte: weekAgo } },
      }) : 0;
      const presentAtt = studentIds.length > 0 ? await prisma.attendance.count({
        where: { studentId: { in: studentIds }, date: { gte: weekAgo }, status: 'PRESENT' },
      }) : 0;
      const attendanceRate = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 0;

      results.push({
        id: dept.id, name: dept.name, code: dept.code,
        students: dept._count.students, faculty: dept._count.employees,
        attendanceRate,
      });
    }
    return results;
  }

  async getFacultyStatus(institutionId: string) {
    const today = new Date();
    const dayNum = new Date().getDay();
    const employees = await prisma.employee.findMany({
      where: { institutionId, isActive: true, department: 'ACADEMIC' },
      include: {
        user: { select: { fullName: true } },
        attendances: { where: { date: today }, select: { status: true } },
        leaves: { where: { status: 'PENDING' }, select: { id: true } },
        timetables: { where: { timetable: { dayOfWeek: dayNum } }, select: { id: true, startTime: true, endTime: true } },
        performanceReviews: { select: { rating: true } },
      },
    });

    const faculty = employees.map(emp => {
      const todayStatus = emp.attendances[0]?.status || 'NO_RECORD';
      const avgScore = emp.performanceReviews.length > 0
        ? Math.round(emp.performanceReviews.reduce((s: number, r: any) => s + (r.rating || 0), 0) / emp.performanceReviews.length * 20)
        : 0;
      return {
        name: emp.user.fullName, designation: emp.designation,
        department: emp.department, todayStatus,
        pendingLeaves: emp.leaves.length,
        classesToday: emp.timetables.length,
        performanceScore: avgScore,
      };
    });

    const present = faculty.filter(f => f.todayStatus === 'PRESENT').length;
    const absent = faculty.filter(f => f.todayStatus === 'ABSENT').length;
    const onLeave = faculty.filter(f => f.todayStatus === 'ON_LEAVE').length;

    return { total: faculty.length, present, absent, onLeave, faculty };
  }

  async getAttendanceTrend(institutionId: string, days = 7) {
    const trends = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayEnd = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      const total = await prisma.student.count({ where: { institutionId, isActive: true } });
      const present = await prisma.attendance.count({
        where: { student: { institutionId }, date: { gte: date, lt: dayEnd }, status: 'PRESENT' },
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

  async getTimetable(institutionId: string) {
    const today = new Date();
    const dayNum = today.getDay();

    const entries = await prisma.timetableEntry.findMany({
      where: { timetable: { institutionId, dayOfWeek: dayNum } },
      include: {
        employee: { include: { user: { select: { fullName: true } } } },
        subject: { select: { name: true, code: true } },
        course: { select: { name: true, code: true } },
      },
      orderBy: { startTime: 'asc' },
    });

    const rooms = await prisma.timetableEntry.groupBy({
      by: ['room'],
      where: { timetable: { institutionId, dayOfWeek: dayNum } },
      _count: true,
    });

    return { entries, roomUtilization: rooms, totalEntries: entries.length };
  }

  async getExaminationStatus(institutionId: string) {
    const [active, upcoming, completed, pendingResults] = await Promise.all([
      prisma.examination.count({ where: { institutionId, startDate: { lte: new Date() }, endDate: { gte: new Date() } } }),
      prisma.examination.count({ where: { institutionId, startDate: { gt: new Date() } } }),
      prisma.examination.count({ where: { institutionId, endDate: { lt: new Date() } } }),
      prisma.examResult.count({ where: { examination: { institutionId }, marksObtained: null } }),
    ]);

    const totalResults = await prisma.examResult.count({ where: { examination: { institutionId } } });
    const passedResults = await prisma.examResult.count({ where: { examination: { institutionId }, isPassed: true } });

    return {
      active, upcoming, completed,
      passRate: totalResults > 0 ? Math.round((passedResults / totalResults) * 100) : 0,
      pendingResults, totalResults, publishedResults: totalResults - pendingResults,
    };
  }

  async getAdmissionStatus(institutionId: string) {
    const [applied, underReview, approved, enrolled, rejected] = await Promise.all([
      prisma.admission.count({ where: { institutionId, status: 'APPLIED' } }),
      prisma.admission.count({ where: { institutionId, status: 'UNDER_REVIEW' } }),
      prisma.admission.count({ where: { institutionId, status: 'APPROVED' } }),
      prisma.admission.count({ where: { institutionId, status: 'ENROLLED' } }),
      prisma.admission.count({ where: { institutionId, status: 'REJECTED' } }),
    ]);

    return { applied, underReview, approved, enrolled, rejected, total: applied + underReview + approved + enrolled + rejected };
  }

  async getFinanceView(institutionId: string) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [monthCollection, pendingDues, feeCollectionRate] = await Promise.all([
      prisma.feePayment.aggregate({
        where: { student: { institutionId }, paidAt: { gte: monthStart }, status: 'PAID' },
        _sum: { paidAmount: true },
      }),
      prisma.feePayment.aggregate({
        where: { student: { institutionId }, status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] } },
        _sum: { dueAmount: true },
      }),
      this.getFeeCollectionRate(institutionId),
    ]);

    return {
      monthRevenue: Number(monthCollection._sum.paidAmount) || 0,
      outstandingDues: Number(pendingDues._sum.dueAmount) || 0,
      feeCollectionRate,
    };
  }

  async getDisciplineSummary(institutionId: string) {
    const [openComplaints, resolvedThisMonth, escalations] = await Promise.all([
      prisma.helpdeskTicket.count({ where: { institutionId, status: 'OPEN' } }),
      prisma.helpdeskTicket.count({
        where: { institutionId, status: 'RESOLVED', resolvedAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
      }),
      prisma.helpdeskTicket.count({ where: { institutionId, priority: 'URGENT', status: { not: 'RESOLVED' } } }),
    ]);

    return { openComplaints, resolvedThisMonth, escalations };
  }

  async getLMSOverview(institutionId: string) {
    const [assignments, submissions, materials, pendingEvaluation] = await Promise.all([
      prisma.assignment.count({ where: { subject: { course: { institutionId } } } }),
      prisma.assignmentSubmission.count({ where: { assignment: { subject: { course: { institutionId } } } } }),
      prisma.studyMaterial.count({ where: { subject: { course: { institutionId } } } }),
      prisma.assignmentSubmission.count({ where: { assignment: { subject: { course: { institutionId } } }, marksObtained: null } }),
    ]);

    return { assignments, submissions, materials, pendingEvaluation };
  }

  async getWorkflowSummary(institutionId: string) {
    const byType = await prisma.workflow.groupBy({
      by: ['type', 'status'],
      where: { institutionId },
      _count: true,
    });
    const pending = byType.filter(w => w.status === 'PENDING');
    return {
      pending: pending.reduce((s, w) => s + w._count, 0),
      byType: pending.map(w => ({ type: w.type, count: w._count })),
    };
  }

  async getRecentActivity(institutionId: string, limit = 15) {
    const activities = await prisma.auditLog.findMany({
      where: { institutionId },
      include: { user: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return activities.map(a => ({
      id: a.id, action: `${a.action} on ${a.entity}`, entity: a.entity,
      user: a.user, createdAt: a.createdAt.toISOString(),
    }));
  }

  async getStudents(
    institutionId: string,
    search?: string,
    departmentId?: string,
    page = 1,
    limit = 20
  ) {
    const where: any = { institutionId };
    if (departmentId) where.departmentId = departmentId;
    if (search) {
      where.OR = [
        { user: { fullName: { contains: search, mode: 'insensitive' } } },
        { admissionNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { fullName: true, email: true } },
          department: { select: { name: true } },
          course: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.student.count({ where }),
    ]);

    return {
      students: students.map(s => ({
        id: s.id,
        fullName: s.user.fullName,
        email: s.user.email,
        admissionNumber: s.admissionNumber,
        rollNumber: s.rollNumber,
        department: s.department?.name || null,
        course: s.course?.name || null,
        isActive: s.isActive,
        isHostelStudent: s.isHostelStudent,
        usesTransport: s.usesTransport,
      })),
      total,
      page,
      limit,
    };
  }

  async getHostelOverview(institutionId: string) {
    const hostels = await prisma.hostel.findMany({
      where: { institutionId },
      include: {
        rooms: { select: { id: true, roomNumber: true, buildingId: true, floor: true, capacity: true, occupied: true, type: true, amenities: true } },
        warden: { include: { user: { select: { fullName: true } } } },
      },
    });

    let totalCapacity = 0;
    let totalOccupied = 0;

    const hostelData = hostels.map(h => {
      const capacity = h.rooms.reduce((sum: number, r: any) => sum + (r.capacity || 0), 0);
      const occupied = h.rooms.reduce((sum: number, r: any) => sum + (r.occupied || 0), 0);
      totalCapacity += capacity;
      totalOccupied += occupied;
      return {
        id: h.id,
        name: h.name,
        type: h.type,
        warden: h.warden?.user?.fullName || null,
        capacity,
        occupied,
        occupancyRate: capacity > 0 ? Math.round((occupied / capacity) * 100) : 0,
        rooms: h.rooms,
      };
    });

    return {
      hostels: hostelData,
      totalCapacity,
      totalOccupied,
      overallOccupancyRate: totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0,
    };
  }

  async getLibraryOverview(institutionId: string) {
    const [books, categories, activeIssues, overdueIssues, totalIssuedEver, recentIssues] = await Promise.all([
      prisma.libraryBook.count({ where: { institutionId, isActive: true } }),
      prisma.libraryBook.groupBy({ by: ['category'], where: { institutionId, isActive: true }, _count: true }),
      prisma.libraryIssue.count({ where: { book: { institutionId }, status: 'ISSUED' } }),
      prisma.libraryIssue.count({ where: { book: { institutionId }, status: 'OVERDUE' } }),
      prisma.libraryIssue.count({ where: { book: { institutionId } } }),
      prisma.libraryIssue.findMany({
        where: { book: { institutionId } },
        include: {
          book: { select: { title: true } },
          student: { include: { user: { select: { fullName: true } } } },
          employee: { include: { user: { select: { fullName: true } } } },
        },
        orderBy: { issueDate: 'desc' },
        take: 10,
      }),
    ]);

    return {
      totalBooks: books,
      totalCategories: categories.length,
      categoryBreakdown: categories.map(c => ({ category: c.category, count: c._count })),
      activeIssues,
      overdueIssues,
      totalIssuedEver,
      recentIssues: recentIssues.map(i => ({
        id: i.id,
        bookTitle: i.book.title,
        borrowerName: i.student?.user?.fullName || i.employee?.user?.fullName || 'Unknown',
        issueDate: i.issueDate,
        dueDate: i.dueDate,
        status: i.status,
      })),
    };
  }

  async getTransportOverview(institutionId: string) {
    const [vehicles, routes, studentCoverage] = await Promise.all([
      prisma.vehicle.findMany({
        where: { institutionId },
        include: {
          driver: { include: { user: { select: { fullName: true } } } },
          routes: {
            include: {
              route: { select: { id: true, name: true, code: true } },
            },
          },
        },
      }),
      prisma.route.findMany({ where: { institutionId } }),
      prisma.student.count({ where: { institutionId, usesTransport: true, isActive: true } }),
    ]);

    const activeVehicles = vehicles.filter(v => v.isActive).length;
    const activeRoutes = routes.filter(r => r.isActive).length;

    return {
      totalVehicles: vehicles.length,
      activeVehicles,
      totalRoutes: routes.length,
      activeRoutes,
      vehicles: vehicles.map(v => ({
        id: v.id,
        registrationNumber: v.registrationNumber,
        type: v.type,
        capacity: v.capacity,
        driver: v.driver?.user?.fullName || null,
        routes: v.routes.map(vr => ({
          id: vr.route.id,
          name: vr.route.name,
          code: vr.route.code,
          shift: vr.shift,
          departureTime: vr.departureTime,
          arrivalTime: vr.arrivalTime,
        })),
      })),
      studentCoverage,
    };
  }

  async getHelpdeskTickets(
    institutionId: string,
    status?: string,
    category?: string,
    page = 1,
    limit = 20
  ) {
    const where: any = { institutionId };
    if (status) where.status = status;
    if (category) where.category = category;

    const [tickets, total] = await Promise.all([
      prisma.helpdeskTicket.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          creator: { select: { fullName: true } },
          assignee: { select: { fullName: true } },
          _count: { select: { comments: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.helpdeskTicket.count({ where }),
    ]);

    const [open, inProgress, resolved, closed] = await Promise.all([
      prisma.helpdeskTicket.count({ where: { institutionId, status: 'OPEN' } }),
      prisma.helpdeskTicket.count({ where: { institutionId, status: 'IN_PROGRESS' } }),
      prisma.helpdeskTicket.count({ where: { institutionId, status: 'RESOLVED' } }),
      prisma.helpdeskTicket.count({ where: { institutionId, status: 'CLOSED' } }),
    ]);

    return {
      tickets: tickets.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        category: t.category,
        priority: t.priority,
        status: t.status,
        creator: t.creator.fullName,
        assignee: t.assignee?.fullName || null,
        commentsCount: t._count.comments,
        createdAt: t.createdAt,
        resolvedAt: t.resolvedAt,
      })),
      total,
      page,
      limit,
      summary: { open, inProgress, resolved, closed },
    };
  }

  async getLeaveRequests(
    institutionId: string,
    status?: string,
    page = 1,
    limit = 20
  ) {
    const where: any = { employee: { institutionId } };
    if (status) where.status = status;

    const [leaves, total] = await Promise.all([
      prisma.leave.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          employee: {
            include: {
              user: { select: { fullName: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.leave.count({ where }),
    ]);

    const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
      prisma.leave.count({ where: { employee: { institutionId }, status: 'PENDING' } }),
      prisma.leave.count({ where: { employee: { institutionId }, status: 'APPROVED' } }),
      prisma.leave.count({ where: { employee: { institutionId }, status: 'REJECTED' } }),
    ]);

    return {
      leaves: leaves.map(l => ({
        id: l.id,
        type: l.type,
        startDate: l.startDate,
        endDate: l.endDate,
        totalDays: l.totalDays,
        reason: l.reason,
        status: l.status,
        employeeName: l.employee.user.fullName,
        designation: l.employee.designation,
        department: l.employee.department,
        approvedBy: l.approvedBy,
        approvedAt: l.approvedAt,
        comments: l.comments,
        createdAt: l.createdAt,
      })),
      total,
      page,
      limit,
      summary: { pending: pendingCount, approved: approvedCount, rejected: rejectedCount },
    };
  }

  async getWorkflowActions(
    institutionId: string,
    status?: string,
    type?: string,
    page = 1,
    limit = 20
  ) {
    const where: any = { institutionId };
    if (status) where.status = status;
    if (type) where.type = type;

    const [workflows, total] = await Promise.all([
      prisma.workflow.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          creator: { select: { fullName: true } },
          actions: {
            include: { user: { select: { fullName: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.workflow.count({ where }),
    ]);

    const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
      prisma.workflow.count({ where: { institutionId, status: 'PENDING' } }),
      prisma.workflow.count({ where: { institutionId, status: 'APPROVED' } }),
      prisma.workflow.count({ where: { institutionId, status: 'REJECTED' } }),
    ]);

    return {
      workflows: workflows.map(w => ({
        id: w.id,
        type: w.type,
        title: w.title,
        description: w.description,
        status: w.status,
        priority: w.priority,
        creator: w.creator.fullName,
        actions: w.actions.map(a => ({
          id: a.id,
          action: a.action,
          comments: a.comments,
          user: a.user.fullName,
          createdAt: a.createdAt,
        })),
        actionCount: w.actions.length,
        createdAt: w.createdAt,
      })),
      total,
      page,
      limit,
      summary: { pending: pendingCount, approved: approvedCount, rejected: rejectedCount },
    };
  }

  async handleWorkflowAction(workflowId: string, userId: string, action: string, comments?: string) {
    const workflowAction = await prisma.workflowAction.create({
      data: {
        workflowId,
        userId,
        action: action as any,
        comments: comments || null,
        status: 'completed',
      },
    });

    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
    const updatedWorkflow = await prisma.workflow.update({
      where: { id: workflowId },
      data: { status: newStatus as any },
      include: {
        creator: { select: { fullName: true } },
        actions: { include: { user: { select: { fullName: true } } } },
      },
    });

    return { workflowAction, workflow: updatedWorkflow };
  }

  async handleLeaveAction(leaveId: string, userId: string, action: string, comments?: string) {
    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
    const updatedLeave = await prisma.leave.update({
      where: { id: leaveId },
      data: {
        status: newStatus as any,
        approvedBy: userId,
        approvedAt: new Date(),
        comments: comments || undefined,
      },
      include: {
        employee: {
          include: { user: { select: { fullName: true } } },
        },
      },
    });

    return updatedLeave;
  }

  async getCalendarEvents(institutionId: string) {
    const now = new Date();

    const [exams, pendingLeaves, recentWorkflows] = await Promise.all([
      prisma.examination.findMany({
        where: { institutionId, startDate: { gte: now } },
        select: { id: true, name: true, startDate: true, endDate: true, type: true },
        orderBy: { startDate: 'asc' },
        take: 10,
      }),
      prisma.leave.findMany({
        where: { employee: { institutionId }, status: 'PENDING' },
        include: { employee: { include: { user: { select: { fullName: true } } } } },
        orderBy: { startDate: 'asc' },
        take: 10,
      }),
      prisma.workflow.findMany({
        where: { institutionId },
        select: { id: true, type: true, title: true, status: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const events: any[] = [];

    exams.forEach((e: any) => {
      events.push({
        id: e.id,
        title: e.name,
        type: 'exam',
        date: e.startDate,
        endDate: e.endDate,
        status: e.type,
        details: { name: e.name },
      });
    });

    pendingLeaves.forEach((l: any) => {
      events.push({
        id: l.id,
        title: `Leave: ${l.employee.user.fullName}`,
        type: 'leave',
        date: l.startDate,
        endDate: l.endDate,
        status: l.status,
        details: { employee: l.employee.user.fullName, type: l.type, totalDays: l.totalDays },
      });
    });

    recentWorkflows.forEach((w: any) => {
      events.push({
        id: w.id,
        title: w.title || `${w.type} workflow`,
        type: 'workflow',
        date: w.createdAt,
        status: w.status,
        details: { type: w.type },
      });
    });

    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return { events };
  }

  async getReports(institutionId: string) {
    const [
      totalStudents, activeStudents,
      totalFaculty, activeFaculty,
      totalDepartments, totalCourses,
      todayPresent, todayTotal,
      feesCollected, feesPending,
      totalExams, activeExams,
      openHelpdesk, resolvedHelpdesk,
      totalVehicles, totalRoutes,
      totalHostelCapacity, totalHostelOccupied,
    ] = await Promise.all([
      prisma.student.count({ where: { institutionId } }),
      prisma.student.count({ where: { institutionId, isActive: true } }),
      prisma.employee.count({ where: { institutionId } }),
      prisma.employee.count({ where: { institutionId, isActive: true } }),
      prisma.department.count({ where: { institutionId } }),
      prisma.course.count({ where: { institutionId } }),
      prisma.attendance.count({ where: { student: { institutionId }, date: new Date(new Date().setHours(0, 0, 0, 0)), status: 'PRESENT' } }),
      prisma.student.count({ where: { institutionId, isActive: true } }),
      prisma.feePayment.aggregate({ where: { student: { institutionId }, status: 'PAID' }, _sum: { paidAmount: true } }),
      prisma.feePayment.aggregate({ where: { student: { institutionId }, status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] } }, _sum: { dueAmount: true } }),
      prisma.examination.count({ where: { institutionId } }),
      prisma.examination.count({ where: { institutionId, startDate: { lte: new Date() }, endDate: { gte: new Date() } } }),
      prisma.helpdeskTicket.count({ where: { institutionId, status: 'OPEN' } }),
      prisma.helpdeskTicket.count({ where: { institutionId, status: 'RESOLVED' } }),
      prisma.vehicle.count({ where: { institutionId } }),
      prisma.route.count({ where: { institutionId } }),
      prisma.hostel.aggregate({ where: { institutionId }, _sum: { capacity: true } }),
      prisma.hostelRoom.aggregate({ where: { hostel: { institutionId } }, _sum: { occupied: true } }),
    ]);

    return {
      students: {
        total: totalStudents,
        active: activeStudents,
        inactive: totalStudents - activeStudents,
      },
      faculty: {
        total: totalFaculty,
        active: activeFaculty,
      },
      departments: { total: totalDepartments },
      courses: { total: totalCourses },
      attendance: {
        todayRate: todayTotal > 0 ? Math.round((todayPresent / todayTotal) * 100) : 0,
      },
      fees: {
        collected: Number(feesCollected._sum.paidAmount) || 0,
        pending: Number(feesPending._sum.dueAmount) || 0,
      },
      exams: {
        total: totalExams,
        active: activeExams,
      },
      helpdesk: {
        open: openHelpdesk,
        resolved: resolvedHelpdesk,
      },
      transport: {
        vehicles: totalVehicles,
        routes: totalRoutes,
      },
      hostel: {
        total: Number(totalHostelCapacity._sum.capacity) || 0,
        occupied: Number(totalHostelOccupied._sum.occupied) || 0,
      },
    };
  }

  private async getTodayAttendanceRate(institutionId: string, date: Date) {
    const total = await prisma.student.count({ where: { institutionId, isActive: true } });
    if (total === 0) return 0;
    const present = await prisma.attendance.count({
      where: { student: { institutionId }, date, status: 'PRESENT' },
    });
    return Math.round((present / total) * 100);
  }

  private async getTeacherAttendanceRate(institutionId: string, date: Date) {
    const total = await prisma.employee.count({ where: { institutionId, isActive: true, department: 'ACADEMIC' } });
    if (total === 0) return 0;
    const present = await prisma.employeeAttendance.count({
      where: { employee: { institutionId }, date, status: 'PRESENT' },
    });
    return Math.round((present / total) * 100);
  }

  private async getFeeCollectionRate(institutionId: string) {
    const [total, collected] = await Promise.all([
      prisma.feePayment.aggregate({ where: { student: { institutionId } }, _sum: { amount: true } }),
      prisma.feePayment.aggregate({ where: { student: { institutionId }, status: 'PAID' }, _sum: { paidAmount: true } }),
    ]);
    const t = Number(total._sum.amount) || 0;
    const c = Number(collected._sum.paidAmount) || 0;
    return t > 0 ? Math.round((c / t) * 100) : 0;
  }

  async getTeachers(institutionId: string, departmentId?: string, search?: string) {
    const where: any = { institutionId, isActive: true, user: { role: 'TEACHER' } };
    if (departmentId) where.departmentId = departmentId;
    if (search) {
      where.OR = [
        { user: { fullName: { contains: search, mode: 'insensitive' } } },
        { employeeCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    const employees = await prisma.employee.findMany({
      where,
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true } },
        departmentRel: { select: { name: true } },
        courses: { select: { id: true, name: true, code: true } },
        timetables: {
          select: { subject: { select: { name: true } }, course: { select: { name: true } } },
          distinct: ['subjectId', 'courseId'],
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return employees.map(e => ({
      id: e.id,
      userId: e.user.id,
      employeeCode: e.employeeCode,
      designation: e.designation,
      department: e.departmentRel?.name || null,
      departmentId: e.departmentId,
      name: e.user.fullName,
      email: e.user.email,
      phone: e.user.phone,
      coordinatedCourses: e.courses.map(c => ({ id: c.id, name: c.name, code: c.code })),
      subjects: e.timetables.map(t => ({ subject: t.subject.name, course: t.course.name })),
      isClassCoordinator: e.courses.length > 0,
    }));
  }

  async getCoursesWithCoordinators(institutionId: string) {
    const courses = await prisma.course.findMany({
      where: { institutionId, isActive: true },
      include: {
        coordinator: {
          include: { user: { select: { fullName: true, email: true } } },
        },
        department: { select: { name: true } },
        _count: { select: { students: true, subjects: true } },
      },
      orderBy: { name: 'asc' },
    });

    return courses.map(c => ({
      id: c.id,
      name: c.name,
      code: c.code,
      level: c.level,
      department: c.department.name,
      studentCount: c._count.students,
      subjectCount: c._count.subjects,
      coordinator: c.coordinator
        ? {
            id: c.coordinator.id,
            userId: c.coordinator.userId,
            name: c.coordinator.user.fullName,
            email: c.coordinator.user.email,
            employeeCode: c.coordinator.employeeCode,
            designation: c.coordinator.designation,
          }
        : null,
    }));
  }

  async assignClassCoordinator(institutionId: string, courseId: string, employeeId: string) {
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, institutionId, isActive: true },
      include: { user: { select: { role: true } } },
    });
    if (!employee) throw new Error('Employee not found');
    if (employee.user.role !== 'TEACHER' && employee.user.role !== 'HOD') {
      throw new Error('Only teachers or HODs can be assigned as class coordinators');
    }

    const course = await prisma.course.findFirst({ where: { id: courseId, institutionId } });
    if (!course) throw new Error('Course not found');

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: { classCoordinatorId: employeeId },
      include: {
        coordinator: { include: { user: { select: { fullName: true, email: true } } } },
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      coordinator: updated.coordinator
        ? { name: updated.coordinator.user.fullName, email: updated.coordinator.user.email, employeeCode: updated.coordinator.employeeCode }
        : null,
    };
  }

  async removeClassCoordinator(institutionId: string, courseId: string) {
    const course = await prisma.course.findFirst({ where: { id: courseId, institutionId } });
    if (!course) throw new Error('Course not found');

    await prisma.course.update({
      where: { id: courseId },
      data: { classCoordinatorId: null },
    });

    return { id: courseId, name: course.name, coordinator: null };
  }

  async getSubjects(institutionId: string, departmentId?: string) {
    const where: any = { course: { institutionId } };
    if (departmentId) where.course = { institutionId, departmentId };

    return prisma.subject.findMany({
      where,
      include: {
        course: { select: { id: true, name: true, code: true } },
        subjectAllocations: {
          include: {
            employee: {
              include: { user: { select: { fullName: true, email: true } } },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async allocateSubject(institutionId: string, subjectId: string, employeeId: string, academicSessionId: string, semester?: number) {
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, institutionId, isActive: true },
    });
    if (!employee) throw new Error('Employee not found');

    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, course: { institutionId } },
    });
    if (!subject) throw new Error('Subject not found');

    const existing = await prisma.subjectAllocation.findUnique({
      where: {
        subjectId_employeeId_academicSessionId: {
          subjectId,
          employeeId,
          academicSessionId,
        },
      },
    });

    if (existing) {
      throw new Error('This teacher is already allocated to this subject');
    }

    return prisma.subjectAllocation.create({
      data: { subjectId, employeeId, academicSessionId, semester },
      include: {
        subject: { select: { name: true, code: true } },
        employee: { include: { user: { select: { fullName: true } } } },
      },
    });
  }

  async deallocateSubject(allocationId: string) {
    return prisma.subjectAllocation.delete({ where: { id: allocationId } });
  }

  async getSubjectAllocationSummary(institutionId: string) {
    const allocations = await prisma.subjectAllocation.findMany({
      where: { subject: { course: { institutionId } } },
      include: {
        subject: { select: { name: true, code: true, course: { select: { name: true, id: true } } } },
        employee: { include: { user: { select: { fullName: true } } } },
      },
    });

    return allocations.map(a => ({
      id: a.id,
      subjectName: a.subject.name,
      subjectCode: a.subject.code,
      courseName: a.subject.course?.name || 'N/A',
      courseId: a.subject.course?.id || null,
      teacherName: a.employee.user.fullName,
      employeeId: a.employeeId,
      semester: a.semester,
      assignedAt: a.assignedAt,
    }));
  }
}

export const principalAnalyticsService = new PrincipalAnalyticsService();
