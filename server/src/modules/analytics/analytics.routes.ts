import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth';
import { prisma } from '../../config/database';
import { examinationAnalyticsService } from './examination.service';
import { facultyAnalyticsService } from './faculty.service';
import { hostelService } from './hostel.service';
import { TransportService } from './transport.service';

const transportAnalyticsService = new TransportService();
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
  try { res.json({ success: true, data: await transportAnalyticsService.getStats(getInstitutionId(req)) }); } catch (e) { next(e); }
});
router.get('/transport/routes', async (req, res, next) => {
  try { res.json({ success: true, data: await transportAnalyticsService.getRouteOccupancy(getInstitutionId(req)) }); } catch (e) { next(e); }
});
router.get('/transport/vehicles', async (req, res, next) => {
  try { res.json({ success: true, data: await transportAnalyticsService.getVehicleTypes(getInstitutionId(req)) }); } catch (e) { next(e); }
});
router.get('/transport/fuel', async (req, res, next) => {
  try { res.json({ success: true, data: await transportAnalyticsService.getFuelExpenses(getInstitutionId(req)) }); } catch (e) { next(e); }
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

export default router;
