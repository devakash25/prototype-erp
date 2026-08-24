import { z } from 'zod';

export const sendMessageSchema = z.object({
  body: z.object({
    conversationId: z.string().uuid(),
    message: z.string().min(1).max(5000),
    attachmentUrl: z.string().url().optional(),
    attachmentType: z.enum(['IMAGE', 'PDF']).optional(),
  }),
});

export const createConversationSchema = z.object({
  body: z.object({
    subjectId: z.string().uuid(),
    classId: z.string().uuid(),
    message: z.string().min(1).max(5000),
  }),
});

export const resolveSchema = z.object({
  body: z.object({
    conversationId: z.string().uuid(),
  }),
});
