import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/auth';
import { directorAnalyticsService } from './director.service';

const router = Router();

router.use(authenticate);

router.get('/kpis', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await directorAnalyticsService.getKPIs(user.institutionId);
  res.json({ success: true, data });
});

router.get('/departments', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await directorAnalyticsService.getDepartmentPerformance(user.institutionId);
  res.json({ success: true, data });
});

router.get('/faculty', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await directorAnalyticsService.getFacultyAnalytics(user.institutionId);
  res.json({ success: true, data });
});

router.get('/students', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await directorAnalyticsService.getStudentAnalytics(user.institutionId);
  res.json({ success: true, data });
});

router.get('/admissions', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await directorAnalyticsService.getAdmissionAnalytics(user.institutionId);
  res.json({ success: true, data });
});

router.get('/examinations', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await directorAnalyticsService.getExamAnalytics(user.institutionId);
  res.json({ success: true, data });
});

router.get('/finance', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await directorAnalyticsService.getFinanceSummary(user.institutionId);
  res.json({ success: true, data });
});

router.get('/hr', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await directorAnalyticsService.getHRSummary(user.institutionId);
  res.json({ success: true, data });
});

router.get('/campus', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await directorAnalyticsService.getCampusSummary(user.institutionId);
  res.json({ success: true, data });
});

router.get('/workflow', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await directorAnalyticsService.getWorkflowSummary(user.institutionId);
  res.json({ success: true, data });
});

router.get('/activity', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const limit = parseInt(req.query.limit as string) || 15;
  const data = await directorAnalyticsService.getRecentActivity(user.institutionId, limit);
  res.json({ success: true, data });
});

export default router;
