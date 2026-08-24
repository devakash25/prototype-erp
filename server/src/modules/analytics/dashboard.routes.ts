import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

// Executive Summary
router.get('/summary', dashboardController.getExecutiveSummary);

// Revenue Analytics
router.get('/revenue', dashboardController.getRevenueAnalytics);

// Attendance Analytics
router.get('/attendance', dashboardController.getAttendanceAnalytics);

// Admission Analytics
router.get('/admissions', dashboardController.getAdmissionAnalytics);

// Academic Analytics
router.get('/academic', dashboardController.getAcademicAnalytics);

// HR Analytics
router.get('/hr', dashboardController.getHRAnalytics);

// Hostel Analytics
router.get('/hostel', dashboardController.getHostelAnalytics);

// Transport Analytics
router.get('/transport', dashboardController.getTransportAnalytics);

// Library Analytics
router.get('/library', dashboardController.getLibraryAnalytics);

// Helpdesk Analytics
router.get('/helpdesk', dashboardController.getHelpdeskAnalytics);

// Workflow Analytics
router.get('/workflow', dashboardController.getWorkflowAnalytics);

// Notification Analytics
router.get('/notifications', dashboardController.getNotificationAnalytics);

// Institution Health Score
router.get('/health-score', dashboardController.getInstitutionHealthScore);

// Recent Activity
router.get('/activity', dashboardController.getRecentActivity);

export default router;
