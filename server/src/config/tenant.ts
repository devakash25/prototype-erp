export const PLATFORM_DOMAIN = 'deverp.com';

export const RESERVED_SUBDOMAINS = new Set([
  'www', 'api', 'app', 'admin', 'ceo', 'mail', 'dashboard', 'platform',
  'root', 'dev', 'staging', 'test', 'blog', 'support', 'ns1', 'ns2',
  'smtp', 'imap', 'ftp', 'vpn', 'cdn', 'static', 'assets', 'auth',
  'login', 'signup', 'docs', 'status', 'help', 'portal', 'panel',
  'console', 'manage', 'system', 'internal', 'ops', 'security',
  'billing', 'payment', 'payments', 'invoice', 'crm', 'erp', 'hr',
  'lms', 'sms', 'oauth', 'sso', 'webmail', 'monitor', 'metrics',
  'git', 'ci', 'search', 'cache', 'queue', 'events', 'files',
]);

export function extractEmailDomain(email: string): string | null {
  const at = email.lastIndexOf('@');
  if (at <= 0 || at === email.length - 1) return null;
  return email.slice(at + 1).trim().toLowerCase() || null;
}

export function isPlatformDomain(domain: string | null): boolean {
  return !!domain && domain === PLATFORM_DOMAIN;
}

export function isReservedSubdomain(subdomain: string): boolean {
  return RESERVED_SUBDOMAINS.has(subdomain.trim().toLowerCase());
}

/** "sbvm.deverp.com" → "sbvm"; non-platform domains → null */
export function subdomainFromEmailDomain(domain: string | null): string | null {
  if (!domain || !domain.endsWith('.' + PLATFORM_DOMAIN)) return null;
  const sub = domain.slice(0, -(PLATFORM_DOMAIN.length + 1));
  if (!sub || sub.includes('.')) return null;
  return sub;
}
