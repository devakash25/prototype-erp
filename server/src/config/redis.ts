import Redis from 'ioredis';
import { env } from './env';
import { logger } from '../utils/logger';

let redis: Redis | null = null;
let redisAvailable = true;

// Lazy init — only connect when actually needed
export function getRedis(): Redis | null {
  if (redis) return redis;
  try {
    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times: number) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      enableOfflineQueue: false,
      connectTimeout: 5000,
      lazyConnect: true,
    });

    redis.on('connect', () => {
      redisAvailable = true;
    });

    redis.on('error', () => {
      redisAvailable = false;
    });

    return redis;
  } catch {
    redisAvailable = false;
    return null;
  }
}

export function isRedisAvailable() {
  return redisAvailable;
}

export async function connectRedis(): Promise<void> {
  const client = getRedis();
  if (!client) return;
  try {
    await client.connect();
    logger.info('Redis connected successfully');
  } catch (error) {
    logger.warn('Redis not available - running without cache');
    redisAvailable = false;
  }
}

// Safe wrappers that don't throw when Redis is down
export async function safeSetex(key: string, ttl: number, value: string): Promise<void> {
  if (!redisAvailable) return;
  const client = getRedis();
  if (!client) return;
  try { await client.setex(key, ttl, value); } catch { /* ignore */ }
}

export async function safeGet(key: string): Promise<string | null> {
  if (!redisAvailable) return null;
  const client = getRedis();
  if (!client) return null;
  try { return await client.get(key); } catch { return null; }
}

export async function safeDel(key: string): Promise<void> {
  if (!redisAvailable) return;
  const client = getRedis();
  if (!client) return;
  try { await client.del(key); } catch { /* ignore */ }
}
