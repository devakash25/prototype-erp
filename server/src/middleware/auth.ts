import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../utils/errors';
import { getTenant } from './tenant.middleware';
import { runWithTenant } from '../config/tenant-context';
import { getSubscriptionInfo, isReadOnlyBlocked } from './subscription.middleware';

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
  institutionId: string;
  institutionType?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'Access denied. No token provided.');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    req.user = decoded;

    void resolveTenantScope(req, res, decoded, next);
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new AppError(401, 'Token expired'));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError(401, 'Invalid token'));
    } else {
      next(error);
    }
  }
}

async function resolveTenantScope(
  req: Request,
  res: Response,
  decoded: AuthPayload,
  next: NextFunction
): Promise<void> {
  try {
    const institutionId = decoded.institutionId || null;

    if (institutionId) {
      const tenant = await getTenant(institutionId);
      if (!tenant) {
        return next(new AppError(401, 'Your institution no longer exists'));
      }
      if (!tenant.isActive) {
        return next(new AppError(403, 'This institution is inactive. Contact your administrator.'));
      }
      req.tenant = tenant;

      const subscription = await getSubscriptionInfo(institutionId);
      req.subscription = subscription;
      res.setHeader('X-Subscription-State', subscription.state);
      if (subscription.graceEndsAt) {
        res.setHeader('X-Subscription-Grace-Ends', subscription.graceEndsAt);
      }

      if (subscription.state === 'readonly' && isReadOnlyBlocked(req)) {
        const plan = subscription.planName ? ` (${subscription.planName})` : '';
        return next(
          new AppError(
            402,
            `Read-only mode: the subscription for this institution${plan} has expired. ` +
              'Renew the plan to restore write access.'
          )
        );
      }
    }

    runWithTenant(institutionId, () => next());
  } catch (error) {
    next(error);
  }
}

export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError(401, 'Authentication required'));
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return next(new AppError(403, 'Insufficient permissions'));
    }

    next();
  };
}

export function generateTokens(payload: AuthPayload) {
  const accessToken = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });

  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
  });

  return { accessToken, refreshToken };
}

export function verifyRefreshToken(token: string): AuthPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as AuthPayload;
}
