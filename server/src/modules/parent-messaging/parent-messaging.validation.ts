import { z } from 'zod';

export const startConversationSchema = z.object({
  body: z.object({
    studentId: z.string().uuid(),
    teacherId: z.string().uuid(),
    recipientType: z.enum(['SUBJECT_TEACHER', 'CLASS_COORDINATOR']),
    message: z.string().min(1).max(5000),
  }),
});

export const sendMessageSchema = z.object({
  body: z.object({
    conversationId: z.string().uuid(),
    message: z.string().min(1).max(5000),
    attachmentUrl: z.string().url().optional(),
    attachmentType: z.enum(['IMAGE', 'PDF']).optional(),
  }),
});
