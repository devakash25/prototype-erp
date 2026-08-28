import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

const featureCache = new Map<string, { features: string[]; expiresAt: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getEnabledFeatures(institutionId: string): Promise<string[]> {
  const cached = featureCache.get(institutionId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.features;
  }

  try {
    const plan = await prisma.subscriptionPlan.findFirst({
      where: { isActive: true },
    });
    const features = plan ? ((plan.modules as string[]) || []) : [];
    featureCache.set(institutionId, { features, expiresAt: Date.now() + CACHE_TTL });
    return features;
  } catch {
    return [];
  }
}

export function requireFeature(featureId: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const institutionId = req.user?.institutionId;
    if (!institutionId) {
      return next(new AppError(401, 'Authentication required'));
    }

    const features = await getEnabledFeatures(institutionId);

    if (features.length === 0) {
      // No plan configured — allow all (dev mode)
      return next();
    }

    if (!features.includes(featureId)) {
      logger.warn({ institutionId, featureId }, 'Feature access denied');
      return next(new AppError(403, `Feature '${featureId}' is not enabled for your institution`));
    }

    next();
  };
}

export function clearFeatureCache(institutionId?: string) {
  if (institutionId) {
    featureCache.delete(institutionId);
  } else {
    featureCache.clear();
  }
}
