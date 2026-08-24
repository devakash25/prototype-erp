import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// All features by role - the complete feature registry
const ALL_FEATURES: Record<string, string[]> = {
  CHIEF_HEAD: [
    'chief_head.dashboard', 'chief_head.authority_management', 'chief_head.fee_structure', 'chief_head.send_notification', 'chief_head.announcements',
    'chief_head.analytics_examinations', 'chief_head.analytics_faculty', 'chief_head.analytics_hostel', 'chief_head.analytics_transport',
    'chief_head.analytics_library', 'chief_head.analytics_helpdesk', 'chief_head.analytics_workflow', 'chief_head.analytics_notifications', 'chief_head.analytics_calendar',
    'chief_head.report_center', 'chief_head.custom_report_builder', 'chief_head.global_search', 'chief_head.student_analytics', 'chief_head.financial_dashboard',
    'chief_head.template_manager', 'chief_head.realtime_notifications', 'chief_head.system_settings', 'chief_head.permission_manager', 'chief_head.bulk_operations',
    'chief_head.data_backup_export', 'chief_head.audit_log', 'chief_head.appearance',
  ],
  DIRECTOR: [
    'director.dashboard', 'director.department_performance', 'director.faculty_monitoring', 'director.student_analytics', 'director.examinations',
    'director.admissions', 'director.finance_view', 'director.hr_overview', 'director.campus_services', 'director.pending_approvals',
    'director.notifications', 'director.calendar', 'director.reports',
  ],
  PRINCIPAL: [
    'principal.dashboard', 'principal.departments', 'principal.timetable', 'principal.attendance', 'principal.lms',
    'principal.faculty_status', 'principal.class_coordinators', 'principal.subject_allocation', 'principal.leave_management', 'principal.performance',
    'principal.students', 'principal.admissions', 'principal.exam_dashboard', 'principal.finance_view', 'principal.discipline',
    'principal.hostel', 'principal.library', 'principal.transport', 'principal.approvals', 'principal.notifications',
    'principal.calendar', 'principal.helpdesk', 'principal.reports',
  ],
  HOD: [
    'hod.dashboard', 'hod.department_overview', 'hod.timetable', 'hod.teachers', 'hod.workload', 'hod.faculty_attendance', 'hod.faculty_performance',
    'hod.students', 'hod.student_performance', 'hod.student_attendance', 'hod.courses', 'hod.subjects', 'hod.lms', 'hod.assignments',
    'hod.exams', 'hod.marks_entry', 'hod.notices', 'hod.approvals', 'hod.helpdesk', 'hod.calendar', 'hod.reports',
  ],
  TEACHER: [
    'teacher.dashboard', 'teacher.todays_schedule', 'teacher.my_classes', 'teacher.subjects', 'teacher.take_attendance',
    'teacher.student_list', 'teacher.student_performance', 'teacher.assignments', 'teacher.lms_overview', 'teacher.exams',
    'teacher.marks_entry', 'teacher.leave', 'teacher.calendar', 'teacher.my_class', 'teacher.notifications', 'teacher.reports',
  ],
  STUDENT: [
    'student.dashboard', 'student.my_subjects', 'student.timetable', 'student.attendance', 'student.performance',
    'student.assignments', 'student.study_materials', 'student.exam_schedule', 'student.results', 'student.fee_status',
    'student.library', 'student.hostel', 'student.transport', 'student.calendar', 'student.notices', 'student.documents', 'student.requests', 'student.profile',
  ],
  PARENT: [
    'parent.dashboard', 'parent.children', 'parent.attendance', 'parent.timetable', 'parent.performance', 'parent.assignments',
    'parent.exams', 'parent.fees', 'parent.transport', 'parent.hostel', 'parent.library', 'parent.notices', 'parent.ptm',
    'parent.leave', 'parent.complaints', 'parent.documents', 'parent.activity',
  ],
  ACCOUNTANT: [
    'accountant.dashboard', 'accountant.collect_fees', 'accountant.student_ledger', 'accountant.outstanding_dues',
    'accountant.payment_verification', 'accountant.receipts', 'accountant.refunds', 'accountant.daily_reports', 'accountant.analytics', 'accountant.profile',
  ],
  ADMISSION_COUNSELLOR: [
    'admission.dashboard', 'admission.all_applications', 'admission.new_application', 'admission.waiting_list',
    'admission.follow_ups', 'admission.reports', 'admission.analytics', 'admission.profile',
  ],
  TRANSPORT_MANAGER: [
    'transport.dashboard', 'transport.vehicles', 'transport.drivers', 'transport.driver_attendance', 'transport.routes',
    'transport.student_allocation', 'transport.daily_schedule', 'transport.maintenance', 'transport.inspections',
    'transport.complaints', 'transport.reports', 'transport.profile',
  ],
  ADMINISTRATIVE_STAFF: [
    'administrative.dashboard', 'administrative.student_requests', 'administrative.certificates', 'administrative.notices',
    'administrative.meetings', 'administrative.documents', 'administrative.approval_tracking', 'administrative.complaints',
    'administrative.reports', 'administrative.profile',
  ],
  LIBRARIAN: [
    'librarian.dashboard', 'librarian.books', 'librarian.issue_book', 'librarian.returns_renewals',
    'librarian.overdue_books', 'librarian.fines', 'librarian.members', 'librarian.analytics',
  ],
  HOSTEL_WARDEN: [
    'hostel.dashboard', 'hostel.buildings', 'hostel.rooms', 'hostel.students', 'hostel.complaints', 'hostel.analytics', 'hostel.activity',
  ],
};

// Free plan - minimal features per role
const FREE_PLAN_FEATURES: Record<string, string[]> = {
  CHIEF_HEAD: ['chief_head.dashboard', 'chief_head.authority_management', 'chief_head.fee_structure', 'chief_head.system_settings'],
  DIRECTOR: ['director.dashboard', 'director.department_performance', 'director.faculty_monitoring'],
  PRINCIPAL: ['principal.dashboard', 'principal.departments', 'principal.attendance', 'principal.faculty_status', 'principal.students'],
  HOD: ['hod.dashboard', 'hod.department_overview', 'hod.teachers', 'hod.students'],
  TEACHER: ['teacher.dashboard', 'teacher.todays_schedule', 'teacher.take_attendance', 'teacher.student_list'],
  STUDENT: ['student.dashboard', 'student.my_subjects', 'student.timetable', 'student.attendance', 'student.fee_status'],
  PARENT: ['parent.dashboard', 'parent.children', 'parent.attendance', 'parent.fees'],
  ACCOUNTANT: ['accountant.dashboard', 'accountant.collect_fees', 'accountant.student_ledger', 'accountant.outstanding_dues'],
  ADMISSION_COUNSELLOR: ['admission.dashboard', 'admission.all_applications', 'admission.new_application'],
  TRANSPORT_MANAGER: ['transport.dashboard', 'transport.vehicles', 'transport.drivers', 'transport.routes'],
  ADMINISTRATIVE_STAFF: ['administrative.dashboard', 'administrative.student_requests', 'administrative.certificates'],
  LIBRARIAN: ['librarian.dashboard', 'librarian.books', 'librarian.issue_book'],
  HOSTEL_WARDEN: ['hostel.dashboard', 'hostel.buildings', 'hostel.rooms', 'hostel.students'],
};

// Pro plan - all features
const PRO_PLAN_FEATURES: Record<string, string[]> = ALL_FEATURES;

function getAllFeatureIds(features: Record<string, string[]>): string[] {
  return Object.values(features).flat();
}

export class CEOService {
  // ========== User Management ==========

  async getUserStats() {
    const [
      totalUsers, totalStudents, totalTeachers, totalParents, totalHODs,
      totalPrincipals, totalDirectors, totalAccountants, totalAdmissions,
      totalTransport, totalAdministrative, totalLibrarians, totalHostelWardens,
      totalChiefHeads, activeUsers, inactiveUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'TEACHER' } }),
      prisma.user.count({ where: { role: 'PARENT' } }),
      prisma.user.count({ where: { role: 'HOD' } }),
      prisma.user.count({ where: { role: 'PRINCIPAL' } }),
      prisma.user.count({ where: { role: 'DIRECTOR' } }),
      prisma.user.count({ where: { role: 'ACCOUNTANT' } }),
      prisma.user.count({ where: { role: 'ADMISSION_COUNSELLOR' } }),
      prisma.user.count({ where: { role: 'TRANSPORT_MANAGER' } }),
      prisma.user.count({ where: { role: 'ADMINISTRATIVE_STAFF' } }),
      prisma.user.count({ where: { role: 'LIBRARIAN' } }),
      prisma.user.count({ where: { role: 'HOSTEL_WARDEN' } }),
      prisma.user.count({ where: { role: 'CHIEF_HEAD' } }),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: false } }),
    ]);

    return {
      totalUsers, activeUsers, inactiveUsers,
      roleBreakdown: [
        { role: 'Student', count: totalStudents },
        { role: 'Teacher', count: totalTeachers },
        { role: 'Parent', count: totalParents },
        { role: 'HOD', count: totalHODs },
        { role: 'Principal', count: totalPrincipals },
        { role: 'Director', count: totalDirectors },
        { role: 'Accountant', count: totalAccountants },
        { role: 'Admission Counsellor', count: totalAdmissions },
        { role: 'Transport Manager', count: totalTransport },
        { role: 'Administrative Staff', count: totalAdministrative },
        { role: 'Librarian', count: totalLibrarians },
        { role: 'Hostel Warden', count: totalHostelWardens },
        { role: 'Chief Head', count: totalChiefHeads },
      ],
    };
  }

  async getUsers(filters: { search?: string; role?: string; status?: string; page?: number; limit?: number }) {
    const { search, role, status, page = 1, limit = 20 } = filters;
    const where: any = {};
    if (role) where.role = role;
    if (status === 'active') where.isActive = true;
    else if (status === 'inactive') where.isActive = false;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where, skip: (page - 1) * limit, take: limit,
        select: {
          id: true, firstName: true, lastName: true, fullName: true, email: true,
          role: true, phone: true, isActive: true, lastLoginAt: true, createdAt: true,
          institution: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);
    return { users, total, page, limit };
  }

  async toggleUserStatus(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error('User not found');
    const newStatus = !user.isActive;
    await prisma.user.update({ where: { id }, data: { isActive: newStatus } });
    return { id, isActive: newStatus };
  }

  async deactivateAllUsers() {
    const result = await prisma.user.updateMany({
      where: { role: { not: 'CEO' }, isActive: true },
      data: { isActive: false },
    });
    return { deactivatedCount: result.count };
  }

  async reactivateAllUsers() {
    const result = await prisma.user.updateMany({
      where: { isActive: false },
      data: { isActive: true },
    });
    return { reactivatedCount: result.count };
  }

  // ========== Plans ==========

  async getPlans() {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        rolePricing: true,
        _count: { select: { subscriptions: true } },
      },
    });

    // Enrich with feature counts
    return plans.map((plan) => {
      const moduleCount = (plan.modules as string[]).length;
      const totalFeatures = Object.values(ALL_FEATURES).flat().length;
      const rolePricingCount = plan.rolePricing.filter((rp) => rp.isEnabled).length;
      return {
        ...plan,
        featureCount: moduleCount,
        totalFeatures,
        enabledRoles: rolePricingCount,
      };
    });
  }

  async getActivePlan() {
    // Find the currently active plan (the one selected by CEO)
    const activePlan = await prisma.subscriptionPlan.findFirst({
      where: { isActive: true },
      include: { rolePricing: true },
      orderBy: { sortOrder: 'asc' },
    });
    return activePlan;
  }

  async getActiveFeatures() {
    const activePlan = await this.getActivePlan();
    if (!activePlan) {
      // Default to Pro features if no plan is active
      return getAllFeatureIds(PRO_PLAN_FEATURES);
    }
    return activePlan.modules as string[];
  }

  async activatePlan(planId: string) {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
      include: { rolePricing: true },
    });
    if (!plan) throw new Error('Plan not found');

    // Deactivate ALL plans first (only one can be active)
    await prisma.subscriptionPlan.updateMany({
      data: { isActive: false },
    });

    // Activate the selected plan
    await prisma.subscriptionPlan.update({
      where: { id: planId },
      data: { isActive: true },
    });

    // Auto-create a charge for this plan
    const roleUserCounts = await this.getRoleUserCounts();
    const enabledRoles = plan.rolePricing.filter((rp) => rp.isEnabled);
    let totalAmount = 0;
    const breakdownParts: string[] = [];

    for (const rp of enabledRoles) {
      const users = roleUserCounts[rp.role] || 0;
      const roleAmount = Number(rp.pricePerSeat) * users;
      totalAmount += roleAmount;
      if (users > 0) {
        breakdownParts.push(`${rp.role}: ₹${rp.pricePerSeat}×${users}=₹${roleAmount}`);
      }
    }

    const now = new Date();
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + 15); // Due in 15 days

    await prisma.charge.create({
      data: {
        planId: planId,
        title: `${plan.name} Plan - ${now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`,
        description: `Auto-generated charge for ${plan.name} plan activation. ${breakdownParts.join(', ') || 'No active users for enabled roles.'}`,
        amount: totalAmount,
        type: 'subscription',
        status: 'unpaid',
        billingPeriod: 'monthly',
        dueDate,
        notes: `Plan: ${plan.name} (${plan.planType}). Enabled roles: ${enabledRoles.length}. Total users: ${Object.values(roleUserCounts).reduce((a, b) => a + b, 0)}`,
      },
    });

    return { success: true, activePlanId: planId, planName: plan.name, chargeAmount: totalAmount };
  }

  async getRoleUserCounts(): Promise<Record<string, number>> {
    const roleMap: Record<string, string> = {
      STUDENT: 'STUDENT', TEACHER: 'TEACHER', PARENT: 'PARENT', HOD: 'HOD',
      PRINCIPAL: 'PRINCIPAL', DIRECTOR: 'DIRECTOR', ACCOUNTANT: 'ACCOUNTANT',
      ADMISSION_COUNSELLOR: 'ADMISSION_COUNSELLOR', TRANSPORT_MANAGER: 'TRANSPORT_MANAGER',
      ADMINISTRATIVE_STAFF: 'ADMINISTRATIVE_STAFF', LIBRARIAN: 'LIBRARIAN',
      HOSTEL_WARDEN: 'HOSTEL_WARDEN', CHIEF_HEAD: 'CHIEF_HEAD',
    };

    const counts = await Promise.all(
      Object.values(roleMap).map(async (role) => {
        const count = await prisma.user.count({ where: { role: role as any } });
        return { role, count };
      })
    );

    const result: Record<string, number> = {};
    for (const { role, count } of counts) {
      result[role] = count;
    }
    return result;
  }

  async createPlan(data: {
    name: string;
    description?: string;
    planType?: string;
    monthlyPrice?: number;
    annualPrice?: number;
    userLimit?: number;
    storageLimitGB?: number;
    modules?: string[];
    rolePricing?: Array<{ role: string; pricePerSeat: number; isEnabled: boolean }>;
  }) {
    const maxSort = await prisma.subscriptionPlan.aggregate({ _max: { sortOrder: true } });

    const plan = await prisma.subscriptionPlan.create({
      data: {
        name: data.name,
        code: data.name.toLowerCase().replace(/\s+/g, '-'),
        description: data.description || '',
        planType: data.planType || 'custom',
        modules: data.modules || [],
        monthlyPrice: data.monthlyPrice || 0,
        annualPrice: data.annualPrice || 0,
        userLimit: data.userLimit || 100,
        storageLimitGB: data.storageLimitGB || 5,
        isActive: false,
        isDefault: false,
        sortOrder: (maxSort._max.sortOrder || 0) + 1,
        rolePricing: {
          create: (data.rolePricing || []).map((rp) => ({
            role: rp.role,
            pricePerSeat: rp.pricePerSeat,
            isEnabled: rp.isEnabled,
          })),
        },
      },
      include: { rolePricing: true },
    });

    return plan;
  }

  async updatePlan(planId: string, data: {
    name?: string;
    description?: string;
    monthlyPrice?: number;
    annualPrice?: number;
    userLimit?: number;
    storageLimitGB?: number;
    modules?: string[];
  }) {
    const existing = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!existing) throw new Error('Plan not found');

    return prisma.subscriptionPlan.update({
      where: { id: planId },
      data,
      include: { rolePricing: true },
    });
  }

  async updateRolePricing(planId: string, pricing: Array<{ role: string; pricePerSeat: number; isEnabled: boolean }>) {
    const existing = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!existing) throw new Error('Plan not found');

    for (const p of pricing) {
      await prisma.rolePricing.updateMany({
        where: { planId, role: p.role },
        data: { pricePerSeat: p.pricePerSeat, isEnabled: p.isEnabled },
      });
    }

    return prisma.rolePricing.findMany({ where: { planId } });
  }

  async deletePlan(planId: string) {
    const existing = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
      include: { _count: { select: { subscriptions: true } } },
    });
    if (!existing) throw new Error('Plan not found');
    if (existing.isActive) throw new Error('Cannot delete the active plan. Activate another plan first.');
    if (existing._count.subscriptions > 0) {
      throw new Error('Cannot delete plan with active subscriptions.');
    }

    await prisma.rolePricing.deleteMany({ where: { planId } });
    return prisma.subscriptionPlan.delete({ where: { id: planId } });
  }

  async getPlanSummary(planId: string) {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
      include: { rolePricing: true },
    });
    if (!plan) throw new Error('Plan not found');

    const enabledRoles = plan.rolePricing.filter((rp) => rp.isEnabled);

    // Get actual user counts per role
    const userCounts: Record<string, number> = {};
    for (const rp of enabledRoles) {
      const count = await prisma.user.count({
        where: { role: rp.role as any, isActive: true },
      });
      userCounts[rp.role] = count;
    }

    const roleBreakdown = enabledRoles.map((rp) => {
      const actualUsers = userCounts[rp.role] || 0;
      const monthlyCost = Number(rp.pricePerSeat) * actualUsers;
      return {
        role: rp.role,
        pricePerSeat: Number(rp.pricePerSeat),
        actualUsers,
        monthlyCost,
      };
    });

    const totalMonthly = roleBreakdown.reduce((sum, r) => sum + r.monthlyCost, 0);
    const totalAnnual = totalMonthly * 12;
    const annualDiscount = totalAnnual * 0.1;
    const totalAnnualAfterDiscount = totalAnnual - annualDiscount;

    const totalEnabledFeatures = (plan.modules as string[]).length;
    const totalFeatures = Object.values(ALL_FEATURES).flat().length;

    return {
      plan: { id: plan.id, name: plan.name, planType: plan.planType, description: plan.description, isActive: plan.isActive },
      features: { enabled: totalEnabledFeatures, total: totalFeatures, percentage: Math.round((totalEnabledFeatures / totalFeatures) * 100) },
      roleBreakdown,
      pricing: { totalMonthly, totalAnnual, annualDiscount, totalAnnualAfterDiscount },
    };
  }

  // ========== Initialize Defaults ==========

  async initializePlans() {
    // Delete existing plans
    await prisma.rolePricing.deleteMany({});
    await prisma.subscriptionPlan.deleteMany({});

    // Create Free plan
    const freeModules = getAllFeatureIds(FREE_PLAN_FEATURES);
    const freePlan = await prisma.subscriptionPlan.create({
      data: {
        name: 'Free',
        code: 'free',
        description: 'Essential features for small institutions - limited access',
        planType: 'basic',
        modules: freeModules,
        monthlyPrice: 0,
        annualPrice: 0,
        userLimit: 50,
        storageLimitGB: 5,
        isActive: false,
        isDefault: true,
        sortOrder: 1,
        rolePricing: {
          create: [
            { role: 'CHIEF_HEAD', pricePerSeat: 0, isEnabled: true },
            { role: 'DIRECTOR', pricePerSeat: 0, isEnabled: true },
            { role: 'PRINCIPAL', pricePerSeat: 0, isEnabled: true },
            { role: 'HOD', pricePerSeat: 0, isEnabled: true },
            { role: 'TEACHER', pricePerSeat: 0, isEnabled: true },
            { role: 'STUDENT', pricePerSeat: 0, isEnabled: true },
            { role: 'PARENT', pricePerSeat: 0, isEnabled: true },
            { role: 'ACCOUNTANT', pricePerSeat: 0, isEnabled: true },
            { role: 'ADMISSION_COUNSELLOR', pricePerSeat: 0, isEnabled: true },
            { role: 'TRANSPORT_MANAGER', pricePerSeat: 0, isEnabled: true },
            { role: 'ADMINISTRATIVE_STAFF', pricePerSeat: 0, isEnabled: true },
            { role: 'LIBRARIAN', pricePerSeat: 0, isEnabled: true },
            { role: 'HOSTEL_WARDEN', pricePerSeat: 0, isEnabled: true },
          ],
        },
      },
    });

    // Create Pro plan (active by default)
    const proModules = getAllFeatureIds(PRO_PLAN_FEATURES);
    const proPlan = await prisma.subscriptionPlan.create({
      data: {
        name: 'Pro',
        code: 'pro',
        description: 'All features unlocked - full access to the entire ERP system',
        planType: 'pro',
        modules: proModules,
        monthlyPrice: 14999,
        annualPrice: 149990,
        userLimit: 500,
        storageLimitGB: 50,
        isActive: true, // Active by default
        isDefault: true,
        sortOrder: 2,
        rolePricing: {
          create: [
            { role: 'CHIEF_HEAD', pricePerSeat: 800, isEnabled: true },
            { role: 'DIRECTOR', pricePerSeat: 600, isEnabled: true },
            { role: 'PRINCIPAL', pricePerSeat: 500, isEnabled: true },
            { role: 'HOD', pricePerSeat: 400, isEnabled: true },
            { role: 'TEACHER', pricePerSeat: 300, isEnabled: true },
            { role: 'STUDENT', pricePerSeat: 75, isEnabled: true },
            { role: 'PARENT', pricePerSeat: 0, isEnabled: true },
            { role: 'ACCOUNTANT', pricePerSeat: 350, isEnabled: true },
            { role: 'ADMISSION_COUNSELLOR', pricePerSeat: 300, isEnabled: true },
            { role: 'TRANSPORT_MANAGER', pricePerSeat: 300, isEnabled: true },
            { role: 'ADMINISTRATIVE_STAFF', pricePerSeat: 250, isEnabled: true },
            { role: 'LIBRARIAN', pricePerSeat: 200, isEnabled: true },
            { role: 'HOSTEL_WARDEN', pricePerSeat: 200, isEnabled: true },
          ],
        },
      },
    });

    return { success: true, freePlanId: freePlan.id, proPlanId: proPlan.id };
  }

  // ========== Feature Registry ==========

  async getFeatureRegistry() {
    return Object.entries(ALL_FEATURES).map(([role, features]) => ({
      role,
      label: role.replace(/_/g, ' '),
      features: features.map((id) => {
        const label = id.split('.').pop()!.replace(/_/g, ' ');
        return { id, label };
      }),
    }));
  }

  // ========== Charges ==========

  async getCharges(filters?: { status?: string; type?: string }) {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.type) where.type = filters.type;

    const charges = await prisma.charge.findMany({
      where,
      include: { plan: { select: { id: true, name: true, planType: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return charges.map((c) => ({
      ...c,
      amount: Number(c.amount),
      paidAmount: c.paidAmount ? Number(c.paidAmount) : null,
    }));
  }

  async getChargeStats() {
    const [totalCharges, paidCharges, unpaidCharges, overdueCharges] = await Promise.all([
      prisma.charge.count(),
      prisma.charge.count({ where: { status: 'paid' } }),
      prisma.charge.count({ where: { status: 'unpaid' } }),
      prisma.charge.count({ where: { status: 'overdue' } }),
    ]);

    const [totalAmount, paidAmount, unpaidAmount] = await Promise.all([
      prisma.charge.aggregate({ _sum: { amount: true } }),
      prisma.charge.aggregate({ _sum: { amount: true }, where: { status: 'paid' } }),
      prisma.charge.aggregate({ _sum: { amount: true }, where: { status: { in: ['unpaid', 'overdue'] } } }),
    ]);

    return {
      totalCharges,
      paidCharges,
      unpaidCharges,
      overdueCharges,
      totalAmount: Number(totalAmount._sum.amount || 0),
      paidAmount: Number(paidAmount._sum.amount || 0),
      unpaidAmount: Number(unpaidAmount._sum.amount || 0),
    };
  }

  async createCharge(data: {
    planId?: string;
    title: string;
    description?: string;
    amount: number;
    type?: string;
    billingPeriod?: string;
    dueDate?: string;
    notes?: string;
  }) {
    return prisma.charge.create({
      data: {
        planId: data.planId || null,
        title: data.title,
        description: data.description || '',
        amount: data.amount,
        type: data.type || 'custom',
        status: 'unpaid',
        billingPeriod: data.billingPeriod || 'one-time',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        notes: data.notes || '',
      },
      include: { plan: { select: { id: true, name: true } } },
    });
  }

  async updateChargeStatus(chargeId: string, status: string, paymentData?: {
    paidAmount?: number;
    paymentMethod?: string;
    transactionId?: string;
    receiptNumber?: string;
  }) {
    const charge = await prisma.charge.findUnique({ where: { id: chargeId } });
    if (!charge) throw new Error('Charge not found');

    const updateData: any = { status };
    if (status === 'paid') {
      updateData.paidAt = new Date();
      if (paymentData?.paidAmount) updateData.paidAmount = paymentData.paidAmount;
      if (paymentData?.paymentMethod) updateData.paymentMethod = paymentData.paymentMethod;
      if (paymentData?.transactionId) updateData.transactionId = paymentData.transactionId;
      if (paymentData?.receiptNumber) updateData.receiptNumber = paymentData.receiptNumber;
    }

    return prisma.charge.update({
      where: { id: chargeId },
      data: updateData,
      include: { plan: { select: { id: true, name: true } } },
    });
  }

  async deleteCharge(chargeId: string) {
    const charge = await prisma.charge.findUnique({ where: { id: chargeId } });
    if (!charge) throw new Error('Charge not found');
    if (charge.status === 'paid') throw new Error('Cannot delete a paid charge');
    return prisma.charge.delete({ where: { id: chargeId } });
  }

  // ========== Dashboard ==========

  async getDashboardStats() {
    const [userStats, chargeStats, activePlan] = await Promise.all([
      this.getUserStats(),
      this.getChargeStats(),
      prisma.subscriptionPlan.findFirst({
        where: { isActive: true },
        include: { rolePricing: true },
      }),
    ]);

    return {
      users: userStats,
      revenue: {
        total: chargeStats.totalAmount,
        paid: chargeStats.paidAmount,
        unpaid: chargeStats.unpaidAmount,
      },
      activePlan: activePlan ? {
        id: activePlan.id,
        name: activePlan.name,
        planType: activePlan.planType,
        monthlyPrice: Number(activePlan.monthlyPrice),
        featureCount: (activePlan.modules as string[]).length,
        enabledRoles: activePlan.rolePricing.filter((rp) => rp.isEnabled).length,
      } : null,
    };
  }
}

export const ceoService = new CEOService();
