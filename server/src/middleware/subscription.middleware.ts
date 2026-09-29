import { Request } from 'express';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

export type SubscriptionState = 'none' | 'active' | 'grace' | 'readonly';

export interface SubscriptionInfo {
  state: SubscriptionState;
  planName: string | null;
  endDate: string | null;
  /** Until when writes are still allowed (endDate, or an explicit early cutoff). */
  effectiveEndDate: string | null;
  /** effectiveEndDate + GRACE_DAYS — after this, read-only. */
  graceEndsAt: string | null;
  daysLeft: number | null;
}

declare global {
  namespace Express {
    interface Request {
      subscription?: SubscriptionInfo;
    }
  }
}

export const GRACE_DAYS = 7;
const GRACE_MS = GRACE_DAYS * 24 * 60 * 60 * 1000;
const CACHE_TTL_MS = 30_000;
const cache = new Map<string, { value: SubscriptionInfo; expiresAt: number }>();

export function clearSubscriptionCache(institutionId?: string): void {
  if (institutionId) cache.delete(institutionId);
  else cache.clear();
}

/**
 * Lifecycle rules (governing row = most recent subscription by createdAt):
 * - active/trial: valid until endDate → then GRACE_DAYS of grace → read-only.
 * - cancelled/expired: cutoff = min(endDate, updatedAt) (explicit early stop
 *   starts grace immediately) → GRACE_DAYS → read-only.
 * - suspended: read-only immediately (admin lock, no grace).
 * - no subscription rows: 'none' → unrestricted (dev/no-plan fallback).
 */
export async function getSubscriptionInfo(institutionId: string): Promise<SubscriptionInfo> {
  const cached = cache.get(institutionId);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  try {
    const sub = await prisma.institutionSubscription.findFirst({
      where: { institutionId },
      orderBy: { createdAt: 'desc' },
      include: { plan: { select: { name: true } } },
    });

    let info: SubscriptionInfo;
    if (!sub) {
      info = {
        state: 'none',
        planName: null,
        endDate: null,
        effectiveEndDate: null,
        graceEndsAt: null,
        daysLeft: null,
      };
    } else {
      const now = Date.now();
      const endMs = sub.endDate.getTime();
      const updatedMs = sub.updatedAt.getTime();
      const isActiveStatus = sub.status === 'active' || sub.status === 'trial';

      if (sub.status === 'suspended') {
        info = {
          state: 'readonly',
          planName: sub.plan?.name ?? null,
          endDate: sub.endDate.toISOString(),
          effectiveEndDate: new Date(Math.min(endMs, updatedMs)).toISOString(),
          graceEndsAt: new Date(Math.min(endMs, updatedMs)).toISOString(),
          daysLeft: 0,
        };
      } else {
        const effectiveEndMs = isActiveStatus ? endMs : Math.min(endMs, updatedMs);
        const graceEndsMs = effectiveEndMs + GRACE_MS;
        let state: SubscriptionState;
        if (now <= effectiveEndMs) state = 'active';
        else if (now <= graceEndsMs) state = 'grace';
        else state = 'readonly';

        info = {
          state,
          planName: sub.plan?.name ?? null,
          endDate: sub.endDate.toISOString(),
          effectiveEndDate: new Date(effectiveEndMs).toISOString(),
          graceEndsAt: new Date(graceEndsMs).toISOString(),
          daysLeft:
            state === 'active'
              ? Math.ceil((effectiveEndMs - now) / (24 * 60 * 60 * 1000))
              : state === 'grace'
                ? Math.ceil((graceEndsMs - now) / (24 * 60 * 60 * 1000))
                : 0,
        };
      }
    }

    cache.set(institutionId, { value: info, expiresAt: Date.now() + CACHE_TTL_MS });
    return info;
  } catch (error) {
    logger.error({ err: error, institutionId }, 'Subscription state lookup failed');
    // Fail-open on transient DB errors (mirrors tenant lookup behaviour);
    // enforcement resumes once the lookup succeeds again.
    const stale = cache.get(institutionId);
    if (stale) return stale.value;
    return {
      state: 'none',
      planName: null,
      endDate: null,
      effectiveEndDate: null,
      graceEndsAt: null,
      daysLeft: null,
    };
  }
}

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const WRITE_ALLOW_PREFIXES = ['/api/v1/auth/'];

export function isReadOnlyBlocked(req: Request): boolean {
  if (SAFE_METHODS.has(req.method)) return false;
  const path = (req.originalUrl || req.url).split('?')[0];
  return !WRITE_ALLOW_PREFIXES.some((prefix) => path.startsWith(prefix));
}
