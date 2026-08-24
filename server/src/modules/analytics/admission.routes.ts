import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/auth';
import { admissionAnalyticsService } from './admission.service';

const router = Router();
router.use(authenticate);

router.get('/kpis', async (req: Request, res: Response) => {
  try {
    const data = await admissionAnalyticsService.getKPIs((req as any).user.userId);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed' } });
  }
});

router.get('/funnel', async (req: Request, res: Response) => {
  try {
    const data = await admissionAnalyticsService.getFunnel((req as any).user.userId);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed' } });
  }
});

router.get('/applications', async (req: Request, res: Response) => {
  try {
    const { search, status, page, limit } = req.query;
    const data = await admissionAnalyticsService.getApplications(
      (req as any).user.userId,
      search as string, status as string,
      parseInt(page as string) || 1, parseInt(limit as string) || 20
    );
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed' } });
  }
});

router.get('/applications/:id', async (req: Request, res: Response) => {
  try {
    const data = await admissionAnalyticsService.getApplicationDetail((req as any).user.userId, req.params.id as string);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed' } });
  }
});

router.post('/applications', async (req: Request, res: Response) => {
  try {
    const data = await admissionAnalyticsService.createApplication((req as any).user.userId, req.body);
    res.json({ success: true, data, message: 'Application created' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed' } });
  }
});

router.put('/applications/:id', async (req: Request, res: Response) => {
  try {
    const data = await admissionAnalyticsService.updateApplication((req as any).user.userId, req.params.id as string, req.body);
    res.json({ success: true, data, message: 'Application updated' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed' } });
  }
});

router.post('/applications/:id/review', async (req: Request, res: Response) => {
  try {
    const data = await admissionAnalyticsService.reviewApplication((req as any).user.userId, req.params.id as string);
    res.json({ success: true, data, message: 'Application under review' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed' } });
  }
});

router.post('/applications/:id/approve', async (req: Request, res: Response) => {
  try {
    const data = await admissionAnalyticsService.approveApplication((req as any).user.userId, req.params.id as string);
    res.json({ success: true, data, message: 'Application approved' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed' } });
  }
});

router.post('/applications/:id/reject', async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;
    const data = await admissionAnalyticsService.rejectApplication((req as any).user.userId, req.params.id as string, reason);
    res.json({ success: true, data, message: 'Application rejected' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed' } });
  }
});

router.post('/applications/:id/enroll', async (req: Request, res: Response) => {
  try {
    const data = await admissionAnalyticsService.enrollStudent((req as any).user.userId, req.params.id as string);
    res.json({ success: true, data, message: 'Student enrolled successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed' } });
  }
});

router.post('/applications/:id/follow-up', async (req: Request, res: Response) => {
  try {
    const { followUpDate, notes } = req.body;
    const data = await admissionAnalyticsService.setFollowUp((req as any).user.userId, req.params.id as string, followUpDate, notes);
    res.json({ success: true, data, message: 'Follow-up scheduled' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed' } });
  }
});

router.get('/follow-ups', async (req: Request, res: Response) => {
  try {
    const data = await admissionAnalyticsService.getFollowUps((req as any).user.userId);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed' } });
  }
});

router.get('/waiting-list', async (req: Request, res: Response) => {
  try {
    const data = await admissionAnalyticsService.getWaitingList((req as any).user.userId);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed' } });
  }
});

router.get('/analytics', async (req: Request, res: Response) => {
  try {
    const data = await admissionAnalyticsService.getAnalytics((req as any).user.userId);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed' } });
  }
});

router.get('/activity', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 15;
    const data = await admissionAnalyticsService.getRecentActivity((req as any).user.userId, limit);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed' } });
  }
});

router.get('/reports', async (req: Request, res: Response) => {
  try {
    const data = await admissionAnalyticsService.getReports((req as any).user.userId);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed' } });
  }
});

router.get('/daily-activities', async (req: Request, res: Response) => {
  try {
    const data = await admissionAnalyticsService.getDailyActivities((req as any).user.userId);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed' } });
  }
});

export default router;
