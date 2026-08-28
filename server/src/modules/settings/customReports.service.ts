import { prisma } from '../../config/database';
import { NotFoundError } from '../../utils/errors';

const REPORTS_KEY = 'custom_reports';

export class CustomReportsService {
  async list(institutionId: string) {
    const setting = await prisma.institutionSetting.findUnique({
      where: { institutionId_key: { institutionId, key: REPORTS_KEY } },
    });
    const val = setting?.value;
    return (Array.isArray(val) ? val : []) as any[];
  }

  async create(institutionId: string, data: { name: string; description?: string; query?: any; columns?: any[] }) {
    const reports = await this.list(institutionId);
    const newReport = {
      id: `rpt_${Date.now()}`,
      ...data,
      createdBy: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    reports.push(newReport);
    await this.save(institutionId, reports);
    return newReport;
  }

  async update(institutionId: string, id: string, data: any) {
    const reports = await this.list(institutionId);
    const idx = reports.findIndex((r: any) => r.id === id);
    if (idx === -1) throw new NotFoundError('Report not found');
    reports[idx] = { ...reports[idx], ...data, updatedAt: new Date().toISOString() };
    await this.save(institutionId, reports);
    return reports[idx];
  }

  async delete(institutionId: string, id: string) {
    const reports = await this.list(institutionId);
    const idx = reports.findIndex((r: any) => r.id === id);
    if (idx === -1) throw new NotFoundError('Report not found');
    reports.splice(idx, 1);
    await this.save(institutionId, reports);
    return { success: true };
  }

  async run(institutionId: string, id: string) {
    const reports = await this.list(institutionId);
    const report = reports.find((r: any) => r.id === id);
    if (!report) throw new NotFoundError('Report not found');
    return { report, data: [], generatedAt: new Date().toISOString() };
  }

  async preview(institutionId: string, idOrData: string | any) {
    if (typeof idOrData === 'string') {
      return this.run(institutionId, idOrData);
    }
    return { report: idOrData, data: [], generatedAt: new Date().toISOString() };
  }

  private async save(institutionId: string, reports: any[]) {
    await prisma.institutionSetting.upsert({
      where: { institutionId_key: { institutionId, key: REPORTS_KEY } },
      update: { value: reports },
      create: { institutionId, key: REPORTS_KEY, value: reports },
    });
  }
}

export const customReportsService = new CustomReportsService();
