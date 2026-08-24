import { z } from 'zod';

export const createAssignmentSchema = z.object({
  body: z.object({
    subjectId: z.string().uuid(),
    title: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    totalMarks: z.number().int().min(1).max(1000),
    dueDate: z.string().datetime().or(z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date')),
    attachments: z.array(z.object({
      url: z.string().url(),
      name: z.string(),
      type: z.string(),
    })).optional(),
  }),
});

export const gradeSubmissionSchema = z.object({
  body: z.object({
    assignmentId: z.string().uuid(),
    studentId: z.string().uuid(),
    marksObtained: z.number().int().min(0),
    feedback: z.string().max(2000).optional(),
  }),
});
