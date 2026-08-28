import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/auth';
import { principalAnalyticsService } from './principal.service';

function wrap(fn: (req: Request, res: Response) => Promise<any>) {
  return (req: Request, res: Response) => {
    Promise.resolve(fn(req, res)).catch((err) => {
      const status = err?.statusCode || err?.status || 500;
      res.status(status).json({
        success: false,
        error: { message: err?.message || 'Internal server error', statusCode: status },
      });
    });
  };
}

const router = Router();
router.use(authenticate);

router.get('/kpis', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await principalAnalyticsService.getKPIs(user.institutionId);
  res.json({ success: true, data });
}));

router.get('/campus-status', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await principalAnalyticsService.getCampusStatus(user.institutionId);
  res.json({ success: true, data });
}));

router.get('/departments', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await principalAnalyticsService.getDepartments(user.institutionId);
  res.json({ success: true, data });
}));

router.get('/faculty', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await principalAnalyticsService.getFacultyStatus(user.institutionId);
  res.json({ success: true, data });
}));

router.get('/attendance-trend', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const days = parseInt(req.query.days as string) || 7;
  const data = await principalAnalyticsService.getAttendanceTrend(user.institutionId, days);
  res.json({ success: true, data });
}));

router.get('/timetable', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await principalAnalyticsService.getTimetable(user.institutionId);
  res.json({ success: true, data });
}));

router.get('/examinations', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await principalAnalyticsService.getExaminationStatus(user.institutionId);
  res.json({ success: true, data });
}));

router.get('/admissions', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await principalAnalyticsService.getAdmissionStatus(user.institutionId);
  res.json({ success: true, data });
}));

router.get('/finance', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await principalAnalyticsService.getFinanceView(user.institutionId);
  res.json({ success: true, data });
}));

router.get('/discipline', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await principalAnalyticsService.getDisciplineSummary(user.institutionId);
  res.json({ success: true, data });
}));

router.get('/lms', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await principalAnalyticsService.getLMSOverview(user.institutionId);
  res.json({ success: true, data });
}));

router.get('/workflow', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await principalAnalyticsService.getWorkflowSummary(user.institutionId);
  res.json({ success: true, data });
}));

router.get('/activity', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const limit = parseInt(req.query.limit as string) || 15;
  const data = await principalAnalyticsService.getRecentActivity(user.institutionId, limit);
  res.json({ success: true, data });
}));

router.get('/students', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { search, departmentId } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const data = await principalAnalyticsService.getStudents(
    user.institutionId,
    search as string | undefined,
    departmentId as string | undefined,
    page,
    limit
  );
  res.json({ success: true, data });
}));

router.get('/hostel', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await principalAnalyticsService.getHostelOverview(user.institutionId);
  res.json({ success: true, data });
}));

router.get('/library', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await principalAnalyticsService.getLibraryOverview(user.institutionId);
  res.json({ success: true, data });
}));

router.get('/transport', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await principalAnalyticsService.getTransportOverview(user.institutionId);
  res.json({ success: true, data });
}));

router.get('/helpdesk', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { status, category } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const data = await principalAnalyticsService.getHelpdeskTickets(
    user.institutionId,
    status as string | undefined,
    category as string | undefined,
    page,
    limit
  );
  res.json({ success: true, data });
}));

router.post('/helpdesk/:id/action', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const id = req.params.id as string;
  const body = req.body as any;
  const data = await principalAnalyticsService.handleWorkflowAction(id, user.id, body.action, body.comments);
  res.json({ success: true, data, message: `Helpdesk ticket ${body.action}d successfully` });
}));

router.get('/leave', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { status } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const data = await principalAnalyticsService.getLeaveRequests(
    user.institutionId,
    status as string | undefined,
    page,
    limit
  );
  res.json({ success: true, data });
}));

router.post('/leave/:id/action', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const id = req.params.id as string;
  const body = req.body as any;
  const data = await principalAnalyticsService.handleLeaveAction(id, user.id, body.action, body.comments);
  res.json({ success: true, data, message: `Leave request ${body.action}d successfully` });
}));

router.get('/workflows', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { status, type } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const data = await principalAnalyticsService.getWorkflowActions(
    user.institutionId,
    status as string | undefined,
    type as string | undefined,
    page,
    limit
  );
  res.json({ success: true, data });
}));

router.post('/workflows/:id/action', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const id = req.params.id as string;
  const body = req.body as any;
  const data = await principalAnalyticsService.handleWorkflowAction(id, user.id, body.action, body.comments);
  res.json({ success: true, data, message: `Workflow ${body.action}d successfully` });
}));

router.get('/calendar', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await principalAnalyticsService.getCalendarEvents(user.institutionId);
  res.json({ success: true, data });
}));

router.get('/reports', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await principalAnalyticsService.getReports(user.institutionId);
  res.json({ success: true, data });
}));

router.get('/teachers', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { departmentId, search } = req.query as any;
  const data = await principalAnalyticsService.getTeachers(user.institutionId, departmentId, search);
  res.json({ success: true, data });
}));

router.get('/courses-with-coordinators', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await principalAnalyticsService.getCoursesWithCoordinators(user.institutionId);
  res.json({ success: true, data });
}));

router.post('/assign-coordinator', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { courseId, employeeId } = req.body;
  const data = await principalAnalyticsService.assignClassCoordinator(user.institutionId, courseId, employeeId);
  res.json({ success: true, data, message: 'Class coordinator assigned successfully' });
}));

router.post('/remove-coordinator', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { courseId } = req.body;
  const data = await principalAnalyticsService.removeClassCoordinator(user.institutionId, courseId);
  res.json({ success: true, data, message: 'Class coordinator removed successfully' });
}));

router.get('/subjects', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { departmentId } = req.query as any;
  const data = await principalAnalyticsService.getSubjects(user.institutionId, departmentId);
  res.json({ success: true, data });
}));

router.post('/allocate-subject', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { subjectId, employeeId, academicSessionId, semester } = req.body;
  const data = await principalAnalyticsService.allocateSubject(user.institutionId, subjectId, employeeId, academicSessionId, semester);
  res.json({ success: true, data, message: 'Subject allocated successfully' });
}));

router.delete('/deallocate-subject/:id', wrap(async (req: Request, res: Response) => {
  await principalAnalyticsService.deallocateSubject(req.params.id as string);
  res.json({ success: true, message: 'Subject deallocated successfully' });
}));

router.get('/subject-allocations', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await principalAnalyticsService.getSubjectAllocationSummary(user.institutionId);
  res.json({ success: true, data });
}));

export default router;
