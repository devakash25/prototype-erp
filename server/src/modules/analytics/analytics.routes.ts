import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { prisma } from '../../config/database';
import { examinationAnalyticsService } from './examination.service';
import { facultyAnalyticsService } from './faculty.service';
import { hostelService } from './hostel.service';
import { TransportService } from './transport.service';
import { libraryAnalyticsService } from './library.service';
import { helpdeskAnalyticsService } from './helpdesk.service';
import { workflowAnalyticsService } from './workflow.service';
import { notificationAnalyticsService } from './notification.service';
import { calendarAnalyticsService } from './calendar.service';
import { AppError } from '../../utils/errors';

const router = Router();
router.use(authenticate);

function getInstitutionId(req: Request): string {
  const id = req.user?.institutionId;
  if (!id) throw new AppError(400, 'Institution not found');
  return id;
}

// Utility endpoints: departments, courses, sessions (used by multiple pages)
router.get('/departments', async (req, res, next) => {
  try {
    const institutionId = getInstitutionId(req);
    const data = await prisma.department.findMany({
      where: { institutionId, isActive: true },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

router.get('/courses', async (req, res, next) => {
  try {
    const institutionId = getInstitutionId(req);
    const data = await prisma.course.findMany({
      where: { institutionId, isActive: true },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

router.get('/sessions', async (req, res, next) => {
  try {
    const institutionId = getInstitutionId(req);
    const data = await prisma.academicSession.findMany({
      where: { institutionId },
      orderBy: { startDate: 'desc' },
    });
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

// Examination
router.get('/examinations/stats', async (req, res, next) => {
  try { res.json({ success: true, data: await examinationAnalyticsService.getStats(getInstitutionId(req)) }); } catch (e) { next(e); }
});
router.get('/examinations/subjects', async (req, res, next) => {
  try { res.json({ success: true, data: await examinationAnalyticsService.getSubjectPerformance(getInstitutionId(req)) }); } catch (e) { next(e); }
});
router.get('/examinations/semesters', async (req, res, next) => {
  try { res.json({ success: true, data: await examinationAnalyticsService.getSemesterComparison(getInstitutionId(req)) }); } catch (e) { next(e); }
});
router.get('/examinations/grades', async (req, res, next) => {
  try { res.json({ success: true, data: await examinationAnalyticsService.getGradeDistribution(getInstitutionId(req)) }); } catch (e) { next(e); }
});
router.get('/examinations/departments', async (req, res, next) => {
  try { res.json({ success: true, data: await examinationAnalyticsService.getDepartmentRankings(getInstitutionId(req)) }); } catch (e) { next(e); }
});
router.get('/examinations/top-performers', async (req, res, next) => {
  try { res.json({ success: true, data: await examinationAnalyticsService.getTopPerformers(getInstitutionId(req), parseInt(req.query.limit as string) || 10) }); } catch (e) { next(e); }
});

// Faculty
router.get('/faculty/stats', async (req, res, next) => {
  try { res.json({ success: true, data: await facultyAnalyticsService.getStats(getInstitutionId(req)) }); } catch (e) { next(e); }
});
router.get('/faculty/departments', async (req, res, next) => {
  try { res.json({ success: true, data: await facultyAnalyticsService.getDepartmentWise(getInstitutionId(req)) }); } catch (e) { next(e); }
});
router.get('/faculty/leave-trend', async (req, res, next) => {
  try { res.json({ success: true, data: await facultyAnalyticsService.getLeaveTrend(getInstitutionId(req)) }); } catch (e) { next(e); }
});
router.get('/faculty/workload', async (req, res, next) => {
  try { res.json({ success: true, data: await facultyAnalyticsService.getWorkload(getInstitutionId(req)) }); } catch (e) { next(e); }
});
router.get('/faculty/feedback', async (req, res, next) => {
  try { res.json({ success: true, data: await facultyAnalyticsService.getFeedbackDistribution(getInstitutionId(req)) }); } catch (e) { next(e); }
});
router.get('/faculty/hiring-trend', async (req, res, next) => {
  try { res.json({ success: true, data: await facultyAnalyticsService.getHiringTrend(getInstitutionId(req)) }); } catch (e) { next(e); }
});

// Hostel
router.get('/hostel/stats', async (req, res, next) => {
  try { res.json({ success: true, data: await hostelService.getStats(getInstitutionId(req)) }); } catch (e) { next(e); }
});
router.get('/hostel/hostel-wise', async (req, res, next) => {
  try { res.json({ success: true, data: await hostelService.getHostelWise(getInstitutionId(req)) }); } catch (e) { next(e); }
});
router.get('/hostel/room-types', async (req, res, next) => {
  try { res.json({ success: true, data: await hostelService.getRoomTypes(getInstitutionId(req)) }); } catch (e) { next(e); }
});
router.get('/hostel/maintenance-trend', async (req, res, next) => {
  try { res.json({ success: true, data: await hostelService.getMaintenanceTrend(getInstitutionId(req)) }); } catch (e) { next(e); }
});

// Transport
router.get('/transport/stats', async (req, res, next) => {
  try { res.json({ success: true, data: await TransportService.getStats(getInstitutionId(req)) }); } catch (e) { next(e); }
});
router.get('/transport/routes', async (req, res, next) => {
  try { res.json({ success: true, data: await TransportService.getRouteOccupancy(getInstitutionId(req)) }); } catch (e) { next(e); }
});
router.get('/transport/vehicles', async (req, res, next) => {
  try { res.json({ success: true, data: await TransportService.getVehicleTypes(getInstitutionId(req)) }); } catch (e) { next(e); }
});
router.get('/transport/fuel', async (req, res, next) => {
  try { res.json({ success: true, data: await TransportService.getFuelExpenses(getInstitutionId(req)) }); } catch (e) { next(e); }
});

// Library
router.get('/library/stats', async (req, res, next) => {
  try { res.json({ success: true, data: await libraryAnalyticsService.getStats(getInstitutionId(req)) }); } catch (e) { next(e); }
});
router.get('/library/categories', async (req, res, next) => {
  try { res.json({ success: true, data: await libraryAnalyticsService.getCategoryDistribution(getInstitutionId(req)) }); } catch (e) { next(e); }
});
router.get('/library/issue-trend', async (req, res, next) => {
  try { res.json({ success: true, data: await libraryAnalyticsService.getIssueReturnTrend(getInstitutionId(req)) }); } catch (e) { next(e); }
});
router.get('/library/most-read', async (req, res, next) => {
  try { res.json({ success: true, data: await libraryAnalyticsService.getMostReadBooks(getInstitutionId(req), parseInt(req.query.limit as string) || 10) }); } catch (e) { next(e); }
});

// Helpdesk
router.get('/helpdesk/stats', async (req, res, next) => {
  try { res.json({ success: true, data: await helpdeskAnalyticsService.getStats(getInstitutionId(req)) }); } catch (e) { next(e); }
});
router.get('/helpdesk/categories', async (req, res, next) => {
  try { res.json({ success: true, data: await helpdeskAnalyticsService.getCategoryDistribution(getInstitutionId(req)) }); } catch (e) { next(e); }
});
router.get('/helpdesk/resolution-trend', async (req, res, next) => {
  try { res.json({ success: true, data: await helpdeskAnalyticsService.getResolutionTrend(getInstitutionId(req)) }); } catch (e) { next(e); }
});
router.get('/helpdesk/priority', async (req, res, next) => {
  try { res.json({ success: true, data: await helpdeskAnalyticsService.getPriorityBreakdown(getInstitutionId(req)) }); } catch (e) { next(e); }
});
router.get('/helpdesk/recent', async (req, res, next) => {
  try { res.json({ success: true, data: await helpdeskAnalyticsService.getRecentTickets(getInstitutionId(req), parseInt(req.query.limit as string) || 10) }); } catch (e) { next(e); }
});

// Workflow
router.get('/workflow/stats', async (req, res, next) => {
  try { res.json({ success: true, data: await workflowAnalyticsService.getStats(getInstitutionId(req)) }); } catch (e) { next(e); }
});
router.get('/workflow/categories', async (req, res, next) => {
  try { res.json({ success: true, data: await workflowAnalyticsService.getByType(getInstitutionId(req)) }); } catch (e) { next(e); }
});
router.get('/workflow/approval-trend', async (req, res, next) => {
  try { res.json({ success: true, data: await workflowAnalyticsService.getApprovalTrend(getInstitutionId(req)) }); } catch (e) { next(e); }
});
router.get('/workflow/recent', async (req, res, next) => {
  try { res.json({ success: true, data: await workflowAnalyticsService.getRecent(getInstitutionId(req), parseInt(req.query.limit as string) || 10) }); } catch (e) { next(e); }
});

// Notifications
router.get('/notifications/stats', async (req, res, next) => {
  try { res.json({ success: true, data: await notificationAnalyticsService.getStats(getInstitutionId(req)) }); } catch (e) { next(e); }
});
router.get('/notifications/categories', async (req, res, next) => {
  try { res.json({ success: true, data: await notificationAnalyticsService.getByType(getInstitutionId(req)) }); } catch (e) { next(e); }
});
router.get('/notifications/delivery-trend', async (req, res, next) => {
  try { res.json({ success: true, data: await notificationAnalyticsService.getMonthlyTrend(getInstitutionId(req)) }); } catch (e) { next(e); }
});
router.get('/notifications/channels', async (req, res, next) => {
  try { res.json({ success: true, data: await notificationAnalyticsService.getDeliveryChannels(getInstitutionId(req)) }); } catch (e) { next(e); }
});
router.get('/notifications/recent', async (req, res, next) => {
  try { res.json({ success: true, data: await notificationAnalyticsService.getRecent(getInstitutionId(req), parseInt(req.query.limit as string) || 10) }); } catch (e) { next(e); }
});

// Calendar
router.get('/calendar/stats', async (req, res, next) => {
  try { res.json({ success: true, data: await calendarAnalyticsService.getStats(getInstitutionId(req)) }); } catch (e) { next(e); }
});
router.get('/calendar/event-types', async (req, res, next) => {
  try { res.json({ success: true, data: await calendarAnalyticsService.getEventsByType(getInstitutionId(req)) }); } catch (e) { next(e); }
});
router.get('/calendar/monthly', async (req, res, next) => {
  try { res.json({ success: true, data: await calendarAnalyticsService.getMonthlyEvents(getInstitutionId(req)) }); } catch (e) { next(e); }
});
router.get('/calendar/upcoming', async (req, res, next) => {
  try { res.json({ success: true, data: await calendarAnalyticsService.getUpcoming(getInstitutionId(req), parseInt(req.query.limit as string) || 10) }); } catch (e) { next(e); }
});

// Finance — management + finance
router.get('/finance/overview', authorize('CHIEF_HEAD', 'DIRECTOR', 'PRINCIPAL', 'ACCOUNTANT', 'CEO'), async (req, res, next) => {
  try {
    const institutionId = getInstitutionId(req);
    const [totalCollected, totalPending, totalStudents] = await Promise.all([
      prisma.feePayment.aggregate({ where: { student: { institutionId }, status: 'PAID' }, _sum: { paidAmount: true } }),
      prisma.feePayment.aggregate({ where: { student: { institutionId }, status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] } }, _sum: { dueAmount: true } }),
      prisma.student.count({ where: { institutionId } }),
    ]);
    res.json({ success: true, data: {
      totalCollected: totalCollected._sum.paidAmount || 0,
      totalPending: totalPending._sum.dueAmount || 0,
      totalStudents,
      collectionRate: totalStudents > 0 ? (((totalCollected._sum.paidAmount || 0) as number) / (((totalCollected._sum.paidAmount || 0) as number) + ((totalPending._sum.dueAmount || 0) as number)) * 100).toFixed(1) : '0',
    }});
  } catch (e) { next(e); }
});

router.get('/finance/revenue', authorize('CHIEF_HEAD', 'DIRECTOR', 'PRINCIPAL', 'ACCOUNTANT', 'CEO'), async (req, res, next) => {
  try {
    const institutionId = getInstitutionId(req);
    const payments = await prisma.feePayment.findMany({
      where: { student: { institutionId }, status: 'PAID', paidAt: { not: null } },
      select: { paidAt: true, paidAmount: true },
      orderBy: { paidAt: 'asc' },
    });
    const monthly: Record<string, number> = {};
    payments.forEach(p => {
      if (p.paidAt) {
        const key = `${p.paidAt.getFullYear()}-${String(p.paidAt.getMonth() + 1).padStart(2, '0')}`;
        monthly[key] = (monthly[key] || 0) + Number(p.paidAmount);
      }
    });
    res.json({ success: true, data: Object.entries(monthly).map(([month, amount]) => ({ month, amount })) });
  } catch (e) { next(e); }
});

router.get('/finance/expenses', authorize('CHIEF_HEAD', 'DIRECTOR', 'PRINCIPAL', 'ACCOUNTANT', 'CEO'), async (req, res, next) => {
  try {
    const institutionId = getInstitutionId(req);
    res.json({ success: true, data: { message: 'Expense tracking not yet implemented', total: 0 } });
  } catch (e) { next(e); }
});

router.get('/finance/collections', authorize('CHIEF_HEAD', 'DIRECTOR', 'PRINCIPAL', 'ACCOUNTANT', 'CEO'), async (req, res, next) => {
  try {
    const institutionId = getInstitutionId(req);
    const [today, thisWeek, thisMonth] = await Promise.all([
      prisma.feePayment.aggregate({ where: { student: { institutionId }, status: 'PAID', paidAt: { gte: new Date(new Date().setHours(0,0,0,0)) } }, _sum: { paidAmount: true }, _count: true }),
      prisma.feePayment.aggregate({ where: { student: { institutionId }, status: 'PAID', paidAt: { gte: new Date(Date.now() - 7*24*60*60*1000) } }, _sum: { paidAmount: true }, _count: true }),
      prisma.feePayment.aggregate({ where: { student: { institutionId }, status: 'PAID', paidAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }, _sum: { paidAmount: true }, _count: true }),
    ]);
    res.json({ success: true, data: {
      today: { amount: today._sum.paidAmount || 0, count: today._count },
      thisWeek: { amount: thisWeek._sum.paidAmount || 0, count: thisWeek._count },
      thisMonth: { amount: thisMonth._sum.paidAmount || 0, count: thisMonth._count },
    }});
  } catch (e) { next(e); }
});

// Students — management
router.get('/students/overview', authorize('CHIEF_HEAD', 'DIRECTOR', 'PRINCIPAL', 'CEO'), async (req, res, next) => {
  try {
    const institutionId = getInstitutionId(req);
    const [total, active, departments] = await Promise.all([
      prisma.student.count({ where: { institutionId } }),
      prisma.student.count({ where: { institutionId, isActive: true } }),
      prisma.student.groupBy({ by: ['departmentId'], where: { institutionId }, _count: true }),
    ]);
    res.json({ success: true, data: { total, active, inactive: total - active, byDepartment: departments.map(d => ({ departmentId: d.departmentId, count: d._count })) } });
  } catch (e) { next(e); }
});

router.get('/students/demographics', authorize('CHIEF_HEAD', 'DIRECTOR', 'PRINCIPAL', 'CEO'), async (req, res, next) => {
  try {
    const institutionId = getInstitutionId(req);
    const [byGender, byCategory] = await Promise.all([
      prisma.user.groupBy({ by: ['gender'], where: { institutionId, role: 'STUDENT' }, _count: true }),
      prisma.student.groupBy({ by: ['category'], where: { institutionId }, _count: true }),
    ]);
    res.json({ success: true, data: {
      byGender: byGender.map(g => ({ gender: g.gender || 'Unknown', count: g._count })),
      byCategory: byCategory.map(c => ({ category: c.category || 'Unknown', count: c._count })),
    }});
  } catch (e) { next(e); }
});

router.get('/students/performance', authorize('CHIEF_HEAD', 'DIRECTOR', 'PRINCIPAL', 'HOD', 'CEO'), async (req, res, next) => {
  try {
    const institutionId = getInstitutionId(req);
    const results = await prisma.examResult.findMany({
      where: { student: { institutionId } },
      include: { examination: { select: { maxMarks: true } } },
      take: 100,
    });
    const avg = results.length > 0 ? results.reduce((sum, r) => {
      const total = Number(r.examination?.maxMarks) || 100;
      return sum + (Number(r.marksObtained || 0) / total * 100);
    }, 0) / results.length : 0;
    res.json({ success: true, data: { averagePercentage: avg.toFixed(1), totalResults: results.length } });
  } catch (e) { next(e); }
});

router.get('/students/attendance', authorize('CHIEF_HEAD', 'DIRECTOR', 'PRINCIPAL', 'HOD', 'CEO'), async (req, res, next) => {
  try {
    const institutionId = getInstitutionId(req);
    const [present, absent] = await Promise.all([
      prisma.attendance.count({ where: { student: { institutionId }, status: 'PRESENT' } }),
      prisma.attendance.count({ where: { student: { institutionId }, status: 'ABSENT' } }),
    ]);
    const rate = present + absent > 0 ? ((present / (present + absent)) * 100).toFixed(1) : '0';
    res.json({ success: true, data: { present, absent, rate } });
  } catch (e) { next(e); }
});

router.get('/students/fees', authorize('CHIEF_HEAD', 'DIRECTOR', 'PRINCIPAL', 'ACCOUNTANT', 'CEO'), async (req, res, next) => {
  try {
    const institutionId = getInstitutionId(req);
    const [paid, pending, overdue] = await Promise.all([
      prisma.feePayment.count({ where: { student: { institutionId }, status: 'PAID' } }),
      prisma.feePayment.count({ where: { student: { institutionId }, status: 'PENDING' } }),
      prisma.feePayment.count({ where: { student: { institutionId }, status: 'OVERDUE' } }),
    ]);
    res.json({ success: true, data: { paid, pending, overdue, total: paid + pending + overdue } });
  } catch (e) { next(e); }
});

export default router;
