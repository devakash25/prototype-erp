import { prisma } from '../../config/database';
import { logger } from '../../utils/logger';

export class AuditLogService {
  async getLogs(institutionId: string, filters: {
    from?: string; to?: string; action?: string; module?: string;
    limit?: number; offset?: number;
  }) {
    const where: any = { institutionId };
    if (filters.from || filters.to) {
      where.createdAt = {};
      if (filters.from) where.createdAt.gte = new Date(filters.from);
      if (filters.to) where.createdAt.lte = new Date(filters.to);
    }
    if (filters.action) where.action = filters.action;
    if (filters.module) where.entity = filters.module;

    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: { user: { select: { id: true, fullName: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { logs, total, limit, offset };
  }

  async log(params: {
    institutionId: string;
    userId: string;
    action: string;
    module: string;
    recordId?: string;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const log = await prisma.auditLog.create({
      data: {
        institutionId: params.institutionId,
        userId: params.userId,
        action: params.action,
        entity: params.module,
        entityId: params.recordId || null,
        oldValues: params.oldValues || undefined,
        newValues: params.newValues || undefined,
        ip: params.ipAddress || null,
        userAgent: params.userAgent || null,
      },
    });

    logger.debug({ auditLogId: log.id, action: params.action, entity: params.module }, 'Audit log created');
    return log;
  }

  async getModules(institutionId: string) {
    const modules = await prisma.auditLog.findMany({
      where: { institutionId },
      distinct: ['entity'],
      select: { entity: true },
    });
    return modules.map(m => m.entity);
  }

  async getActions(institutionId: string) {
    const actions = await prisma.auditLog.findMany({
      where: { institutionId },
      distinct: ['action'],
      select: { action: true },
    });
    return actions.map(a => a.action);
  }
}

export const auditLogService = new AuditLogService();
