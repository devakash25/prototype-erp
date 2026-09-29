/* Phase 3 smoke test — run: npx tsx src/scripts/phase3-smoke-test.ts */
import { prisma } from '../config/database';

const BASE = 'http://localhost:5001/api/v1';
const DOMAIN_C = 'deverp003.deverp.com';

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
    throw new Error(`login ${email} -> ${res.status} ${JSON.stringify(json).slice(0, 200)}`);
  }
  return json.data.accessToken as string;
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
  await prisma.user.deleteMany({ where: { email: { endsWith: DOMAIN_C } } });
  await prisma.institution.deleteMany({ where: { emailDomain: DOMAIN_C } });
}

async function main() {
  await cleanup();
  const ceo = await login('ceo@deverp.com', 'Admin@123');

  // list
  const list = await api('/ceo/institutions', ceo);
  check('GET institutions (200, array)', list.status === 200 && Array.isArray(list.json), `status=${list.status}`);
  check('list includes deverp001', list.text.includes('deverp001'));

  // reserved subdomain rejected
  const reserved = await api('/ceo/institutions', ceo, {
    method: 'POST',
    body: JSON.stringify({ name: 'Reserved Probe', subdomain: 'admin' }),
  });
  check('reserved subdomain rejected (400)', reserved.status === 400, `status=${reserved.status}`);

  // invalid subdomain rejected
  const invalid = await api('/ceo/institutions', ceo, {
    method: 'POST',
    body: JSON.stringify({ name: 'Bad Label', subdomain: '-bad-' }),
  });
  check('invalid subdomain rejected (400)', invalid.status === 400, `status=${invalid.status}`);

  // create
  const created = await api('/ceo/institutions', ceo, {
    method: 'POST',
    body: JSON.stringify({ name: 'Phase3 Smoke Inst', subdomain: 'deverp003', type: 'SCHOOL', city: 'Testville' }),
  });
  check('create institution (201)', created.status === 201, `status=${created.status} ${created.text.slice(0, 200)}`);
  const instId = created.json?.institution?.id;
  const adminEmail = created.json?.initialAdmin?.email;
  const adminPw = created.json?.initialAdmin?.password;
  check('initial admin email domain', adminEmail === `admin@${DOMAIN_C}`, String(adminEmail));

  // duplicate rejected
  const dup = await api('/ceo/institutions', ceo, {
    method: 'POST',
    body: JSON.stringify({ name: 'Dup', subdomain: 'deverp003' }),
  });
  check('duplicate subdomain rejected (409)', dup.status === 409, `status=${dup.status}`);

  // initial admin can log in (Phase 1 domain resolution + Phase 2 tenant middleware)
  const adminToken = await login(adminEmail, adminPw);
  check('initial admin login', !!adminToken);

  // domain change forbidden
  const domChange = await api(`/ceo/institutions/${instId}`, ceo, {
    method: 'PATCH',
    body: JSON.stringify({ subdomain: 'hacked' }),
  });
  check('domain change rejected (400)', domChange.status === 400, `status=${domChange.status}`);

  // update profile fields
  const updated = await api(`/ceo/institutions/${instId}`, ceo, {
    method: 'PATCH',
    body: JSON.stringify({ city: 'Newtown', phone: '+91 12345 67890' }),
  });
  check('update institution profile (200)', updated.status === 200 && updated.json?.city === 'Newtown', `status=${updated.status}`);

  // plans available
  const plans = await api('/ceo/plans', ceo);
  check('GET plans (200)', plans.status === 200 && Array.isArray(plans.json), `status=${plans.status}`);
  const planId = Array.isArray(plans.json)
    ? (plans.json.find((p: any) => p.isActive) || plans.json[0]).id
    : null;
  check('a plan exists', !!planId, 'run POST /ceo/initialize-plans if missing');

  let subId: string | null = null;
  if (planId) {
    // assign subscription
    const sub = await api(`/ceo/institutions/${instId}/subscriptions`, ceo, {
      method: 'POST',
      body: JSON.stringify({ planId, billingCycle: 'monthly' }),
    });
    check('assign subscription (201)', sub.status === 201, `status=${sub.status} ${sub.text.slice(0, 200)}`);
    subId = sub.json?.id;

    const subs = await api(`/ceo/institutions/${instId}/subscriptions`, ceo);
    check('list subscriptions (active present)', subs.status === 200 && subs.text.includes('"active"'), `status=${subs.status}`);

    // features now come from the institution's subscription plan
    const features = await api('/auth/features', adminToken);
    check('institution features from subscription (200)', features.status === 200, `status=${features.status}`);

    // supersede: second assign cancels the first
    const sub2 = await api(`/ceo/institutions/${instId}/subscriptions`, ceo, {
      method: 'POST',
      body: JSON.stringify({ planId, billingCycle: 'yearly' }),
    });
    check('re-assign subscription (201)', sub2.status === 201, `status=${sub2.status}`);
    const old = subId ? await api(`/ceo/subscriptions/${subId}`, ceo, { method: 'PATCH', body: JSON.stringify({ status: 'expired' }) }) : null;
    check('update subscription status (200)', !!old && old.status === 200, `status=${old?.status}`);
    subId = sub2.json?.id;
  }

  // deactivate → login blocked
  const off = await api(`/ceo/institutions/${instId}/status`, ceo, { method: 'PATCH', body: JSON.stringify({ isActive: false }) });
  check('deactivate institution (200)', off.status === 200, `status=${off.status}`);
  let blocked = false;
  try { await login(adminEmail, adminPw); } catch { blocked = true; }
  check('login blocked after deactivation', blocked);

  // reactivate
  const on = await api(`/ceo/institutions/${instId}/status`, ceo, { method: 'PATCH', body: JSON.stringify({ isActive: true }) });
  check('reactivate institution (200)', on.status === 200, `status=${on.status}`);
  const back = await login(adminEmail, adminPw);
  check('login works after reactivation', !!back);

  // non-CEO blocked from institutions API
  const nonCeo = await api('/ceo/institutions', back);
  check('non-CEO blocked from institutions API (403)', nonCeo.status === 403, `status=${nonCeo.status}`);

  await cleanup();
  console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
  await prisma.$disconnect();
  process.exit(fail ? 1 : 0);
}

main().catch(async (e) => {
  console.error('FATAL', e);
  try { await cleanup(); } catch { /* ignore */ }
  process.exit(1);
});
