import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { AppError } from '../../utils/errors';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.createUser(req.body);
      res.status(201).json({
        success: true,
        data: user,
        message: 'User created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const ip = req.ip;
      const userAgent = req.headers['user-agent'];

      const result = await authService.login({ email, password }, ip, userAgent);

      res.json({
        success: true,
        data: result,
        message: 'Login successful',
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        throw new AppError(400, 'Refresh token required');
      }

      const tokens = await authService.refreshToken(refreshToken);

      res.json({
        success: true,
        data: tokens,
        message: 'Token refreshed',
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const refreshToken = req.body.refreshToken;

      if (userId) {
        await authService.logout(userId, refreshToken);
      }

      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError(401, 'Not authenticated');
      }

      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(userId, currentPassword, newPassword);

      res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError(401, 'Not authenticated');
      }

      const user = await authService.updateProfile(userId, req.body);

      res.json({
        success: true,
        data: user,
        message: 'Profile updated',
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError(401, 'Not authenticated');
      }

      const user = await authService.getMe(userId);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async getFeatures(req: Request, res: Response, next: NextFunction) {
    try {
      const features = await authService.getActiveFeatures();
      res.json({
        success: true,
        data: { features },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
