/* Cross-tenant isolation test — run: npx tsx src/scripts/tenant-isolation-test.ts */
import bcrypt from 'bcrypt';
import { prisma } from '../config/database';

const BASE = 'http://localhost:5001/api/v1';
const DOMAIN_B = 'deverp002.deverp.com';

let pass = 0;
let fail = 0;
function check(name: string, cond: boolean, detail = ''): void {
  if (cond) {
    pass++;
    console.log(`PASS  ${name}`);
  } else {
    fail++;
    console.log(`FAIL  ${name} ${detail}`);
  }
}

async function login(email: string, password: string) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json: any = await res.json().catch(() => ({}));
  if (res.status !== 200 || !json?.data?.accessToken) {
    throw new Error(`login ${email} -> ${res.status} ${JSON.stringify(json).slice(0, 200)}`);
  }
  return { token: json.data.accessToken as string, userId: json.data.user.id as string };
}

async function api(path: string, token: string, init: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
  const text = await res.text();
  return { status: res.status, text };
}

async function main() {
  // cleanup leftovers
  await prisma.user.deleteMany({ where: { email: { endsWith: DOMAIN_B } } });
  await prisma.institution.deleteMany({ where: { emailDomain: DOMAIN_B } });

  // institution B + admin
  const instB = await prisma.institution.create({
    data: {
      name: 'Isolation Probe Inst',
      code: 'ISO-TEST-002',
      subdomain: 'deverp002',
      emailDomain: DOMAIN_B,
      type: 'SCHOOL',
    },
  });
  const userB = await prisma.user.create({
    data: {
      institutionId: instB.id,
      email: `admin@${DOMAIN_B}`,
      password: await bcrypt.hash('Admin@123', 12),
      role: 'CHIEF_HEAD',
      firstName: 'Iso',
      lastName: 'Admin',
      fullName: 'Iso Admin',
      isActive: true,
      isEmailVerified: true,
    },
  });

  try {
    const b = await login(`admin@${DOMAIN_B}`, 'Admin@123');
    const a = await login('principal@deverp001.deverp.com', 'Teacher@123');
    const ceo = await login('ceo@deverp.com', 'Admin@123');
    check('B login (own email domain)', b.userId === userB.id);

    const listA = await api('/users?limit=100', a.token);
    check('A list hides B admin', !listA.text.includes(`admin@${DOMAIN_B}`), listA.text.slice(0, 150));
    const listB = await api('/users?limit=100', b.token);
    check('B list has only B users', listB.text.includes(`admin@${DOMAIN_B}`) && !listB.text.includes('deverp001'), listB.text.slice(0, 150));

    const cross1 = await api(`/users/${b.userId}`, a.token);
    check('A cannot read B user by id (404)', cross1.status === 404, `status=${cross1.status}`);
    const cross2 = await api(`/users/${a.userId}`, b.token);
    check('B cannot read A user by id (404)', cross2.status === 404, `status=${cross2.status}`);

    const writeCross = await api(`/users/${a.userId}`, b.token, {
      method: 'PUT',
      body: JSON.stringify({ firstName: 'Hacked' }),
    });
    check('B cannot update A user (404)', writeCross.status === 404, `status=${writeCross.status}`);

    const ceoRoute = await api('/ceo/users?limit=5', b.token);
    check('B blocked from CEO route (403)', ceoRoute.status === 403, `status=${ceoRoute.status}`);

    const ceoList = await api('/ceo/users?limit=100', ceo.token);
    check('CEO sees both institutions', ceoList.text.includes('deverp001') && ceoList.text.includes(DOMAIN_B));
  } finally {
    await prisma.user.deleteMany({ where: { email: { endsWith: DOMAIN_B } } });
    await prisma.institution.deleteMany({ where: { emailDomain: DOMAIN_B } });
    await prisma.$disconnect();
  }

  console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(async (e) => {
  console.error('FATAL', e);
  try {
    await prisma.user.deleteMany({ where: { email: { endsWith: DOMAIN_B } } });
    await prisma.institution.deleteMany({ where: { emailDomain: DOMAIN_B } });
  } catch { /* ignore */ }
  process.exit(1);
});
