import { Request } from 'express';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

export interface TenantInfo {
  id: string;
  name: string;
  type: string;
  emailDomain: string | null;
  subdomain: string | null;
  isActive: boolean;
}

declare global {
  namespace Express {
    interface Request {
      tenant?: TenantInfo;
    }
  }
}

const CACHE_TTL_MS = 30_000;
const cache = new Map<string, { value: TenantInfo; expiresAt: number }>();

export async function getTenant(institutionId: string): Promise<TenantInfo | null> {
  const hit = cache.get(institutionId);
  if (hit && hit.expiresAt > Date.now()) return hit.value;

  try {
    const inst = await prisma.institution.findUnique({
      where: { id: institutionId },
      select: { id: true, name: true, type: true, emailDomain: true, subdomain: true, isActive: true },
    });
    if (inst) {
      cache.set(institutionId, { value: inst, expiresAt: Date.now() + CACHE_TTL_MS });
    } else {
      cache.delete(institutionId);
    }
    return inst;
  } catch (error) {
    // Transient DB blip: serve stale entry if we have one rather than
    // failing every authenticated request (fail-open on lookup errors,
    // fail-closed on definitive missing/inactive institutions).
    const stale = cache.get(institutionId);
    if (stale) {
      logger.warn({ institutionId }, 'Tenant lookup failed — using stale cached tenant');
      return stale.value;
    }
    throw error;
  }
}

export function invalidateTenantCache(institutionId?: string): void {
  if (institutionId) cache.delete(institutionId);
  else cache.clear();
}
