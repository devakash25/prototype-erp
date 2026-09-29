import { AsyncLocalStorage } from 'node:async_hooks';

export interface TenantScope {
  institutionId: string | null;
}

/**
 * Request-scoped tenant context. Set by the `authenticate` middleware for
 * every authenticated request; read by the Prisma client extension to enforce
 * row-level isolation on models that carry a required `institutionId`.
 *
 * CEO/platform requests run with `institutionId: null` and are intentionally
 * unscoped (cross-institution console reads).
 */
export const tenantALS = new AsyncLocalStorage<TenantScope>();

export function currentTenantScope(): TenantScope | undefined {
  return tenantALS.getStore();
}

export function runWithTenant<T>(institutionId: string | null, fn: () => T): T {
  return tenantALS.run({ institutionId }, fn);
}

/**
 * Marks the current async context as executing inside an interactive
 * transaction where `app.current_tenant_id` is already set (see `tenantTx`
 * in config/database). The Prisma extension skips its per-statement
 * set_config batch while this flag is on.
 */
const txBoundALS = new AsyncLocalStorage<true>();

export function runWithTenantTxBound<T>(fn: () => T): T {
  return txBoundALS.run(true, fn);
}

export function isTenantTxBound(): boolean {
  return txBoundALS.getStore() === true;
}
