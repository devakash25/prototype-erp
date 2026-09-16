import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { useSettingsStore } from '@/store/settingsStore'
import { MainLayout } from '@/layouts/MainLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { SuperAdminDashboard } from '@/pages/super-admin/SuperAdminDashboard'
import { AuthorityManagement } from '@/pages/super-admin/AuthorityManagement'
import { NotificationsPage } from '@/pages/super-admin/NotificationsPage'
import { AnnouncementsPage } from '@/pages/super-admin/AnnouncementsPage'
import { ExaminationAnalytics } from '@/pages/super-admin/ExaminationAnalytics'
import { FacultyAnalytics } from '@/pages/super-admin/FacultyAnalytics'
import { HostelAnalytics } from '@/pages/super-admin/HostelAnalytics'
import { TransportAnalytics } from '@/pages/super-admin/TransportAnalytics'
import { LibraryAnalytics } from '@/pages/super-admin/LibraryAnalytics'
import { HelpdeskAnalytics } from '@/pages/super-admin/HelpdeskAnalytics'
import { WorkflowAnalytics } from '@/pages/super-admin/WorkflowAnalytics'
import { NotificationAnalytics } from '@/pages/super-admin/NotificationAnalytics'
import { CalendarAnalytics } from '@/pages/super-admin/CalendarAnalytics'
import { ReportCenter } from '@/pages/super-admin/ReportCenter'
import { FeeStructurePage } from '@/pages/super-admin/FeeStructurePage'
import GlobalSearch from '@/pages/super-admin/GlobalSearch'
import AuditLog from '@/pages/super-admin/AuditLog'
import SystemSettings from '@/pages/super-admin/SystemSettings'
import BulkOperations from '@/pages/super-admin/BulkOperations'
import StudentAnalytics from '@/pages/super-admin/StudentAnalytics'
import FinancialDashboard from '@/pages/super-admin/FinancialDashboard'
import PermissionManager from '@/pages/super-admin/PermissionManager'
import TemplateManager from '@/pages/super-admin/TemplateManager'
import DataBackupExport from '@/pages/super-admin/DataBackupExport'
import CustomReportBuilder from '@/pages/super-admin/CustomReportBuilder'
import RealtimeNotifications from '@/pages/super-admin/RealtimeNotifications'
import DarkModeEnhancement from '@/pages/super-admin/DarkModeEnhancement'
import { PrincipalDashboard } from '@/pages/principal/PrincipalDashboard'
import { PrincipalDepartments } from '@/pages/principal/PrincipalDepartments'
import { PrincipalTimetable } from '@/pages/principal/PrincipalTimetable'
import { PrincipalAttendance } from '@/pages/principal/PrincipalAttendance'
import { PrincipalLMS } from '@/pages/principal/PrincipalLMS'
import { PrincipalFaculty } from '@/pages/principal/PrincipalFaculty'
import { PrincipalLeave } from '@/pages/principal/PrincipalLeave'
import { PrincipalPerformance } from '@/pages/principal/PrincipalPerformance'
import { PrincipalStudents } from '@/pages/principal/PrincipalStudents'
import { PrincipalAdmissions } from '@/pages/principal/PrincipalAdmissions'
import { PrincipalExaminations } from '@/pages/principal/PrincipalExaminations'
import { PrincipalFinance } from '@/pages/principal/PrincipalFinance'
import { PrincipalDiscipline } from '@/pages/principal/PrincipalDiscipline'
import { PrincipalHostel } from '@/pages/principal/PrincipalHostel'
import { PrincipalLibrary } from '@/pages/principal/PrincipalLibrary'
import { PrincipalTransport } from '@/pages/principal/PrincipalTransport'
import { PrincipalApprovals } from '@/pages/principal/PrincipalApprovals'
import { PrincipalNotifications } from '@/pages/principal/PrincipalNotifications'
import { PrincipalCalendar } from '@/pages/principal/PrincipalCalendar'
import { PrincipalHelpdesk } from '@/pages/principal/PrincipalHelpdesk'
import { PrincipalReports } from '@/pages/principal/PrincipalReports'
import { PrincipalClassCoordinators } from '@/pages/principal/PrincipalClassCoordinators'
import { PrincipalSubjectAllocation } from '@/pages/principal/PrincipalSubjectAllocation'
import { ProfilePage } from '@/pages/ProfilePage'
import { TeacherDashboard } from '@/pages/teacher/TeacherDashboard'
import { TeacherSchedule } from '@/pages/teacher/TeacherSchedule'
import { TeacherClasses } from '@/pages/teacher/TeacherClasses'
import { TeacherSubjects } from '@/pages/teacher/TeacherSubjects'
import { TeacherAttendance } from '@/pages/teacher/TeacherAttendance'
import { TeacherStudents } from '@/pages/teacher/TeacherStudents'
import { TeacherStudentPerformance } from '@/pages/teacher/TeacherStudentPerformance'
import { TeacherAssignments } from '@/pages/teacher/TeacherAssignments'
import { TeacherLMS } from '@/pages/teacher/TeacherLMS'
import { TeacherExaminations } from '@/pages/teacher/TeacherExaminations'
import { TeacherMarksEntry } from '@/pages/teacher/TeacherMarksEntry'
import { TeacherLeave } from '@/pages/teacher/TeacherLeave'
import { TeacherCalendar } from '@/pages/teacher/TeacherCalendar'
import { TeacherReports } from '@/pages/teacher/TeacherReports'
import { TeacherMyClass } from '@/pages/teacher/TeacherMyClass'
import { CoordinatorAttendance } from '@/pages/teacher/CoordinatorAttendance'
import { SubjectTeacherAttendance } from '@/pages/teacher/SubjectTeacherAttendance'
import { AttendanceMonitor } from '@/pages/teacher/AttendanceMonitor'
import { TeacherNotifications } from '@/pages/teacher/TeacherNotifications'
import { TeacherDoubts } from '@/pages/teacher/TeacherDoubts'
import { TeacherParentMessages } from '@/pages/teacher/TeacherParentMessages'
import { TeacherMCQs } from '@/pages/teacher/TeacherMCQs'
import { StudentDashboard } from '@/pages/student/StudentDashboard'
import { StudentAttendance } from '@/pages/student/StudentAttendance'
import { StudentSubjects } from '@/pages/student/StudentSubjects'
import { StudentAssignments } from '@/pages/student/StudentAssignments'
import { StudentExams } from '@/pages/student/StudentExams'
import { StudentResults } from '@/pages/student/StudentResults'
import { StudentFees } from '@/pages/student/StudentFees'
import { StudentNotices } from '@/pages/student/StudentNotices'
import { StudentDoubts } from '@/pages/student/StudentDoubts'
import { StudentLibrary } from '@/pages/student/StudentLibrary'
import { StudentProfile } from '@/pages/student/StudentProfile'
import { StudentSchedule } from '@/pages/student/StudentSchedule'
import { StudentMaterials } from '@/pages/student/StudentMaterials'
import { StudentCalendar } from '@/pages/student/StudentCalendar'
import { StudentPerformance } from '@/pages/student/StudentPerformance'
import { StudentRequests } from '@/pages/student/StudentRequests'
import { StudentHostel } from '@/pages/student/StudentHostel'
import { StudentTransport } from '@/pages/student/StudentTransport'
import { StudentDocuments } from '@/pages/student/StudentDocuments'
import { StudentMCQs } from '@/pages/student/StudentMCQs'
import { AccountantDashboard } from '@/pages/accountant/AccountantDashboard'
import { AccountantCollections } from '@/pages/accountant/AccountantCollections'
import { AccountantStudentLedger } from '@/pages/accountant/AccountantStudentLedger'
import { AccountantReceipts } from '@/pages/accountant/AccountantReceipts'
import { AccountantPayments } from '@/pages/accountant/AccountantPayments'
import { AccountantRefunds } from '@/pages/accountant/AccountantRefunds'
import { AccountantReports } from '@/pages/accountant/AccountantReports'
import { AccountantOutstanding } from '@/pages/accountant/AccountantOutstanding'
import { AccountantAnalytics } from '@/pages/accountant/AccountantAnalytics'
import { AdmissionDashboard } from '@/pages/admission/AdmissionDashboard'
import { AdmissionApplications } from '@/pages/admission/AdmissionApplications'
import { AdmissionNewApplication } from '@/pages/admission/AdmissionNewApplication'
import { AdmissionFollowUps } from '@/pages/admission/AdmissionFollowUps'
import { AdmissionWaitingList } from '@/pages/admission/AdmissionWaitingList'
import { AdmissionAnalytics } from '@/pages/admission/AdmissionAnalytics'
import { AdmissionReports } from '@/pages/admission/AdmissionReports'
import { TransportDashboard } from '@/pages/transport/TransportDashboard'
import { TransportVehicles } from '@/pages/transport/TransportVehicles'
import { TransportDrivers } from '@/pages/transport/TransportDrivers'
import { TransportRoutes as TransportRoutesPage } from '@/pages/transport/TransportRoutes'
import { TransportStudentAllocation } from '@/pages/transport/TransportStudentAllocation'
import { TransportMaintenance } from '@/pages/transport/TransportMaintenance'
import { TransportInspections } from '@/pages/transport/TransportInspections'
import { TransportComplaints } from '@/pages/transport/TransportComplaints'
import { TransportReports } from '@/pages/transport/TransportReports'
import { TransportDriverAttendance } from '@/pages/transport/TransportDriverAttendance'
import { TransportDailySchedule } from '@/pages/transport/TransportDailySchedule'
import { AdminDashboard } from '@/pages/administrative/AdminDashboard'
import { AdminCertificates } from '@/pages/administrative/AdminCertificates'
import { AdminRequests } from '@/pages/administrative/AdminRequests'
import { AdminNotices } from '@/pages/administrative/AdminNotices'
import { AdminMeetings } from '@/pages/administrative/AdminMeetings'
import { AdminWorkflows } from '@/pages/administrative/AdminWorkflows'
import { AdminDocuments } from '@/pages/administrative/AdminDocuments'
import { AdminComplaints } from '@/pages/administrative/AdminComplaints'
import { AdminReports } from '@/pages/administrative/AdminReports'
import { ParentDashboard } from '@/pages/parent/ParentDashboard'
import { ParentChildren } from '@/pages/parent/ParentChildren'
import { ParentAttendance } from '@/pages/parent/ParentAttendance'
import { ParentTimetable } from '@/pages/parent/ParentTimetable'
import { ParentPerformance } from '@/pages/parent/ParentPerformance'
import { ParentAssignments } from '@/pages/parent/ParentAssignments'
import { ParentExams } from '@/pages/parent/ParentExams'
import { ParentFees } from '@/pages/parent/ParentFees'
import { ParentTransport } from '@/pages/parent/ParentTransport'
import { ParentHostel } from '@/pages/parent/ParentHostel'
import { ParentLibrary } from '@/pages/parent/ParentLibrary'
import { ParentNotices } from '@/pages/parent/ParentNotices'
import { ParentPTM } from '@/pages/parent/ParentPTM'
import { ParentLeave } from '@/pages/parent/ParentLeave'
import { ParentComplaints } from '@/pages/parent/ParentComplaints'
import { ParentDocuments } from '@/pages/parent/ParentDocuments'
import { ParentMessages } from '@/pages/parent/ParentMessages'
import { ParentActivity } from '@/pages/parent/ParentActivity'
import { CEOSubscription } from '@/pages/ceo/CEOSubscription'
import { CEOCharges } from '@/pages/ceo/CEOCharges'
import { CEODashboard } from '@/pages/ceo/CEODashboard'
import { LibrarianDashboard } from '@/pages/librarian/LibrarianDashboard'
import { LibrarianBooks } from '@/pages/librarian/LibrarianBooks'
import { LibrarianIssueBook } from '@/pages/librarian/LibrarianIssueBook'
import { LibrarianReturns } from '@/pages/librarian/LibrarianReturns'
import { LibrarianOverdue } from '@/pages/librarian/LibrarianOverdue'
import { LibrarianFines } from '@/pages/librarian/LibrarianFines'
import { LibrarianMembers } from '@/pages/librarian/LibrarianMembers'
import { LibrarianAnalytics } from '@/pages/librarian/LibrarianAnalytics'
import { HostelDashboard } from '@/pages/hostel/HostelDashboard'
import { HostelBuildings } from '@/pages/hostel/HostelBuildings'
import { HostelRooms } from '@/pages/hostel/HostelRooms'
import { HostelStudents } from '@/pages/hostel/HostelStudents'
import { HostelComplaints } from '@/pages/hostel/HostelComplaints'
import { HostelAnalytics as HostelWardenAnalytics } from '@/pages/hostel/HostelAnalytics'
import { HostelRoomDetail } from '@/pages/hostel/HostelRoomDetail'
import { HostelActivity } from '@/pages/hostel/HostelActivity'
import { useEffect } from 'react'
import { lazy } from 'react'

const VicePrincipalDashboard = lazy(() => import('@/pages/vice-principal/VicePrincipalDashboard'))
const VicePrincipalAttendance = lazy(() => import('@/pages/vice-principal/VicePrincipalAttendance'))
const VicePrincipalDiscipline = lazy(() => import('@/pages/vice-principal/VicePrincipalDiscipline'))
const VicePrincipalSubstitutions = lazy(() => import('@/pages/vice-principal/VicePrincipalSubstitutions'))
const VicePrincipalDailyReports = lazy(() => import('@/pages/vice-principal/VicePrincipalDailyReports'))
const VicePrincipalInspections = lazy(() => import('@/pages/vice-principal/VicePrincipalInspections'))

const ExamControllerDashboard = lazy(() => import('@/pages/exam-controller/ExamControllerDashboard'))
const ExamControllerExams = lazy(() => import('@/pages/exam-controller/ExamControllerExams'))
const ExamControllerResults = lazy(() => import('@/pages/exam-controller/ExamControllerResults'))
const ExamControllerSeating = lazy(() => import('@/pages/exam-controller/ExamControllerSeating'))
const ExamControllerMeritList = lazy(() => import('@/pages/exam-controller/ExamControllerMeritList'))
const ExamControllerGrades = lazy(() => import('@/pages/exam-controller/ExamControllerGrades'))

const ReceptionistDashboard = lazy(() => import('@/pages/receptionist/ReceptionistDashboard'))
const ReceptionistVisitors = lazy(() => import('@/pages/receptionist/ReceptionistVisitors'))
const ReceptionistEnquiries = lazy(() => import('@/pages/receptionist/ReceptionistEnquiries'))
const ReceptionistPhoneLogs = lazy(() => import('@/pages/receptionist/ReceptionistPhoneLogs'))
const ReceptionistCertificates = lazy(() => import('@/pages/receptionist/ReceptionistCertificates'))
const ReceptionistIdCards = lazy(() => import('@/pages/receptionist/ReceptionistIDCards'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 1 },
  },
})

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function RoleRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { user, isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user && !allowedRoles.includes(user.role)) {
    if (user.role === 'PRINCIPAL') return <Navigate to="/principal/dashboard" replace />
    if (user.role === 'TEACHER') return <Navigate to="/teacher/dashboard" replace />
    if (user.role === 'STUDENT') return <Navigate to="/student/dashboard" replace />
    if (user.role === 'ACCOUNTANT') return <Navigate to="/accountant/dashboard" replace />
    if (user.role === 'ADMISSION_COUNSELLOR') return <Navigate to="/admission/dashboard" replace />
    if (user.role === 'TRANSPORT_MANAGER') return <Navigate to="/transport/dashboard" replace />
    if (user.role === 'ADMINISTRATIVE_STAFF') return <Navigate to="/administrative/dashboard" replace />
    if (user.role === 'PARENT') return <Navigate to="/parent/dashboard" replace />
    if (user.role === 'CEO') return <Navigate to="/ceo/dashboard" replace />
    if (user.role === 'LIBRARIAN') return <Navigate to="/librarian/dashboard" replace />
    if (user.role === 'HOSTEL_WARDEN') return <Navigate to="/hostel/dashboard" replace />
    if (user.role === 'VICE_PRINCIPAL') return <Navigate to="/vice-principal/dashboard" replace />
    if (user.role === 'EXAM_CONTROLLER') return <Navigate to="/exam-controller/dashboard" replace />
    if (user.role === 'RECEPTIONIST') return <Navigate to="/receptionist/dashboard" replace />
    return <Navigate to="/dashboard" replace />
  }
  return <>{children}</>
}

function PrincipalRoute({ children }: { children: React.ReactNode }) {
  return <RoleRoute allowedRoles={['PRINCIPAL']}>{children}</RoleRoute>
}

function ChiefHeadRoute({ children }: { children: React.ReactNode }) {
  return <RoleRoute allowedRoles={['CHIEF_HEAD']}>{children}</RoleRoute>
}

function TeacherRoute({ children }: { children: React.ReactNode }) {
  return <RoleRoute allowedRoles={['TEACHER']}>{children}</RoleRoute>
}

function StudentRoute({ children }: { children: React.ReactNode }) {
  return <RoleRoute allowedRoles={['STUDENT']}>{children}</RoleRoute>
}

function AccountantRoute({ children }: { children: React.ReactNode }) {
  return <RoleRoute allowedRoles={['ACCOUNTANT']}>{children}</RoleRoute>
}

function AdmissionRoute({ children }: { children: React.ReactNode }) {
  return <RoleRoute allowedRoles={['ADMISSION_COUNSELLOR']}>{children}</RoleRoute>
}

function TransportRoute({ children }: { children: React.ReactNode }) {
  return <RoleRoute allowedRoles={['TRANSPORT_MANAGER']}>{children}</RoleRoute>
}

function AdministrativeRoute({ children }: { children: React.ReactNode }) {
  return <RoleRoute allowedRoles={['ADMINISTRATIVE_STAFF']}>{children}</RoleRoute>
}

function ParentRoute({ children }: { children: React.ReactNode }) {
  return <RoleRoute allowedRoles={['PARENT']}>{children}</RoleRoute>
}

function CEORoute({ children }: { children: React.ReactNode }) {
  return <RoleRoute allowedRoles={['CEO']}>{children}</RoleRoute>
}

function LibrarianRoute({ children }: { children: React.ReactNode }) {
  return <RoleRoute allowedRoles={['LIBRARIAN']}>{children}</RoleRoute>
}

function HostelWardenRoute({ children }: { children: React.ReactNode }) {
  return <RoleRoute allowedRoles={['HOSTEL_WARDEN']}>{children}</RoleRoute>
}

function VicePrincipalRoute({ children }: { children: React.ReactNode }) {
  return <RoleRoute allowedRoles={['VICE_PRINCIPAL']}>{children}</RoleRoute>
}

function ExamControllerRoute({ children }: { children: React.ReactNode }) {
  return <RoleRoute allowedRoles={['EXAM_CONTROLLER']}>{children}</RoleRoute>
}

function ReceptionistRoute({ children }: { children: React.ReactNode }) {
  return <RoleRoute allowedRoles={['RECEPTIONIST']}>{children}</RoleRoute>
}

function NotFound() {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <p className="text-gray-500 mb-4">Page not found</p>
        <a href="/dashboard" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">Go to Dashboard</a>
      </div>
    </div>
  )
}

function RoleRedirect() {
  const { user } = useAuthStore()
  if (user?.role === 'PRINCIPAL') return <Navigate to="/principal/dashboard" replace />
  if (user?.role === 'TEACHER') return <Navigate to="/teacher/dashboard" replace />
  if (user?.role === 'STUDENT') return <Navigate to="/student/dashboard" replace />
  if (user?.role === 'ACCOUNTANT') return <Navigate to="/accountant/dashboard" replace />
  if (user?.role === 'ADMISSION_COUNSELLOR') return <Navigate to="/admission/dashboard" replace />
  if (user?.role === 'TRANSPORT_MANAGER') return <Navigate to="/transport/dashboard" replace />
  if (user?.role === 'ADMINISTRATIVE_STAFF') return <Navigate to="/administrative/dashboard" replace />
  if (user?.role === 'PARENT') return <Navigate to="/parent/dashboard" replace />
  if (user?.role === 'CEO') return <Navigate to="/ceo/dashboard" replace />
  if (user?.role === 'LIBRARIAN') return <Navigate to="/librarian/dashboard" replace />
  if (user?.role === 'HOSTEL_WARDEN') return <Navigate to="/hostel/dashboard" replace />
  if (user?.role === 'VICE_PRINCIPAL') return <Navigate to="/vice-principal/dashboard" replace />
  if (user?.role === 'EXAM_CONTROLLER') return <Navigate to="/exam-controller/dashboard" replace />
  if (user?.role === 'RECEPTIONIST') return <Navigate to="/receptionist/dashboard" replace />
  return <Navigate to="/dashboard" replace />
}

function App() {
  const { darkMode } = useSettingsStore()
  const { fetchMe, isAuthenticated } = useAuthStore()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  useEffect(() => {
    if (isAuthenticated) fetchMe()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Routes>
                    <Route path="/" element={<RoleRedirect />} />

                    {/* Chief Head Routes */}
                    <Route path="/dashboard" element={<ChiefHeadRoute><SuperAdminDashboard /></ChiefHeadRoute>} />
                    <Route path="/authority-management" element={<ChiefHeadRoute><AuthorityManagement /></ChiefHeadRoute>} />
                    <Route path="/fee-structure" element={<ChiefHeadRoute><FeeStructurePage /></ChiefHeadRoute>} />
                    <Route path="/notifications" element={<ChiefHeadRoute><NotificationsPage /></ChiefHeadRoute>} />
                    <Route path="/announcements" element={<ChiefHeadRoute><AnnouncementsPage /></ChiefHeadRoute>} />
                    <Route path="/analytics/examinations" element={<ChiefHeadRoute><ExaminationAnalytics /></ChiefHeadRoute>} />
                    <Route path="/analytics/faculty" element={<ChiefHeadRoute><FacultyAnalytics /></ChiefHeadRoute>} />
                    <Route path="/analytics/hostel" element={<ChiefHeadRoute><HostelAnalytics /></ChiefHeadRoute>} />
                    <Route path="/analytics/transport" element={<ChiefHeadRoute><TransportAnalytics /></ChiefHeadRoute>} />
                    <Route path="/analytics/library" element={<ChiefHeadRoute><LibraryAnalytics /></ChiefHeadRoute>} />
                    <Route path="/analytics/helpdesk" element={<ChiefHeadRoute><HelpdeskAnalytics /></ChiefHeadRoute>} />
                    <Route path="/analytics/workflow" element={<ChiefHeadRoute><WorkflowAnalytics /></ChiefHeadRoute>} />
                    <Route path="/analytics/notifications" element={<ChiefHeadRoute><NotificationAnalytics /></ChiefHeadRoute>} />
                    <Route path="/analytics/calendar" element={<ChiefHeadRoute><CalendarAnalytics /></ChiefHeadRoute>} />
                    <Route path="/reports" element={<ChiefHeadRoute><ReportCenter /></ChiefHeadRoute>} />
                    <Route path="/search" element={<ChiefHeadRoute><GlobalSearch /></ChiefHeadRoute>} />
                    <Route path="/audit-log" element={<ChiefHeadRoute><AuditLog /></ChiefHeadRoute>} />
                    <Route path="/system-settings" element={<ChiefHeadRoute><SystemSettings /></ChiefHeadRoute>} />
                    <Route path="/bulk-operations" element={<ChiefHeadRoute><BulkOperations /></ChiefHeadRoute>} />
                    <Route path="/analytics/students" element={<ChiefHeadRoute><StudentAnalytics /></ChiefHeadRoute>} />
                    <Route path="/analytics/finance" element={<ChiefHeadRoute><FinancialDashboard /></ChiefHeadRoute>} />
                    <Route path="/permissions" element={<ChiefHeadRoute><PermissionManager /></ChiefHeadRoute>} />
                    <Route path="/templates" element={<ChiefHeadRoute><TemplateManager /></ChiefHeadRoute>} />
                    <Route path="/data-backup" element={<ChiefHeadRoute><DataBackupExport /></ChiefHeadRoute>} />
                    <Route path="/report-builder" element={<ChiefHeadRoute><CustomReportBuilder /></ChiefHeadRoute>} />
                    <Route path="/realtime-notifications" element={<ChiefHeadRoute><RealtimeNotifications /></ChiefHeadRoute>} />
                    <Route path="/appearance" element={<ChiefHeadRoute><DarkModeEnhancement /></ChiefHeadRoute>} />

                    {/* Principal Routes */}
                    <Route path="/principal/dashboard" element={<PrincipalRoute><PrincipalDashboard /></PrincipalRoute>} />
                    <Route path="/principal/departments" element={<PrincipalRoute><PrincipalDepartments /></PrincipalRoute>} />
                    <Route path="/principal/timetable" element={<PrincipalRoute><PrincipalTimetable /></PrincipalRoute>} />
                    <Route path="/principal/attendance" element={<PrincipalRoute><PrincipalAttendance /></PrincipalRoute>} />
                    <Route path="/principal/lms" element={<PrincipalRoute><PrincipalLMS /></PrincipalRoute>} />
                    <Route path="/principal/faculty" element={<PrincipalRoute><PrincipalFaculty /></PrincipalRoute>} />
                    <Route path="/principal/class-coordinators" element={<PrincipalRoute><PrincipalClassCoordinators /></PrincipalRoute>} />
                    <Route path="/principal/subject-allocation" element={<PrincipalRoute><PrincipalSubjectAllocation /></PrincipalRoute>} />
                    <Route path="/principal/leave" element={<PrincipalRoute><PrincipalLeave /></PrincipalRoute>} />
                    <Route path="/principal/performance" element={<PrincipalRoute><PrincipalPerformance /></PrincipalRoute>} />
                    <Route path="/principal/students" element={<PrincipalRoute><PrincipalStudents /></PrincipalRoute>} />
                    <Route path="/principal/admissions" element={<PrincipalRoute><PrincipalAdmissions /></PrincipalRoute>} />
                    <Route path="/principal/examinations" element={<PrincipalRoute><PrincipalExaminations /></PrincipalRoute>} />
                    <Route path="/principal/finance" element={<PrincipalRoute><PrincipalFinance /></PrincipalRoute>} />
                    <Route path="/principal/discipline" element={<PrincipalRoute><PrincipalDiscipline /></PrincipalRoute>} />
                    <Route path="/principal/hostel" element={<PrincipalRoute><PrincipalHostel /></PrincipalRoute>} />
                    <Route path="/principal/library" element={<PrincipalRoute><PrincipalLibrary /></PrincipalRoute>} />
                    <Route path="/principal/transport" element={<PrincipalRoute><PrincipalTransport /></PrincipalRoute>} />
                    <Route path="/principal/approvals" element={<PrincipalRoute><PrincipalApprovals /></PrincipalRoute>} />
                    <Route path="/principal/notifications" element={<PrincipalRoute><PrincipalNotifications /></PrincipalRoute>} />
                    <Route path="/principal/calendar" element={<PrincipalRoute><PrincipalCalendar /></PrincipalRoute>} />
                    <Route path="/principal/helpdesk" element={<PrincipalRoute><PrincipalHelpdesk /></PrincipalRoute>} />
                    <Route path="/principal/reports" element={<PrincipalRoute><PrincipalReports /></PrincipalRoute>} />

                    {/* Profile - All Roles */}
                    <Route path="/profile" element={<ProfilePage />} />

                    {/* Teacher Routes */}
                    <Route path="/teacher/dashboard" element={<TeacherRoute><TeacherDashboard /></TeacherRoute>} />
                    <Route path="/teacher/schedule" element={<TeacherRoute><TeacherSchedule /></TeacherRoute>} />
                    <Route path="/teacher/classes" element={<TeacherRoute><TeacherClasses /></TeacherRoute>} />
                    <Route path="/teacher/subjects" element={<TeacherRoute><TeacherSubjects /></TeacherRoute>} />
                    <Route path="/teacher/attendance" element={<TeacherRoute><TeacherAttendance /></TeacherRoute>} />
                    <Route path="/teacher/students" element={<TeacherRoute><TeacherStudents /></TeacherRoute>} />
                    <Route path="/teacher/students/performance" element={<TeacherRoute><TeacherStudentPerformance /></TeacherRoute>} />
                    <Route path="/teacher/assignments" element={<TeacherRoute><TeacherAssignments /></TeacherRoute>} />
                    <Route path="/teacher/lms" element={<TeacherRoute><TeacherLMS /></TeacherRoute>} />
                    <Route path="/teacher/examinations" element={<TeacherRoute><TeacherExaminations /></TeacherRoute>} />
                    <Route path="/teacher/marks-entry" element={<TeacherRoute><TeacherMarksEntry /></TeacherRoute>} />
                    <Route path="/teacher/leave" element={<TeacherRoute><TeacherLeave /></TeacherRoute>} />
                    <Route path="/teacher/calendar" element={<TeacherRoute><TeacherCalendar /></TeacherRoute>} />
                    <Route path="/teacher/reports" element={<TeacherRoute><TeacherReports /></TeacherRoute>} />
                    <Route path="/teacher/my-class" element={<TeacherRoute><TeacherMyClass /></TeacherRoute>} />
                    <Route path="/teacher/coordinator-attendance" element={<TeacherRoute><CoordinatorAttendance /></TeacherRoute>} />
                    <Route path="/teacher/subject-attendance" element={<TeacherRoute><SubjectTeacherAttendance /></TeacherRoute>} />
                    <Route path="/teacher/attendance-monitor" element={<TeacherRoute><AttendanceMonitor /></TeacherRoute>} />
                    <Route path="/teacher/notifications" element={<TeacherRoute><TeacherNotifications /></TeacherRoute>} />
                    <Route path="/teacher/doubts" element={<TeacherRoute><TeacherDoubts /></TeacherRoute>} />
                    <Route path="/teacher/parent-messages" element={<TeacherRoute><TeacherParentMessages /></TeacherRoute>} />
                    <Route path="/teacher/mcq" element={<TeacherRoute><TeacherMCQs /></TeacherRoute>} />

                    {/* Student Routes */}
                    <Route path="/student/dashboard" element={<StudentRoute><StudentDashboard /></StudentRoute>} />
                    <Route path="/student/subjects" element={<StudentRoute><StudentSubjects /></StudentRoute>} />
                    <Route path="/student/schedule" element={<StudentRoute><StudentSchedule /></StudentRoute>} />
                    <Route path="/student/attendance" element={<StudentRoute><StudentAttendance /></StudentRoute>} />
                    <Route path="/student/assignments" element={<StudentRoute><StudentAssignments /></StudentRoute>} />
                    <Route path="/student/materials" element={<StudentRoute><StudentMaterials /></StudentRoute>} />
                    <Route path="/student/exams" element={<StudentRoute><StudentExams /></StudentRoute>} />
                    <Route path="/student/results" element={<StudentRoute><StudentResults /></StudentRoute>} />
                    <Route path="/student/fees" element={<StudentRoute><StudentFees /></StudentRoute>} />
                    <Route path="/student/library" element={<StudentRoute><StudentLibrary /></StudentRoute>} />
                    <Route path="/student/hostel" element={<StudentRoute><StudentHostel /></StudentRoute>} />
                    <Route path="/student/transport" element={<StudentRoute><StudentTransport /></StudentRoute>} />
                    <Route path="/student/calendar" element={<StudentRoute><StudentCalendar /></StudentRoute>} />
                    <Route path="/student/notices" element={<StudentRoute><StudentNotices /></StudentRoute>} />
                    <Route path="/student/doubts" element={<StudentRoute><StudentDoubts /></StudentRoute>} />
                    <Route path="/student/mcq" element={<StudentRoute><StudentMCQs /></StudentRoute>} />
                    <Route path="/student/documents" element={<StudentRoute><StudentDocuments /></StudentRoute>} />
                    <Route path="/student/requests" element={<StudentRoute><StudentRequests /></StudentRoute>} />
                    <Route path="/student/performance" element={<StudentRoute><StudentPerformance /></StudentRoute>} />
                    <Route path="/student/profile" element={<StudentRoute><StudentProfile /></StudentRoute>} />

                    <Route path="/accountant/dashboard" element={<AccountantRoute><AccountantDashboard /></AccountantRoute>} />
                    <Route path="/accountant/collections" element={<AccountantRoute><AccountantCollections /></AccountantRoute>} />
                    <Route path="/accountant/ledger" element={<AccountantRoute><AccountantStudentLedger /></AccountantRoute>} />
                    <Route path="/accountant/receipts" element={<AccountantRoute><AccountantReceipts /></AccountantRoute>} />
                    <Route path="/accountant/payments" element={<AccountantRoute><AccountantPayments /></AccountantRoute>} />
                    <Route path="/accountant/refunds" element={<AccountantRoute><AccountantRefunds /></AccountantRoute>} />
                    <Route path="/accountant/reports" element={<AccountantRoute><AccountantReports /></AccountantRoute>} />
                    <Route path="/accountant/outstanding" element={<AccountantRoute><AccountantOutstanding /></AccountantRoute>} />
                    <Route path="/accountant/analytics" element={<AccountantRoute><AccountantAnalytics /></AccountantRoute>} />
                    <Route path="/accountant/profile" element={<AccountantRoute><ProfilePage /></AccountantRoute>} />

                    <Route path="/admission/dashboard" element={<AdmissionRoute><AdmissionDashboard /></AdmissionRoute>} />
                    <Route path="/admission/applications" element={<AdmissionRoute><AdmissionApplications /></AdmissionRoute>} />
                    <Route path="/admission/new" element={<AdmissionRoute><AdmissionNewApplication /></AdmissionRoute>} />
                    <Route path="/admission/follow-ups" element={<AdmissionRoute><AdmissionFollowUps /></AdmissionRoute>} />
                    <Route path="/admission/waiting-list" element={<AdmissionRoute><AdmissionWaitingList /></AdmissionRoute>} />
                    <Route path="/admission/analytics" element={<AdmissionRoute><AdmissionAnalytics /></AdmissionRoute>} />
                    <Route path="/admission/reports" element={<AdmissionRoute><AdmissionReports /></AdmissionRoute>} />
                    <Route path="/admission/profile" element={<AdmissionRoute><ProfilePage /></AdmissionRoute>} />

                    {/* Transport Manager Routes */}
                    <Route path="/transport/dashboard" element={<TransportRoute><TransportDashboard /></TransportRoute>} />
                    <Route path="/transport/vehicles" element={<TransportRoute><TransportVehicles /></TransportRoute>} />
                    <Route path="/transport/drivers" element={<TransportRoute><TransportDrivers /></TransportRoute>} />
                    <Route path="/transport/routes" element={<TransportRoute><TransportRoutesPage /></TransportRoute>} />
                    <Route path="/transport/allocation" element={<TransportRoute><TransportStudentAllocation /></TransportRoute>} />
                    <Route path="/transport/maintenance" element={<TransportRoute><TransportMaintenance /></TransportRoute>} />
                    <Route path="/transport/inspections" element={<TransportRoute><TransportInspections /></TransportRoute>} />
                    <Route path="/transport/complaints" element={<TransportRoute><TransportComplaints /></TransportRoute>} />
                    <Route path="/transport/reports" element={<TransportRoute><TransportReports /></TransportRoute>} />
                    <Route path="/transport/attendance" element={<TransportRoute><TransportDriverAttendance /></TransportRoute>} />
                    <Route path="/transport/schedule" element={<TransportRoute><TransportDailySchedule /></TransportRoute>} />
                    <Route path="/transport/profile" element={<TransportRoute><ProfilePage /></TransportRoute>} />

                    {/* Administrative Staff Routes */}
                    <Route path="/administrative/dashboard" element={<AdministrativeRoute><AdminDashboard /></AdministrativeRoute>} />
                    <Route path="/administrative/certificates" element={<AdministrativeRoute><AdminCertificates /></AdministrativeRoute>} />
                    <Route path="/administrative/requests" element={<AdministrativeRoute><AdminRequests /></AdministrativeRoute>} />
                    <Route path="/administrative/notices" element={<AdministrativeRoute><AdminNotices /></AdministrativeRoute>} />
                    <Route path="/administrative/meetings" element={<AdministrativeRoute><AdminMeetings /></AdministrativeRoute>} />
                    <Route path="/administrative/workflows" element={<AdministrativeRoute><AdminWorkflows /></AdministrativeRoute>} />
                    <Route path="/administrative/documents" element={<AdministrativeRoute><AdminDocuments /></AdministrativeRoute>} />
                    <Route path="/administrative/complaints" element={<AdministrativeRoute><AdminComplaints /></AdministrativeRoute>} />
                    <Route path="/administrative/reports" element={<AdministrativeRoute><AdminReports /></AdministrativeRoute>} />
                    <Route path="/administrative/profile" element={<AdministrativeRoute><ProfilePage /></AdministrativeRoute>} />

                    {/* Parent Routes */}
                    <Route path="/parent/dashboard" element={<ParentRoute><ParentDashboard /></ParentRoute>} />
                    <Route path="/parent/children" element={<ParentRoute><ParentChildren /></ParentRoute>} />
                    <Route path="/parent/attendance" element={<ParentRoute><ParentAttendance /></ParentRoute>} />
                    <Route path="/parent/timetable" element={<ParentRoute><ParentTimetable /></ParentRoute>} />
                    <Route path="/parent/performance" element={<ParentRoute><ParentPerformance /></ParentRoute>} />
                    <Route path="/parent/assignments" element={<ParentRoute><ParentAssignments /></ParentRoute>} />
                    <Route path="/parent/exams" element={<ParentRoute><ParentExams /></ParentRoute>} />
                    <Route path="/parent/fees" element={<ParentRoute><ParentFees /></ParentRoute>} />
                    <Route path="/parent/transport" element={<ParentRoute><ParentTransport /></ParentRoute>} />
                    <Route path="/parent/hostel" element={<ParentRoute><ParentHostel /></ParentRoute>} />
                    <Route path="/parent/library" element={<ParentRoute><ParentLibrary /></ParentRoute>} />
                    <Route path="/parent/notices" element={<ParentRoute><ParentNotices /></ParentRoute>} />
                    <Route path="/parent/ptm" element={<ParentRoute><ParentPTM /></ParentRoute>} />
                    <Route path="/parent/leave" element={<ParentRoute><ParentLeave /></ParentRoute>} />
                    <Route path="/parent/complaints" element={<ParentRoute><ParentComplaints /></ParentRoute>} />
                    <Route path="/parent/documents" element={<ParentRoute><ParentDocuments /></ParentRoute>} />
                    <Route path="/parent/messages" element={<ParentRoute><ParentMessages /></ParentRoute>} />
                    <Route path="/parent/activity" element={<ParentRoute><ParentActivity /></ParentRoute>} />

                    {/* CEO Routes */}
                    <Route path="/ceo/dashboard" element={<CEORoute><CEODashboard /></CEORoute>} />
                    <Route path="/ceo/pricing" element={<CEORoute><CEOSubscription /></CEORoute>} />
                    <Route path="/ceo/subscription" element={<CEORoute><CEOSubscription /></CEORoute>} />
                    <Route path="/ceo/charges" element={<CEORoute><CEOCharges /></CEORoute>} />

                    {/* Librarian Routes */}
                    <Route path="/librarian/dashboard" element={<LibrarianRoute><LibrarianDashboard /></LibrarianRoute>} />
                    <Route path="/librarian/books" element={<LibrarianRoute><LibrarianBooks /></LibrarianRoute>} />
                    <Route path="/librarian/issue" element={<LibrarianRoute><LibrarianIssueBook /></LibrarianRoute>} />
                    <Route path="/librarian/returns" element={<LibrarianRoute><LibrarianReturns /></LibrarianRoute>} />
                    <Route path="/librarian/overdue" element={<LibrarianRoute><LibrarianOverdue /></LibrarianRoute>} />
                    <Route path="/librarian/fines" element={<LibrarianRoute><LibrarianFines /></LibrarianRoute>} />
                    <Route path="/librarian/members" element={<LibrarianRoute><LibrarianMembers /></LibrarianRoute>} />
                    <Route path="/librarian/analytics" element={<LibrarianRoute><LibrarianAnalytics /></LibrarianRoute>} />

                    {/* Hostel Warden Routes */}
                    <Route path="/hostel/dashboard" element={<HostelWardenRoute><HostelDashboard /></HostelWardenRoute>} />
                    <Route path="/hostel/buildings" element={<HostelWardenRoute><HostelBuildings /></HostelWardenRoute>} />
                    <Route path="/hostel/rooms" element={<HostelWardenRoute><HostelRooms /></HostelWardenRoute>} />
                    <Route path="/hostel/rooms/:id" element={<HostelWardenRoute><HostelRoomDetail /></HostelWardenRoute>} />
                    <Route path="/hostel/students" element={<HostelWardenRoute><HostelStudents /></HostelWardenRoute>} />
                    <Route path="/hostel/complaints" element={<HostelWardenRoute><HostelComplaints /></HostelWardenRoute>} />
                    <Route path="/hostel/analytics" element={<HostelWardenRoute><HostelWardenAnalytics /></HostelWardenRoute>} />
                    <Route path="/hostel/activity" element={<HostelWardenRoute><HostelActivity /></HostelWardenRoute>} />

                    {/* Vice Principal Routes */}
                    <Route path="/vice-principal/dashboard" element={<VicePrincipalRoute><VicePrincipalDashboard /></VicePrincipalRoute>} />
                    <Route path="/vice-principal/attendance" element={<VicePrincipalRoute><VicePrincipalAttendance /></VicePrincipalRoute>} />
                    <Route path="/vice-principal/discipline" element={<VicePrincipalRoute><VicePrincipalDiscipline /></VicePrincipalRoute>} />
                    <Route path="/vice-principal/substitutions" element={<VicePrincipalRoute><VicePrincipalSubstitutions /></VicePrincipalRoute>} />
                    <Route path="/vice-principal/daily-reports" element={<VicePrincipalRoute><VicePrincipalDailyReports /></VicePrincipalRoute>} />
                    <Route path="/vice-principal/inspections" element={<VicePrincipalRoute><VicePrincipalInspections /></VicePrincipalRoute>} />

                    {/* Exam Controller Routes */}
                    <Route path="/exam-controller/dashboard" element={<ExamControllerRoute><ExamControllerDashboard /></ExamControllerRoute>} />
                    <Route path="/exam-controller/exams" element={<ExamControllerRoute><ExamControllerExams /></ExamControllerRoute>} />
                    <Route path="/exam-controller/results" element={<ExamControllerRoute><ExamControllerResults /></ExamControllerRoute>} />
                    <Route path="/exam-controller/seating" element={<ExamControllerRoute><ExamControllerSeating /></ExamControllerRoute>} />
                    <Route path="/exam-controller/merit-list" element={<ExamControllerRoute><ExamControllerMeritList /></ExamControllerRoute>} />
                    <Route path="/exam-controller/grades" element={<ExamControllerRoute><ExamControllerGrades /></ExamControllerRoute>} />

                    {/* Receptionist Routes */}
                    <Route path="/receptionist/dashboard" element={<ReceptionistRoute><ReceptionistDashboard /></ReceptionistRoute>} />
                    <Route path="/receptionist/visitors" element={<ReceptionistRoute><ReceptionistVisitors /></ReceptionistRoute>} />
                    <Route path="/receptionist/enquiries" element={<ReceptionistRoute><ReceptionistEnquiries /></ReceptionistRoute>} />
                    <Route path="/receptionist/phone-logs" element={<ReceptionistRoute><ReceptionistPhoneLogs /></ReceptionistRoute>} />
                    <Route path="/receptionist/certificates" element={<ReceptionistRoute><ReceptionistCertificates /></ReceptionistRoute>} />
                    <Route path="/receptionist/id-cards" element={<ReceptionistRoute><ReceptionistIdCards /></ReceptionistRoute>} />

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </QueryClientProvider>
  )
}

export default App
