import { z } from 'zod';

export const createFeeStructureSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    departmentId: z.string().uuid().optional().nullable(),
    courseId: z.string().uuid().optional().nullable(),
    academicSessionId: z.string().uuid('Academic session is required'),
    totalAmount: z.number().positive('Total amount must be positive'),
    dueDate: z.string().datetime().optional().nullable(),
    components: z.array(z.object({
      name: z.string().min(1),
      amount: z.number().positive(),
      type: z.enum(['tuition', 'admission', 'hostel', 'transport', 'exam', 'library', 'misc']),
      isRefundable: z.boolean().optional(),
    })).optional(),
  }),
});

export const updateFeeStructureSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    departmentId: z.string().uuid().optional().nullable(),
    courseId: z.string().uuid().optional().nullable(),
    totalAmount: z.number().positive().optional(),
    dueDate: z.string().datetime().optional().nullable(),
    isActive: z.boolean().optional(),
    components: z.array(z.object({
      id: z.string().uuid().optional(),
      name: z.string().min(1),
      amount: z.number().positive(),
      type: z.enum(['tuition', 'admission', 'hostel', 'transport', 'exam', 'library', 'misc']),
      isRefundable: z.boolean().optional(),
    })).optional(),
  }),
});
