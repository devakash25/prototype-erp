import { z } from 'zod';

export const updateSettingsSchema = z.object({
  body: z.record(z.any()),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const updateSettingByKeySchema = z.object({
  body: z.object({
    value: z.any(),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const createTemplateSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200),
    subject: z.string().min(1).max(500),
    body: z.string().min(1).max(5000),
    type: z.enum(['email', 'sms', 'push', 'in_app']),
    category: z.string().max(100).optional(),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const updateTemplateSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    subject: z.string().min(1).max(500).optional(),
    body: z.string().min(1).max(5000).optional(),
    type: z.enum(['email', 'sms', 'push', 'in_app']).optional(),
    category: z.string().max(100).optional(),
    isActive: z.boolean().optional(),
  }).passthrough(),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const createReportSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    query: z.any().optional(),
    columns: z.array(z.any()).optional(),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const updateReportSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    query: z.any().optional(),
    columns: z.array(z.any()).optional(),
  }).passthrough(),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const updatePermissionsSchema = z.object({
  body: z.record(z.any()),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const restoreBackupSchema = z.object({
  body: z.object({
    backupId: z.string().min(1),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const updateBackupSettingsSchema = z.object({
  body: z.object({
    autoBackup: z.boolean().optional(),
    frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
    retention: z.number().min(1).max(365).optional(),
  }).passthrough(),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const searchQuerySchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({
    q: z.string().min(2).max(200).optional(),
    type: z.enum(['students', 'faculty', 'finance', 'all']).optional(),
  }).passthrough(),
  params: z.object({}).passthrough(),
});

export const generateReportSchema = z.object({
  body: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
    departmentId: z.string().optional(),
    courseId: z.string().optional(),
  }).passthrough(),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const appearanceSettingsSchema = z.object({
  body: z.object({
    logo: z.string().optional().or(z.literal('')),
    favicon: z.string().optional().or(z.literal('')),
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    sidebarStyle: z.enum(['LIGHT', 'DARK']).optional(),
    sidebarColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    font: z.string().max(50).optional(),
    borderRadius: z.string().max(20).optional(),
    darkMode: z.boolean().optional(),
    compactMode: z.boolean().optional(),
    customCss: z.string().max(10000).optional(),
  }).passthrough(),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const notificationChannelsSchema = z.object({
  body: z.object({
    email: z.boolean().optional(),
    sms: z.boolean().optional(),
    push: z.boolean().optional(),
    inApp: z.boolean().optional(),
  }).passthrough(),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});
