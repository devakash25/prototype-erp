import 'express-async-errors';
import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { env } from './config/env';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { auditLog } from './middleware/auditLog';
import { apiLimiter, authLimiter } from './middleware/rateLimit';

// Routes
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import notificationRoutes, { announcementRouter } from './modules/notifications/notifications.routes';
import dashboardRoutes from './modules/analytics/dashboard.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import feeStructureRoutes from './modules/finance/feeStructure.routes';
import principalAnalyticsRoutes from './modules/analytics/principal.routes';
import teacherAnalyticsRoutes from './modules/analytics/teacher.routes';
import studentAnalyticsRoutes from './modules/analytics/student.routes';
import accountantAnalyticsRoutes from './modules/analytics/accountant.routes';
import admissionAnalyticsRoutes from './modules/analytics/admission.routes';
import transportAnalyticsRoutes from './modules/analytics/transport.routes';
import administrativeAnalyticsRoutes from './modules/analytics/administrative.routes';
import parentAnalyticsRoutes from './modules/analytics/parent.routes';
import ceoAnalyticsRoutes from './modules/analytics/ceo.routes';
import librarianAnalyticsRoutes from './modules/analytics/librarian.routes';
import hostelAnalyticsRoutes from './modules/analytics/hostel.routes';
import vicePrincipalAnalyticsRoutes from './modules/analytics/vicePrincipal.routes';
import examControllerAnalyticsRoutes from './modules/analytics/examController.routes';
import receptionistAnalyticsRoutes from './modules/analytics/receptionist.routes';
import feeRoutes from './modules/fees/fees.routes';
import attendanceRoutes from './modules/attendance/attendance.routes';
import doubtRoutes from './modules/doubts/doubts.routes';
import assignmentRoutes from './modules/assignments/assignments.routes';
import parentMessagingRoutes from './modules/parent-messaging/parent-messaging.routes';
import mcqRoutes from './modules/mcq/mcq.routes';
import settingsRoutes from './modules/settings/settings.routes';
import rolesRoutes from './modules/settings/roles.routes';
import bulkRoutes from './modules/settings/bulk.routes';
import backupRoutes from './modules/settings/backup.routes';
import auditLogRoutes from './modules/settings/auditLog.routes';
import reportsRoutes from './modules/settings/reports.routes';
import searchRoutes from './modules/settings/search.routes';
import templatesRoutes from './modules/settings/templates.routes';
import customReportsRoutes from './modules/settings/customReports.routes';
import appearanceRoutes from './modules/settings/appearance.routes';

const app = express();
app.set('etag', false);

// Security & utility middleware
app.use(helmet());
app.use(cors({
  origin: env.NODE_ENV === 'production' ? env.APP_URL : '*',
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined', {
  stream: { write: (message: string) => logger.info(message.trim()) },
}));

// Global rate limiting
app.use('/api/', apiLimiter);

// Audit logging for write operations
app.use('/api/', auditLog());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Disable ETags for API routes to prevent 304 empty responses
app.use('/api/', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.set('Pragma', 'no-cache');
  next();
});

// API Info
app.get('/api/v1', (req, res) => {
  res.json({
    name: 'DEV ERP API',
    version: '1.0.0',
    status: 'running',
  });
});

// Register routes
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/announcements', announcementRouter);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/fee-structures', feeStructureRoutes);
app.use('/api/v1/principal', principalAnalyticsRoutes);
app.use('/api/v1/teacher', teacherAnalyticsRoutes);
app.use('/api/v1/student', studentAnalyticsRoutes);
app.use('/api/v1/accountant', accountantAnalyticsRoutes);
app.use('/api/v1/admission', admissionAnalyticsRoutes);
app.use('/api/v1/transport', transportAnalyticsRoutes);
app.use('/api/v1/administrative', administrativeAnalyticsRoutes);
app.use('/api/v1/parent', parentAnalyticsRoutes);
app.use('/api/v1/ceo', ceoAnalyticsRoutes);
app.use('/api/v1/librarian', librarianAnalyticsRoutes);
app.use('/api/v1/hostel', hostelAnalyticsRoutes);
app.use('/api/v1/vice-principal', vicePrincipalAnalyticsRoutes);
app.use('/api/v1/exam-controller', examControllerAnalyticsRoutes);
app.use('/api/v1/receptionist', receptionistAnalyticsRoutes);
app.use('/api/v1/fees', feeRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/doubts', doubtRoutes);
app.use('/api/v1/assignments', assignmentRoutes);
app.use('/api/v1/parent-messaging', parentMessagingRoutes);
app.use('/api/v1/mcq', mcqRoutes);
app.use('/api/v1/system-settings', settingsRoutes);
app.use('/api/v1/roles', rolesRoutes);
app.use('/api/v1/bulk', bulkRoutes);
app.use('/api/v1/backups', backupRoutes);
app.use('/api/v1/audit-logs', auditLogRoutes);
app.use('/api/v1/reports', reportsRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/templates', templatesRoutes);
app.use('/api/v1/custom-reports', customReportsRoutes);
app.use('/api/v1/appearance-settings', appearanceRoutes);

// Serve static client files (single-service deployment)
const clientPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientPath)) {
  // Static assets with cache
  app.use(express.static(clientPath, {
    index: false,
    setHeaders: (res, filePath) => {
      if (filePath.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
        res.set('Cache-Control', 'public, max-age=31536000, immutable');
      }
    },
  }));

  // SPA fallback - serve index.html for all non-API routes
  app.get(/^\/(?!api|health).*/, (_req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
  });
}

// 404 handler (API only)
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({
      success: false,
      error: { message: 'Route not found', statusCode: 404 },
    });
  } else {
    res.status(404).send('Not found');
  }
});

// Error handler
app.use(errorHandler);

export default app;
