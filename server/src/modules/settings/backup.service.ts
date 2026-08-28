import { prisma } from '../../config/database';
import { logger } from '../../utils/logger';
import { AppError } from '../../utils/errors';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

const BACKUP_DIR = path.join(process.cwd(), 'backups');

export class BackupService {
  constructor() {
    fs.mkdir(BACKUP_DIR, { recursive: true }).catch(() => {});
  }

  async listBackups() {
    try {
      const files = await fs.readdir(BACKUP_DIR);
      const backups = await Promise.all(
        files.filter(f => f.endsWith('.sql')).map(async (file) => {
          const stats = await fs.stat(path.join(BACKUP_DIR, file));
          const id = file.replace('.sql', '');
          return { id, filename: file, size: stats.size, createdAt: stats.birthtime, status: 'completed' };
        })
      );
      return backups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch {
      return [];
    }
  }

  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup_${timestamp}.sql`;
    const filepath = path.join(BACKUP_DIR, filename);
    const id = filename.replace('.sql', '');

    try {
      await execAsync(`pg_dump ${process.env.DATABASE_URL} > ${filepath}`);
      const stats = await fs.stat(filepath);
      logger.info({ id, size: stats.size }, 'Backup created');
      return { id, filename, size: stats.size, createdAt: new Date(), status: 'completed' };
    } catch (error: any) {
      logger.error({ error: error.message }, 'Backup failed');
      throw new AppError(500, 'Backup creation failed');
    }
  }

  async restoreBackup(id: string) {
    const filepath = path.join(BACKUP_DIR, `${id}.sql`);
    try {
      await fs.access(filepath);
    } catch {
      throw new AppError(404, 'Backup not found');
    }

    try {
      await execAsync(`psql ${process.env.DATABASE_URL} < ${filepath}`);
      logger.info({ id }, 'Backup restored');
      return { success: true, message: 'Backup restored successfully' };
    } catch (error: any) {
      logger.error({ error: error.message }, 'Restore failed');
      throw new AppError(500, 'Backup restore failed');
    }
  }

  async deleteBackup(id: string) {
    const filepath = path.join(BACKUP_DIR, `${id}.sql`);
    try {
      await fs.unlink(filepath);
      logger.info({ id }, 'Backup deleted');
      return { success: true };
    } catch {
      throw new AppError(404, 'Backup not found');
    }
  }

  async getBackupSettings(institutionId: string) {
    const setting = await prisma.institutionSetting.findUnique({
      where: { institutionId_key: { institutionId, key: 'backup_settings' } },
    });
    const val = setting?.value;
    return (typeof val === 'object' && val !== null ? val : { autoBackup: false, frequency: 'daily', retention: 30 }) as any;
  }

  async updateBackupSettings(institutionId: string, settings: any) {
    await prisma.institutionSetting.upsert({
      where: { institutionId_key: { institutionId, key: 'backup_settings' } },
      update: { value: settings },
      create: { institutionId, key: 'backup_settings', value: settings },
    });
    return settings;
  }

  async exportData(institutionId: string, key: string): Promise<string> {
    switch (key) {
      case 'students': return this.exportStudents(institutionId);
      case 'faculty': return this.exportFaculty(institutionId);
      case 'fees': return this.exportFees(institutionId);
      default: throw new AppError(400, 'Invalid export key');
    }
  }

  private async exportStudents(institutionId: string): Promise<string> {
    const students = await prisma.student.findMany({
      where: { institutionId },
      include: {
        user: { select: { fullName: true, email: true, phone: true } },
        department: { select: { name: true } },
        course: { select: { name: true } },
      },
    });
    const headers = ['fullName', 'email', 'phone', 'admissionNumber', 'department', 'course'];
    const rows = students.map(s => [
      s.user.fullName, s.user.email, s.user.phone || '', s.admissionNumber,
      s.department?.name || '', s.course?.name || '',
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  private async exportFaculty(institutionId: string): Promise<string> {
    const faculty = await prisma.user.findMany({
      where: { institutionId, role: { in: ['TEACHER', 'HOD', 'PRINCIPAL'] } },
      select: { fullName: true, email: true, phone: true, role: true },
    });
    const headers = ['fullName', 'email', 'phone', 'role'];
    const rows = faculty.map(f => [f.fullName, f.email, f.phone || '', f.role]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  private async exportFees(institutionId: string): Promise<string> {
    const structures = await prisma.feeStructure.findMany({
      where: { institutionId },
      include: { department: { select: { name: true } } },
    });
    const headers = ['name', 'totalAmount', 'department'];
    const rows = structures.map(s => [s.name, String(s.totalAmount), s.department?.name || '']);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}

export const backupService = new BackupService();
