import app from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { logger } from './utils/logger';

async function bootstrap(): Promise<void> {
  try {
    // Connect to database
    await connectDatabase();

    // Connect to Redis
    await connectRedis();

    // Start server
    const port = parseInt(env.PORT, 10);
    app.listen(port, () => {
      logger.info(`🚀 DEV ERP Server running on port ${port}`);
      logger.info(`📝 Environment: ${env.NODE_ENV}`);
      logger.info(`🔗 API: http://localhost:${port}/api/v1`);
    });
  } catch (error) {
    logger.error('Failed to start server: ' + (error as Error).message);
    process.exit(1);
  }
}

// Graceful shutdown
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
