import { z } from 'zod';

export const createNotificationSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    message: z.string().min(1, 'Message is required'),
    type: z.enum(['INFO', 'WARNING', 'URGENT', 'SUCCESS', 'ERROR']).optional(),
    target: z.enum(['ALL', 'STUDENTS', 'EMPLOYEES', 'TEACHERS', 'PARENTS', 'DEPARTMENT', 'SPECIFIC_USERS']),
    priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
    isScheduled: z.boolean().optional(),
    scheduledAt: z.string().datetime().optional(),
    targetUserIds: z.array(z.string().uuid()).optional(),
  }),
});

export const createAnnouncementSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    content: z.string().min(1, 'Content is required'),
    type: z.enum(['GENERAL', 'ACADEMIC', 'EVENT', 'HOLIDAY', 'MEETING', 'EMERGENCY', 'POLICY']),
    target: z.enum(['ALL', 'STUDENTS', 'EMPLOYEES', 'TEACHERS', 'PARENTS', 'DEPARTMENT', 'SPECIFIC_USERS']),
    priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
    isPublished: z.boolean().optional(),
    expiresAt: z.string().datetime().optional(),
    attachments: z.any().optional(),
  }),
});

export const updateAnnouncementSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    content: z.string().min(1).optional(),
    type: z.enum(['GENERAL', 'ACADEMIC', 'EVENT', 'HOLIDAY', 'MEETING', 'EMERGENCY', 'POLICY']).optional(),
    target: z.enum(['ALL', 'STUDENTS', 'EMPLOYEES', 'TEACHERS', 'PARENTS', 'DEPARTMENT', 'SPECIFIC_USERS']).optional(),
    priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
    isPublished: z.boolean().optional(),
    expiresAt: z.string().datetime().optional(),
  }),
});
