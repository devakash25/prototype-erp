import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/auth';
import { studentAnalyticsService } from './student.service';

const router = Router();
router.use(authenticate);

router.get('/kpis', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await studentAnalyticsService.getKPIs(user.userId);
  res.json({ success: true, data });
});

router.get('/schedule', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await studentAnalyticsService.getTodaySchedule(user.userId);
  res.json({ success: true, data });
});

router.get('/subjects', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await studentAnalyticsService.getSubjects(user.userId);
  res.json({ success: true, data });
});

router.get('/attendance', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const subjectId = req.query.subjectId as string | undefined;
  const days = parseInt(req.query.days as string) || 30;
  const data = await studentAnalyticsService.getAttendance(user.userId, subjectId, days);
  res.json({ success: true, data });
});

router.get('/attendance/calendar', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
  const year = parseInt(req.query.year as string) || new Date().getFullYear();
  const data = await studentAnalyticsService.getAttendanceCalendar(user.userId, month, year);
  res.json({ success: true, data });
});

router.get('/assignments', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await studentAnalyticsService.getAssignments(user.userId);
  res.json({ success: true, data });
});

router.get('/study-materials', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await studentAnalyticsService.getStudyMaterials(user.userId);
  res.json({ success: true, data });
});

router.get('/examinations', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await studentAnalyticsService.getExaminations(user.userId);
  res.json({ success: true, data });
});

router.get('/results', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await studentAnalyticsService.getResults(user.userId);
  res.json({ success: true, data });
});

router.get('/fees', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await studentAnalyticsService.getFees(user.userId);
  res.json({ success: true, data });
});

router.get('/library', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await studentAnalyticsService.getLibrary(user.userId);
  res.json({ success: true, data });
});

router.get('/notices', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await studentAnalyticsService.getNotices(user.userId);
  res.json({ success: true, data });
});

router.get('/calendar', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await studentAnalyticsService.getCalendarEvents(user.userId);
  res.json({ success: true, data });
});

router.get('/profile', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await studentAnalyticsService.getProfile(user.userId);
  res.json({ success: true, data });
});

router.get('/performance', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await studentAnalyticsService.getPerformance(user.userId);
  res.json({ success: true, data });
});

router.get('/requests', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await studentAnalyticsService.getRequests(user.userId);
  res.json({ success: true, data });
});

router.get('/activity', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const limit = parseInt(req.query.limit as string) || 10;
  const data = await studentAnalyticsService.getRecentActivity(user.userId, limit);
  res.json({ success: true, data });
});

router.post('/submit-assignment', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { assignmentId, fileUrl, notes } = req.body;
    const data = await studentAnalyticsService.submitAssignment(user.userId, assignmentId, fileUrl, notes);
    res.json({ success: true, data, message: 'Assignment submitted successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message || 'Failed to submit' } });
  }
});

router.get('/reports', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await studentAnalyticsService.getReports(user.userId);
  res.json({ success: true, data });
});

export default router;
