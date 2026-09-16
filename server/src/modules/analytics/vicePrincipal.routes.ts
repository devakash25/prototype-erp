import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/auth';
import { vicePrincipalService } from './vicePrincipal.service';

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

router.get('/dashboard', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await vicePrincipalService.getDashboard(user.id, user.institutionId);
  res.json({ success: true, data });
}));

router.get('/attendance-overview', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await vicePrincipalService.getAttendanceOverview(user.id, user.institutionId);
  res.json({ success: true, data });
}));

router.get('/discipline', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const studentId = req.query.studentId as string | undefined;
  const data = await vicePrincipalService.getDisciplineRecords(user.id, user.institutionId, studentId);
  res.json({ success: true, data });
}));

router.get('/substitutions', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await vicePrincipalService.getTeacherSubstitutions(user.id, user.institutionId);
  res.json({ success: true, data });
}));

router.get('/daily-reports', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await vicePrincipalService.getDailyReports(user.id, user.institutionId);
  res.json({ success: true, data });
}));

router.get('/inspections', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await vicePrincipalService.getClassroomInspections(user.id, user.institutionId);
  res.json({ success: true, data });
}));

export default router;
