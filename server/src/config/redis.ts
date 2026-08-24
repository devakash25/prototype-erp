import Redis from 'ioredis';
import { env } from './env';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times: number) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  enableOfflineQueue: false,
});

let redisAvailable = true;

redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
  redisAvailable = true;
});

redis.on('error', () => {
  redisAvailable = false;
});

export function isRedisAvailable() {
  return redisAvailable;
}

export async function connectRedis(): Promise<void> {
  try {
    await redis.ping();
  } catch (error) {
    console.warn('⚠️ Redis not available - running without cache');
    redisAvailable = false;
  }
}

// Safe wrappers that don't throw when Redis is down
export async function safeSetex(key: string, ttl: number, value: string): Promise<void> {
  if (!redisAvailable) return;
  try { await redis.setex(key, ttl, value); } catch { /* ignore */ }
}

export async function safeGet(key: string): Promise<string | null> {
  if (!redisAvailable) return null;
  try { return await redis.get(key); } catch { return null; }
}

export async function safeDel(key: string): Promise<void> {
  if (!redisAvailable) return;
  try { await redis.del(key); } catch { /* ignore */ }
}
