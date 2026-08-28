import { prisma } from '../../config/database';

class AccountantAnalyticsService {
  private async resolve(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, institutionId: true },
    });
    if (!user || !user.institutionId) throw new Error('User not found or no institution');
    return { institutionId: user.institutionId };
  }

  async getKPIs(userId: string) {
    const { institutionId } = await this.resolve(userId);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [todayCollection, monthRevenue, weekRevenue, pendingFeesResult, studentsPendingList, onlinePayments, cashCounter, chequePayments, failedPayments, refundRequests] = await Promise.all([
      prisma.feePayment.aggregate({
        where: { student: { institutionId }, status: 'PAID', paidAt: { gte: today, lt: todayEnd } },
        _sum: { paidAmount: true },
      }),
      prisma.feePayment.aggregate({
        where: { student: { institutionId }, status: 'PAID', paidAt: { gte: monthStart, lte: monthEnd } },
        _sum: { paidAmount: true },
      }),
      prisma.feePayment.aggregate({
        where: { student: { institutionId }, status: 'PAID', paidAt: { gte: weekStart } },
        _sum: { paidAmount: true },
      }),
      prisma.feePayment.aggregate({
        where: { student: { institutionId }, status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] } },
        _sum: { dueAmount: true },
      }),
      prisma.feePayment.findMany({
        where: { student: { institutionId }, status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] } },
        select: { studentId: true },
        distinct: ['studentId'],
      }),
      prisma.feePayment.count({
        where: { student: { institutionId }, paymentMethod: { in: ['UPI', 'CARD', 'ONLINE'] }, status: 'PAID', paidAt: { gte: monthStart, lte: monthEnd } },
      }),
      prisma.feePayment.aggregate({
        where: { student: { institutionId }, paymentMethod: 'CASH', status: 'PAID', paidAt: { gte: today, lt: todayEnd } },
        _sum: { paidAmount: true },
      }),
      prisma.feePayment.count({
        where: { student: { institutionId }, paymentMethod: 'CHEQUE', status: 'PAID', paidAt: { gte: monthStart, lte: monthEnd } },
      }),
      prisma.feePayment.count({
        where: { student: { institutionId }, status: 'CANCELLED' },
      }),
      prisma.refund.count({
        where: { payment: { student: { institutionId } }, status: 'pending' },
      }),
    ]);

    const totalFees = await prisma.feePayment.aggregate({
      where: { student: { institutionId } }, _sum: { amount: true },
    });
    const totalPaid = await prisma.feePayment.aggregate({
      where: { student: { institutionId }, status: 'PAID' }, _sum: { paidAmount: true },
    });
    const totalFeesNum = Number(totalFees._sum.amount || 0);
    const totalPaidNum = Number(totalPaid._sum.paidAmount || 0);

    return {
      todayCollection: Number(todayCollection._sum.paidAmount || 0),
      monthRevenue: Number(monthRevenue._sum.paidAmount || 0),
      weekCollection: Number(weekRevenue._sum.paidAmount || 0),
      pendingFees: Number(pendingFeesResult._sum.dueAmount || 0),
      studentsPending: studentsPendingList.length,
      onlinePayments,
      cashCounter: Number(cashCounter._sum.paidAmount || 0),
      chequePayments,
      failedPayments,
      refundRequests,
      collectionRate: totalFeesNum > 0 ? Math.round((totalPaidNum / totalFeesNum) * 100) : 0,
    };
  }

  async getRevenueByType(userId: string) {
    const { institutionId } = await this.resolve(userId);

    const payments = await prisma.feePayment.groupBy({
      by: ['feeStructureId'],
      where: { student: { institutionId } },
      _sum: { paidAmount: true, dueAmount: true },
    });

    const feeStructures = await prisma.feeStructure.findMany({
      where: { id: { in: payments.map(p => p.feeStructureId) } },
      select: { id: true, name: true },
    });
    const fsMap = new Map(feeStructures.map(f => [f.id, f.name]));

    return payments.map(p => ({
      feeType: fsMap.get(p.feeStructureId) || 'Unknown',
      collected: Number(p._sum.paidAmount || 0),
      pending: Number(p._sum.dueAmount || 0),
    }));
  }

  async getStudentLedger(userId: string, search?: string, page = 1, limit = 20) {
    const { institutionId } = await this.resolve(userId);
    const where: any = { institutionId, isActive: true };
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
          user: { select: { fullName: true } },
          course: { select: { name: true } },
          feePayments: { select: { amount: true, paidAmount: true, dueAmount: true, status: true } },
        },
        orderBy: { enrollmentDate: 'desc' },
      }),
      prisma.student.count({ where }),
    ]);

    return {
      students: students.map(s => {
        const totalFees = s.feePayments.reduce((sum, p) => sum + Number(p.amount), 0);
        const paid = s.feePayments.reduce((sum, p) => sum + Number(p.paidAmount), 0);
        const due = s.feePayments.reduce((sum, p) => sum + Number(p.dueAmount), 0);
        return {
          id: s.id, name: s.user.fullName, admissionNumber: s.admissionNumber,
          course: s.course.name, totalFees, paid, due, payments: s.feePayments,
        };
      }),
      total, page, limit, totalPages: Math.ceil(total / limit),
    };
  }

  async getStudentFeeDetails(userId: string, studentId: string) {
    const { institutionId } = await this.resolve(userId);

    const student = await prisma.student.findFirst({
      where: { id: studentId, institutionId },
      include: {
        user: { select: { fullName: true, email: true, phone: true } },
        course: { select: { name: true } },
        feePayments: {
          include: { feeStructure: { include: { components: true } } },
          orderBy: { createdAt: 'desc' },
        },
        scholarships: {
          include: { scholarship: { select: { name: true, amount: true } } },
        },
      },
    });

    if (!student) throw new Error('Student not found');

    const totalFees = student.feePayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalPaid = student.feePayments.reduce((sum, p) => sum + Number(p.paidAmount), 0);
    const totalDue = student.feePayments.reduce((sum, p) => sum + Number(p.dueAmount), 0);
    const totalScholarship = student.scholarships.reduce((sum, s) => sum + Number(s.amount), 0);

    return {
      student: {
        id: student.id, name: student.user.fullName, email: student.user.email,
        phone: student.user.phone, admissionNumber: student.admissionNumber, course: student.course.name,
      },
      summary: { totalFees, totalPaid, totalDue, totalScholarship },
      payments: student.feePayments,
      scholarships: student.scholarships,
    };
  }

  async collectFee(userId: string, data: {
    studentId: string; feeStructureId: string; amount: number;
    paymentMethod: string; transactionId?: string; notes?: string;
  }) {
    const { institutionId } = await this.resolve(userId);

    const student = await prisma.student.findFirst({
      where: { id: data.studentId, institutionId },
    });
    if (!student) throw new Error('Student not found');

    const existingPayment = await prisma.feePayment.findFirst({
      where: {
        studentId: data.studentId, feeStructureId: data.feeStructureId,
        status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] },
      },
    });

    const receiptNumber = `REC-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    let payment;
    if (existingPayment) {
      const newPaidAmount = Number(existingPayment.paidAmount) + data.amount;
      const newDueAmount = Number(existingPayment.amount) - newPaidAmount;
      const newStatus = newDueAmount <= 0 ? 'PAID' : 'PARTIAL';

      payment = await prisma.feePayment.update({
        where: { id: existingPayment.id },
        data: {
          paidAmount: newPaidAmount, dueAmount: Math.max(0, newDueAmount),
          status: newStatus as any, paymentMethod: data.paymentMethod as any,
          transactionId: data.transactionId, receiptNumber, paidAt: new Date(), notes: data.notes,
        },
        include: {
          student: { include: { user: { select: { fullName: true } } } },
          feeStructure: { select: { name: true } },
        },
      });
    } else {
      const feeStructure = await prisma.feeStructure.findUnique({ where: { id: data.feeStructureId } });
      if (!feeStructure) throw new Error('Fee structure not found');

      const dueAmount = Number(feeStructure.totalAmount) - data.amount;
      payment = await prisma.feePayment.create({
        data: {
          studentId: data.studentId, feeStructureId: data.feeStructureId,
          amount: feeStructure.totalAmount, paidAmount: data.amount,
          dueAmount: Math.max(0, dueAmount), status: dueAmount <= 0 ? 'PAID' : 'PARTIAL',
          paymentMethod: data.paymentMethod as any, transactionId: data.transactionId,
          receiptNumber, paidAt: new Date(), notes: data.notes,
        },
        include: {
          student: { include: { user: { select: { fullName: true } } } },
          feeStructure: { select: { name: true } },
        },
      });
    }

    return payment;
  }

  async getPendingVerifications(userId: string) {
    const { institutionId } = await this.resolve(userId);
    return prisma.feePayment.findMany({
      where: {
        student: { institutionId }, status: { in: ['PENDING', 'PARTIAL'] }, paidAt: { not: null },
      },
      include: {
        student: { include: { user: { select: { fullName: true } } } },
        feeStructure: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async verifyPayment(userId: string, paymentId: string, status: 'PAID' | 'FAILED', notes?: string) {
    const { institutionId } = await this.resolve(userId);

    const payment = await prisma.feePayment.findFirst({
      where: { id: paymentId, student: { institutionId } },
    });
    if (!payment) throw new Error('Payment not found');

    return prisma.feePayment.update({
      where: { id: paymentId },
      data: { status: status as any, notes: notes || payment.notes },
      include: {
        student: { include: { user: { select: { fullName: true } } } },
        feeStructure: { select: { name: true } },
      },
    });
  }

  async getReceipts(userId: string, studentId?: string, page = 1, limit = 20) {
    const { institutionId } = await this.resolve(userId);
    const where: any = {
      student: { institutionId }, status: 'PAID', receiptNumber: { not: null },
    };
    if (studentId) where.studentId = studentId;

    const [payments, total] = await Promise.all([
      prisma.feePayment.findMany({
        where, skip: (page - 1) * limit, take: limit,
        include: {
          student: { include: { user: { select: { fullName: true } } } },
          feeStructure: { select: { name: true } },
        },
        orderBy: { paidAt: 'desc' },
      }),
      prisma.feePayment.count({ where }),
    ]);

    return { payments, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getReceiptById(userId: string, paymentId: string) {
    const { institutionId } = await this.resolve(userId);
    const payment = await prisma.feePayment.findFirst({
      where: { id: paymentId, student: { institutionId } },
      include: {
        student: { include: { user: { select: { fullName: true, email: true, phone: true } } } },
        feeStructure: { include: { components: true } },
      },
    });
    if (!payment) throw new Error('Payment not found');
    return payment;
  }

  async getOutstandingDues(userId: string) {
    const { institutionId } = await this.resolve(userId);

    const payments = await prisma.feePayment.findMany({
      where: { student: { institutionId }, status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] } },
      include: {
        student: { include: { user: { select: { fullName: true } }, course: { select: { name: true } } } },
        feeStructure: { select: { name: true } },
      },
      orderBy: { dueDate: 'asc' },
    });

    const now = new Date();
    const flatDues = payments.map(p => {
      const dueDate = p.dueDate ? new Date(p.dueDate) : null;
      const daysOverdue = dueDate && dueDate < now
        ? Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      return {
        studentId: p.studentId,
        studentName: p.student.user.fullName,
        admissionNumber: p.student.admissionNumber,
        course: p.student.course?.name || '',
        feeType: p.feeStructure.name,
        amountDue: Number(p.dueAmount),
        dueDate: p.dueDate,
        daysOverdue,
        status: p.status,
      };
    });

    const totalOutstanding = flatDues.reduce((sum, d) => sum + d.amountDue, 0);
    return { students: flatDues, totalOutstanding };
  }

  async getRefunds(userId: string) {
    const { institutionId } = await this.resolve(userId);
    const refunds = await prisma.refund.findMany({
      where: { payment: { student: { institutionId } } },
      include: {
        payment: {
          include: {
            student: { include: { user: { select: { fullName: true } } } },
            feeStructure: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return refunds.map(r => ({
      id: r.id,
      studentName: r.payment.student.user.fullName,
      admissionNumber: r.payment.student.admissionNumber,
      amount: Number(r.amount),
      reason: r.reason,
      date: r.createdAt,
      status: r.status,
    }));
  }

  async processRefund(userId: string, refundId: string, action: 'APPROVE' | 'REJECT', notes?: string) {
    const { institutionId } = await this.resolve(userId);

    const refund = await prisma.refund.findFirst({
      where: { id: refundId, payment: { student: { institutionId } } },
    });
    if (!refund) throw new Error('Refund not found');

    return prisma.refund.update({
      where: { id: refundId },
      data: { status: action === 'APPROVE' ? 'approved' : 'rejected', approvedBy: userId, processedAt: new Date() },
      include: {
        payment: { include: { student: { include: { user: { select: { fullName: true } } } } } },
      },
    });
  }

  async getDailyReport(userId: string, date?: string) {
    const { institutionId } = await this.resolve(userId);
    const targetDate = date ? new Date(date) : new Date();
    const dayStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    const payments = await prisma.feePayment.findMany({
      where: { student: { institutionId }, status: 'PAID', paidAt: { gte: dayStart, lt: dayEnd } },
      include: {
        student: { include: { user: { select: { fullName: true } } } },
        feeStructure: { select: { name: true } },
      },
      orderBy: { paidAt: 'asc' },
    });

    const byMethod: Record<string, { count: number; total: number }> = {};
    for (const p of payments) {
      const method = p.paymentMethod || 'UNKNOWN';
      if (!byMethod[method]) byMethod[method] = { count: 0, total: 0 };
      byMethod[method].count++;
      byMethod[method].total += Number(p.paidAmount);
    }

    return {
      date: dayStart.toISOString().split('T')[0], transactions: payments,
      byMethod, totalCollected: payments.reduce((sum, p) => sum + Number(p.paidAmount), 0),
      totalTransactions: payments.length,
    };
  }

  async getMonthlyReport(userId: string, month?: number, year?: number) {
    const { institutionId } = await this.resolve(userId);
    const now = new Date();
    const m = month ?? now.getMonth();
    const y = year ?? now.getFullYear();
    const monthStart = new Date(y, m, 1);
    const monthEnd = new Date(y, m + 1, 0, 23, 59, 59, 999);

    const payments = await prisma.feePayment.findMany({
      where: { student: { institutionId }, status: 'PAID', paidAt: { gte: monthStart, lte: monthEnd } },
      include: {
        student: { include: { user: { select: { fullName: true } } } },
        feeStructure: { select: { name: true, departmentId: true } },
      },
    });

    const byFeeType: Record<string, number> = {};
    const byMethod: Record<string, number> = {};

    for (const p of payments) {
      byFeeType[p.feeStructure.name] = (byFeeType[p.feeStructure.name] || 0) + Number(p.paidAmount);
      byMethod[p.paymentMethod || 'UNKNOWN'] = (byMethod[p.paymentMethod || 'UNKNOWN'] || 0) + Number(p.paidAmount);
    }

    const deptIds = [...new Set(payments.map(p => p.feeStructure.departmentId).filter(Boolean))] as string[];
    const byDepartment: Record<string, number> = {};
    if (deptIds.length > 0) {
      const depts = await prisma.department.findMany({ where: { id: { in: deptIds } }, select: { id: true, name: true } });
      const deptMap = new Map(depts.map(d => [d.id, d.name]));
      for (const p of payments) {
        if (p.feeStructure.departmentId) {
          const deptName = deptMap.get(p.feeStructure.departmentId) || 'Unknown';
          byDepartment[deptName] = (byDepartment[deptName] || 0) + Number(p.paidAmount);
        }
      }
    }

    return {
      month: m + 1, year: y,
      totalRevenue: payments.reduce((sum, p) => sum + Number(p.paidAmount), 0),
      totalTransactions: payments.length,
      byFeeType: Object.entries(byFeeType).map(([name, amount]) => ({ name, amount })),
      byMethod: Object.entries(byMethod).map(([name, amount]) => ({ name, amount })),
      byDepartment: Object.entries(byDepartment).map(([name, amount]) => ({ name, amount })),
    };
  }

  async getRevenueAnalytics(userId: string) {
    const { institutionId } = await this.resolve(userId);
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentPayments = await prisma.feePayment.findMany({
      where: { student: { institutionId }, status: 'PAID', paidAt: { gte: thirtyDaysAgo } },
      select: { paidAmount: true, paidAt: true, paymentMethod: true, feeStructureId: true },
    });

    const dailyMap: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dailyMap[d.toISOString().split('T')[0]] = 0;
    }
    for (const p of recentPayments) {
      if (p.paidAt) {
        const key = p.paidAt.toISOString().split('T')[0];
        if (dailyMap[key] !== undefined) dailyMap[key] += Number(p.paidAmount);
      }
    }
    const dailyTrend = Object.entries(dailyMap)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const modeMap: Record<string, number> = {};
    for (const p of recentPayments) {
      const mode = p.paymentMethod || 'UNKNOWN';
      modeMap[mode] = (modeMap[mode] || 0) + Number(p.paidAmount);
    }
    const paymentModeDistribution = Object.entries(modeMap).map(([name, amount]) => ({ name, amount }));

    const feeTypeMap: Record<string, number> = {};
    for (const p of recentPayments) {
      feeTypeMap[p.feeStructureId] = (feeTypeMap[p.feeStructureId] || 0) + Number(p.paidAmount);
    }
    const feeStructures = await prisma.feeStructure.findMany({
      where: { id: { in: Object.keys(feeTypeMap) } }, select: { id: true, name: true },
    });
    const fsMap = new Map(feeStructures.map(f => [f.id, f.name]));
    const revenueByFeeType = Object.entries(feeTypeMap).map(([id, amount]) => ({
      name: fsMap.get(id) || 'Unknown', amount,
    }));

    return { dailyTrend, paymentModeDistribution, revenueByFeeType };
  }

  async getCollectionPerformance(userId: string) {
    const { institutionId } = await this.resolve(userId);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [totalStudents, collectedThisMonth, totalFees, totalPaid, totalDue] = await Promise.all([
      prisma.student.count({ where: { institutionId, isActive: true } }),
      prisma.feePayment.aggregate({
        where: { student: { institutionId }, status: 'PAID', paidAt: { gte: monthStart, lte: monthEnd } },
        _sum: { paidAmount: true },
      }),
      prisma.feePayment.aggregate({
        where: { student: { institutionId } }, _sum: { amount: true },
      }),
      prisma.feePayment.aggregate({
        where: { student: { institutionId }, status: 'PAID' }, _sum: { paidAmount: true },
      }),
      prisma.feePayment.aggregate({
        where: { student: { institutionId }, status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] } },
        _sum: { dueAmount: true },
      }),
    ]);

    const monthlyCollected = Number(collectedThisMonth._sum.paidAmount || 0);
    const totalFeesAmount = Number(totalFees._sum.amount || 0);
    const totalPaidAmount = Number(totalPaid._sum.paidAmount || 0);
    const totalDueAmount = Number(totalDue._sum.dueAmount || 0);

    return {
      monthlyCollected, totalFees: totalFeesAmount, totalPaid: totalPaidAmount,
      totalDue: totalDueAmount,
      collectionRate: totalFeesAmount > 0 ? Math.round((totalPaidAmount / totalFeesAmount) * 100) : 0,
      avgCollectionPerStudent: totalStudents > 0 ? Math.round(monthlyCollected / totalStudents) : 0,
      totalStudents,
    };
  }

  async getRecentActivity(userId: string, limit = 15) {
    const { institutionId } = await this.resolve(userId);

    const [payments, refunds] = await Promise.all([
      prisma.feePayment.findMany({
        where: { student: { institutionId }, status: 'PAID' },
        include: { student: { include: { user: { select: { fullName: true } } } } },
        orderBy: { paidAt: 'desc' }, take: limit,
      }),
      prisma.refund.findMany({
        where: { payment: { student: { institutionId } } },
        include: { payment: { include: { student: { include: { user: { select: { fullName: true } } } } } } },
        orderBy: { createdAt: 'desc' }, take: limit,
      }),
    ]);

    const activities: any[] = [];
    payments.forEach(p => activities.push({
      type: 'payment', id: p.id,
      description: `Fee payment of ₹${p.paidAmount} by ${p.student.user.fullName}`,
      receiptNumber: p.receiptNumber, amount: Number(p.paidAmount), date: p.paidAt,
    }));
    refunds.forEach(r => activities.push({
      type: 'refund', id: r.id,
      description: `Refund of ₹${r.amount} for ${r.payment.student.user.fullName}`,
      amount: Number(r.amount), status: r.status, date: r.createdAt,
    }));

    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return activities.slice(0, limit);
  }

  async getAllStudentsFeeSummary(userId: string, search?: string, status?: string, page = 1, limit = 20) {
    const { institutionId } = await this.resolve(userId);
    const studentWhere: any = { institutionId, isActive: true };
    if (search) {
      studentWhere.OR = [
        { user: { fullName: { contains: search, mode: 'insensitive' } } },
        { admissionNumber: { contains: search, mode: 'insensitive' } },
        { rollNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const students = await prisma.student.findMany({
      where: studentWhere,
      include: {
        user: { select: { fullName: true } },
        course: { select: { name: true } },
        feePayments: { select: { amount: true, paidAmount: true, dueAmount: true, status: true } },
      },
      orderBy: { enrollmentDate: 'desc' },
    });

    const summaries = students.map(s => {
      const totalFees = s.feePayments.reduce((sum, p) => sum + Number(p.amount), 0);
      const paid = s.feePayments.reduce((sum, p) => sum + Number(p.paidAmount), 0);
      const due = s.feePayments.reduce((sum, p) => sum + Number(p.dueAmount), 0);
      const hasPending = s.feePayments.some(p => ['PENDING', 'PARTIAL', 'OVERDUE'].includes(p.status));
      const allPaid = s.feePayments.length > 0 && s.feePayments.every(p => p.status === 'PAID');
      const hasOverdue = s.feePayments.some(p => p.status === 'OVERDUE');

      let studentStatus = 'no_fees';
      if (s.feePayments.length > 0) {
        if (hasOverdue) studentStatus = 'overdue';
        else if (hasPending) studentStatus = 'pending';
        else if (allPaid) studentStatus = 'paid';
      }

      return {
        id: s.id, name: s.user.fullName, admissionNumber: s.admissionNumber,
        course: s.course.name, totalFees, paid, due, status: studentStatus,
      };
    });

    let filtered = summaries;
    if (status && status !== 'all') {
      filtered = summaries.filter(s => s.status === status);
    }

    const total = filtered.length;
    return {
      students: filtered.slice((page - 1) * limit, page * limit),
      total, page, limit, totalPages: Math.ceil(total / limit),
    };
  }
}

export const accountantAnalyticsService = new AccountantAnalyticsService();
