import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/auth';
import { teacherAnalyticsService } from './teacher.service';

const router = Router();
router.use(authenticate);

router.get('/kpis', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await teacherAnalyticsService.getKPIs(user.userId);
  res.json({ success: true, data });
});

router.get('/schedule', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await teacherAnalyticsService.getTodaySchedule(user.userId);
  res.json({ success: true, data });
});

router.get('/subjects', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await teacherAnalyticsService.getSubjects(user.userId);
  res.json({ success: true, data });
});

router.get('/classes', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await teacherAnalyticsService.getAssignedClasses(user.userId);
  res.json({ success: true, data });
});

router.get('/students', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const search = req.query.search as string | undefined;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const data = await teacherAnalyticsService.getStudentList(user.userId, search, page, limit);
  res.json({ success: true, data });
});

router.get('/students/performance', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await teacherAnalyticsService.getStudentPerformance(user.userId);
  res.json({ success: true, data });
});

router.get('/attendance/status', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await teacherAnalyticsService.getAttendanceStatus(user.userId);
  res.json({ success: true, data });
});

router.get('/assignments', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await teacherAnalyticsService.getAssignments(user.userId);
  res.json({ success: true, data });
});

router.get('/lms', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await teacherAnalyticsService.getLMSOverview(user.userId);
  res.json({ success: true, data });
});

router.get('/examinations', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await teacherAnalyticsService.getExaminationStatus(user.userId);
  res.json({ success: true, data });
});

router.get('/marks-entry', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await teacherAnalyticsService.getMarksEntryStatus(user.userId);
  res.json({ success: true, data });
});

router.get('/leave', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await teacherAnalyticsService.getLeaveRequests(user.userId);
  res.json({ success: true, data });
});

router.post('/leave', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const body = req.body as any;
    const data = await teacherAnalyticsService.applyLeave(user.userId, body);
    res.json({ success: true, data, message: 'Leave applied successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed' } });
  }
});

router.get('/calendar', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await teacherAnalyticsService.getCalendarEvents(user.userId);
  res.json({ success: true, data });
});

router.get('/notifications', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await teacherAnalyticsService.getNotifications(user.userId);
  res.json({ success: true, data });
});

router.get('/activity', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const limit = parseInt(req.query.limit as string) || 10;
  const data = await teacherAnalyticsService.getRecentActivity(user.userId, limit);
  res.json({ success: true, data });
});

router.get('/reports', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await teacherAnalyticsService.getReports(user.userId);
  res.json({ success: true, data });
});

router.get('/coordinator/courses', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await teacherAnalyticsService.getCoordinatorCourses(user.userId);
  res.json({ success: true, data });
});

router.get('/coordinator/students/:courseId', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const search = req.query.search as string | undefined;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const data = await teacherAnalyticsService.getCoordinatorStudents(user.userId, req.params.courseId as string, search, page, limit);
  res.json({ success: true, data });
});

router.get('/coordinator/academics/:courseId', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await teacherAnalyticsService.getCoordinatorAcademics(user.userId, req.params.courseId as string);
  res.json({ success: true, data });
});

router.get('/coordinator/attendance/:courseId', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const days = parseInt(req.query.days as string) || 30;
  const data = await teacherAnalyticsService.getCoordinatorAttendance(user.userId, req.params.courseId as string, days);
  res.json({ success: true, data });
});

export default router;
