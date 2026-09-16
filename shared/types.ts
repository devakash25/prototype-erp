// Shared types between client and server

export type UserRole =
  | 'CEO'
  | 'CHIEF_HEAD'
  | 'PRINCIPAL'
  | 'VICE_PRINCIPAL'
  | 'TEACHER'
  | 'ACCOUNTANT'
  | 'ADMISSION_COUNSELLOR'
  | 'RECEPTIONIST'
  | 'EXAM_CONTROLLER'
  | 'LIBRARIAN'
  | 'HOSTEL_WARDEN'
  | 'TRANSPORT_MANAGER'
  | 'ADMINISTRATIVE_STAFF'
  | 'STUDENT'
  | 'PARENT'

// Subscription & Feature types
export type PlanType = 'basic' | 'pro' | 'custom'

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

export interface RolePricing {
  id: string
  planId: string
  role: string
  pricePerSeat: number
  isEnabled: boolean
}

export interface SubscriptionPlan {
  id: string
  name: string
  code: string
  description?: string
  planType: PlanType
  monthlyPrice: number
  annualPrice: number
  userLimit: number
  storageLimitGB: number
  modules: string[] // feature IDs
  features?: any
  isActive: boolean
  isDefault: boolean
  sortOrder: number
  rolePricing: RolePricing[]
}

export interface PlanSummary {
  plan: {
    id: string
    name: string
    planType: string
    description?: string
    isActive: boolean
  }
  features: {
    enabled: number
    total: number
    percentage: number
  }
  roleBreakdown: Array<{
    role: string
    pricePerSeat: number
    actualUsers: number
    monthlyCost: number
  }>
  pricing: {
    totalMonthly: number
    totalAnnual: number
    annualDiscount: number
    totalAnnualAfterDiscount: number
  }
}

export type Gender = 'MALE' | 'FEMALE' | 'OTHER'

export type AdmissionStatus = 'APPLIED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'ENROLLED' | 'CANCELLED'

export type PaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED'

export type PaymentMethod = 'CASH' | 'CARD' | 'UPI' | 'NET_BANKING' | 'CHEQUE' | 'DEMAND_DRAFT' | 'ONLINE'

export type ExamType = 'MIDTERM' | 'FINAL' | 'INTERNAL' | 'PRACTICAL' | 'ASSIGNMENT' | 'QUIZ' | 'VIVA'

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'HALF_DAY' | 'ON_LEAVE'

export type NotificationType = 'INFO' | 'WARNING' | 'URGENT' | 'SUCCESS' | 'ERROR'

export type NotificationTarget = 'ALL' | 'STUDENTS' | 'EMPLOYEES' | 'TEACHERS' | 'PARENTS' | 'DEPARTMENT' | 'SPECIFIC_USERS'

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'

export type AnnouncementType = 'GENERAL' | 'ACADEMIC' | 'EVENT' | 'HOLIDAY' | 'MEETING' | 'EMERGENCY' | 'POLICY'

export type WorkflowType = 'ADMISSION' | 'FEE_WAIVER' | 'REFUND' | 'LEAVE_REQUEST' | 'DOCUMENT_REQUEST' | 'CERTIFICATE_REQUEST' | 'PURCHASE' | 'CUSTOM'

export type WorkflowStatus = 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED'

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING' | 'RESOLVED' | 'CLOSED'

export type HostelType = 'BOYS' | 'GIRLS' | 'MIXED'

export type EmployeeDepartment = 'ACADEMIC' | 'ADMINISTRATION' | 'FINANCE' | 'LIBRARY' | 'HOSTEL' | 'TRANSPORT' | 'MAINTENANCE' | 'IT' | 'HR'

// Dashboard Types
export interface DashboardKPI {
  label: string
  value: number | string
  change?: number
  changeType?: 'increase' | 'decrease' | 'neutral'
  icon?: string
  color?: string
}

export interface RevenueData {
  admissionFees: number
  tuitionFees: number
  hostelFees: number
  transportFees: number
  examFees: number
  libraryFines: number
  certificateCharges: number
  miscellaneous: number
  total: number
}

export interface AttendanceData {
  date: string
  present: number
  absent: number
  late: number
  percentage: number
}

export interface AdmissionPipeline {
  applied: number
  underReview: number
  approved: number
  rejected: number
  enrolled: number
}

export interface DepartmentStats {
  id: string
  name: string
  students: number
  employees: number
  attendance: number
  revenue: number
}

export interface ActivityLogEntry {
  id: string
  time: string
  action: string
  entity: string
  entityId: string
  user: string
  details?: string
}

export interface Alert {
  id: string
  type: 'warning' | 'error' | 'info' | 'success'
  title: string
  message: string
  timestamp: string
  acknowledged: boolean
}
