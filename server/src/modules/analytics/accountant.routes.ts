import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/auth';
import { accountantAnalyticsService } from './accountant.service';

const router = Router();
router.use(authenticate);

router.get('/kpis', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const data = await accountantAnalyticsService.getKPIs(user.userId);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed to fetch KPIs' } });
  }
});

router.get('/revenue-by-type', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const data = await accountantAnalyticsService.getRevenueByType(user.userId);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed' } });
  }
});

router.get('/student-ledger', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const search = req.query.search as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const data = await accountantAnalyticsService.getStudentLedger(user.userId, search, page, limit);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed' } });
  }
});

router.get('/student-ledger/:studentId', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const data = await accountantAnalyticsService.getStudentFeeDetails(user.userId, req.params.studentId as string);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed' } });
  }
});

router.post('/collect-fees', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const data = await accountantAnalyticsService.collectFee(user.userId, req.body);
    res.json({ success: true, data, message: 'Fee collected successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed' } });
  }
});

router.get('/pending-verifications', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const data = await accountantAnalyticsService.getPendingVerifications(user.userId);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed' } });
  }
});

router.post('/verify-payment/:id', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { status, notes } = req.body;
    const data = await accountantAnalyticsService.verifyPayment(user.userId, req.params.id as string, status, notes);
    res.json({ success: true, data, message: 'Payment verified' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed' } });
  }
});

router.get('/receipts', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const studentId = req.query.studentId as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const data = await accountantAnalyticsService.getReceipts(user.userId, studentId, page, limit);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed' } });
  }
});

router.get('/receipts/:id', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const data = await accountantAnalyticsService.getReceiptById(user.userId, req.params.id as string);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed' } });
  }
});

router.get('/outstanding-dues', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const data = await accountantAnalyticsService.getOutstandingDues(user.userId);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed' } });
  }
});

router.get('/refunds', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const data = await accountantAnalyticsService.getRefunds(user.userId);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed' } });
  }
});

router.post('/refunds/:id/process', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { action, reason, notes } = req.body;
    const data = await accountantAnalyticsService.processRefund(user.userId, req.params.id as string, action, reason || notes);
    res.json({ success: true, data, message: `Refund ${action.toLowerCase()}d` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed' } });
  }
});

router.get('/daily-report', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const date = req.query.date as string | undefined;
    const data = await accountantAnalyticsService.getDailyReport(user.userId, date);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed' } });
  }
});

router.get('/monthly-report', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const month = req.query.month ? parseInt(req.query.month as string) : undefined;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const data = await accountantAnalyticsService.getMonthlyReport(user.userId, month, year);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed' } });
  }
});

router.get('/revenue-analytics', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const data = await accountantAnalyticsService.getRevenueAnalytics(user.userId);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed' } });
  }
});

router.get('/collection-performance', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const data = await accountantAnalyticsService.getCollectionPerformance(user.userId);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed' } });
  }
});

router.get('/activity', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const limit = parseInt(req.query.limit as string) || 15;
    const data = await accountantAnalyticsService.getRecentActivity(user.userId, limit);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed' } });
  }
});

router.get('/students/:id/payments', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const data = await accountantAnalyticsService.getStudentFeeDetails(user.userId, req.params.id as string);
    res.json({ success: true, data: data.payments });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed' } });
  }
});

router.get('/students', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const data = await accountantAnalyticsService.getAllStudentsFeeSummary(user.userId, search, status, page, limit);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed' } });
  }
});

export default router;
