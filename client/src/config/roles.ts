// Maps which roles are allowed for each institution type

export const ROLES_BY_INSTITUTION_TYPE = {
  SCHOOL: [
    'CEO',
    'CHIEF_HEAD',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'TEACHER',
    'STUDENT',
    'PARENT',
    'ACCOUNTANT',
    'ADMISSION_COUNSELLOR',
    'RECEPTIONIST',
    'EXAM_CONTROLLER',
    'LIBRARIAN',
    'HOSTEL_WARDEN',
    'TRANSPORT_MANAGER',
    'ADMINISTRATIVE_STAFF',
  ] as const,
  COLLEGE: [
    'CEO',
    'CHIEF_HEAD',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'TEACHER',
    'STUDENT',
    'PARENT',
    'ACCOUNTANT',
    'ADMISSION_COUNSELLOR',
    'RECEPTIONIST',
    'EXAM_CONTROLLER',
    'LIBRARIAN',
    'HOSTEL_WARDEN',
    'TRANSPORT_MANAGER',
    'ADMINISTRATIVE_STAFF',
  ] as const,
} as const

export type InstitutionType = 'SCHOOL' | 'COLLEGE'

export function getAllowedRoles(institutionType: InstitutionType): readonly string[] {
  return ROLES_BY_INSTITUTION_TYPE[institutionType] || ROLES_BY_INSTITUTION_TYPE.COLLEGE
}

export function isRoleAllowed(role: string, institutionType?: InstitutionType | null): boolean {
  if (!institutionType) return true
  return (ROLES_BY_INSTITUTION_TYPE[institutionType] as readonly string[])?.includes(role) ?? true
}

export const ROLE_LABELS: Record<string, string> = {
  CEO: 'CEO',
  CHIEF_HEAD: 'Chief Head',
  PRINCIPAL: 'Principal',
  VICE_PRINCIPAL: 'Vice Principal',
  TEACHER: 'Teacher',
  STUDENT: 'Student',
  PARENT: 'Parent',
  ACCOUNTANT: 'Accountant',
  ADMISSION_COUNSELLOR: 'Admission Counsellor',
  RECEPTIONIST: 'Receptionist',
  EXAM_CONTROLLER: 'Exam Controller',
  LIBRARIAN: 'Librarian',
  HOSTEL_WARDEN: 'Hostel Warden',
  TRANSPORT_MANAGER: 'Transport Manager',
  ADMINISTRATIVE_STAFF: 'Administrative Staff',
}
