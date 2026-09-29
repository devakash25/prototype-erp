import { Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const POLICY = (table: string, col: string) => `
ALTER TABLE "public"."${table}" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."${table}" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenant_isolation" ON "public"."${table}";
CREATE POLICY "tenant_isolation" ON "public"."${table}"
  FOR ALL
  USING (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "${col}" = NULLIF(current_setting('app.current_tenant_id', true), '')
  )
  WITH CHECK (
    NULLIF(current_setting('app.current_tenant_id', true), '') IS NULL
    OR "${col}" = NULLIF(current_setting('app.current_tenant_id', true), '')
  );`;

const entries: { table: string; col: string }[] = [];
for (const m of Prisma.dmmf.datamodel.models) {
  const f = m.fields.find((x) => x.name === 'institutionId' && x.kind === 'scalar');
  if (!f) continue;
  entries.push({ table: m.dbName ?? m.name, col: f.dbName ?? 'institutionId' });
}
entries.sort((a, b) => a.table.localeCompare(b.table));

const sql = `-- Phase 5: row-level security (defense-in-depth under Phase 2 app scoping).
-- Requires the app role \`erp_app\` (no BYPASSRLS). On a fresh database create it first:
--   CREATE ROLE erp_app LOGIN PASSWORD '<see server/.env DATABASE_URL>';
-- Policies are permissive: when app.current_tenant_id is unset/empty (CEO, scripts,
-- migrations) rows are unrestricted — the app layer owns that path.

-- Application role grants (idempotent):
GRANT USAGE ON SCHEMA public TO erp_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO erp_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO erp_app;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO erp_app;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO erp_app;
${entries.map((e) => POLICY(e.table, e.col)).join('\n')}
-- ${entries.length} tables hardened: ${entries.map((e) => e.table).join(', ')}
`;

const dir = path.join(__dirname, '../../prisma/migrations/20260928000000_rls_tenant_isolation');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'migration.sql'), sql);
console.log(`wrote ${entries.length} tables to ${dir}`);
console.log(entries.map((e) => e.table).join(', '));
