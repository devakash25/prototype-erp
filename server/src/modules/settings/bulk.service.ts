import { prisma } from '../../config/database';
import { logger } from '../../utils/logger';
import { AppError } from '../../utils/errors';

interface ImportResult {
  totalRows: number;
  successful: number;
  failed: number;
  errors: { row: number; message: string }[];
}

export class BulkService {
  async importStudents(institutionId: string, file: Express.Multer.File): Promise<ImportResult> {
    const csvContent = file.buffer.toString('utf-8');
    const lines = csvContent.split('\n').filter(l => l.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

    const required = ['firstname', 'email', 'admissionnumber'];
    const missing = required.filter(h => !headers.includes(h));
    if (missing.length) {
      throw new Error(`Missing required columns: ${missing.join(', ')}`);
    }

    const result: ImportResult = { totalRows: lines.length - 1, successful: 0, failed: 0, errors: [] };

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim());
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => { row[h] = values[idx] || ''; });

        const parsedDepartment = row.department ? await prisma.department.findFirst({
          where: { institutionId, name: { contains: row.department, mode: 'insensitive' } },
        }) : null;

        const parsedCourse = row.course ? await prisma.course.findFirst({
          where: { institutionId, name: { contains: row.course, mode: 'insensitive' } },
        }) : null;

        const session = await prisma.academicSession.findFirst({
          where: { institutionId, isActive: true },
        });

        if (!session) throw new Error('No active academic session');

        const user = await prisma.user.create({
          data: {
            institutionId,
            email: row.email,
            firstName: row.firstname || row.name?.split(' ')[0] || '',
            lastName: row.lastname || row.name?.split(' ').slice(1).join(' ') || '',
            fullName: row.name || `${row.firstname || ''} ${row.lastname || ''}`.trim(),
            password: '$2b$10$default',
            role: 'STUDENT',
            isActive: true,
            phone: row.phone || null,
          },
        });

        await prisma.student.create({
          data: {
            institutionId,
            userId: user.id,
            admissionNumber: row.admissionnumber,
            rollNumber: row.rollnumber || null,
            departmentId: parsedDepartment?.id || (await this.getDefaultDepartment(institutionId)),
            courseId: parsedCourse?.id || (await this.getDefaultCourse(institutionId)),
            academicSessionId: session.id,
            admissionType: row.admissiontype || 'regular',
          },
        });
        result.successful++;
      } catch (err: any) {
        result.failed++;
        result.errors.push({ row: i + 1, message: err.message });
      }
    }

    logger.info({ institutionId, result }, 'Student import completed');
    return result;
  }

  async importFaculty(institutionId: string, file: Express.Multer.File): Promise<ImportResult> {
    const csvContent = file.buffer.toString('utf-8');
    const lines = csvContent.split('\n').filter(l => l.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

    const result: ImportResult = { totalRows: lines.length - 1, successful: 0, failed: 0, errors: [] };

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim());
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => { row[h] = values[idx] || ''; });

        await prisma.user.create({
          data: {
            institutionId,
            email: row.email,
            firstName: row.firstname || row.name?.split(' ')[0] || '',
            lastName: row.lastname || row.name?.split(' ').slice(1).join(' ') || '',
            fullName: row.name || `${row.firstname || ''} ${row.lastname || ''}`.trim(),
            password: '$2b$10$default',
            role: 'TEACHER',
            isActive: true,
            phone: row.phone || null,
          },
        });
        result.successful++;
      } catch (err: any) {
        result.failed++;
        result.errors.push({ row: i + 1, message: err.message });
      }
    }

    logger.info({ institutionId, result }, 'Faculty import completed');
    return result;
  }

  async exportStudents(institutionId: string): Promise<string> {
    const students = await prisma.student.findMany({
      where: { institutionId },
      include: {
        user: { select: { fullName: true, email: true, phone: true } },
        department: { select: { name: true } },
        course: { select: { name: true } },
      },
    });

    const headers = ['fullName', 'email', 'phone', 'admissionNumber', 'rollNumber', 'department', 'course'];
    const rows = students.map(s => [
      s.user.fullName, s.user.email, s.user.phone || '', s.admissionNumber,
      s.rollNumber || '', s.department?.name || '', s.course?.name || '',
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  async exportFaculty(institutionId: string): Promise<string> {
    const faculty = await prisma.user.findMany({
      where: { institutionId, role: { in: ['TEACHER', 'PRINCIPAL'] } },
      select: { fullName: true, email: true, phone: true, role: true },
    });

    const headers = ['fullName', 'email', 'phone', 'role'];
    const rows = faculty.map(f => [f.fullName, f.email, f.phone || '', f.role]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  async exportFees(institutionId: string): Promise<string> {
    const structures = await prisma.feeStructure.findMany({
      where: { institutionId },
      include: { department: { select: { name: true } } },
    });

    const headers = ['name', 'totalAmount', 'department'];
    const rows = structures.map(s => [s.name, String(s.totalAmount), s.department?.name || '']);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  getTemplate(type: string): string {
    switch (type) {
      case 'students':
        return 'firstName,lastName,email,phone,admissionNumber,department,course\nJohn,Doe,john@example.com,1234567890,ADM001,Computer Science,B.Tech CSE';
      case 'faculty':
        return 'firstName,lastName,email,phone,role\nJane,Smith,jane@example.com,0987654321,TEACHER';
      case 'fees':
        return 'name,totalAmount,department\nTuition Fee,50000,Computer Science';
      default:
        throw new Error(`Unknown template type: ${type}`);
    }
  }

  private async getDefaultDepartment(institutionId: string): Promise<string> {
    const dept = await prisma.department.findFirst({ where: { institutionId } });
    if (!dept) throw new Error('No department found');
    return dept.id;
  }

  private async getDefaultCourse(institutionId: string): Promise<string> {
    const course = await prisma.course.findFirst({ where: { institutionId } });
    if (!course) throw new Error('No course found');
    return course.id;
  }
}

export const bulkService = new BulkService();
