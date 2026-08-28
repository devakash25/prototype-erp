import { useState, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useApi } from '@/hooks/useApi'
import {
  LayoutDashboard, Users, Bell, Megaphone, GraduationCap, BookOpen, Calendar,
  ChevronDown, ChevronRight, Shield, DollarSign, Building, Bus, Library,
  HelpCircle, FileText, BarChart3, ClipboardList, UserPlus, School, Heart,
  Target, TrendingUp, UserCheck, Award, ClipboardCheck, Clock, Home,
  BookOpenCheck, UserCog, AlertTriangle, Settings, FileCheck, Star,
  MapPin, Wrench, RotateCcw, Bed, CreditCard,
  Search, Database, MessageSquare, Palette, Eye, MessageCircle,
} from 'lucide-react'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

interface NavItem {
  label: string
  icon: any
  href?: string
  featureId?: string
  children?: NavItem[]
  roles?: string[]
}

const chiefHeadNavigation: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  {
    label: 'Administration',
    icon: Shield,
    children: [
      { label: 'Authority Management', icon: Users, href: '/authority-management' },
      { label: 'Fee Structure', icon: DollarSign, href: '/fee-structure' },
    ],
  },
  {
    label: 'Notifications',
    icon: Bell,
    children: [
      { label: 'Send Notification', icon: Bell, href: '/notifications' },
      { label: 'Announcements', icon: Megaphone, href: '/announcements' },
    ],
  },
  {
    label: 'Analytics',
    icon: BarChart3,
    children: [
      { label: 'Examination Analytics', icon: FileText, href: '/analytics/examinations' },
      { label: 'Faculty Analytics', icon: GraduationCap, href: '/analytics/faculty' },
      { label: 'Hostel Analytics', icon: Building, href: '/analytics/hostel' },
      { label: 'Transport Analytics', icon: Bus, href: '/analytics/transport' },
      { label: 'Library Analytics', icon: Library, href: '/analytics/library' },
      { label: 'Helpdesk Analytics', icon: HelpCircle, href: '/analytics/helpdesk' },
      { label: 'Workflow Analytics', icon: ClipboardList, href: '/analytics/workflow' },
      { label: 'Notification Analytics', icon: Bell, href: '/analytics/notifications' },
      { label: 'Calendar Analytics', icon: Calendar, href: '/analytics/calendar' },
    ],
  },
  {
    label: 'Reports',
    icon: FileText,
    children: [
      { label: 'Report Center', icon: FileText, href: '/reports' },
      { label: 'Custom Report Builder', icon: ClipboardCheck, href: '/report-builder' },
    ],
  },
  {
    label: 'Search',
    icon: Search,
    href: '/search',
  },
  {
    label: 'More Analytics',
    icon: BarChart3,
    children: [
      { label: 'Student Analytics', icon: Users, href: '/analytics/students' },
      { label: 'Financial Dashboard', icon: DollarSign, href: '/analytics/finance' },
    ],
  },
  {
    label: 'Communication',
    icon: MessageSquare,
    children: [
      { label: 'Template Manager', icon: FileText, href: '/templates' },
      { label: 'Real-time Notifications', icon: Bell, href: '/realtime-notifications' },
    ],
  },
  {
    label: 'System',
    icon: Settings,
    children: [
      { label: 'System Settings', icon: Settings, href: '/system-settings' },
      { label: 'Permission Manager', icon: Shield, href: '/permissions' },
      { label: 'Bulk Operations', icon: Database, href: '/bulk-operations' },
      { label: 'Data Backup & Export', icon: Database, href: '/data-backup' },
      { label: 'Audit Log', icon: ClipboardCheck, href: '/audit-log' },
      { label: 'Appearance', icon: Palette, href: '/appearance' },
    ],
  },
]

const directorNavigation: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/director/dashboard' },
  {
    label: 'Academic',
    icon: GraduationCap,
    children: [
      { label: 'Department Performance', icon: Target, href: '/director/departments' },
      { label: 'Faculty Monitoring', icon: Users, href: '/director/faculty' },
      { label: 'Student Analytics', icon: UserCheck, href: '/director/students' },
      { label: 'Examinations', icon: Award, href: '/director/examinations' },
    ],
  },
  {
    label: 'Operations',
    icon: Building,
    children: [
      { label: 'Admissions', icon: UserPlus, href: '/director/admissions' },
      { label: 'Finance View', icon: DollarSign, href: '/director/finance' },
      { label: 'HR Overview', icon: ClipboardCheck, href: '/director/hr' },
      { label: 'Campus Services', icon: School, href: '/director/campus' },
    ],
  },
  {
    label: 'Management',
    icon: Shield,
    children: [
      { label: 'Pending Approvals', icon: ClipboardList, href: '/director/approvals' },
      { label: 'Notifications', icon: Bell, href: '/director/notifications' },
      { label: 'Calendar', icon: Calendar, href: '/director/calendar' },
    ],
  },
  {
    label: 'Reports',
    icon: FileText,
    children: [
      { label: 'Reports', icon: FileText, href: '/director/reports' },
    ],
  },
]

const principalNavigation: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/principal/dashboard' },
  {
    label: 'Academic',
    icon: GraduationCap,
    children: [
      { label: 'Departments', icon: Building, href: '/principal/departments' },
      { label: 'Timetable', icon: Clock, href: '/principal/timetable' },
      { label: 'Attendance', icon: UserCheck, href: '/principal/attendance' },
      { label: 'LMS', icon: BookOpenCheck, href: '/principal/lms' },
    ],
  },
  {
    label: 'Faculty',
    icon: Users,
    children: [
      { label: 'Faculty Status', icon: Users, href: '/principal/faculty' },
      { label: 'Class Coordinators', icon: UserCheck, href: '/principal/class-coordinators' },
      { label: 'Subject Allocation', icon: BookOpen, href: '/principal/subject-allocation' },
      { label: 'Leave Management', icon: ClipboardList, href: '/principal/leave' },
      { label: 'Performance', icon: Star, href: '/principal/performance' },
    ],
  },
  {
    label: 'Students',
    icon: GraduationCap,
    children: [
      { label: 'Students', icon: Users, href: '/principal/students' },
      { label: 'Admissions', icon: UserPlus, href: '/principal/admissions' },
    ],
  },
  {
    label: 'Examinations',
    icon: Award,
    children: [
      { label: 'Exam Dashboard', icon: Award, href: '/principal/examinations' },
    ],
  },
  {
    label: 'Operations',
    icon: Settings,
    children: [
      { label: 'Finance View', icon: DollarSign, href: '/principal/finance' },
      { label: 'Discipline', icon: AlertTriangle, href: '/principal/discipline' },
      { label: 'Hostel', icon: Home, href: '/principal/hostel' },
      { label: 'Library', icon: Library, href: '/principal/library' },
      { label: 'Transport', icon: Bus, href: '/principal/transport' },
    ],
  },
  {
    label: 'Management',
    icon: Shield,
    children: [
      { label: 'Approvals', icon: ClipboardList, href: '/principal/approvals' },
      { label: 'Notifications', icon: Bell, href: '/principal/notifications' },
      { label: 'Calendar', icon: Calendar, href: '/principal/calendar' },
      { label: 'Helpdesk', icon: HelpCircle, href: '/principal/helpdesk' },
    ],
  },
  {
    label: 'Reports',
    icon: FileText,
    children: [
      { label: 'Reports', icon: FileText, href: '/principal/reports' },
    ],
  },
]

// School-specific roles (use principal routes for now since similar function)
const managerNavigation: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/principal/dashboard' },
  {
    label: 'Academic',
    icon: GraduationCap,
    children: [
      { label: 'Departments', icon: Building, href: '/principal/departments' },
      { label: 'Timetable', icon: Clock, href: '/principal/timetable' },
      { label: 'Attendance', icon: UserCheck, href: '/principal/attendance' },
      { label: 'LMS', icon: BookOpenCheck, href: '/principal/lms' },
    ],
  },
  {
    label: 'Faculty',
    icon: Users,
    children: [
      { label: 'Faculty Status', icon: Users, href: '/principal/faculty' },
      { label: 'Leave Management', icon: ClipboardList, href: '/principal/leave' },
    ],
  },
  {
    label: 'Students',
    icon: GraduationCap,
    children: [
      { label: 'Student List', icon: Users, href: '/principal/students' },
      { label: 'Performance', icon: TrendingUp, href: '/principal/students/performance' },
      { label: 'Attendance', icon: UserCheck, href: '/principal/students/attendance' },
    ],
  },
  {
    label: 'Examinations',
    icon: Award,
    children: [
      { label: 'Exam Schedule', icon: Calendar, href: '/principal/exams' },
      { label: 'Results', icon: TrendingUp, href: '/principal/results' },
      { label: 'Marks Entry', icon: ClipboardCheck, href: '/principal/marks-entry' },
    ],
  },
  {
    label: 'Management',
    icon: Shield,
    children: [
      { label: 'Notices', icon: Bell, href: '/principal/notices' },
      { label: 'Approvals', icon: ClipboardCheck, href: '/principal/approvals' },
      { label: 'Calendar', icon: Calendar, href: '/principal/calendar' },
    ],
  },
  {
    label: 'Reports',
    icon: FileText,
    children: [
      { label: 'Reports', icon: FileText, href: '/principal/reports' },
    ],
  },
]

const viceManagerNavigation: NavItem[] = managerNavigation
const vicePrincipalNavigation: NavItem[] = principalNavigation

const hodNavigation: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/hod/dashboard' },
  {
    label: 'Department',
    icon: Building,
    children: [
      { label: 'Overview', icon: Building, href: '/hod/department' },
      { label: 'Timetable', icon: Clock, href: '/hod/timetable' },
    ],
  },
  {
    label: 'Faculty',
    icon: Users,
    children: [
      { label: 'Teachers', icon: Users, href: '/hod/faculty' },
      { label: 'Workload', icon: ClipboardCheck, href: '/hod/faculty/workload' },
      { label: 'Attendance', icon: UserCheck, href: '/hod/faculty/attendance' },
      { label: 'Performance', icon: Star, href: '/hod/faculty/performance' },
    ],
  },
  {
    label: 'Students',
    icon: GraduationCap,
    children: [
      { label: 'Students', icon: Users, href: '/hod/students' },
      { label: 'Performance', icon: TrendingUp, href: '/hod/students/performance' },
      { label: 'Attendance', icon: UserCheck, href: '/hod/students/attendance' },
    ],
  },
  {
    label: 'Academics',
    icon: BookOpen,
    children: [
      { label: 'Courses', icon: School, href: '/hod/courses' },
      { label: 'Subjects', icon: BookOpen, href: '/hod/subjects' },
      { label: 'LMS', icon: BookOpenCheck, href: '/hod/lms' },
      { label: 'Assignments', icon: FileCheck, href: '/hod/assignments' },
    ],
  },
  {
    label: 'Examinations',
    icon: Award,
    children: [
      { label: 'Exams', icon: Award, href: '/hod/examinations' },
      { label: 'Marks Entry', icon: ClipboardCheck, href: '/hod/marks-entry' },
    ],
  },
  {
    label: 'Management',
    icon: Shield,
    children: [
      { label: 'Notices', icon: Bell, href: '/hod/notices' },
      { label: 'Approvals', icon: ClipboardList, href: '/hod/approvals' },
      { label: 'Helpdesk', icon: HelpCircle, href: '/hod/helpdesk' },
      { label: 'Calendar', icon: Calendar, href: '/hod/calendar' },
    ],
  },
  {
    label: 'Reports',
    icon: FileText,
    children: [
      { label: 'Reports', icon: FileText, href: '/hod/reports' },
    ],
  },
]

const teacherNavigation: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/teacher/dashboard' },
  {
    label: 'Teaching',
    icon: BookOpen,
    children: [
      { label: "Today's Schedule", icon: Clock, href: '/teacher/schedule' },
      { label: 'My Classes', icon: School, href: '/teacher/classes' },
      { label: 'Subjects', icon: BookOpen, href: '/teacher/subjects' },
    ],
  },
  {
    label: 'Attendance',
    icon: UserCheck,
    children: [
      { label: 'Take Attendance', icon: ClipboardCheck, href: '/teacher/attendance' },
      { label: 'Mark Period Attendance', icon: ClipboardCheck, href: '/teacher/subject-attendance' },
    ],
  },
  {
    label: 'Students',
    icon: Users,
    children: [
      { label: 'Student List', icon: Users, href: '/teacher/students' },
      { label: 'Performance', icon: TrendingUp, href: '/teacher/students/performance' },
    ],
  },
  {
    label: 'LMS',
    icon: BookOpenCheck,
    children: [
      { label: 'Assignments', icon: FileCheck, href: '/teacher/assignments' },
      { label: 'LMS Overview', icon: BookOpenCheck, href: '/teacher/lms' },
    ],
  },
  {
    label: 'Examinations',
    icon: Award,
    children: [
      { label: 'Exams', icon: Award, href: '/teacher/examinations' },
      { label: 'MCQ Tests', icon: FileText, href: '/teacher/mcq' },
      { label: 'Marks Entry', icon: ClipboardCheck, href: '/teacher/marks-entry' },
    ],
  },
  {
    label: 'Management',
    icon: Shield,
    children: [
      { label: 'Leave', icon: ClipboardList, href: '/teacher/leave' },
      { label: 'Calendar', icon: Calendar, href: '/teacher/calendar' },
    ],
  },
  {
    label: 'Class Coordinator',
    icon: UserCheck,
    children: [
      { label: 'My Class', icon: School, href: '/teacher/my-class' },
      { label: 'Class Attendance', icon: ClipboardCheck, href: '/teacher/coordinator-attendance' },
      { label: 'Monitor', icon: Eye, href: '/teacher/attendance-monitor' },
      { label: 'Notifications', icon: Bell, href: '/teacher/notifications' },
      { label: 'Doubt Solving', icon: MessageCircle, href: '/teacher/doubts' },
      { label: 'Parent Messages', icon: MessageCircle, href: '/teacher/parent-messages' },
    ],
  },
  {
    label: 'Reports',
    icon: FileText,
    children: [
      { label: 'Reports', icon: FileText, href: '/teacher/reports' },
    ],
  },
]

const studentNavigation: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/student/dashboard' },
  {
    label: 'Academics',
    icon: GraduationCap,
    children: [
      { label: 'My Subjects', icon: BookOpen, href: '/student/subjects' },
      { label: 'Timetable', icon: Clock, href: '/student/schedule' },
      { label: 'Attendance', icon: UserCheck, href: '/student/attendance' },
      { label: 'Performance', icon: TrendingUp, href: '/student/performance' },
    ],
  },
  {
    label: 'Learning',
    icon: BookOpenCheck,
    children: [
      { label: 'Assignments', icon: FileCheck, href: '/student/assignments' },
      { label: 'Study Materials', icon: BookOpenCheck, href: '/student/materials' },
      { label: 'Doubts', icon: MessageCircle, href: '/student/doubts' },
    ],
  },
  {
    label: 'Examinations',
    icon: Award,
    children: [
      { label: 'Exam Schedule', icon: Calendar, href: '/student/exams' },
      { label: 'MCQ Tests', icon: FileText, href: '/student/mcq' },
      { label: 'Results', icon: TrendingUp, href: '/student/results' },
    ],
  },
  {
    label: 'Finance',
    icon: DollarSign,
    children: [
      { label: 'Fee Status', icon: DollarSign, href: '/student/fees' },
    ],
  },
  {
    label: 'Campus',
    icon: Building,
    children: [
      { label: 'Library', icon: Library, href: '/student/library' },
      { label: 'Hostel', icon: Home, href: '/student/hostel' },
      { label: 'Transport', icon: Bus, href: '/student/transport' },
    ],
  },
  {
    label: 'Services',
    icon: Settings,
    children: [
      { label: 'Calendar', icon: Calendar, href: '/student/calendar' },
      { label: 'Notices', icon: Bell, href: '/student/notices' },
      { label: 'Documents', icon: FileText, href: '/student/documents' },
      { label: 'Requests', icon: ClipboardList, href: '/student/requests' },
    ],
  },
  {
    label: 'Profile',
    icon: UserCog,
    href: '/student/profile',
  },
]

const admissionNavigation: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/admission/dashboard' },
  {
    label: 'Applications',
    icon: FileText,
    children: [
      { label: 'All Applications', icon: FileText, href: '/admission/applications' },
      { label: 'New Application', icon: UserPlus, href: '/admission/new' },
      { label: 'Waiting List', icon: Clock, href: '/admission/waiting-list' },
    ],
  },
  {
    label: 'Follow-ups',
    icon: Calendar,
    href: '/admission/follow-ups',
  },
  {
    label: 'Reports',
    icon: BarChart3,
    children: [
      { label: 'Admission Reports', icon: BarChart3, href: '/admission/reports' },
      { label: 'Analytics', icon: TrendingUp, href: '/admission/analytics' },
    ],
  },
  {
    label: 'Profile',
    icon: UserCog,
    href: '/admission/profile',
  },
]

const accountantNavigation: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/accountant/dashboard' },
  {
    label: 'Fee Collection',
    icon: DollarSign,
    children: [
      { label: 'Collect Fees', icon: DollarSign, href: '/accountant/collections' },
      { label: 'Student Ledger', icon: Users, href: '/accountant/ledger' },
      { label: 'Outstanding Dues', icon: AlertTriangle, href: '/accountant/outstanding' },
    ],
  },
  {
    label: 'Payments',
    icon: FileText,
    children: [
      { label: 'Payment Verification', icon: FileCheck, href: '/accountant/payments' },
      { label: 'Receipts', icon: FileText, href: '/accountant/receipts' },
      { label: 'Refunds', icon: TrendingUp, href: '/accountant/refunds' },
    ],
  },
  {
    label: 'Reports',
    icon: BarChart3,
    children: [
      { label: 'Daily Reports', icon: Calendar, href: '/accountant/reports' },
      { label: 'Analytics', icon: TrendingUp, href: '/accountant/analytics' },
    ],
  },
  {
    label: 'Profile',
    icon: UserCog,
    href: '/accountant/profile',
  },
]

const transportNavigation: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/transport/dashboard' },
  {
    label: 'Fleet Management',
    icon: Bus,
    children: [
      { label: 'Vehicles', icon: Bus, href: '/transport/vehicles' },
      { label: 'Drivers', icon: Users, href: '/transport/drivers' },
      { label: 'Driver Attendance', icon: UserCheck, href: '/transport/attendance' },
    ],
  },
  {
    label: 'Route Management',
    icon: MapPin,
    children: [
      { label: 'Routes', icon: MapPin, href: '/transport/routes' },
      { label: 'Student Allocation', icon: GraduationCap, href: '/transport/allocation' },
      { label: 'Daily Schedule', icon: Clock, href: '/transport/schedule' },
    ],
  },
  {
    label: 'Operations',
    icon: Settings,
    children: [
      { label: 'Maintenance', icon: Wrench, href: '/transport/maintenance' },
      { label: 'Inspections', icon: ClipboardCheck, href: '/transport/inspections' },
      { label: 'Complaints', icon: AlertTriangle, href: '/transport/complaints' },
    ],
  },
  {
    label: 'Reports',
    icon: FileText,
    children: [
      { label: 'Transport Reports', icon: BarChart3, href: '/transport/reports' },
    ],
  },
  {
    label: 'Profile',
    icon: UserCog,
    href: '/transport/profile',
  },
]

const administrativeNavigation: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/administrative/dashboard' },
  {
    label: 'Student Services',
    icon: GraduationCap,
    children: [
      { label: 'Student Requests', icon: ClipboardList, href: '/administrative/requests' },
      { label: 'Certificates', icon: FileCheck, href: '/administrative/certificates' },
    ],
  },
  {
    label: 'Office Management',
    icon: Building,
    children: [
      { label: 'Notices', icon: Bell, href: '/administrative/notices' },
      { label: 'Meetings', icon: Calendar, href: '/administrative/meetings' },
      { label: 'Documents', icon: FileText, href: '/administrative/documents' },
    ],
  },
  {
    label: 'Workflow',
    icon: ClipboardCheck,
    children: [
      { label: 'Approval Tracking', icon: ClipboardCheck, href: '/administrative/workflows' },
      { label: 'Complaints', icon: AlertTriangle, href: '/administrative/complaints' },
    ],
  },
  {
    label: 'Reports',
    icon: BarChart3,
    children: [
      { label: 'Administrative Reports', icon: FileText, href: '/administrative/reports' },
    ],
  },
  {
    label: 'Profile',
    icon: UserCog,
    href: '/administrative/profile',
  },
]

const parentNavigation: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/parent/dashboard' },
  {
    label: 'Children',
    icon: Users,
    href: '/parent/children',
  },
  {
    label: 'Academics',
    icon: GraduationCap,
    children: [
      { label: 'Attendance', icon: UserCheck, href: '/parent/attendance' },
      { label: 'Timetable', icon: Clock, href: '/parent/timetable' },
      { label: 'Performance', icon: TrendingUp, href: '/parent/performance' },
      { label: 'Assignments', icon: FileCheck, href: '/parent/assignments' },
    ],
  },
  {
    label: 'Examinations',
    icon: Award,
    href: '/parent/exams',
  },
  {
    label: 'Finance',
    icon: DollarSign,
    href: '/parent/fees',
  },
  {
    label: 'Campus',
    icon: Building,
    children: [
      { label: 'Transport', icon: Bus, href: '/parent/transport' },
      { label: 'Hostel', icon: Home, href: '/parent/hostel' },
      { label: 'Library', icon: Library, href: '/parent/library' },
    ],
  },
  {
    label: 'Communication',
    icon: Bell,
    children: [
      { label: 'Messages', icon: MessageCircle, href: '/parent/messages' },
      { label: 'Notices', icon: Bell, href: '/parent/notices' },
      { label: 'PTM', icon: Calendar, href: '/parent/ptm' },
    ],
  },
  {
    label: 'Services',
    icon: Settings,
    children: [
      { label: 'Leave', icon: ClipboardList, href: '/parent/leave' },
      { label: 'Complaints', icon: AlertTriangle, href: '/parent/complaints' },
      { label: 'Documents', icon: FileText, href: '/parent/documents' },
    ],
  },
  {
    label: 'Activity',
    icon: Clock,
    href: '/parent/activity',
  },
]

const ceoNavigation: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/ceo/dashboard' },
  { label: 'Plan & Subscription', icon: CreditCard, href: '/ceo/subscription' },
  { label: 'Charges & Payments', icon: DollarSign, href: '/ceo/charges' },
]

// Maps each role's href to its feature ID for feature gating
const HREF_TO_FEATURE: Record<string, Record<string, string>> = {
  CHIEF_HEAD: {
    '/dashboard': 'chief_head.dashboard',
    '/authority-management': 'chief_head.authority_management',
    '/fee-structure': 'chief_head.fee_structure',
    '/notifications': 'chief_head.send_notification',
    '/announcements': 'chief_head.announcements',
    '/analytics/examinations': 'chief_head.analytics_examinations',
    '/analytics/faculty': 'chief_head.analytics_faculty',
    '/analytics/hostel': 'chief_head.analytics_hostel',
    '/analytics/transport': 'chief_head.analytics_transport',
    '/analytics/library': 'chief_head.analytics_library',
    '/analytics/helpdesk': 'chief_head.analytics_helpdesk',
    '/analytics/workflow': 'chief_head.analytics_workflow',
    '/analytics/notifications': 'chief_head.analytics_notifications',
    '/analytics/calendar': 'chief_head.analytics_calendar',
    '/reports': 'chief_head.report_center',
    '/report-builder': 'chief_head.custom_report_builder',
    '/search': 'chief_head.global_search',
    '/analytics/students': 'chief_head.student_analytics',
    '/analytics/finance': 'chief_head.financial_dashboard',
    '/templates': 'chief_head.template_manager',
    '/realtime-notifications': 'chief_head.realtime_notifications',
    '/system-settings': 'chief_head.system_settings',
    '/permissions': 'chief_head.permission_manager',
    '/bulk-operations': 'chief_head.bulk_operations',
    '/data-backup': 'chief_head.data_backup_export',
    '/audit-log': 'chief_head.audit_log',
    '/appearance': 'chief_head.appearance',
  },
  DIRECTOR: {
    '/director/dashboard': 'director.dashboard',
    '/director/departments': 'director.department_performance',
    '/director/faculty': 'director.faculty_monitoring',
    '/director/students': 'director.student_analytics',
    '/director/examinations': 'director.examinations',
    '/director/admissions': 'director.admissions',
    '/director/finance': 'director.finance_view',
    '/director/hr': 'director.hr_overview',
    '/director/campus': 'director.campus_services',
    '/director/approvals': 'director.pending_approvals',
    '/director/notifications': 'director.notifications',
    '/director/calendar': 'director.calendar',
    '/director/reports': 'director.reports',
  },
  PRINCIPAL: {
    '/principal/dashboard': 'principal.dashboard',
    '/principal/departments': 'principal.departments',
    '/principal/timetable': 'principal.timetable',
    '/principal/attendance': 'principal.attendance',
    '/principal/lms': 'principal.lms',
    '/principal/faculty': 'principal.faculty_status',
    '/principal/class-coordinators': 'principal.class_coordinators',
    '/principal/subject-allocation': 'principal.subject_allocation',
    '/principal/leave': 'principal.leave_management',
    '/principal/performance': 'principal.performance',
    '/principal/students': 'principal.students',
    '/principal/admissions': 'principal.admissions',
    '/principal/examinations': 'principal.exam_dashboard',
    '/principal/finance': 'principal.finance_view',
    '/principal/discipline': 'principal.discipline',
    '/principal/hostel': 'principal.hostel',
    '/principal/library': 'principal.library',
    '/principal/transport': 'principal.transport',
    '/principal/approvals': 'principal.approvals',
    '/principal/notifications': 'principal.notifications',
    '/principal/calendar': 'principal.calendar',
    '/principal/helpdesk': 'principal.helpdesk',
    '/principal/reports': 'principal.reports',
  },
  MANAGER: {
    '/principal/dashboard': 'principal.dashboard',
    '/principal/departments': 'principal.departments',
    '/principal/timetable': 'principal.timetable',
    '/principal/attendance': 'principal.attendance',
    '/principal/lms': 'principal.lms',
    '/principal/faculty': 'principal.faculty_status',
    '/principal/leave': 'principal.leave_management',
    '/principal/students': 'principal.students',
    '/principal/performance': 'principal.performance',
    '/principal/examinations': 'principal.exam_dashboard',
    '/principal/notices': 'principal.notifications',
    '/principal/approvals': 'principal.approvals',
    '/principal/calendar': 'principal.calendar',
    '/principal/reports': 'principal.reports',
  },
  VICE_MANAGER: {
    '/principal/dashboard': 'principal.dashboard',
    '/principal/departments': 'principal.departments',
    '/principal/timetable': 'principal.timetable',
    '/principal/attendance': 'principal.attendance',
    '/principal/lms': 'principal.lms',
    '/principal/faculty': 'principal.faculty_status',
    '/principal/leave': 'principal.leave_management',
    '/principal/students': 'principal.students',
    '/principal/performance': 'principal.performance',
    '/principal/examinations': 'principal.exam_dashboard',
    '/principal/notices': 'principal.notifications',
    '/principal/approvals': 'principal.approvals',
    '/principal/calendar': 'principal.calendar',
    '/principal/reports': 'principal.reports',
  },
  VICE_PRINCIPAL: {
    '/principal/dashboard': 'principal.dashboard',
    '/principal/departments': 'principal.departments',
    '/principal/timetable': 'principal.timetable',
    '/principal/attendance': 'principal.attendance',
    '/principal/lms': 'principal.lms',
    '/principal/faculty': 'principal.faculty_status',
    '/principal/class-coordinators': 'principal.class_coordinators',
    '/principal/subject-allocation': 'principal.subject_allocation',
    '/principal/leave': 'principal.leave_management',
    '/principal/performance': 'principal.performance',
    '/principal/students': 'principal.students',
    '/principal/admissions': 'principal.admissions',
    '/principal/examinations': 'principal.exam_dashboard',
    '/principal/finance': 'principal.finance_view',
    '/principal/discipline': 'principal.discipline',
    '/principal/hostel': 'principal.hostel',
    '/principal/library': 'principal.library',
    '/principal/transport': 'principal.transport',
    '/principal/approvals': 'principal.approvals',
    '/principal/notifications': 'principal.notifications',
    '/principal/calendar': 'principal.calendar',
    '/principal/helpdesk': 'principal.helpdesk',
    '/principal/reports': 'principal.reports',
  },
  HOD: {
    '/hod/dashboard': 'hod.dashboard',
    '/hod/department': 'hod.department_overview',
    '/hod/timetable': 'hod.timetable',
    '/hod/faculty': 'hod.teachers',
    '/hod/faculty/workload': 'hod.workload',
    '/hod/faculty/attendance': 'hod.faculty_attendance',
    '/hod/faculty/performance': 'hod.faculty_performance',
    '/hod/students': 'hod.students',
    '/hod/students/performance': 'hod.student_performance',
    '/hod/students/attendance': 'hod.student_attendance',
    '/hod/courses': 'hod.courses',
    '/hod/subjects': 'hod.subjects',
    '/hod/lms': 'hod.lms',
    '/hod/assignments': 'hod.assignments',
    '/hod/examinations': 'hod.exams',
    '/hod/marks-entry': 'hod.marks_entry',
    '/hod/notices': 'hod.notices',
    '/hod/approvals': 'hod.approvals',
    '/hod/helpdesk': 'hod.helpdesk',
    '/hod/calendar': 'hod.calendar',
    '/hod/reports': 'hod.reports',
  },
  TEACHER: {
    '/teacher/dashboard': 'teacher.dashboard',
    '/teacher/schedule': 'teacher.todays_schedule',
    '/teacher/classes': 'teacher.my_classes',
    '/teacher/subjects': 'teacher.subjects',
    '/teacher/attendance': 'teacher.take_attendance',
    '/teacher/students': 'teacher.student_list',
    '/teacher/students/performance': 'teacher.student_performance',
    '/teacher/assignments': 'teacher.assignments',
    '/teacher/lms': 'teacher.lms_overview',
    '/teacher/examinations': 'teacher.exams',
    '/teacher/marks-entry': 'teacher.marks_entry',
    '/teacher/leave': 'teacher.leave',
    '/teacher/calendar': 'teacher.calendar',
    '/teacher/my-class': 'teacher.my_class',
    '/teacher/coordinator-attendance': 'teacher.my_class',
    '/teacher/subject-attendance': 'teacher.take_attendance',
    '/teacher/attendance-monitor': 'teacher.my_class',
    '/teacher/notifications': 'teacher.notifications',
    '/teacher/reports': 'teacher.reports',
    '/teacher/parent-messages': 'teacher.parent_messages',
  },
  STUDENT: {
    '/student/dashboard': 'student.dashboard',
    '/student/subjects': 'student.my_subjects',
    '/student/schedule': 'student.timetable',
    '/student/attendance': 'student.attendance',
    '/student/performance': 'student.performance',
    '/student/assignments': 'student.assignments',
    '/student/materials': 'student.study_materials',
    '/student/exams': 'student.exam_schedule',
    '/student/results': 'student.results',
    '/student/fees': 'student.fee_status',
    '/student/library': 'student.library',
    '/student/hostel': 'student.hostel',
    '/student/transport': 'student.transport',
    '/student/calendar': 'student.calendar',
    '/student/notices': 'student.notices',
    '/student/documents': 'student.documents',
    '/student/requests': 'student.requests',
    '/student/profile': 'student.profile',
  },
  PARENT: {
    '/parent/dashboard': 'parent.dashboard',
    '/parent/children': 'parent.children',
    '/parent/attendance': 'parent.attendance',
    '/parent/timetable': 'parent.timetable',
    '/parent/performance': 'parent.performance',
    '/parent/assignments': 'parent.assignments',
    '/parent/exams': 'parent.exams',
    '/parent/fees': 'parent.fees',
    '/parent/transport': 'parent.transport',
    '/parent/hostel': 'parent.hostel',
    '/parent/library': 'parent.library',
    '/parent/notices': 'parent.notices',
    '/parent/ptm': 'parent.ptm',
    '/parent/messages': 'parent.messages',
    '/parent/leave': 'parent.leave',
    '/parent/complaints': 'parent.complaints',
    '/parent/documents': 'parent.documents',
    '/parent/activity': 'parent.activity',
  },
  ACCOUNTANT: {
    '/accountant/dashboard': 'accountant.dashboard',
    '/accountant/collections': 'accountant.collect_fees',
    '/accountant/ledger': 'accountant.student_ledger',
    '/accountant/outstanding': 'accountant.outstanding_dues',
    '/accountant/payments': 'accountant.payment_verification',
    '/accountant/receipts': 'accountant.receipts',
    '/accountant/refunds': 'accountant.refunds',
    '/accountant/reports': 'accountant.daily_reports',
    '/accountant/analytics': 'accountant.analytics',
    '/accountant/profile': 'accountant.profile',
  },
  ADMISSION_COUNSELLOR: {
    '/admission/dashboard': 'admission.dashboard',
    '/admission/applications': 'admission.all_applications',
    '/admission/new': 'admission.new_application',
    '/admission/waiting-list': 'admission.waiting_list',
    '/admission/follow-ups': 'admission.follow_ups',
    '/admission/reports': 'admission.reports',
    '/admission/analytics': 'admission.analytics',
    '/admission/profile': 'admission.profile',
  },
  TRANSPORT_MANAGER: {
    '/transport/dashboard': 'transport.dashboard',
    '/transport/vehicles': 'transport.vehicles',
    '/transport/drivers': 'transport.drivers',
    '/transport/attendance': 'transport.driver_attendance',
    '/transport/routes': 'transport.routes',
    '/transport/allocation': 'transport.student_allocation',
    '/transport/schedule': 'transport.daily_schedule',
    '/transport/maintenance': 'transport.maintenance',
    '/transport/inspections': 'transport.inspections',
    '/transport/complaints': 'transport.complaints',
    '/transport/reports': 'transport.reports',
    '/transport/profile': 'transport.profile',
  },
  ADMINISTRATIVE_STAFF: {
    '/administrative/dashboard': 'administrative.dashboard',
    '/administrative/requests': 'administrative.student_requests',
    '/administrative/certificates': 'administrative.certificates',
    '/administrative/notices': 'administrative.notices',
    '/administrative/meetings': 'administrative.meetings',
    '/administrative/documents': 'administrative.documents',
    '/administrative/workflows': 'administrative.approval_tracking',
    '/administrative/complaints': 'administrative.complaints',
    '/administrative/reports': 'administrative.reports',
    '/administrative/profile': 'administrative.profile',
  },
  LIBRARIAN: {
    '/librarian/dashboard': 'librarian.dashboard',
    '/librarian/books': 'librarian.books',
    '/librarian/issue': 'librarian.issue_book',
    '/librarian/returns': 'librarian.returns_renewals',
    '/librarian/overdue': 'librarian.overdue_books',
    '/librarian/fines': 'librarian.fines',
    '/librarian/members': 'librarian.members',
    '/librarian/analytics': 'librarian.analytics',
  },
  HOSTEL_WARDEN: {
    '/hostel/dashboard': 'hostel.dashboard',
    '/hostel/buildings': 'hostel.buildings',
    '/hostel/rooms': 'hostel.rooms',
    '/hostel/students': 'hostel.students',
    '/hostel/complaints': 'hostel.complaints',
    '/hostel/analytics': 'hostel.analytics',
    '/hostel/activity': 'hostel.activity',
  },
}

const librarianNavigation: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/librarian/dashboard' },
  { label: 'Books', icon: BookOpen, href: '/librarian/books' },
  {
    label: 'Operations',
    icon: ClipboardList,
    children: [
      { label: 'Issue Book', icon: BookOpen, href: '/librarian/issue' },
      { label: 'Returns & Renewals', icon: RotateCcw, href: '/librarian/returns' },
      { label: 'Overdue Books', icon: AlertTriangle, href: '/librarian/overdue' },
    ],
  },
  { label: 'Fines', icon: DollarSign, href: '/librarian/fines' },
  { label: 'Members', icon: Users, href: '/librarian/members' },
  { label: 'Analytics', icon: BarChart3, href: '/librarian/analytics' },
]

const hostelWardenNavigation: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/hostel/dashboard' },
  { label: 'Buildings', icon: Building, href: '/hostel/buildings' },
  { label: 'Rooms', icon: Bed, href: '/hostel/rooms' },
  { label: 'Students', icon: GraduationCap, href: '/hostel/students' },
  { label: 'Complaints', icon: AlertTriangle, href: '/hostel/complaints' },
  { label: 'Analytics', icon: BarChart3, href: '/hostel/analytics' },
  { label: 'Activity', icon: Clock, href: '/hostel/activity' },
]

export function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation()
  const { user, enabledFeatures } = useAuthStore()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const { data: notifCount } = useApi('/notifications/unread-count')
  const unreadCount = notifCount?.count || 0

  const rawNavigation = user?.role === 'CEO' ? ceoNavigation
    : user?.role === 'MANAGER' ? managerNavigation
    : user?.role === 'VICE_MANAGER' ? viceManagerNavigation
    : user?.role === 'VICE_PRINCIPAL' ? vicePrincipalNavigation
    : user?.role === 'LIBRARIAN' ? librarianNavigation
    : user?.role === 'HOSTEL_WARDEN' ? hostelWardenNavigation
    : user?.role === 'DIRECTOR' ? directorNavigation
    : user?.role === 'PRINCIPAL' ? principalNavigation
    : user?.role === 'HOD' ? hodNavigation
    : user?.role === 'TEACHER' ? teacherNavigation
    : user?.role === 'STUDENT' ? studentNavigation
    : user?.role === 'ACCOUNTANT' ? accountantNavigation
    : user?.role === 'ADMISSION_COUNSELLOR' ? admissionNavigation
    : user?.role === 'TRANSPORT_MANAGER' ? transportNavigation
    : user?.role === 'ADMINISTRATIVE_STAFF' ? administrativeNavigation
    : user?.role === 'PARENT' ? parentNavigation
    : chiefHeadNavigation

  // Filter navigation based on enabled features (CEO sees everything)
  const navigation = useMemo(() => {
    if (user?.role === 'CEO' || !enabledFeatures || enabledFeatures.length === 0) {
      return rawNavigation
    }

    const hrefMap = HREF_TO_FEATURE[user.role] || {}

    const filterItems = (items: NavItem[]): NavItem[] => {
      return items
        .map((item) => {
          if (item.href) {
            const featureId = hrefMap[item.href]
            if (featureId && enabledFeatures.includes(featureId)) {
              return item
            }
            if (!featureId) {
              return item
            }
            return null
          }

          if (item.children) {
            const filteredChildren = filterItems(item.children)
            if (filteredChildren.length === 0) return null
            return { ...item, children: filteredChildren }
          }

          return item
        })
        .filter(Boolean) as NavItem[]
    }

    return filterItems(rawNavigation)
  }, [rawNavigation, enabledFeatures, user?.role])

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    )
  }

  const isActive = (href: string) => location.pathname === href
  const isExpanded = (label: string) => expandedItems.includes(label)

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={onClose} />}

      <aside className={cn(
        'fixed lg:static inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out overflow-hidden',
        open ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0 lg:w-0'
      )}>
        <div className={cn('flex flex-col h-full w-72', !open && 'lg:opacity-0 lg:pointer-events-none transition-opacity duration-200')}>
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-200">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 tracking-tight">DEV ERP</h1>
              <p className="text-[11px] text-gray-400 font-medium">Enterprise System</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5 scrollbar-thin">
            {navigation.map((item, idx) => (
              <div key={item.label} className="animate-slide-in-left" style={{ animationDelay: `${idx * 30}ms` }}>
                {item.href ? (
                  <Link
                    to={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 shadow-sm border border-indigo-100/50'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                    onClick={() => window.innerWidth < 1024 && onClose()}
                  >
                    {isActive(item.href) && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] bg-gradient-to-b from-indigo-500 to-purple-500 rounded-r-full" />
                    )}
                    <item.icon className={cn('w-5 h-5 transition-transform duration-200', isActive(item.href) ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600 group-hover:scale-110')} />
                    {item.label}
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={() => toggleExpanded(item.label)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group"
                    >
                      <item.icon className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:scale-110 transition-transform duration-200" />
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform duration-200', isExpanded(item.label) && 'rotate-180')} />
                    </button>
                    <div className={cn(
                      'overflow-hidden transition-all duration-300 ease-in-out',
                      isExpanded(item.label) ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    )}>
                      <div className="ml-4 mt-1 space-y-0.5 border-l border-gray-100 pl-3">
                        {item.children?.map((child) => (
                          <Link
                            key={child.label}
                            to={child.href || '#'}
                            className={cn(
                              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200',
                              isActive(child.href || '')
                                ? 'bg-indigo-50 text-indigo-700 font-medium border border-indigo-100/50'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                            )}
                            onClick={() => window.innerWidth < 1024 && onClose()}
                          >
                            <child.icon className={cn('w-4 h-4', isActive(child.href || '') ? 'text-indigo-500' : 'text-gray-400')} />
                            {child.label}
                            {child.label === 'Send Notification' && unreadCount > 0 && (
                              <span className="ml-auto min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
                                {unreadCount > 99 ? '99+' : unreadCount}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </nav>

          {/* User profile footer */}
          <div className="px-4 py-4 border-t border-gray-100 bg-gradient-to-b from-gray-50/50 to-white">
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all duration-200 cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md shadow-indigo-200/50 ring-2 ring-white">
                <span className="text-white font-medium text-sm">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.fullName}</p>
                <p className="text-[11px] text-gray-400 truncate font-medium">{user?.role?.replace(/_/g, ' ')}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
