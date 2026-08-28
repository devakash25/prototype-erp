import { Request, Response, NextFunction } from 'express';
import { getRedis, isRedisAvailable } from '../config/redis';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';

interface RateLimitOptions {
  windowMs: number;    // Time window in milliseconds
  max: number;         // Max requests per window
  message?: string;
  keyGenerator?: (req: Request) => string;
  skip?: (req: Request) => boolean;
}

// Default rate limiter
export function rateLimit(options: RateLimitOptions) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100,
    message = 'Too many requests, please try again later',
    keyGenerator = (req) => req.ip || req.connection.remoteAddress || 'unknown',
    skip = () => false,
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (skip(req)) {
        return next();
      }

      const key = `ratelimit:${keyGenerator(req)}`;
      const windowStart = Date.now();
      const windowEnd = windowStart + windowMs;

      // Use Redis pipeline for atomic operations
      const client = getRedis();
      if (!client) {
        return next(); // No Redis, skip rate limiting
      }
      const pipeline = client.pipeline();
      pipeline.zremrangebyscore(key, 0, windowStart - windowMs);
      pipeline.zadd(key, windowStart, `${windowStart}:${Math.random()}`);
      pipeline.zcard(key);
      pipeline.pexpire(key, windowMs);

      const results = await pipeline.exec();
      const requestCount = results?.[2]?.[1] as number || 0;

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - requestCount));
      res.setHeader('X-RateLimit-Reset', Math.ceil(windowEnd / 1000));

      if (requestCount > max) {
        logger.warn({ key, requestCount, max }, 'Rate limit exceeded');
        throw new AppError(429, message);
      }

      next();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      // If Redis is down, allow the request
      next();
    }
  };
}

// Pre-configured rate limiters
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many API requests, please try again later',
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many login attempts, please try again after 15 minutes',
  keyGenerator: (req) => {
    const email = req.body?.email || 'unknown';
    return `auth:${email}:${req.ip}`;
  },
});

export const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: 'Too many requests, please slow down',
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  message: 'Upload limit exceeded, please try again later',
});

// Password reset rate limiter
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: 'Too many password reset attempts, please try again after 1 hour',
  keyGenerator: (req) => `passwordreset:${req.body?.email || req.ip}`,
});
