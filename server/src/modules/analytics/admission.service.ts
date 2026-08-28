import { prisma } from '../../config/database';

class AdmissionAnalyticsService {
  private async resolve(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    return { institutionId: user.institutionId!, userId };
  }

  async getKPIs(userId: string) {
    const { institutionId } = await this.resolve(userId);
    const today = new Date(); today.setHours(0,0,0,0);
    const todayEnd = new Date(today); todayEnd.setHours(23,59,59,999);

    const [todayEnquiries, totalApplications, pendingReview, approved, rejected, enrolled, followUpPending, underReview, incompleteDocs] = await Promise.all([
      prisma.admission.count({ where: { institutionId, createdAt: { gte: today, lte: todayEnd } } }),
      prisma.admission.count({ where: { institutionId } }),
      prisma.admission.count({ where: { institutionId, status: 'APPLIED' } }),
      prisma.admission.count({ where: { institutionId, status: 'APPROVED' } }),
      prisma.admission.count({ where: { institutionId, status: 'REJECTED' } }),
      prisma.admission.count({ where: { institutionId, status: 'ENROLLED' } }),
      prisma.admission.count({ where: { institutionId, followUpDate: { not: null }, status: { in: ['APPLIED', 'UNDER_REVIEW'] } } }),
      prisma.admission.count({ where: { institutionId, status: 'UNDER_REVIEW' } }),
      prisma.admission.count({ where: { institutionId, documents: { equals: null } as any, status: { in: ['APPLIED', 'UNDER_REVIEW'] } } }),
    ]);

    return {
      todayEnquiries,
      newApplications: totalApplications,
      totalApplications,
      pendingVerification: pendingReview,
      admissionsApproved: approved,
      incompleteDocuments: incompleteDocs,
      admissionTarget: totalApplications > 0 ? ((enrolled / Math.max(totalApplications, 1)) * 100).toFixed(0) : '0',
      underReview,
      followupsPending: followUpPending,
      rejected,
      enrolled,
      conversionRate: totalApplications > 0 ? ((enrolled / totalApplications) * 100).toFixed(1) : '0',
      sourceWebsite: 0,
      sourceWalkin: 0,
      sourceReferral: 0,
      sourceSocial: 0,
    };
  }

  async getFunnel(userId: string) {
    const { institutionId } = await this.resolve(userId);
    const stages = [
      { name: 'Applied', status: 'APPLIED' },
      { name: 'Under Review', status: 'UNDER_REVIEW' },
      { name: 'Approved', status: 'APPROVED' },
      { name: 'Enrolled', status: 'ENROLLED' },
      { name: 'Rejected', status: 'REJECTED' },
    ];
    const results = await Promise.all(
      stages.map(s => prisma.admission.count({ where: { institutionId, status: s.status as any } }))
    );
    return stages.map((s, i) => ({ stage: s.name, count: results[i] }));
  }

  async getApplications(userId: string, search?: string, status?: string, page = 1, limit = 20) {
    const { institutionId } = await this.resolve(userId);
    const where: any = { institutionId };
    if (status && status !== 'ALL') where.status = status;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { applicationNumber: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [admissions, total] = await Promise.all([
      prisma.admission.findMany({
        where, include: { course: { select: { name: true } }, department: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit, take: limit,
      }),
      prisma.admission.count({ where }),
    ]);
    return { admissions, total, totalPages: Math.ceil(total / limit), page };
  }

  async getApplicationDetail(userId: string, admissionId: string) {
    const { institutionId } = await this.resolve(userId);
    return prisma.admission.findFirst({
      where: { id: admissionId, institutionId },
      include: { course: { select: { name: true } }, department: { select: { name: true } } },
    });
  }

  async createApplication(userId: string, data: any) {
    const { institutionId } = await this.resolve(userId);
    const session = await prisma.academicSession.findFirst({ where: { institutionId, isActive: true } });
    if (!session) throw new Error('No active academic session');
    const count = await prisma.admission.count({ where: { institutionId } });
    const applicationNumber = 'ADM' + new Date().getFullYear() + String(count + 1).padStart(3, '0');
    return prisma.admission.create({
      data: {
        institutionId, academicSessionId: session.id, applicationNumber,
        firstName: data.firstName, lastName: data.lastName, email: data.email,
        phone: data.phone, dateOfBirth: new Date(data.dateOfBirth), gender: data.gender,
        courseId: data.courseId, departmentId: data.departmentId,
        previousSchool: data.previousSchool, previousPercentage: data.previousPercentage,
        parentName: data.parentName, parentPhone: data.parentPhone, parentEmail: data.parentEmail,
        address: data.address, city: data.city, state: data.state, pincode: data.pincode,
        category: data.category, source: data.source || 'DIRECT', priority: data.priority || 'MEDIUM',
        counselorNotes: data.counselorNotes || undefined, notes: data.notes || undefined,
      },
    });
  }

  async updateApplication(userId: string, admissionId: string, data: any) {
    const { institutionId } = await this.resolve(userId);
    return prisma.admission.updateMany({
      where: { id: admissionId, institutionId }, data,
    });
  }

  async reviewApplication(userId: string, admissionId: string) {
    const { institutionId } = await this.resolve(userId);
    return prisma.admission.updateMany({
      where: { id: admissionId, institutionId },
      data: { status: 'UNDER_REVIEW', reviewedAt: new Date(), reviewedBy: userId },
    });
  }

  async approveApplication(userId: string, admissionId: string) {
    const { institutionId } = await this.resolve(userId);
    return prisma.admission.updateMany({
      where: { id: admissionId, institutionId },
      data: { status: 'APPROVED', approvedAt: new Date(), approvedBy: userId },
    });
  }

  async rejectApplication(userId: string, admissionId: string, reason?: string) {
    const { institutionId } = await this.resolve(userId);
    return prisma.admission.updateMany({
      where: { id: admissionId, institutionId },
      data: { status: 'REJECTED', rejectedAt: new Date(), rejectedBy: userId, rejectionReason: reason },
    });
  }

  async enrollStudent(userId: string, admissionId: string) {
    const { institutionId } = await this.resolve(userId);
    const admission = await prisma.admission.findFirst({ where: { id: admissionId, institutionId } });
    if (!admission) throw new Error('Admission not found');
    if (admission.status !== 'APPROVED') throw new Error('Only approved admissions can be enrolled');

    if (!admission.courseId) throw new Error('No course assigned to admission');

    const user = await prisma.user.create({
      data: {
        email: admission.email, password: '$2b$12$ENROLLED', role: 'STUDENT',
        firstName: admission.firstName, lastName: admission.lastName,
        fullName: admission.firstName + ' ' + admission.lastName,
        institutionId,
      },
    });

    const session = await prisma.academicSession.findFirst({ where: { institutionId, isActive: true } });

    const student = await prisma.student.create({
      data: {
        institutionId, userId: user.id,
        admissionNumber: admission.applicationNumber,
        courseId: admission.courseId,
        departmentId: admission.departmentId!,
        academicSessionId: session?.id || '',
        admissionType: 'REGULAR',
        enrollmentDate: new Date(),
      },
    });

    await prisma.admission.update({
      where: { id: admissionId },
      data: { status: 'ENROLLED', studentId: student.id },
    });

    return { student, user, message: 'Student enrolled successfully' };
  }

  async setFollowUp(userId: string, admissionId: string, followUpDate: string, notes?: string) {
    const { institutionId } = await this.resolve(userId);
    return prisma.admission.updateMany({
      where: { id: admissionId, institutionId },
      data: { followUpDate: new Date(followUpDate), lastFollowUp: new Date(), counselorNotes: notes || undefined },
    });
  }

  async getFollowUps(userId: string) {
    const { institutionId } = await this.resolve(userId);
    return prisma.admission.findMany({
      where: { institutionId, followUpDate: { not: null }, status: { in: ['APPLIED', 'UNDER_REVIEW'] } },
      include: { course: { select: { name: true } } },
      orderBy: { followUpDate: 'asc' },
    });
  }

  async getWaitingList(userId: string) {
    const { institutionId } = await this.resolve(userId);
    return prisma.admission.findMany({
      where: { institutionId, status: 'APPLIED', priority: { in: ['HIGH', 'URGENT'] } },
      include: { course: { select: { name: true } } },
      orderBy: { appliedAt: 'asc' },
    });
  }

  async getAnalytics(userId: string) {
    const { institutionId } = await this.resolve(userId);
    const [statusDistribution, sourceDistribution, categoryDistribution, genderDistribution] = await Promise.all([
      prisma.admission.groupBy({ by: ['status'], where: { institutionId }, _count: true }),
      prisma.admission.groupBy({ by: ['source'], where: { institutionId }, _count: true }),
      prisma.admission.groupBy({ by: ['category'], where: { institutionId }, _count: true }),
      prisma.admission.groupBy({ by: ['gender'], where: { institutionId }, _count: true }),
    ]);
    return {
      statusDistribution: statusDistribution.map(s => ({ name: s.status, count: s._count })),
      sourceDistribution: sourceDistribution.map(s => ({ name: s.source || 'Unknown', count: s._count })),
      categoryDistribution: categoryDistribution.map(s => ({ name: s.category || 'Unknown', count: s._count })),
      genderDistribution: genderDistribution.map(s => ({ name: s.gender, count: s._count })),
    };
  }

  async getRecentActivity(userId: string, limit = 15) {
    const { institutionId } = await this.resolve(userId);
    const admissions = await prisma.admission.findMany({
      where: { institutionId },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      select: { id: true, firstName: true, lastName: true, applicationNumber: true, status: true, updatedAt: true, source: true },
    });
    return admissions.map(a => ({
      id: a.id,
      description: `${a.firstName} ${a.lastName} - ${a.status.replace('_', ' ')}`,
      date: a.updatedAt,
      source: a.source,
      applicationNumber: a.applicationNumber,
    }));
  }

  async getReports(userId: string) {
    const { institutionId } = await this.resolve(userId);
    const total = await prisma.admission.count({ where: { institutionId } });
    const byStatus = await prisma.admission.groupBy({ by: ['status'], where: { institutionId }, _count: true });
    const bySource = await prisma.admission.groupBy({ by: ['source'], where: { institutionId }, _count: true });
    const byCategory = await prisma.admission.groupBy({ by: ['category'], where: { institutionId }, _count: true });
    const byGender = await prisma.admission.groupBy({ by: ['gender'], where: { institutionId }, _count: true });
    return { total, byStatus, bySource, byCategory, byGender };
  }

  async getDailyActivities(userId: string) {
    const { institutionId } = await this.resolve(userId);
    const today = new Date(); today.setHours(0,0,0,0);
    const todayEnd = new Date(today); todayEnd.setHours(23,59,59,999);
    return prisma.admission.findMany({
      where: { institutionId, createdAt: { gte: today, lte: todayEnd } },
      orderBy: { createdAt: 'asc' },
      select: { id: true, firstName: true, lastName: true, applicationNumber: true, status: true, source: true, createdAt: true },
    });
  }
}

export const admissionAnalyticsService = new AdmissionAnalyticsService();
