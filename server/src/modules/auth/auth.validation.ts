import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum([
      'CHIEF_HEAD', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER',
      'ACCOUNTANT', 'ADMISSION_COUNSELLOR', 'RECEPTIONIST', 'EXAM_CONTROLLER',
      'LIBRARIAN', 'HOSTEL_WARDEN',
      'TRANSPORT_MANAGER', 'ADMINISTRATIVE_STAFF', 'STUDENT', 'PARENT',
    ]),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().optional(),
    institutionId: z.string().uuid().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    phone: z.string().optional(),
    secondaryPhone: z.string().optional(),
    email: z.string().email().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    avatar: z.string().url().optional(),
  }),
});
