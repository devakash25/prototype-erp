import app from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { logger } from './utils/logger';

// Vercel serverless — only connect, don't listen
if (process.env.VERCEL) {
  logger.info('Running in Vercel serverless mode');
  connectDatabase().catch(() => {});
  connectRedis().catch(() => {});
} else {
  // Standalone mode — full bootstrap
  async function bootstrap(): Promise<void> {
    try {
      await connectDatabase();
      await connectRedis();

      const port = parseInt(env.PORT, 10);
      app.listen(port, () => {
        logger.info(`DEV ERP Server running on port ${port}`);
        logger.info(`Environment: ${env.NODE_ENV}`);
        logger.info(`API: http://localhost:${port}/api/v1`);
      });
    } catch (error) {
      logger.error({ err: error }, 'Failed to start server');
      process.exit(1);
    }
  }

  process.on('unhandledRejection', (reason: unknown) => {
    logger.error({ err: reason }, 'Unhandled promise rejection');
  });

  process.on('uncaughtException', (error: Error) => {
    logger.fatal({ err: error }, 'Uncaught exception — shutting down');
    process.exit(1);
  });

  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    await disconnectDatabase();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.info('SIGINT received. Shutting down gracefully...');
    await disconnectDatabase();
    process.exit(0);
  });

  bootstrap();
}
