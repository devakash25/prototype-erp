import { z } from 'zod';

export const markDailyAttendanceSchema = z.object({
  body: z.object({
    courseId: z.string().uuid(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    session: z.string().transform(v => v.toUpperCase()),
    records: z.array(z.object({
      studentId: z.string().uuid(),
      status: z.enum(['PRESENT', 'ABSENT', 'LATE']),
      remarks: z.string().optional(),
    })).min(1),
  }),
});

export const markSubjectAttendanceSchema = z.object({
  body: z.object({
    timetableEntryId: z.string().uuid(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    records: z.array(z.object({
      studentId: z.string().uuid(),
      status: z.enum(['PRESENT', 'ABSENT', 'LATE']),
    })).min(1),
  }),
});

export const attendanceQuerySchema = z.object({
  query: z.object({
    courseId: z.string().uuid(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
});

export const modeToggleSchema = z.object({
  body: z.object({
    courseId: z.string().uuid(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
});

export const lockSchema = z.object({
  body: z.object({
    courseId: z.string().uuid(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
});
