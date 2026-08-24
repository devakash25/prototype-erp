import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

interface AuditLogData {
  userId: string;
  action: string;
  entity: string;
  entityId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ip?: string;
  userAgent?: string;
}

// Audit log middleware - automatically logs all write operations
export function auditLog() {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    // Capture original json method
    const originalJson = res.json.bind(res);

    res.json = function (body: any) {
      const duration = Date.now() - startTime;

      // Only log for write operations
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        const userId = req.user?.userId;
        const institutionId = req.user?.institutionId;

        if (userId && institutionId) {
          const entity = extractEntity(req.path);
          const entityId = typeof req.params.id === 'string' ? req.params.id : undefined;

          // Log async to not block response
          logAuditEvent({
            userId,
            action: getAction(req.method),
            entity,
            entityId,
            newValues: req.method !== 'DELETE' ? body?.data : undefined,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined,
            institutionId,
            duration,
            statusCode: res.statusCode,
          }).catch((err) => logger.error({ err }, 'Audit log failed'));
        }
      }

      return originalJson(body);
    };

    next();
  };
}

// Manual audit log function
export async function logAuditEvent(data: AuditLogData & {
  institutionId: string;
  duration?: number;
  statusCode?: number;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        institutionId: data.institutionId,
        userId: data.userId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        oldValues: data.oldValues || undefined,
        newValues: data.newValues || undefined,
        ip: data.ip,
        userAgent: data.userAgent,
      },
    });

    logger.debug({
      action: data.action,
      entity: data.entity,
      entityId: data.entityId,
      duration: data.duration,
      statusCode: data.statusCode,
    }, 'Audit log created');
  } catch (error) {
    logger.error({ error }, 'Failed to create audit log');
  }
}

// Helper functions
function extractEntity(path: string): string {
  const segments = path.split('/').filter(Boolean);
  // Remove 'api/v1' prefix if present
  const entitySegments = segments.filter((s) => s !== 'api' && s !== 'v1');
  return entitySegments[0] || 'unknown';
}

function getAction(method: string): string {
  const actions: Record<string, string> = {
    POST: 'CREATE',
    PUT: 'UPDATE',
    PATCH: 'UPDATE',
    DELETE: 'DELETE',
  };
  return actions[method] || 'READ';
}

// Get audit logs with filters
export async function getAuditLogs(filters: {
  institutionId: string;
  userId?: string;
  entity?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}) {
  const { institutionId, userId, entity, action, startDate, endDate, page = 1, limit = 50 } = filters;

  const where: any = { institutionId };
  if (userId) where.userId = userId;
  if (entity) where.entity = entity;
  if (action) where.action = action;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: { id: true, fullName: true, email: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
