const PW = 'ErpRls$2026x';
async function main() {
  const { PrismaClient } = await import('@prisma/client');
  const url = `postgresql://erp_app.anqqglqdbzykyugonbzn:${encodeURIComponent(PW)}@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres?sslmode=require&connection_limit=3&pool_timeout=15`;
  const c = new PrismaClient({ datasourceUrl: url });

  const insts = await c.$queryRaw<any[]>`SELECT id, code FROM "institutions" ORDER BY code`;
  console.log('institutions:', insts.map((i: any) => i.code).join(', '));

  const noGuc = await c.$queryRaw<any[]>`SELECT count(*)::int AS n FROM "students"`;
  console.log('students (no GUC):', noGuc[0].n);

  for (const inst of insts) {
    const n = await c.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.current_tenant_id', CAST(${inst.id} AS text), true)`;
      const r = await tx.$queryRaw<any[]>`SELECT count(*)::int AS n FROM "students"`;
      return r[0].n;
    });
    console.log(`students GUC=${inst.code}:`, n);
  }

  const usersNoGuc = await c.$queryRaw<any[]>`SELECT count(*)::int AS n FROM "users"`;
  console.log('users (no GUC):', usersNoGuc[0].n);
  const usersGuc = await c.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.current_tenant_id', CAST(${insts[0].id} AS text), true)`;
    const r = await tx.$queryRaw<any[]>`SELECT count(*)::int AS n FROM "users"`;
    return r[0].n;
  });
  console.log(`users GUC=${insts[0].code}:`, usersGuc);
  await c.$disconnect();
}
main().catch(e => { console.error('ERR', e.message); process.exit(1); });
