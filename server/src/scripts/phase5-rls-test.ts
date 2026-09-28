/* Phase 5 RLS test — run: npx tsx src/scripts/phase5-rls-test.ts
 *
 * Proves:
 *  1. SQL policies: GUC unset → unrestricted (CEO/scripts path);
 *     GUC set → only that institution's rows visible (as erp_app).
 *  2. The Prisma extension batches set_config into the SAME transaction as
 *     mutations, so cross-tenant writes are blocked by RLS USING/WITH CHECK
 *     even when the Phase 2 app-layer filter is deliberately bypassed
 *     (explicit institutionId in where → injection skips).
 *  3. tenantTx pre-sets the GUC for interactive transactions.
 *  4. Legit tenant writes still work over HTTP.
 *  5. (Phase 6b) Child tables: policies walk the FK chain to the tenant
 *     anchor; cross-tenant child inserts/updates are blocked, reads follow
 *     the GUC when probed as erp_app.
 */
import { prisma, tenantTx } from '../config/database';
import { runWithTenant } from '../config/tenant-context';

const BASE = 'http://localhost:5001/api/v1';
const B_DOMAIN = 'deverp008.deverp.com';

let pass = 0;
let fail = 0;
function check(name: string, cond: boolean, detail = ''): void {
  if (cond) { pass++; console.log(`PASS  ${name}`); }
  else { fail++; console.log(`FAIL  ${name} ${detail}`); }
}

async function api(path: string, token: string, init: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
  const text = await res.text();
  let json: any = null;
  try { json = JSON.parse(text); } catch { /* ignore */ }
  return { status: res.status, text, json };
}

async function cleanup() {
  await prisma.refreshToken.deleteMany({ where: { token: { in: ['cross-tenant-child-probe', 'own-tenant-child-probe'] } } });
  await prisma.user.deleteMany({ where: { email: { endsWith: B_DOMAIN } } });
  await prisma.institution.deleteMany({ where: { emailDomain: B_DOMAIN } });
}

async function main() {
  if (!process.env.APP_DATABASE_URL) throw new Error('APP_DATABASE_URL not set');
  await cleanup();

  const { PrismaClient } = await import('@prisma/client');
  const raw = new PrismaClient({ datasourceUrl: process.env.APP_DATABASE_URL });

  const instA = await prisma.institution.findUnique({ where: { emailDomain: 'deverp001.deverp.com' } });
  if (!instA) throw new Error('institution A (deverp001) not found');
  const aUser = await prisma.user.findFirst({ where: { institutionId: instA.id, role: { not: 'CEO' } } });
  if (!aUser) throw new Error('no A user found');

  // ---- Level 1: SQL policies as erp_app ----
  const totalUsers = (await raw.$queryRaw<any[]>`SELECT count(*)::int AS n FROM "users"`)[0].n;
  const aCount = await prisma.user.count({ where: { institutionId: instA.id } });
  const noGucA = (await raw.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.current_tenant_id', CAST(${instA.id} AS text), true)`;
    return tx.$queryRaw<any[]>`SELECT count(*)::int AS n FROM "users"`;
  }))[0].n;
  const ceoVisible = (await raw.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.current_tenant_id', CAST(${instA.id} AS text), true)`;
    return tx.$queryRaw<any[]>`SELECT count(*)::int AS n FROM "users" WHERE email = 'ceo@deverp.com'`;
  }))[0].n;
  check('policy: GUC unset → all rows visible', totalUsers > 0, `total=${totalUsers}`);
  check('policy: GUC=A → exactly A rows visible', noGucA === aCount, `got ${noGucA} want ${aCount}`);
  check('policy: GUC=A → CEO row (institutionId NULL) hidden', ceoVisible === 0, `got ${ceoVisible}`);
  const gucNobody = (await raw.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.current_tenant_id', 'ffffffff-ffff-ffff-ffff-ffffffffffff', true)`;
    return tx.$queryRaw<any[]>`SELECT count(*)::int AS n FROM "users"`;
  }))[0].n;
  check('policy: GUC=unknown tenant → 0 rows', gucNobody === 0, `got ${gucNobody}`);

  // ---- Create institution B through the CEO API ----
  const ceoLogin = await api('/auth/login', '', { method: 'POST', body: JSON.stringify({ email: 'ceo@deverp.com', password: 'Admin@123' }) });
  const ceoToken = ceoLogin.json?.data?.accessToken;
  check('CEO login', !!ceoToken);
  const created = await api('/ceo/institutions', ceoToken, {
    method: 'POST',
    body: JSON.stringify({ name: 'RLS Probe', subdomain: 'deverp008' }),
  });
  check('create institution B', created.status === 201, `status=${created.status} ${created.text.slice(0, 160)}`);
  const instB: string = created.json?.institution?.id;
  const bEmail: string = created.json?.initialAdmin?.email;
  const bPw: string = created.json?.initialAdmin?.password;

  try {
    const bLogin = await api('/auth/login', '', { method: 'POST', body: JSON.stringify({ email: bEmail, password: bPw }) });
    const bToken = bLogin.json?.data?.accessToken;
    const bUserId: string = bLogin.json?.data?.user?.id;
    check('B admin login', !!bToken);

    // ---- Level 2: extension mutation batching ----
    // Killer test: explicit institutionId → Phase 2 injection SKIPPED →
    // app-layer would allow the write; only RLS can block it.
    let blockedErr: any = null;
    await runWithTenant(instB, async () => {
      try {
        await prisma.user.update({
          where: { id: aUser.id, institutionId: instA.id },
          data: { phone: '+91 99999 00007' },
        });
      } catch (e: any) { blockedErr = e; }
    });
    check(
      'mutation: cross-tenant update blocked by RLS (P2025)',
      blockedErr?.code === 'P2025' || /depends on one or more records/i.test(blockedErr?.message || ''),
      `err=${blockedErr?.code || blockedErr?.message?.slice(0, 140)}`
    );
    const aUserAfter = await prisma.user.findUnique({ where: { id: aUser.id }, select: { phone: true } });
    check('mutation: A user phone unchanged', aUserAfter?.phone === aUser.phone, `got ${aUserAfter?.phone}`);

    // Legit tenant write through the extension (batch path) still works
    const ownUpdate = await runWithTenant(instB, () =>
      prisma.user.update({ where: { id: bUserId }, data: { phone: '+91 99999 00008' } })
    ) as any;
    check('mutation: own-tenant update succeeds', ownUpdate.institutionId === instB);

    // Read side stays on Phase 2 app-layer filtering by default (documented)
    const crossRead = await runWithTenant(instB, async () =>
      prisma.user.findMany({ where: { institutionId: instA.id }, take: 3 })
    );
    check('read: explicit-institutionId read returns A rows (app-layer contract)', crossRead.length > 0, `got ${crossRead.length}`);

    // ---- Level 3: tenantTx pre-sets GUC for the interactive tx ----
    let rlsInTx = -1;
    try {
      rlsInTx = await runWithTenant(instB, () =>
        tenantTx(async (tx) => {
          const r = await tx.$queryRaw<any[]>`SELECT count(*)::int AS n FROM "users" WHERE "institutionId" = CAST(${instA.id} AS text)`;
          return r[0].n;
        })
      );
    } catch (e: any) {
      check('tenantTx: raw count inside tx ran', false, e.message?.slice(0, 140));
    }
    check('tenantTx: GUC set → A rows invisible to tenant B (count 0)', rlsInTx === 0, `got ${rlsInTx}`);

    let txCount = -1;
    try {
      txCount = await runWithTenant(instB, () => tenantTx(async (tx) => tx.user.count()));
    } catch (e: any) {
      check('tenantTx: model op inside tx ran', false, e.message?.slice(0, 140));
    }
    const bUsers = await prisma.user.count({ where: { institutionId: instB } });
    check('tenantTx: model count inside tx matches B users', txCount === bUsers, `got ${txCount} want ${bUsers}`);

    // ---- Level 4: HTTP legit write under RLS (server-side batch path) ----
    const httpWrite = await api(`/users/${bUserId}`, bToken, {
      method: 'PUT',
      body: JSON.stringify({ phone: '+91 99999 00009' }),
    });
    check('HTTP: tenant write (PUT /users/:id) works under RLS', httpWrite.status === 200, `status=${httpWrite.status} ${httpWrite.text.slice(0, 140)}`);

    // CEO still unrestricted
    const ceoList = await api('/ceo/institutions', ceoToken);
    check('CEO: list institutions unaffected', ceoList.status === 200 && Array.isArray(ceoList.json), `status=${ceoList.status}`);

    // ---- Level 5 (Phase 6b): child-table policies (FK chain to tenant) ----
    const { CHILD_SCOPED_MODELS } = await import('../config/tenant-chain');
    check('child models: RefreshToken + Attendance are GUC-scoped', CHILD_SCOPED_MODELS.has('RefreshToken') && CHILD_SCOPED_MODELS.has('Attendance'));
    const policyCount = (await raw.$queryRaw<any[]>`SELECT count(*)::int AS n FROM pg_policies WHERE policyname = 'tenant_isolation'`)[0].n;
    check('policies: 37 tenant tables + 39 child tables = 76', policyCount === 76, `got ${policyCount}`);

    // Row-level read probe on a child table (chain: refresh_tokens → users)
    const bTokenRow: any = await raw.refreshToken.findFirst({ where: { userId: bUserId } });
    check('child read: B refresh token exists (GUC unset)', !!bTokenRow);
    const visB = (await raw.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.current_tenant_id', CAST(${instB} AS text), true)`;
      return tx.$queryRaw<any[]>`SELECT count(*)::int AS n FROM "refresh_tokens" WHERE "id" = CAST(${bTokenRow?.id} AS text)`;
    }))[0].n;
    const visA = (await raw.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.current_tenant_id', CAST(${instA.id} AS text), true)`;
      return tx.$queryRaw<any[]>`SELECT count(*)::int AS n FROM "refresh_tokens" WHERE "id" = CAST(${bTokenRow?.id} AS text)`;
    }))[0].n;
    check('child read: GUC=B → own row visible', visB === 1, `got ${visB}`);
    check('child read: GUC=A → B row hidden', visA === 0, `got ${visA}`);

    // Cross-tenant child INSERT (WITH CHECK via FK chain) through the extension
    let childInsertErr: any = null;
    await runWithTenant(instB, async () => {
      try {
        await prisma.refreshToken.create({
          data: { userId: aUser.id, token: 'cross-tenant-child-probe', expiresAt: new Date(Date.now() + 60_000) },
        });
      } catch (e: any) { childInsertErr = e; }
    });
    const leaked = await raw.refreshToken.count({ where: { token: 'cross-tenant-child-probe' } });
    check(
      'child write: cross-tenant insert blocked by RLS',
      !!childInsertErr && leaked === 0,
      `err=${childInsertErr?.code || childInsertErr?.message?.slice(0, 120)} leaked=${leaked}`
    );
    await raw.refreshToken.deleteMany({ where: { token: 'cross-tenant-child-probe' } });

    // Cross-tenant child UPDATE (USING via FK chain)
    const bExpires = bTokenRow?.expiresAt;
    let childUpdateErr: any = null;
    await runWithTenant(instA.id, async () => {
      try {
        await prisma.refreshToken.update({
          where: { id: bTokenRow.id },
          data: { expiresAt: new Date(Date.now() + 90_000) },
        });
      } catch (e: any) { childUpdateErr = e; }
    });
    const bTokenAfter: any = await raw.refreshToken.findUnique({ where: { id: bTokenRow.id } });
    check(
      'child write: cross-tenant update blocked (P2025)',
      childUpdateErr?.code === 'P2025' && bTokenAfter?.expiresAt?.getTime?.() === bExpires?.getTime?.(),
      `err=${childUpdateErr?.code || childUpdateErr?.message?.slice(0, 120)}`
    );

    // Own-tenant child write through the extension batch path still works
    const ownChild = await runWithTenant(instB, () =>
      prisma.refreshToken.create({
        data: { userId: bUserId, token: 'own-tenant-child-probe', expiresAt: new Date(Date.now() + 60_000) },
      })
    ) as any;
    check('child write: own-tenant insert succeeds', !!ownChild?.id);
    await raw.refreshToken.deleteMany({ where: { token: 'own-tenant-child-probe' } });
  } finally {
    await cleanup();
    await raw.$disconnect();
  }

  console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
  await prisma.$disconnect();
  process.exit(fail ? 1 : 0);
}

main().catch(async (e) => {
  console.error('FATAL', e);
  try { await cleanup(); } catch { /* ignore */ }
  process.exit(1);
});
