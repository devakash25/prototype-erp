import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/auth';
import { principalAnalyticsService } from './principal.service';

const router = Router();
router.use(authenticate);

router.get('/kpis', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await principalAnalyticsService.getKPIs(user.institutionId);
  res.json({ success: true, data });
});

router.get('/campus-status', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await principalAnalyticsService.getCampusStatus(user.institutionId);
  res.json({ success: true, data });
});

router.get('/departments', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await principalAnalyticsService.getDepartments(user.institutionId);
  res.json({ success: true, data });
});

router.get('/faculty', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await principalAnalyticsService.getFacultyStatus(user.institutionId);
  res.json({ success: true, data });
});

router.get('/attendance-trend', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const days = parseInt(req.query.days as string) || 7;
  const data = await principalAnalyticsService.getAttendanceTrend(user.institutionId, days);
  res.json({ success: true, data });
});

router.get('/timetable', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await principalAnalyticsService.getTimetable(user.institutionId);
  res.json({ success: true, data });
});

router.get('/examinations', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await principalAnalyticsService.getExaminationStatus(user.institutionId);
  res.json({ success: true, data });
});

router.get('/admissions', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await principalAnalyticsService.getAdmissionStatus(user.institutionId);
  res.json({ success: true, data });
});

router.get('/finance', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await principalAnalyticsService.getFinanceView(user.institutionId);
  res.json({ success: true, data });
});

router.get('/discipline', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await principalAnalyticsService.getDisciplineSummary(user.institutionId);
  res.json({ success: true, data });
});

router.get('/lms', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await principalAnalyticsService.getLMSOverview(user.institutionId);
  res.json({ success: true, data });
});

router.get('/workflow', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await principalAnalyticsService.getWorkflowSummary(user.institutionId);
  res.json({ success: true, data });
});

router.get('/activity', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const limit = parseInt(req.query.limit as string) || 15;
  const data = await principalAnalyticsService.getRecentActivity(user.institutionId, limit);
  res.json({ success: true, data });
});

router.get('/students', async (req: Request, res: Response) => {
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
});

router.get('/hostel', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await principalAnalyticsService.getHostelOverview(user.institutionId);
  res.json({ success: true, data });
});

router.get('/library', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await principalAnalyticsService.getLibraryOverview(user.institutionId);
  res.json({ success: true, data });
});

router.get('/transport', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await principalAnalyticsService.getTransportOverview(user.institutionId);
  res.json({ success: true, data });
});

router.get('/helpdesk', async (req: Request, res: Response) => {
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
});

router.post('/helpdesk/:id/action', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const id = req.params.id as string;
    const body = req.body as any;
    const data = await principalAnalyticsService.handleWorkflowAction(id, user.id, body.action, body.comments);
    res.json({ success: true, data, message: `Helpdesk ticket ${body.action}d successfully` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed to process helpdesk action' } });
  }
});

router.get('/leave', async (req: Request, res: Response) => {
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
});

router.post('/leave/:id/action', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const id = req.params.id as string;
    const body = req.body as any;
    const data = await principalAnalyticsService.handleLeaveAction(id, user.id, body.action, body.comments);
    res.json({ success: true, data, message: `Leave request ${body.action}d successfully` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed to process leave action' } });
  }
});

router.get('/workflows', async (req: Request, res: Response) => {
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
});

router.post('/workflows/:id/action', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const id = req.params.id as string;
    const body = req.body as any;
    const data = await principalAnalyticsService.handleWorkflowAction(id, user.id, body.action, body.comments);
    res.json({ success: true, data, message: `Workflow ${body.action}d successfully` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed to process workflow action' } });
  }
});

router.get('/calendar', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await principalAnalyticsService.getCalendarEvents(user.institutionId);
  res.json({ success: true, data });
});

router.get('/reports', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await principalAnalyticsService.getReports(user.institutionId);
  res.json({ success: true, data });
});

router.get('/teachers', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { departmentId, search } = req.query as any;
  const data = await principalAnalyticsService.getTeachers(user.institutionId, departmentId, search);
  res.json({ success: true, data });
});

router.get('/courses-with-coordinators', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await principalAnalyticsService.getCoursesWithCoordinators(user.institutionId);
  res.json({ success: true, data });
});

router.post('/assign-coordinator', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { courseId, employeeId } = req.body;
    const data = await principalAnalyticsService.assignClassCoordinator(user.institutionId, courseId, employeeId);
    res.json({ success: true, data, message: 'Class coordinator assigned successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message || 'Failed' } });
  }
});

router.post('/remove-coordinator', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { courseId } = req.body;
    const data = await principalAnalyticsService.removeClassCoordinator(user.institutionId, courseId);
    res.json({ success: true, data, message: 'Class coordinator removed successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message || 'Failed' } });
  }
});

router.get('/subjects', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { departmentId } = req.query as any;
  const data = await principalAnalyticsService.getSubjects(user.institutionId, departmentId);
  res.json({ success: true, data });
});

router.post('/allocate-subject', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { subjectId, employeeId, academicSessionId, semester } = req.body;
    const data = await principalAnalyticsService.allocateSubject(user.institutionId, subjectId, employeeId, academicSessionId, semester);
    res.json({ success: true, data, message: 'Subject allocated successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message || 'Failed' } });
  }
});

router.delete('/deallocate-subject/:id', async (req: Request, res: Response) => {
  try {
    await principalAnalyticsService.deallocateSubject(req.params.id as string);
    res.json({ success: true, message: 'Subject deallocated successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message || 'Failed' } });
  }
});

router.get('/subject-allocations', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await principalAnalyticsService.getSubjectAllocationSummary(user.institutionId);
  res.json({ success: true, data });
});

export default router;
