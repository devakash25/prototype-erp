export interface FeatureDefinition {
  id: string
  label: string
  description?: string
}

export interface RoleFeatureGroup {
  role: string
  label: string
  features: FeatureDefinition[]
}

// Complete feature registry - maps every navigation item to a unique ID
export const FEATURE_REGISTRY: RoleFeatureGroup[] = [
  {
    role: 'CHIEF_HEAD',
    label: 'Chief Head',
    features: [
      { id: 'chief_head.dashboard', label: 'Dashboard' },
      { id: 'chief_head.authority_management', label: 'Authority Management' },
      { id: 'chief_head.fee_structure', label: 'Fee Structure' },
      { id: 'chief_head.send_notification', label: 'Send Notification' },
      { id: 'chief_head.announcements', label: 'Announcements' },
      { id: 'chief_head.analytics_examinations', label: 'Examination Analytics' },
      { id: 'chief_head.analytics_faculty', label: 'Faculty Analytics' },
      { id: 'chief_head.analytics_hostel', label: 'Hostel Analytics' },
      { id: 'chief_head.analytics_transport', label: 'Transport Analytics' },
      { id: 'chief_head.analytics_library', label: 'Library Analytics' },
      { id: 'chief_head.analytics_helpdesk', label: 'Helpdesk Analytics' },
      { id: 'chief_head.analytics_workflow', label: 'Workflow Analytics' },
      { id: 'chief_head.analytics_notifications', label: 'Notification Analytics' },
      { id: 'chief_head.analytics_calendar', label: 'Calendar Analytics' },
      { id: 'chief_head.report_center', label: 'Report Center' },
      { id: 'chief_head.custom_report_builder', label: 'Custom Report Builder' },
      { id: 'chief_head.global_search', label: 'Global Search' },
      { id: 'chief_head.student_analytics', label: 'Student Analytics' },
      { id: 'chief_head.financial_dashboard', label: 'Financial Dashboard' },
      { id: 'chief_head.template_manager', label: 'Template Manager' },
      { id: 'chief_head.realtime_notifications', label: 'Real-time Notifications' },
      { id: 'chief_head.system_settings', label: 'System Settings' },
      { id: 'chief_head.permission_manager', label: 'Permission Manager' },
      { id: 'chief_head.bulk_operations', label: 'Bulk Operations' },
      { id: 'chief_head.data_backup_export', label: 'Data Backup & Export' },
      { id: 'chief_head.audit_log', label: 'Audit Log' },
      { id: 'chief_head.appearance', label: 'Appearance' },
    ],
  },
  {
    role: 'DIRECTOR',
    label: 'Director',
    features: [
      { id: 'director.dashboard', label: 'Dashboard' },
      { id: 'director.department_performance', label: 'Department Performance' },
      { id: 'director.faculty_monitoring', label: 'Faculty Monitoring' },
      { id: 'director.student_analytics', label: 'Student Analytics' },
      { id: 'director.examinations', label: 'Examinations' },
      { id: 'director.admissions', label: 'Admissions' },
      { id: 'director.finance_view', label: 'Finance View' },
      { id: 'director.hr_overview', label: 'HR Overview' },
      { id: 'director.campus_services', label: 'Campus Services' },
      { id: 'director.pending_approvals', label: 'Pending Approvals' },
      { id: 'director.notifications', label: 'Notifications' },
      { id: 'director.calendar', label: 'Calendar' },
      { id: 'director.reports', label: 'Reports' },
    ],
  },
  {
    role: 'PRINCIPAL',
    label: 'Principal',
    features: [
      { id: 'principal.dashboard', label: 'Dashboard' },
      { id: 'principal.departments', label: 'Departments' },
      { id: 'principal.timetable', label: 'Timetable' },
      { id: 'principal.attendance', label: 'Attendance' },
      { id: 'principal.lms', label: 'LMS' },
      { id: 'principal.faculty_status', label: 'Faculty Status' },
      { id: 'principal.class_coordinators', label: 'Class Coordinators' },
      { id: 'principal.subject_allocation', label: 'Subject Allocation' },
      { id: 'principal.leave_management', label: 'Leave Management' },
      { id: 'principal.performance', label: 'Performance' },
      { id: 'principal.students', label: 'Students' },
      { id: 'principal.admissions', label: 'Admissions' },
      { id: 'principal.exam_dashboard', label: 'Exam Dashboard' },
      { id: 'principal.finance_view', label: 'Finance View' },
      { id: 'principal.discipline', label: 'Discipline' },
      { id: 'principal.hostel', label: 'Hostel' },
      { id: 'principal.library', label: 'Library' },
      { id: 'principal.transport', label: 'Transport' },
      { id: 'principal.approvals', label: 'Approvals' },
      { id: 'principal.notifications', label: 'Notifications' },
      { id: 'principal.calendar', label: 'Calendar' },
      { id: 'principal.helpdesk', label: 'Helpdesk' },
      { id: 'principal.reports', label: 'Reports' },
    ],
  },
  {
    role: 'HOD',
    label: 'Head of Department',
    features: [
      { id: 'hod.dashboard', label: 'Dashboard' },
      { id: 'hod.department_overview', label: 'Department Overview' },
      { id: 'hod.timetable', label: 'Timetable' },
      { id: 'hod.teachers', label: 'Teachers' },
      { id: 'hod.workload', label: 'Workload' },
      { id: 'hod.faculty_attendance', label: 'Faculty Attendance' },
      { id: 'hod.faculty_performance', label: 'Faculty Performance' },
      { id: 'hod.students', label: 'Students' },
      { id: 'hod.student_performance', label: 'Student Performance' },
      { id: 'hod.student_attendance', label: 'Student Attendance' },
      { id: 'hod.courses', label: 'Courses' },
      { id: 'hod.subjects', label: 'Subjects' },
      { id: 'hod.lms', label: 'LMS' },
      { id: 'hod.assignments', label: 'Assignments' },
      { id: 'hod.exams', label: 'Exams' },
      { id: 'hod.marks_entry', label: 'Marks Entry' },
      { id: 'hod.notices', label: 'Notices' },
      { id: 'hod.approvals', label: 'Approvals' },
      { id: 'hod.helpdesk', label: 'Helpdesk' },
      { id: 'hod.calendar', label: 'Calendar' },
      { id: 'hod.reports', label: 'Reports' },
    ],
  },
  {
    role: 'TEACHER',
    label: 'Teacher',
    features: [
      { id: 'teacher.dashboard', label: 'Dashboard' },
      { id: 'teacher.todays_schedule', label: "Today's Schedule" },
      { id: 'teacher.my_classes', label: 'My Classes' },
      { id: 'teacher.subjects', label: 'Subjects' },
      { id: 'teacher.take_attendance', label: 'Take Attendance' },
      { id: 'teacher.student_list', label: 'Student List' },
      { id: 'teacher.student_performance', label: 'Student Performance' },
      { id: 'teacher.assignments', label: 'Assignments' },
      { id: 'teacher.lms_overview', label: 'LMS Overview' },
      { id: 'teacher.exams', label: 'Exams' },
      { id: 'teacher.marks_entry', label: 'Marks Entry' },
      { id: 'teacher.leave', label: 'Leave' },
      { id: 'teacher.calendar', label: 'Calendar' },
      { id: 'teacher.my_class', label: 'My Class (Coordinator)' },
      { id: 'teacher.notifications', label: 'Notifications' },
      { id: 'teacher.reports', label: 'Reports' },
    ],
  },
  {
    role: 'STUDENT',
    label: 'Student',
    features: [
      { id: 'student.dashboard', label: 'Dashboard' },
      { id: 'student.my_subjects', label: 'My Subjects' },
      { id: 'student.timetable', label: 'Timetable' },
      { id: 'student.attendance', label: 'Attendance' },
      { id: 'student.performance', label: 'Performance' },
      { id: 'student.assignments', label: 'Assignments' },
      { id: 'student.study_materials', label: 'Study Materials' },
      { id: 'student.exam_schedule', label: 'Exam Schedule' },
      { id: 'student.results', label: 'Results' },
      { id: 'student.fee_status', label: 'Fee Status' },
      { id: 'student.library', label: 'Library' },
      { id: 'student.hostel', label: 'Hostel' },
      { id: 'student.transport', label: 'Transport' },
      { id: 'student.calendar', label: 'Calendar' },
      { id: 'student.notices', label: 'Notices' },
      { id: 'student.documents', label: 'Documents' },
      { id: 'student.requests', label: 'Requests' },
      { id: 'student.profile', label: 'Profile' },
    ],
  },
  {
    role: 'PARENT',
    label: 'Parent',
    features: [
      { id: 'parent.dashboard', label: 'Dashboard' },
      { id: 'parent.children', label: 'Children' },
      { id: 'parent.attendance', label: 'Attendance' },
      { id: 'parent.timetable', label: 'Timetable' },
      { id: 'parent.performance', label: 'Performance' },
      { id: 'parent.assignments', label: 'Assignments' },
      { id: 'parent.exams', label: 'Exams' },
      { id: 'parent.fees', label: 'Fees' },
      { id: 'parent.transport', label: 'Transport' },
      { id: 'parent.hostel', label: 'Hostel' },
      { id: 'parent.library', label: 'Library' },
      { id: 'parent.notices', label: 'Notices' },
      { id: 'parent.ptm', label: 'PTM' },
      { id: 'parent.leave', label: 'Leave' },
      { id: 'parent.complaints', label: 'Complaints' },
      { id: 'parent.documents', label: 'Documents' },
      { id: 'parent.activity', label: 'Activity' },
    ],
  },
  {
    role: 'ACCOUNTANT',
    label: 'Accountant',
    features: [
      { id: 'accountant.dashboard', label: 'Dashboard' },
      { id: 'accountant.collect_fees', label: 'Collect Fees' },
      { id: 'accountant.student_ledger', label: 'Student Ledger' },
      { id: 'accountant.outstanding_dues', label: 'Outstanding Dues' },
      { id: 'accountant.payment_verification', label: 'Payment Verification' },
      { id: 'accountant.receipts', label: 'Receipts' },
      { id: 'accountant.refunds', label: 'Refunds' },
      { id: 'accountant.daily_reports', label: 'Daily Reports' },
      { id: 'accountant.analytics', label: 'Analytics' },
      { id: 'accountant.profile', label: 'Profile' },
    ],
  },
  {
    role: 'ADMISSION_COUNSELLOR',
    label: 'Admission Counsellor',
    features: [
      { id: 'admission.dashboard', label: 'Dashboard' },
      { id: 'admission.all_applications', label: 'All Applications' },
      { id: 'admission.new_application', label: 'New Application' },
      { id: 'admission.waiting_list', label: 'Waiting List' },
      { id: 'admission.follow_ups', label: 'Follow-ups' },
      { id: 'admission.reports', label: 'Admission Reports' },
      { id: 'admission.analytics', label: 'Analytics' },
      { id: 'admission.profile', label: 'Profile' },
    ],
  },
  {
    role: 'TRANSPORT_MANAGER',
    label: 'Transport Manager',
    features: [
      { id: 'transport.dashboard', label: 'Dashboard' },
      { id: 'transport.vehicles', label: 'Vehicles' },
      { id: 'transport.drivers', label: 'Drivers' },
      { id: 'transport.driver_attendance', label: 'Driver Attendance' },
      { id: 'transport.routes', label: 'Routes' },
      { id: 'transport.student_allocation', label: 'Student Allocation' },
      { id: 'transport.daily_schedule', label: 'Daily Schedule' },
      { id: 'transport.maintenance', label: 'Maintenance' },
      { id: 'transport.inspections', label: 'Inspections' },
      { id: 'transport.complaints', label: 'Complaints' },
      { id: 'transport.reports', label: 'Transport Reports' },
      { id: 'transport.profile', label: 'Profile' },
    ],
  },
  {
    role: 'ADMINISTRATIVE_STAFF',
    label: 'Administrative Staff',
    features: [
      { id: 'administrative.dashboard', label: 'Dashboard' },
      { id: 'administrative.student_requests', label: 'Student Requests' },
      { id: 'administrative.certificates', label: 'Certificates' },
      { id: 'administrative.notices', label: 'Notices' },
      { id: 'administrative.meetings', label: 'Meetings' },
      { id: 'administrative.documents', label: 'Documents' },
      { id: 'administrative.approval_tracking', label: 'Approval Tracking' },
      { id: 'administrative.complaints', label: 'Complaints' },
      { id: 'administrative.reports', label: 'Administrative Reports' },
      { id: 'administrative.profile', label: 'Profile' },
    ],
  },
  {
    role: 'LIBRARIAN',
    label: 'Librarian',
    features: [
      { id: 'librarian.dashboard', label: 'Dashboard' },
      { id: 'librarian.books', label: 'Books' },
      { id: 'librarian.issue_book', label: 'Issue Book' },
      { id: 'librarian.returns_renewals', label: 'Returns & Renewals' },
      { id: 'librarian.overdue_books', label: 'Overdue Books' },
      { id: 'librarian.fines', label: 'Fines' },
      { id: 'librarian.members', label: 'Members' },
      { id: 'librarian.analytics', label: 'Analytics' },
    ],
  },
  {
    role: 'HOSTEL_WARDEN',
    label: 'Hostel Warden',
    features: [
      { id: 'hostel.dashboard', label: 'Dashboard' },
      { id: 'hostel.buildings', label: 'Buildings' },
      { id: 'hostel.rooms', label: 'Rooms' },
      { id: 'hostel.students', label: 'Students' },
      { id: 'hostel.complaints', label: 'Complaints' },
      { id: 'hostel.analytics', label: 'Analytics' },
      { id: 'hostel.activity', label: 'Activity' },
    ],
  },
]

// Basic plan - minimal features per role
export const BASIC_PLAN_FEATURES: Record<string, string[]> = {
  CHIEF_HEAD: [
    'chief_head.dashboard',
    'chief_head.authority_management',
    'chief_head.fee_structure',
    'chief_head.system_settings',
  ],
  DIRECTOR: [
    'director.dashboard',
    'director.department_performance',
    'director.faculty_monitoring',
  ],
  PRINCIPAL: [
    'principal.dashboard',
    'principal.departments',
    'principal.attendance',
    'principal.faculty_status',
    'principal.students',
  ],
  HOD: [
    'hod.dashboard',
    'hod.department_overview',
    'hod.teachers',
    'hod.students',
  ],
  TEACHER: [
    'teacher.dashboard',
    'teacher.todays_schedule',
    'teacher.take_attendance',
    'teacher.student_list',
  ],
  STUDENT: [
    'student.dashboard',
    'student.my_subjects',
    'student.timetable',
    'student.attendance',
    'student.fee_status',
  ],
  PARENT: [
    'parent.dashboard',
    'parent.children',
    'parent.attendance',
    'parent.fees',
  ],
  ACCOUNTANT: [
    'accountant.dashboard',
    'accountant.collect_fees',
    'accountant.student_ledger',
    'accountant.outstanding_dues',
  ],
  ADMISSION_COUNSELLOR: [
    'admission.dashboard',
    'admission.all_applications',
    'admission.new_application',
  ],
  TRANSPORT_MANAGER: [
    'transport.dashboard',
    'transport.vehicles',
    'transport.drivers',
    'transport.routes',
  ],
  ADMINISTRATIVE_STAFF: [
    'administrative.dashboard',
    'administrative.student_requests',
    'administrative.certificates',
  ],
  LIBRARIAN: [
    'librarian.dashboard',
    'librarian.books',
    'librarian.issue_book',
  ],
  HOSTEL_WARDEN: [
    'hostel.dashboard',
    'hostel.buildings',
    'hostel.rooms',
    'hostel.students',
  ],
}

// Pro plan - all features enabled
export const PRO_PLAN_FEATURES: Record<string, string[]> = Object.fromEntries(
  FEATURE_REGISTRY.map((group) => [
    group.role,
    group.features.map((f) => f.id),
  ])
)

// Helper: get all feature IDs for a role
export function getAllFeatureIdsForRole(role: string): string[] {
  const group = FEATURE_REGISTRY.find((g) => g.role === role)
  return group ? group.features.map((f) => f.id) : []
}

// Helper: get all feature IDs across all roles
export function getAllFeatureIds(): string[] {
  return FEATURE_REGISTRY.flatMap((group) => group.features.map((f) => f.id))
}

// Helper: check if a feature is enabled
export function isFeatureEnabled(
  enabledFeatures: string[],
  featureId: string
): boolean {
  return enabledFeatures.includes(featureId)
}

// Helper: filter navigation items by enabled features
export function filterNavByFeatures<T extends { href?: string; children?: T[] }>(
  items: T[],
  enabledFeatures: string[],
  rolePrefix: string
): T[] {
  return items
    .map((item) => {
      if (item.href) {
        // Match feature ID from href
        const featureId = hrefToFeatureId(item.href, rolePrefix)
        if (featureId && !enabledFeatures.includes(featureId)) {
          return null
        }
        return item
      }
      if (item.children) {
        const filteredChildren = filterNavByFeatures(
          item.children,
          enabledFeatures,
          rolePrefix
        )
        if (filteredChildren.length === 0) return null
        return { ...item, children: filteredChildren }
      }
      return item
    })
    .filter(Boolean) as T[]
}

// Helper: convert href to feature ID
function hrefToFeatureId(href: string, rolePrefix: string): string | null {
  const segment = href.split('/').filter(Boolean).pop()
  if (!segment) return null
  return `${rolePrefix}.${segment}`
}
