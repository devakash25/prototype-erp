import { prisma } from '../../config/database';

export class AdministrativeService {
  static async getDashboard(institutionId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      pendingCertificates,
      pendingRequests,
      noticesThisMonth,
      meetingsToday,
      pendingComplaints,
      pendingWorkflows,
      docsProcessedToday,
      totalCertificates,
      totalRequests,
      totalMeetings,
      totalWorkflows,
      totalDocuments,
    ] = await Promise.all([
      prisma.certificate.count({ where: { institutionId, status: { in: ['PENDING', 'PROCESSING'] } } }),
      prisma.studentRequest.count({ where: { institutionId, status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'FORWARDING'] } } }),
      prisma.announcement.count({ where: { institutionId, createdAt: { gte: monthStart } } }),
      prisma.meeting.count({ where: { institutionId, meetingDate: { gte: today, lt: tomorrow } } }),
      prisma.helpdeskTicket.count({ where: { institutionId, category: 'general', status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
      prisma.workflow.count({ where: { institutionId, status: { in: ['PENDING', 'IN_PROGRESS'] } } }),
      prisma.document.count({ where: { institutionId, createdAt: { gte: today, lt: tomorrow } } }),
      prisma.certificate.count({ where: { institutionId } }),
      prisma.studentRequest.count({ where: { institutionId } }),
      prisma.meeting.count({ where: { institutionId } }),
      prisma.workflow.count({ where: { institutionId } }),
      prisma.document.count({ where: { institutionId } }),
    ]);

    const recentCertificates = await prisma.certificate.findMany({
      where: { institutionId },
      include: { student: { include: { user: { select: { firstName: true, lastName: true } } } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const recentRequests = await prisma.studentRequest.findMany({
      where: { institutionId },
      include: { student: { include: { user: { select: { firstName: true, lastName: true } } } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const upcomingMeetings = await prisma.meeting.findMany({
      where: { institutionId, status: 'SCHEDULED', meetingDate: { gte: today } },
      orderBy: { meetingDate: 'asc' },
      take: 5,
    });

    return {
      summary: {
        pendingCertificates,
        pendingRequests,
        noticesThisMonth,
        meetingsToday,
        pendingComplaints,
        pendingWorkflows,
        docsProcessedToday,
        avgProcessingTime: '2.4 days',
      },
      recentCertificates,
      recentRequests,
      upcomingMeetings,
    };
  }

  // Certificates
  static async getCertificates(institutionId: string, filters?: { status?: string; type?: string }) {
    const where: any = { institutionId };
    if (filters?.status) where.status = filters.status;
    if (filters?.type) where.type = filters.type;
    return prisma.certificate.findMany({
      where,
      include: { student: { include: { user: { select: { firstName: true, lastName: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createCertificate(institutionId: string, data: any) {
    return prisma.certificate.create({ data: { ...data, institutionId } });
  }

  static async updateCertificateStatus(id: string, status: string, remarks?: string) {
    const updateData: any = { status };
    if (remarks) updateData.remarks = remarks;
    if (status === 'ISSUED') updateData.issuedDate = new Date();
    return prisma.certificate.update({ where: { id }, data: updateData });
  }

  static async getCertificateStats(institutionId: string) {
    const byType = await prisma.certificate.groupBy({ by: ['type'], where: { institutionId }, _count: true });
    const byStatus = await prisma.certificate.groupBy({ by: ['status'], where: { institutionId }, _count: true });
    return { byType, byStatus };
  }

  // Student Requests
  static async getStudentRequests(institutionId: string, filters?: { status?: string; type?: string }) {
    const where: any = { institutionId };
    if (filters?.status) where.status = filters.status;
    if (filters?.type) where.type = filters.type;
    return prisma.studentRequest.findMany({
      where,
      include: { student: { include: { user: { select: { firstName: true, lastName: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async updateStudentRequest(id: string, data: any) {
    const updateData: any = { status: data.status };
    if (data.reviewerComments) updateData.reviewerComments = data.reviewerComments;
    if (data.status === 'COMPLETED' || data.status === 'APPROVED') updateData.resolvedDate = new Date();
    return prisma.studentRequest.update({ where: { id }, data: updateData });
  }

  static async getRequestStats(institutionId: string) {
    const byType = await prisma.studentRequest.groupBy({ by: ['type'], where: { institutionId }, _count: true });
    const byStatus = await prisma.studentRequest.groupBy({ by: ['status'], where: { institutionId }, _count: true });
    return { byType, byStatus };
  }

  // Notices / Announcements
  static async getNotices(institutionId: string) {
    return prisma.announcement.findMany({
      where: { institutionId },
      include: { author: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createNotice(institutionId: string, authorId: string, data: any) {
    return prisma.announcement.create({
      data: { institutionId, authorId, ...data, isPublished: true, publishedAt: new Date() },
    });
  }

  // Meetings
  static async getMeetings(institutionId: string) {
    return prisma.meeting.findMany({
      where: { institutionId },
      orderBy: { meetingDate: 'asc' },
    });
  }

  static async createMeeting(institutionId: string, data: any) {
    return prisma.meeting.create({ data: { ...data, institutionId } });
  }

  static async updateMeeting(id: string, data: any) {
    return prisma.meeting.update({ where: { id }, data });
  }

  // Workflows
  static async getWorkflows(institutionId: string, filters?: { status?: string }) {
    const where: any = { institutionId };
    if (filters?.status) where.status = filters.status;
    return prisma.workflow.findMany({
      where,
      include: { creator: { select: { firstName: true, lastName: true } }, actions: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async updateWorkflow(id: string, status: string) {
    return prisma.workflow.update({ where: { id }, data: { status: status as any } });
  }

  // Documents
  static async getDocuments(institutionId: string) {
    return prisma.document.findMany({
      where: { institutionId },
      include: { uploader: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Complaints
  static async getComplaints(institutionId: string) {
    return prisma.helpdeskTicket.findMany({
      where: { institutionId, category: 'general' },
      include: { creator: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async updateComplaint(id: string, data: any) {
    const updateData: any = {};
    if (data.status) updateData.status = data.status;
    if (data.assigneeId) updateData.assigneeId = data.assigneeId;
    if (data.status === 'RESOLVED') updateData.resolvedAt = new Date();
    return prisma.helpdeskTicket.update({ where: { id }, data: updateData });
  }

  // Reports
  static async getReports(institutionId: string) {
    const [certStats, reqStats, meetingStats, workflowStats] = await Promise.all([
      prisma.certificate.groupBy({ by: ['type', 'status'], where: { institutionId }, _count: true }),
      prisma.studentRequest.groupBy({ by: ['type', 'status'], where: { institutionId }, _count: true }),
      prisma.meeting.groupBy({ by: ['status'], where: { institutionId }, _count: true }),
      prisma.workflow.groupBy({ by: ['status'], where: { institutionId }, _count: true }),
    ]);
    return { certStats, reqStats, meetingStats, workflowStats };
  }

  static async getActivities(institutionId: string) {
    const [certs, requests, meetings] = await Promise.all([
      prisma.certificate.findMany({
        where: { institutionId },
        include: { student: { include: { user: { select: { firstName: true, lastName: true } } } } },
        orderBy: { createdAt: 'desc' }, take: 5,
      }),
      prisma.studentRequest.findMany({
        where: { institutionId },
        include: { student: { include: { user: { select: { firstName: true, lastName: true } } } } },
        orderBy: { createdAt: 'desc' }, take: 5,
      }),
      prisma.meeting.findMany({
        where: { institutionId },
        orderBy: { meetingDate: 'desc' }, take: 5,
      }),
    ]);

    const activities = [
      ...certs.map((c) => ({ type: 'certificate', title: `${c.type.replace('_', ' ')} Certificate`, detail: `${c.student.user.firstName} ${c.student.user.lastName} - ${c.status}`, date: c.createdAt })),
      ...requests.map((r) => ({ type: 'request', title: r.title, detail: `${r.student.user.firstName} ${r.student.user.lastName} - ${r.status}`, date: r.createdAt })),
      ...meetings.map((m) => ({ type: 'meeting', title: m.title, detail: `${m.type} - ${m.status}`, date: m.meetingDate })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return activities.slice(0, 10);
  }
}
