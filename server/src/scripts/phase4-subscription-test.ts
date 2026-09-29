/* Phase 4 subscription lifecycle test — run: npx tsx src/scripts/phase4-subscription-test.ts */
import { prisma } from '../config/database';

const BASE = 'http://localhost:5001/api/v1';
const DOMAIN_F = 'deverp006.deverp.com';

let pass = 0;
let fail = 0;
function check(name: string, cond: boolean, detail = ''): void {
  if (cond) { pass++; console.log(`PASS  ${name}`); }
  else { fail++; console.log(`FAIL  ${name} ${detail}`); }
}

async function login(email: string, password: string) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json: any = await res.json().catch(() => ({}));
  if (res.status !== 200 || !json?.data?.accessToken) {
    throw new Error(`login ${email} -> ${res.status} ${JSON.stringify(json).slice(0, 160)}`);
  }
  return { token: json.data.accessToken as string, userId: json.data.user.id as string };
}

async function api(path: string, token: string, init: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
  const text = await res.text();
  let json: any = null;
  try { json = JSON.parse(text); } catch { /* ignore */ }
  return {
    status: res.status,
    text,
    json,
    state: res.headers.get('x-subscription-state'),
    graceEnds: res.headers.get('x-subscription-grace-ends'),
  };
}

function isoDaysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

async function cleanup() {
  await prisma.user.deleteMany({ where: { email: { endsWith: DOMAIN_F } } });
  await prisma.institution.deleteMany({ where: { emailDomain: DOMAIN_F } });
}

async function main() {
  await cleanup();
  const ceo = await login('ceo@deverp.com', 'Admin@123');

  const created = await api('/ceo/institutions', ceo.token, {
    method: 'POST',
    body: JSON.stringify({ name: 'Phase4 Probe', subdomain: 'deverp006' }),
  });
  check('create institution', created.status === 201, `status=${created.status}`);
  const instId = created.json?.institution?.id;
  const adminEmail = created.json?.initialAdmin?.email;
  const adminPw = created.json?.initialAdmin?.password;

  const admin = await login(adminEmail, adminPw);
  const uid = admin.userId;
  const write = () => api(`/users/${uid}`, admin.token, { method: 'PUT', body: JSON.stringify({ phone: '+91 90000 00006' }) });

  try {
    const plans = await api('/ceo/plans', ceo.token);
    const planId = (plans.json || []).find((p: any) => p.isActive)?.id;
    check('plan available', !!planId);

    // 1. no subscription → unrestricted, header 'none'
    let r = await api('/users?limit=1', admin.token);
    check('no-sub: read ok + header none', r.status === 200 && r.state === 'none', `status=${r.status} state=${r.state}`);
    r = await write();
    check('no-sub: write ok', r.status === 200, `status=${r.status} ${r.text.slice(0, 120)}`);

    // 2. active subscription
    let sub = await api(`/ceo/institutions/${instId}/subscriptions`, ceo.token, {
      method: 'POST',
      body: JSON.stringify({ planId, billingCycle: 'monthly', endDate: isoDaysFromNow(30) }),
    });
    check('assign active sub', sub.status === 201, `status=${sub.status}`);
    const subId = sub.json?.id;
    r = await api('/users?limit=1', admin.token);
    check('active: header active', r.state === 'active', `state=${r.state}`);
    r = await write();
    check('active: write ok', r.status === 200, `status=${r.status}`);

    // 3. grace (ended 2 days ago)
    sub = await api(`/ceo/institutions/${instId}/subscriptions`, ceo.token, {
      method: 'POST',
      body: JSON.stringify({ planId, billingCycle: 'monthly', startDate: isoDaysFromNow(-20), endDate: isoDaysFromNow(-2) }),
    });
    check('assign grace sub', sub.status === 201, `status=${sub.status}`);
    r = await api('/users?limit=1', admin.token);
    check('grace: header grace + grace-ends', r.state === 'grace' && !!r.graceEnds, `state=${r.state} ends=${r.graceEnds}`);
    r = await write();
    check('grace: write still ok', r.status === 200, `status=${r.status}`);

    // 4. readonly (ended 8 days ago → past 7-day grace)
    sub = await api(`/ceo/institutions/${instId}/subscriptions`, ceo.token, {
      method: 'POST',
      body: JSON.stringify({ planId, billingCycle: 'monthly', startDate: isoDaysFromNow(-30), endDate: isoDaysFromNow(-8) }),
    });
    check('assign expired sub', sub.status === 201, `status=${sub.status}`);
    r = await api('/users?limit=1', admin.token);
    check('readonly: read ok + header readonly', r.status === 200 && r.state === 'readonly', `status=${r.status} state=${r.state}`);
    r = await write();
    check('readonly: write blocked 402', r.status === 402, `status=${r.status} ${r.text.slice(0, 140)}`);
    check('readonly: 402 message mentions renew', /renew/i.test(r.text), r.text.slice(0, 140));

    // allowlisted auth writes still work
    const logout = await api('/auth/logout', admin.token, { method: 'POST', body: JSON.stringify({ refreshToken: 'x' }) });
    check('readonly: /auth/logout allowed (not 402)', logout.status !== 402, `status=${logout.status}`);

    // public register hole closed
    const reg = await api('/auth/register', admin.token, {
      method: 'POST',
      body: JSON.stringify({
        institutionId: instId,
        email: `late.reg@${DOMAIN_F}`,
        password: 'LateReg@123',
        role: 'TEACHER',
        firstName: 'Late',
        lastName: 'Register',
      }),
    });
    check('readonly: register blocked 402', reg.status === 402, `status=${reg.status} ${reg.text.slice(0, 120)}`);

    // CEO still unaffected while tenant is read-only
    const ceoList = await api('/ceo/institutions', ceo.token);
    check('readonly: CEO still works', ceoList.status === 200, `status=${ceoList.status}`);

    // 5. suspended → read-only immediately (even with future end date)
    await api(`/ceo/institutions/${instId}/subscriptions`, ceo.token, {
      method: 'POST',
      body: JSON.stringify({ planId, billingCycle: 'monthly', endDate: isoDaysFromNow(30) }),
    });
    r = await api('/users?limit=1', admin.token);
    check('renewed: back to active', r.state === 'active', `state=${r.state}`);
    const susp = await api(`/ceo/subscriptions/${subId}`, ceo.token, { method: 'PATCH', body: JSON.stringify({ status: 'suspended' }) });
    check('suspend subscription (200)', susp.status === 200, `status=${susp.status}`);
    r = await api('/users?limit=1', admin.token);
    check('suspended: readonly immediately', r.state === 'readonly', `state=${r.state}`);
    r = await write();
    check('suspended: write blocked 402', r.status === 402, `status=${r.status}`);

    // 6. reactivate → full access
    const react = await api(`/ceo/subscriptions/${subId}`, ceo.token, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'active', endDate: isoDaysFromNow(30) }),
    });
    check('reactivate (200)', react.status === 200, `status=${react.status}`);
    r = await api('/users?limit=1', admin.token);
    check('reactivated: active again', r.state === 'active', `state=${r.state}`);
    r = await write();
    check('reactivated: write ok', r.status === 200, `status=${r.status}`);
  } finally {
    await cleanup();
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
