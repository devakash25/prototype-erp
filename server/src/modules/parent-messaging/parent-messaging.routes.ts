import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { parentMessagingService } from './parent-messaging.service';
import { startConversationSchema, sendMessageSchema } from './parent-messaging.validation';

const router = Router();
router.use(authenticate);

const wrap = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

// Parent endpoints
router.get('/parent/recipients', authorize('PARENT'), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await parentMessagingService.getParentRecipientList(user.userId);
  res.json({ success: true, data });
}));

router.post('/parent/start', authorize('PARENT'), validate(startConversationSchema), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { studentId, teacherId, recipientType, message } = req.body;
  const data = await parentMessagingService.startConversation(user.userId, { studentId, teacherId, recipientType, message });
  res.json({ success: true, data });
}));

router.get('/parent/conversations', authorize('PARENT'), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await parentMessagingService.getParentConversations(user.userId);
  res.json({ success: true, data });
}));

router.get('/parent/chat/:conversationId', authorize('PARENT'), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await parentMessagingService.getParentChat(user.userId, req.params.conversationId as string);
  res.json({ success: true, data });
}));

router.post('/parent/send', authorize('PARENT'), validate(sendMessageSchema), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { conversationId, message, attachmentUrl, attachmentType } = req.body;
  const data = await parentMessagingService.sendParentMessage(user.userId, { conversationId, message, attachmentUrl, attachmentType });
  res.json({ success: true, data, message: 'Message sent' });
}));

// Teacher / Coordinator endpoints
router.get('/teacher/inbox', authorize('TEACHER'), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await parentMessagingService.getTeacherInbox(user.userId);
  res.json({ success: true, data });
}));

router.get('/teacher/chat/:conversationId', authorize('TEACHER'), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await parentMessagingService.getTeacherChat(user.userId, req.params.conversationId as string);
  res.json({ success: true, data });
}));

router.post('/teacher/send', authorize('TEACHER'), validate(sendMessageSchema), wrap(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { conversationId, message, attachmentUrl, attachmentType } = req.body;
  const data = await parentMessagingService.sendTeacherMessage(user.userId, { conversationId, message, attachmentUrl, attachmentType });
  res.json({ success: true, data, message: 'Message sent' });
}));

export default router;
