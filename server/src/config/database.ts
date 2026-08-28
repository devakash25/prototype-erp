import { PrismaClient } from '@prisma/client';
import { env } from './env';
import { logger } from '../utils/logger';

// In serverless (Vercel), cache PrismaClient globally to avoid connection exhaustion
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasourceUrl: env.DATABASE_URL,
});

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error({ err: error }, 'Database connection failed');
    // Don't exit in serverless — let Vercel handle cold starts
    if (env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info('Database disconnected');
}
