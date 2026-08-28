import { prisma } from '../../config/database';
import { NotFoundError } from '../../utils/errors';
import { logger } from '../../utils/logger';

interface SettingsGroup {
  [key: string]: any;
}

export class SettingsService {
  private defaultSettings: Record<string, any> = {
    general: {
      institutionName: '',
      logo: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      timezone: 'UTC',
    },
    academic: {
      currentYear: '',
      currentSemester: '',
      gradingScale: 'POINT_10',
      passPercentage: '40',
      attendanceThreshold: '75',
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true,
      frequency: 'REAL_TIME',
    },
    security: {
      passwordMinLength: '8',
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      sessionTimeout: '30',
      twoFactorEnabled: false,
    },
    appearance: {
      logo: '',
      primaryColor: '#6366f1',
      sidebarStyle: 'LIGHT',
    },
  };

  async getSettings(institutionId: string) {
    const settings = await prisma.institutionSetting.findMany({
      where: { institutionId },
    });

    const result: Record<string, any> = { ...this.defaultSettings };

    settings.forEach((s) => {
      if (s.key in result) {
        result[s.key] = s.value;
      }
    });

    return result;
  }

  async updateSettings(institutionId: string, data: Record<string, any>) {
    const updates = Object.entries(data).map(([key, value]) =>
      prisma.institutionSetting.upsert({
        where: {
          institutionId_key: { institutionId, key },
        },
        update: { value },
        create: {
          institutionId,
          key,
          value,
        },
      })
    );

    await Promise.all(updates);
    logger.info({ institutionId, keys: Object.keys(data) }, 'Settings updated');

    return this.getSettings(institutionId);
  }

  async getSettingByKey(institutionId: string, key: string) {
    const setting = await prisma.institutionSetting.findUnique({
      where: {
        institutionId_key: { institutionId, key },
      },
    });

    return setting?.value || this.defaultSettings[key] || null;
  }

  async updateSettingByKey(institutionId: string, key: string, value: any) {
    const result = await prisma.institutionSetting.upsert({
      where: {
        institutionId_key: { institutionId, key },
      },
      update: { value },
      create: {
        institutionId,
        key,
        value,
      },
    });

    return result;
  }

  async resetToDefaults(institutionId: string) {
    await prisma.institutionSetting.deleteMany({
      where: { institutionId },
    });

    return this.getSettings(institutionId);
  }
}

export const settingsService = new SettingsService();
