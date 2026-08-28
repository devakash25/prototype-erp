import { prisma } from '../../config/database';
import { NotFoundError } from '../../utils/errors';

const TEMPLATES_KEY = 'notification_templates';

export class TemplatesService {
  async list(institutionId: string) {
    const setting = await prisma.institutionSetting.findUnique({
      where: { institutionId_key: { institutionId, key: TEMPLATES_KEY } },
    });
    const val = setting?.value;
    return (Array.isArray(val) ? val : []) as any[];
  }

  async create(institutionId: string, data: { name: string; subject: string; body: string; type: string; category?: string }) {
    const templates = await this.list(institutionId);
    const newTemplate = {
      id: `tpl_${Date.now()}`,
      ...data,
      category: data.category || 'general',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    templates.push(newTemplate);
    await this.save(institutionId, templates);
    return newTemplate;
  }

  async update(institutionId: string, id: string, data: any) {
    const templates = await this.list(institutionId);
    const idx = templates.findIndex((t: any) => t.id === id);
    if (idx === -1) throw new NotFoundError('Template not found');
    templates[idx] = { ...templates[idx], ...data, updatedAt: new Date().toISOString() };
    await this.save(institutionId, templates);
    return templates[idx];
  }

  async delete(institutionId: string, id: string) {
    const templates = await this.list(institutionId);
    const idx = templates.findIndex((t: any) => t.id === id);
    if (idx === -1) throw new NotFoundError('Template not found');
    templates.splice(idx, 1);
    await this.save(institutionId, templates);
    return { success: true };
  }

  async toggle(institutionId: string, id: string) {
    const templates = await this.list(institutionId);
    const tpl = templates.find((t: any) => t.id === id);
    if (!tpl) throw new NotFoundError('Template not found');
    tpl.isActive = !tpl.isActive;
    tpl.updatedAt = new Date().toISOString();
    await this.save(institutionId, templates);
    return tpl;
  }

  private async save(institutionId: string, templates: any[]) {
    await prisma.institutionSetting.upsert({
      where: { institutionId_key: { institutionId, key: TEMPLATES_KEY } },
      update: { value: templates },
      create: { institutionId, key: TEMPLATES_KEY, value: templates },
    });
  }
}

export const templatesService = new TemplatesService();
