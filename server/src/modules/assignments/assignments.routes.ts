import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { assignmentService } from './assignments.service';
import { createAssignmentSchema, gradeSubmissionSchema } from './assignments.validation';

const router = Router();
router.use(authenticate);

const wrap = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

router.get('/teacher/subjects', authorize('TEACHER', 'HOD'), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await assignmentService.getTeacherSubjects(user.userId);
  res.json({ success: true, data });
}));

router.get('/teacher/subjects/:subjectId/assignments', authorize('TEACHER', 'HOD'), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await assignmentService.getSubjectAssignments(user.userId, req.params.subjectId as string);
  res.json({ success: true, data });
}));

router.post('/teacher/assignments', authorize('TEACHER', 'HOD'), validate(createAssignmentSchema), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { subjectId, title, description, totalMarks, dueDate, attachments } = req.body;
  const data = await assignmentService.createAssignment(user.userId, { subjectId, title, description, totalMarks, dueDate, attachments });
  res.json({ success: true, data, message: 'Assignment created' });
}));

router.get('/teacher/assignments/:assignmentId/submissions', authorize('TEACHER', 'HOD'), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await assignmentService.getAssignmentSubmissions(user.userId, req.params.assignmentId as string);
  res.json({ success: true, data });
}));

router.post('/teacher/grade', authorize('TEACHER', 'HOD'), validate(gradeSubmissionSchema), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { assignmentId, studentId, marksObtained, feedback } = req.body;
  const data = await assignmentService.gradeSubmission(user.userId, assignmentId, studentId, marksObtained, feedback);
  res.json({ success: true, data, message: 'Submission graded' });
}));

export default router;
