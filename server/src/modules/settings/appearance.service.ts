import { prisma } from '../../config/database';
import { logger } from '../../utils/logger';

const APPEARANCE_KEY = 'appearance_settings';

const DEFAULT_APPEARANCE = {
  logo: '',
  favicon: '',
  primaryColor: '#6366f1',
  secondaryColor: '#8b5cf6',
  accentColor: '#06b6d4',
  backgroundColor: '#ffffff',
  sidebarStyle: 'LIGHT',
  sidebarColor: '#1e293b',
  font: 'Inter',
  borderRadius: '8px',
  darkMode: false,
  compactMode: false,
  customCss: '',
};

export class AppearanceService {
  async getSettings(institutionId: string) {
    const setting = await prisma.institutionSetting.findUnique({
      where: { institutionId_key: { institutionId, key: APPEARANCE_KEY } },
    });
    const val = setting?.value;
    return { ...DEFAULT_APPEARANCE, ...(typeof val === 'object' && val !== null ? val : {}) };
  }

  async updateSettings(institutionId: string, data: any) {
    const current = await this.getSettings(institutionId);
    const updated = { ...current, ...data };
    await prisma.institutionSetting.upsert({
      where: { institutionId_key: { institutionId, key: APPEARANCE_KEY } },
      update: { value: updated },
      create: { institutionId, key: APPEARANCE_KEY, value: updated },
    });
    logger.info({ institutionId }, 'Appearance settings updated');
    return updated;
  }

  async resetSettings(institutionId: string) {
    await prisma.institutionSetting.deleteMany({
      where: { institutionId, key: APPEARANCE_KEY },
    });
    return DEFAULT_APPEARANCE;
  }
}

export const appearanceService = new AppearanceService();
