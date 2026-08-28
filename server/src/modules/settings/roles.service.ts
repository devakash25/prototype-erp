import { prisma } from '../../config/database';
import { logger } from '../../utils/logger';

const ROLE_DEFINITIONS = [
  { id: 'CHIEF_HEAD', name: 'Chief Head', description: 'Institution super administrator' },
  { id: 'DIRECTOR', name: 'Director', description: 'Director of the institution' },
  { id: 'PRINCIPAL', name: 'Principal', description: 'Principal of the institution' },
  { id: 'HOD', name: 'Head of Department', description: 'Department head' },
  { id: 'TEACHER', name: 'Teacher', description: 'Teaching faculty' },
  { id: 'ACCOUNTANT', name: 'Accountant', description: 'Finance management' },
  { id: 'ADMISSION_COUNSELLOR', name: 'Admission Counsellor', description: 'Admissions handling' },
  { id: 'LIBRARIAN', name: 'Librarian', description: 'Library management' },
  { id: 'HOSTEL_WARDEN', name: 'Hostel Warden', description: 'Hostel management' },
  { id: 'TRANSPORT_MANAGER', name: 'Transport Manager', description: 'Transport management' },
  { id: 'ADMINISTRATIVE_STAFF', name: 'Administrative Staff', description: 'Administrative tasks' },
  { id: 'STUDENT', name: 'Student', description: 'Student' },
  { id: 'PARENT', name: 'Parent', description: 'Parent/Guardian' },
];

export class RolesService {
  async getRoles(institutionId: string) {
    const roleCounts = await prisma.user.groupBy({
      by: ['role'],
      where: { institutionId },
      _count: { role: true },
    });

    const countMap: Record<string, number> = {};
    roleCounts.forEach(r => { countMap[r.role] = r._count.role; });

    return ROLE_DEFINITIONS.map(role => ({
      ...role,
      userCount: countMap[role.id] || 0,
    }));
  }

  async getPermissions(institutionId: string, roleId: string) {
    const setting = await prisma.institutionSetting.findUnique({
      where: {
        institutionId_key: { institutionId, key: `permissions_${roleId}` },
      },
    });

    return setting?.value || {};
  }

  async updatePermissions(institutionId: string, roleId: string, permissions: any) {
    const result = await prisma.institutionSetting.upsert({
      where: {
        institutionId_key: { institutionId, key: `permissions_${roleId}` },
      },
      update: { value: permissions },
      create: {
        institutionId,
        key: `permissions_${roleId}`,
        value: permissions,
      },
    });

    logger.info({ institutionId, roleId }, 'Role permissions updated');
    return result.value;
  }

  async getAllPermissions(institutionId: string) {
    const settings = await prisma.institutionSetting.findMany({
      where: {
        institutionId,
        key: { startsWith: 'permissions_' },
      },
    });

    const result: Record<string, any> = {};
    settings.forEach(s => {
      const roleId = s.key.replace('permissions_', '');
      result[roleId] = s.value;
    });

    return result;
  }
}

export const rolesService = new RolesService();
