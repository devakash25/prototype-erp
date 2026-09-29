import { PrismaClient, Prisma } from '@prisma/client';
import { env } from './env';
import { logger } from '../utils/logger';
import {
  currentTenantScope,
  runWithTenantTxBound,
  isTenantTxBound,
} from './tenant-context';
import { CHILD_SCOPED_MODELS } from './tenant-chain';

// Models with an institutionId column (required OR nullable) are automatically
// row-scoped to the authenticated tenant. Nullable-column models (User,
// PlatformAuditLog, PlatformNotification) are scoped too — CEO/platform
// requests run unscoped (institutionId: null in the ALS context).
const SCOPED_MODELS: Set<string> = (() => {
  const set = new Set<string>();
  for (const m of Prisma.dmmf.datamodel.models) {
    const field = m.fields.find((f) => f.name === 'institutionId');
    if (field && field.kind === 'scalar') set.add(m.name);
  }
  return set;
})();

type OpArgs = Record<string, any>;

// Phase 5 (RLS): mutations additionally set the `app.current_tenant_id`
// transaction-local GUC so the database policies (see migration
// 20260928000000_rls_tenant_isolation) enforce WITH CHECK / USING on writes.
// Reads keep the Phase 2 app-layer filter only by default — batching every
// read would add a full round trip (~160ms) to each one. Set
// RLS_ENFORCE_READS=1 to also batch reads through the GUC.
const MUTATING_OPS: Set<string> = new Set([
  'create', 'createMany', 'createManyAndReturn',
  'update', 'updateMany', 'updateManyAndReturn',
  'delete', 'deleteMany', 'upsert',
]);
const RLS_READS = process.env.RLS_ENFORCE_READS === '1' || process.env.RLS_ENFORCE_READS === 'true';

function applyTenantScope(model: string, operation: string, args: OpArgs): OpArgs {
  const scope = currentTenantScope();
  if (!scope?.institutionId) return args;
  if (!SCOPED_MODELS.has(model)) return args;
  const instId = scope.institutionId;
  const whereHasScope = args.where && typeof args.where === 'object' && args.where.institutionId !== undefined;

  switch (operation) {
    case 'findMany':
    case 'findFirst':
    case 'findFirstOrThrow':
    case 'findUnique':
    case 'findUniqueOrThrow':
    case 'count':
    case 'aggregate':
    case 'groupBy':
    case 'update':
    case 'delete':
    case 'updateMany':
    case 'deleteMany':
      if (!whereHasScope) args.where = { ...(args.where ?? {}), institutionId: instId };
      break;
    case 'upsert':
      if (!whereHasScope) args.where = { ...(args.where ?? {}), institutionId: instId };
      if (args.create && typeof args.create === 'object' && args.create.institutionId === undefined) {
        args.create = { ...args.create, institutionId: instId };
      }
      break;
    case 'create':
      if (args.data && !Array.isArray(args.data) && typeof args.data === 'object' && args.data.institutionId === undefined) {
        args.data = { ...args.data, institutionId: instId };
      }
      break;
    case 'createMany':
    case 'createManyAndReturn':
      if (Array.isArray(args.data)) {
        args.data = args.data.map((d: OpArgs) =>
          d && d.institutionId === undefined ? { ...d, institutionId: instId } : d
        );
      }
      break;
    default:
      break;
  }
  return args;
}

// In serverless (Vercel), cache PrismaClient globally to avoid connection exhaustion
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

const baseClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasourceUrl: env.APP_DATABASE_URL ?? env.DATABASE_URL,
  });

export const prisma = baseClient.$extends({
  query: {
    $allModels: {
      // Explicit Promise<any>: the handler closes over `prisma`, whose type
      // depends on this extension — annotate to break the circular inference.
      async $allOperations({ model, operation, args, query }): Promise<any> {
        const scopedArgs = applyTenantScope(model, operation, (args ?? {}) as OpArgs) as typeof args;
        const scope = currentTenantScope();
        // Child models (no institutionId column) batch the GUC too — their
        // Phase 6b policies walk the FK chain to the tenant anchor (see
        // config/tenant-chain.ts).
        const needsGuc =
          !!scope?.institutionId &&
          (SCOPED_MODELS.has(model) || CHILD_SCOPED_MODELS.has(model)) &&
          !isTenantTxBound() &&
          (MUTATING_OPS.has(operation) || RLS_READS);
        if (!needsGuc) return query(scopedArgs);

        try {
          const results = (await prisma.$transaction([
            prisma.$queryRaw`SELECT set_config('app.current_tenant_id', CAST(${scope!.institutionId} AS text), true)`,
            query(scopedArgs),
          ])) as unknown[];
          return results[1];
        } catch (err: any) {
          // Operation outcome errors (P2025 from RLS blocking the row,
          // constraint violations, validation errors) must surface — never
          // retry them without the GUC. A "Error in batch request" marker
          // means the model query itself executed and failed (e.g. Postgres
          // 42501 row-level security on a child-table WITH CHECK) — that is
          // an outcome too. Only mechanism failures (e.g. a nested-$transaction
          // misuse where the batch never starts) fall back to app scoping.
          if (
            err?.name === 'PrismaClientKnownRequestError' ||
            err?.name === 'PrismaClientValidationError' ||
            typeof err?.code === 'string' ||
            (typeof err?.message === 'string' && err.message.includes('Error in batch request'))
          ) {
            throw err;
          }
          logger.warn({ err, model, operation }, 'RLS set_config batch failed; falling back to app-layer scoping');
          return query(scopedArgs);
        }
      },
    },
  },
});

/**
 * Interactive transaction with `app.current_tenant_id` pre-set for the whole
 * transaction when running under a tenant scope. All operations executed on
 * the `tx` client are therefore subject to the Phase 5 RLS policies, and the
 * Prisma extension skips its per-statement set_config batch (see
 * `isTenantTxBound`).
 */
export async function tenantTx<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  const scope = currentTenantScope();
  return await prisma.$transaction(async (tx) => {
    if (scope?.institutionId) {
      await tx.$executeRaw`SELECT set_config('app.current_tenant_id', CAST(${scope.institutionId} AS text), true)`;
    }
    return runWithTenantTxBound(() => fn(tx as unknown as Prisma.TransactionClient));
  });
}

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = baseClient;
}

export async function connectDatabase(): Promise<void> {
  const maxAttempts = 5;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await prisma.$connect();
      logger.info('Database connected successfully');
      return;
    } catch (error) {
      logger.error({ err: error, attempt, maxAttempts }, 'Database connection failed');
      if (attempt < maxAttempts) {
        const delay = Math.min(1000 * 2 ** (attempt - 1), 10000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  logger.error('Database connection failed after retries');
  if (env.NODE_ENV !== 'production') {
    process.exit(1);
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info('Database disconnected');
}
