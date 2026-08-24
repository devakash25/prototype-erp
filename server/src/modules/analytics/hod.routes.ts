import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/auth';
import { hodAnalyticsService } from './hod.service';

const router = Router();
router.use(authenticate);

router.get('/kpis', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await hodAnalyticsService.getKPIs(user.userId);
  res.json({ success: true, data });
});

router.get('/department', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await hodAnalyticsService.getDepartmentOverview(user.userId);
  res.json({ success: true, data });
});

router.get('/faculty', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await hodAnalyticsService.getFacultyList(user.userId);
  res.json({ success: true, data });
});

router.get('/faculty/workload', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await hodAnalyticsService.getFacultyWorkload(user.userId);
  res.json({ success: true, data });
});

router.get('/faculty/attendance', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const days = parseInt(req.query.days as string) || 7;
  const data = await hodAnalyticsService.getFacultyAttendance(user.userId, days);
  res.json({ success: true, data });
});

router.get('/faculty/performance', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await hodAnalyticsService.getFacultyPerformance(user.userId);
  res.json({ success: true, data });
});

router.get('/students', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const search = req.query.search as string | undefined;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const data = await hodAnalyticsService.getStudentList(user.userId, search, page, limit);
  res.json({ success: true, data });
});

router.get('/students/performance', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await hodAnalyticsService.getStudentPerformance(user.userId);
  res.json({ success: true, data });
});

router.get('/students/attendance', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const days = parseInt(req.query.days as string) || 7;
  const data = await hodAnalyticsService.getStudentAttendance(user.userId, days);
  res.json({ success: true, data });
});

router.get('/courses', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await hodAnalyticsService.getCourses(user.userId);
  res.json({ success: true, data });
});

router.get('/subjects', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await hodAnalyticsService.getSubjects(user.userId);
  res.json({ success: true, data });
});

router.get('/timetable', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await hodAnalyticsService.getTimetable(user.userId);
  res.json({ success: true, data });
});

router.get('/lms', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await hodAnalyticsService.getLMSOverview(user.userId);
  res.json({ success: true, data });
});

router.get('/assignments', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await hodAnalyticsService.getAssignments(user.userId);
  res.json({ success: true, data });
});

router.get('/examinations', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await hodAnalyticsService.getExaminationStatus(user.userId);
  res.json({ success: true, data });
});

router.get('/marks-entry', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await hodAnalyticsService.getMarksEntryStatus(user.userId);
  res.json({ success: true, data });
});

router.get('/notices', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await hodAnalyticsService.getNotices(user.userId);
  res.json({ success: true, data });
});

router.get('/workflows', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const status = req.query.status as string | undefined;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const data = await hodAnalyticsService.getWorkflowActions(user.userId, status, page, limit);
  res.json({ success: true, data });
});

router.get('/helpdesk', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const status = req.query.status as string | undefined;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const data = await hodAnalyticsService.getHelpdeskTickets(user.userId, status, page, limit);
  res.json({ success: true, data });
});

router.get('/analytics', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await hodAnalyticsService.getDepartmentAnalytics(user.userId);
  res.json({ success: true, data });
});

router.get('/reports', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await hodAnalyticsService.getReports(user.userId);
  res.json({ success: true, data });
});

router.get('/calendar', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await hodAnalyticsService.getCalendarEvents(user.userId);
  res.json({ success: true, data });
});

router.get('/activity', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const limit = parseInt(req.query.limit as string) || 15;
  const data = await hodAnalyticsService.getRecentActivity(user.userId, limit);
  res.json({ success: true, data });
});

router.post('/helpdesk/:id/action', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const body = req.body as any;
    const data = await hodAnalyticsService.handleHelpdeskAction(id, body.action);
    res.json({ success: true, data, message: `Ticket ${body.action}d successfully` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed' } });
  }
});

router.post('/workflows/:id/action', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const id = req.params.id as string;
    const body = req.body as any;
    const data = await hodAnalyticsService.handleWorkflowAction(id, user.userId, body.action, body.comments);
    res.json({ success: true, data, message: `Workflow ${body.action}d successfully` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed' } });
  }
});

export default router;
