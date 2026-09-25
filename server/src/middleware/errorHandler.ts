import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

const PRISMA_STATUS: Record<string, { statusCode: number; message?: string }> = {
  P2025: { statusCode: 404, message: 'Record not found' },
  P2016: { statusCode: 404, message: 'Record not found' },
  P2017: { statusCode: 404, message: 'Related record not found' },
  P2002: { statusCode: 409, message: 'Duplicate value violates a unique constraint' },
  P2024: { statusCode: 503, message: 'Database is busy, please try again' },
  P1001: { statusCode: 503, message: 'Database is temporarily unavailable, please try again' },
  P1002: { statusCode: 503, message: 'Database is temporarily unavailable, please try again' },
  P1008: { statusCode: 503, message: 'Database operation timed out, please try again' },
  P1017: { statusCode: 503, message: 'Database is temporarily unavailable, please try again' },
};

const TRANSIENT_PRISMA_CODES = new Set(['P2024', 'P1001', 'P1002', 'P1008', 'P1017']);

export function errorHandler(
  err: Error & { code?: string },
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Retry idempotent GETs once when the database pool is exhausted or briefly
  // unreachable (Supabase pooler blips) instead of surfacing a 503.
  if (
    err.code &&
    TRANSIENT_PRISMA_CODES.has(err.code) &&
    req.method === 'GET' &&
    !res.headersSent &&
    !(req as Request & { __dbRetry?: boolean }).__dbRetry
  ) {
    (req as Request & { __dbRetry?: boolean }).__dbRetry = true;
    logger.warn({ code: err.code, path: req.path }, 'Retrying GET after transient database error');
    const dispatch = (req.app as unknown as {
      handle: (rq: Request, rs: Response, done: NextFunction) => void;
    }).handle;
    setTimeout(() => dispatch(req, res, next), 500);
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        statusCode: err.statusCode,
      },
    });
    return;
  }

  const prismaError = err.code ? PRISMA_STATUS[err.code] : undefined;
  const isNotFound = /not found/i.test(err.message || '');

  if (prismaError?.statusCode || isNotFound) {
    const statusCode = prismaError?.statusCode || 404;
    const message = prismaError?.message || err.message;
    if (statusCode >= 500) {
      logger.error({ err, req }, 'Database error');
    }
    res.status(statusCode).json({
      success: false,
      error: { message, statusCode },
    });
    return;
  }

  logger.error({ err, req }, 'Unhandled error');

  res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
      statusCode: 500,
    },
  });
}
