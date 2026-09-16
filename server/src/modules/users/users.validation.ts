import { z } from 'zod';

export const createAuthoritySchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum([
      'PRINCIPAL', 'TEACHER', 'ACCOUNTANT',
      'ADMISSION_COUNSELLOR', 'LIBRARIAN', 'HOSTEL_WARDEN',
      'TRANSPORT_MANAGER', 'ADMINISTRATIVE_STAFF',
    ]),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().optional(),
    departmentId: z.string().uuid().optional(),
    designation: z.string().optional(),
    employeeCode: z.string().optional(),
    dateOfJoining: z.string().datetime().optional(),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    phone: z.string().optional(),
    secondaryPhone: z.string().optional(),
    avatar: z.string().url().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  }),
});
