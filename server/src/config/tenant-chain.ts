import { Prisma } from '@prisma/client';

/**
 * Phase 6b — tenant anchoring for child models (models without their own
 * institutionId column). Each child row belongs to the tenant of its parent
 * chain: e.g. mcq_answers → mcq_submissions → mcq_tests.institutionId.
 *
 * Used by:
 *  - the Prisma extension (database.ts) to batch the tenant GUC for child
 *    model mutations (and reads when RLS_ENFORCE_READS=1),
 *  - gen-rls-child-migration.ts to emit per-table RLS policies whose
 *    USING/WITH CHECK clauses walk the FK chain to an institutionId anchor.
 */

export const TENANT_GUC = `NULLIF(current_setting('app.current_tenant_id', true), '')`;

const models = Prisma.dmmf.datamodel.models;
const byName = new Map(models.map((m) => [m.name, m]));

function q(id: string): string {
  return `"${id.replace(/"/g, '""')}"`;
}
function tableOf(m: { name: string; dbName?: string | null }): string {
  return m.dbName ?? m.name;
}
function colOf(m: { fields: readonly { name: string; dbName?: string | null }[] }, fieldName: string): string {
  const f = m.fields.find((x) => x.name === fieldName);
  return f?.dbName ?? fieldName;
}
function hasInstField(m: { fields: readonly { name: string; kind: string }[] }): boolean {
  return m.fields.some((f) => f.name === 'institutionId' && f.kind === 'scalar');
}

/** relationName is always `${ModelA}To${ModelB}` — split on the junction. */
function splitRel(rel: string | undefined): [string, string] | null {
  if (!rel) return null;
  let i = rel.indexOf('To');
  while (i !== -1) {
    const a = rel.slice(0, i);
    const b = rel.slice(i + 2);
    if (byName.has(a) && byName.has(b)) return [a, b];
    i = rel.indexOf('To', i + 2);
  }
  return null;
}

const memo = new Map<string, string | null>();

/**
 * Boolean SQL expression over `model`'s own columns: true when the row's
 * parent chain reaches an institutionId equal to the tenant GUC.
 * Returns null when no chain anchors to a tenant (platform models).
 */
function chainExpr(modelName: string, stack: Set<string>): string | null {
  if (memo.has(modelName)) return memo.get(modelName)!;
  if (stack.has(modelName)) return null;
  const m = byName.get(modelName);
  if (!m) return null;
  stack.add(modelName);

  const parts: string[] = [];
  for (const f of m.fields) {
    if (f.kind !== 'object') continue;
    const from = f.relationFromFields ?? [];
    if (from.length === 0) continue;
    const sides = splitRel(f.relationName);
    if (!sides) continue;
    const target = sides[0] === modelName ? sides[1] : sides[0];
    if (target === modelName) continue;
    const t = byName.get(target);
    if (!t) continue;

    let cond: string | null;
    if (target === 'Institution') {
      cond = `${q('id')} = ${TENANT_GUC}`;
    } else if (hasInstField(t)) {
      cond = `${q(colOf(t, 'institutionId'))} = ${TENANT_GUC}`;
    } else {
      cond = chainExpr(target, stack);
      if (cond) cond = `(${cond})`;
    }
    if (!cond) continue;

    const fkCols = from.map((n) => q(colOf(m, n)));
    const toFields = (f.relationToFields && f.relationToFields.length ? f.relationToFields : ['id'])
      .map((n) => q(colOf(t, n)));
    const fkList = fkCols.length === 1 ? fkCols[0] : `(${fkCols.join(', ')})`;
    const selList = toFields.length === 1 ? toFields[0] : `(${toFields.join(', ')})`;
    parts.push(`${fkList} IN (SELECT ${selList} FROM ${q(tableOf(t))} WHERE ${cond})`);
  }

  const expr = parts.length > 0 ? parts.join(' OR ') : null;
  stack.delete(modelName);
  memo.set(modelName, expr);
  return expr;
}

export interface ChildPolicy {
  model: string;
  table: string;
  expr: string;
}

function build(): { policies: ChildPolicy[]; skipped: { model: string; reason: string }[] } {
  const policies: ChildPolicy[] = [];
  const skipped: { model: string; reason: string }[] = [];
  for (const m of models) {
    if (hasInstField(m)) continue;
    if (m.name === 'Institution') {
      skipped.push({ model: m.name, reason: 'tenant root' });
      continue;
    }
    const expr = chainExpr(m.name, new Set());
    if (!expr) {
      skipped.push({ model: m.name, reason: 'no tenant-anchored FK chain' });
      continue;
    }
    policies.push({ model: m.name, table: tableOf(m), expr });
  }
  policies.sort((a, b) => a.table.localeCompare(b.table));
  return { policies, skipped };
}

const { policies, skipped } = build();

/** Child models whose operations must carry the tenant GUC (RLS batch). */
export const CHILD_SCOPED_MODELS: Set<string> = new Set(policies.map((p) => p.model));
export const CHILD_POLICIES: ChildPolicy[] = policies;
export const CHILD_SKIPPED = skipped;
