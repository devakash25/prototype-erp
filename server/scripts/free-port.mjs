#!/usr/bin/env node
/**
 * Frees the DEV ERP server port before starting a dev instance.
 *
 * The crash we keep hitting:
 *   EADDRINUSE: address already in use :::5001
 * happens when `npm run dev` is started a second time while an earlier
 * nodemon/tsx instance still holds the port.
 *
 * This script stops every stale dev-server process for this project, waits
 * until the port is free, so `npm run dev` is idempotent.
 */
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PROJECT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = process.env.PORT || '5001';

function sh(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return '';
  }
}

const listAll = sh('ps -axo pid=,ppid=,command=')
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => {
    const [pid, ppid, ...rest] = line.split(/\s+/);
    return { pid: Number(pid), ppid: Number(ppid), command: rest.join(' ') };
  })
  .filter((p) => Number.isFinite(p.pid));

const byPid = new Map(listAll.map((p) => [p.pid, p]));

// One-time ancestor walk: everything from this process up to init.
const protectedPids = new Set([process.pid]);
{
  let current = process.pid;
  for (let i = 0; i < 32; i++) {
    const proc = byPid.get(current);
    if (!proc || !proc.ppid || protectedPids.has(proc.ppid)) break;
    protectedPids.add(proc.ppid);
    current = proc.ppid;
  }
}

function pidsOnPort() {
  const direct = sh(`lsof -nP -iTCP:${PORT} -sTCP:LISTEN -t`)
    .split('\n')
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (direct.length) return direct;
  return sh(`fuser -n tcp ${PORT}`)
    .replace(/[^0-9\s]/g, ' ')
    .split(/\s+/)
    .map(Number)
    .filter((n) => Number.isFinite(n) && n > 0);
}

const isDevServerProcess = (proc) => {
  const c = proc.command;
  return (
    c.includes(PROJECT_DIR) &&
    (c.includes('nodemon') ||
      c.includes('tsx src/server.ts') ||
      c.includes('server/src/server.ts') ||
      /[\\/]dist[\\/]server\.js/.test(c))
  );
};

const alive = (pid) => sh(`ps -p ${pid} -o pid=`).trim() !== '';

const targets = new Map();
const add = (pid) => {
  if (!pid || protectedPids.has(pid)) return;
  const proc = byPid.get(pid);
  targets.set(pid, `${pid}  ${(proc ? proc.command : '?').slice(0, 90)}`);
};

// 1. Every dev-server process belonging to this project (stale nodemon included).
for (const proc of listAll) if (isDevServerProcess(proc)) add(proc.pid);

// 2. Whatever owns the port, plus its nodemon/npm ancestors.
for (const pid of pidsOnPort()) {
  let current = pid;
  for (let i = 0; i < 16; i++) {
    const proc = byPid.get(current);
    if (!proc) break;
    if (i === 0 || isDevServerProcess(proc)) add(proc.pid);
    if (!proc.ppid || proc.ppid === 1) break;
    current = proc.ppid;
  }
}

if (!targets.size) {
  console.log(`[free-port] port ${PORT} is free — nothing to stop.`);
  process.exit(0);
}

console.log(`[free-port] stopping stale dev server(s) for port ${PORT}:`);
for (const line of targets.values()) console.log(`  - ${line}`);

for (const pid of targets.keys()) {
  try { process.kill(pid, 'SIGTERM'); } catch { /* already gone */ }
}

const deadline = Date.now() + 8000;
while (Date.now() < deadline) {
  if (pidsOnPort().filter((p) => !protectedPids.has(p)).length === 0) break;
  execSync('sleep 0.2');
}

for (const pid of targets.keys()) {
  if (alive(pid)) {
    console.log(`[free-port] force killing ${pid}`);
    try { process.kill(pid, 'SIGKILL'); } catch { /* already gone */ }
  }
}

const stillThere = pidsOnPort().filter((p) => !protectedPids.has(p));
if (stillThere.length) {
  console.error(`[free-port] port ${PORT} still held by ${stillThere.join(', ')} — aborting.`);
  process.exit(1);
}

console.log(`[free-port] port ${PORT} is free.`);
