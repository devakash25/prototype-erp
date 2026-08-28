import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

// Executive Summary — management roles only
router.get('/summary', authorize('CHIEF_HEAD', 'DIRECTOR', 'PRINCIPAL', 'CEO'), dashboardController.getExecutiveSummary);

// Revenue Analytics — finance + management
router.get('/revenue', authorize('CHIEF_HEAD', 'DIRECTOR', 'PRINCIPAL', 'ACCOUNTANT', 'CEO'), dashboardController.getRevenueAnalytics);

// Attendance Analytics — management
router.get('/attendance', authorize('CHIEF_HEAD', 'DIRECTOR', 'PRINCIPAL', 'HOD', 'CEO'), dashboardController.getAttendanceAnalytics);

// Admission Analytics — management + admission
router.get('/admissions', authorize('CHIEF_HEAD', 'DIRECTOR', 'PRINCIPAL', 'ADMISSION_COUNSELLOR', 'CEO'), dashboardController.getAdmissionAnalytics);

// Academic Analytics — management + HOD
router.get('/academic', authorize('CHIEF_HEAD', 'DIRECTOR', 'PRINCIPAL', 'HOD', 'CEO'), dashboardController.getAcademicAnalytics);

// HR Analytics — management + admin
router.get('/hr', authorize('CHIEF_HEAD', 'DIRECTOR', 'PRINCIPAL', 'ADMINISTRATIVE_STAFF', 'CEO'), dashboardController.getHRAnalytics);

// Hostel Analytics — management + warden
router.get('/hostel', authorize('CHIEF_HEAD', 'DIRECTOR', 'PRINCIPAL', 'HOSTEL_WARDEN', 'CEO'), dashboardController.getHostelAnalytics);

// Transport Analytics — management + transport
router.get('/transport', authorize('CHIEF_HEAD', 'DIRECTOR', 'PRINCIPAL', 'TRANSPORT_MANAGER', 'CEO'), dashboardController.getTransportAnalytics);

// Library Analytics — management + librarian
router.get('/library', authorize('CHIEF_HEAD', 'DIRECTOR', 'PRINCIPAL', 'LIBRARIAN', 'CEO'), dashboardController.getLibraryAnalytics);

// Helpdesk Analytics — management
router.get('/helpdesk', authorize('CHIEF_HEAD', 'DIRECTOR', 'PRINCIPAL', 'ADMINISTRATIVE_STAFF', 'CEO'), dashboardController.getHelpdeskAnalytics);

// Workflow Analytics — management
router.get('/workflow', authorize('CHIEF_HEAD', 'DIRECTOR', 'PRINCIPAL', 'CEO'), dashboardController.getWorkflowAnalytics);

// Notification Analytics — management
router.get('/notifications', authorize('CHIEF_HEAD', 'DIRECTOR', 'PRINCIPAL', 'CEO'), dashboardController.getNotificationAnalytics);

// Institution Health Score — management only
router.get('/health-score', authorize('CHIEF_HEAD', 'DIRECTOR', 'PRINCIPAL', 'CEO'), dashboardController.getInstitutionHealthScore);

// Recent Activity — management
router.get('/activity', authorize('CHIEF_HEAD', 'DIRECTOR', 'PRINCIPAL', 'CEO'), dashboardController.getRecentActivity);

export default router;
