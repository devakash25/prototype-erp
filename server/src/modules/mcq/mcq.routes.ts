import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { mcqService } from './mcq.service';
import { createTestSchema, submitTestSchema } from './mcq.validation';

const router = Router();
router.use(authenticate);

const wrap = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

// TEACHER
router.post('/create', authorize('TEACHER'), validate(createTestSchema), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const test = await mcqService.createTest(user.userId, req.body);
  res.json({ success: true, data: test, message: 'Test created' });
}));

router.get('/teacher/tests', authorize('TEACHER'), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const status = req.query.status as string | undefined;
  const data = await mcqService.getTeacherTests(user.userId, status);
  res.json({ success: true, data });
}));

router.get('/:testId', authorize('TEACHER'), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await mcqService.getTestById(user.userId, req.params.testId as string);
  res.json({ success: true, data });
}));

router.get('/:testId/analytics', authorize('TEACHER'), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await mcqService.getTestAnalytics(user.userId, req.params.testId as string);
  res.json({ success: true, data });
}));

router.post('/:testId/publish', authorize('TEACHER'), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await mcqService.publishTest(user.userId, req.params.testId as string);
  res.json({ success: true, data, message: 'Test published' });
}));

router.post('/:testId/archive', authorize('TEACHER'), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await mcqService.archiveTest(user.userId, req.params.testId as string);
  res.json({ success: true, data, message: 'Test archived' });
}));

router.delete('/:testId', authorize('TEACHER'), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  await mcqService.deleteTest(user.userId, req.params.testId as string);
  res.json({ success: true, message: 'Test deleted' });
}));

// STUDENT
router.get('/student/available', authorize('STUDENT'), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await mcqService.getAvailableTests(user.userId);
  res.json({ success: true, data });
}));

router.get('/student/upcoming', authorize('STUDENT'), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await mcqService.getUpcomingTests(user.userId);
  res.json({ success: true, data });
}));

router.get('/student/history', authorize('STUDENT'), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await mcqService.getStudentHistory(user.userId);
  res.json({ success: true, data });
}));

router.get('/student/start/:testId', authorize('STUDENT'), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await mcqService.startTest(user.userId, req.params.testId as string);
  res.json({ success: true, data });
}));

router.post('/student/submit', authorize('STUDENT'), validate(submitTestSchema), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { testId, answers, timeTaken } = req.body;
  const data = await mcqService.submitTest(user.userId, testId, answers, timeTaken);
  res.json({ success: true, data, message: 'Test submitted' });
}));

router.get('/student/result/:submissionId', authorize('STUDENT'), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await mcqService.getStudentResult(user.userId, req.params.submissionId as string);
  res.json({ success: true, data });
}));

export default router;
