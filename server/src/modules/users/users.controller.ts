import { Request, Response, NextFunction } from 'express';
import { userService } from './users.service';
import { AppError } from '../../utils/errors';

export class UserController {
  async createAuthority(req: Request, res: Response, next: NextFunction) {
    try {
      const institutionId = req.user?.institutionId;
      if (!institutionId) {
        throw new AppError(401, 'Not authenticated');
      }

      const user = await userService.createAuthority(req.body, institutionId);

      res.status(201).json({
        success: true,
        data: user,
        message: 'Authority created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const institutionId = req.user?.institutionId;
      if (!institutionId) {
        throw new AppError(400, 'Institution not found');
      }

      const filters = {
        role: req.query.role as any,
        isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
        search: req.query.search as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
      };

      const result = await userService.getUsers(filters, institutionId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getUserById(req.params.id as string);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.updateUser(req.params.id as string, req.body);

      res.json({
        success: true,
        data: user,
        message: 'User updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async toggleUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.toggleUserStatus(req.params.id as string);

      res.json({
        success: true,
        data: user,
        message: `User ${user.isActive ? 'activated' : 'deactivated'}`,
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { newPassword } = req.body;
      await userService.resetPassword(req.params.id as string, newPassword);

      res.json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserStats(req: Request, res: Response, next: NextFunction) {
    try {
      const institutionId = req.user?.institutionId;
      if (!institutionId) {
        throw new AppError(400, 'Institution not found');
      }

      const stats = await userService.getUserStats(institutionId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
