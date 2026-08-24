import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { doubtService } from './doubts.service';
import { sendMessageSchema, createConversationSchema, resolveSchema } from './doubts.validation';

const router = Router();
router.use(authenticate);

const wrap = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

router.get('/student/subjects', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await doubtService.getStudentSubjectList(user.userId);
  res.json({ success: true, data });
}));

router.post('/student/open-subject', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { subjectId } = req.body;
  const data = await doubtService.openSubjectChat(user.userId, subjectId);
  res.json({ success: true, data });
}));

router.get('/student/conversations', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await doubtService.getStudentConversations(user.userId);
  res.json({ success: true, data });
}));

router.get('/student/chat/:conversationId', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await doubtService.getStudentChat(user.userId, req.params.conversationId as string);
  res.json({ success: true, data });
}));

router.post('/student/send', validate(sendMessageSchema), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { conversationId, message, attachmentUrl, attachmentType } = req.body;
  const data = await doubtService.sendMessage(user.userId, conversationId, message, attachmentUrl, attachmentType);
  res.json({ success: true, data, message: 'Message sent' });
}));

router.post('/student/create', validate(createConversationSchema), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { subjectId, classId, message } = req.body;
  const data = await doubtService.createConversation(user.userId, subjectId, classId, message);
  res.json({ success: true, data, message: 'Doubt created' });
}));

router.post('/resolve', validate(resolveSchema), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { conversationId } = req.body;
  const data = await doubtService.resolveDoubt(user.userId, conversationId);
  res.json({ success: true, data, message: 'Doubt resolved' });
}));

router.get('/teacher/classes', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await doubtService.getTeacherClassStats(user.userId);
  res.json({ success: true, data });
}));

router.get('/teacher/conversations', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const classId = req.query.classId as string | undefined;
  const data = await doubtService.getTeacherConversations(user.userId, classId);
  res.json({ success: true, data });
}));

router.get('/teacher/chat/:conversationId', wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await doubtService.getTeacherChat(user.userId, req.params.conversationId as string);
  res.json({ success: true, data });
}));

router.post('/teacher/send', validate(sendMessageSchema), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { conversationId, message, attachmentUrl, attachmentType } = req.body;
  const data = await doubtService.sendMessage(user.userId, conversationId, message, attachmentUrl, attachmentType);
  res.json({ success: true, data, message: 'Reply sent' });
}));

export default router;
