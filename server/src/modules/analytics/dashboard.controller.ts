import { Request, Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service';
import { AppError } from '../../utils/errors';

export class DashboardController {
  async getExecutiveSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const institutionId = req.user?.institutionId;
      if (!institutionId) {
        throw new AppError(400, 'Institution not found');
      }

      const data = await dashboardService.getExecutiveSummary(institutionId);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRevenueAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const institutionId = req.user?.institutionId;
      if (!institutionId) {
        throw new AppError(400, 'Institution not found');
      }

      const data = await dashboardService.getRevenueAnalytics(institutionId);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAttendanceAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const institutionId = req.user?.institutionId;
      if (!institutionId) {
        throw new AppError(400, 'Institution not found');
      }

      const data = await dashboardService.getAttendanceAnalytics(institutionId);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAdmissionAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const institutionId = req.user?.institutionId;
      if (!institutionId) {
        throw new AppError(400, 'Institution not found');
      }

      const data = await dashboardService.getAdmissionAnalytics(institutionId);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAcademicAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const institutionId = req.user?.institutionId;
      if (!institutionId) {
        throw new AppError(400, 'Institution not found');
      }

      const data = await dashboardService.getAcademicAnalytics(institutionId);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getHRAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const institutionId = req.user?.institutionId;
      if (!institutionId) {
        throw new AppError(400, 'Institution not found');
      }

      const data = await dashboardService.getHRAnalytics(institutionId);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getHostelAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const institutionId = req.user?.institutionId;
      if (!institutionId) {
        throw new AppError(400, 'Institution not found');
      }

      const data = await dashboardService.getHostelAnalytics(institutionId);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTransportAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const institutionId = req.user?.institutionId;
      if (!institutionId) {
        throw new AppError(400, 'Institution not found');
      }

      const data = await dashboardService.getTransportAnalytics(institutionId);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getLibraryAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const institutionId = req.user?.institutionId;
      if (!institutionId) {
        throw new AppError(400, 'Institution not found');
      }

      const data = await dashboardService.getLibraryAnalytics(institutionId);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getHelpdeskAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const institutionId = req.user?.institutionId;
      if (!institutionId) {
        throw new AppError(400, 'Institution not found');
      }

      const data = await dashboardService.getHelpdeskAnalytics(institutionId);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getWorkflowAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const institutionId = req.user?.institutionId;
      if (!institutionId) {
        throw new AppError(400, 'Institution not found');
      }

      const data = await dashboardService.getWorkflowAnalytics(institutionId);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getNotificationAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const institutionId = req.user?.institutionId;
      if (!institutionId) {
        throw new AppError(400, 'Institution not found');
      }

      const data = await dashboardService.getNotificationAnalytics(institutionId);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getInstitutionHealthScore(req: Request, res: Response, next: NextFunction) {
    try {
      const institutionId = req.user?.institutionId;
      if (!institutionId) {
        throw new AppError(400, 'Institution not found');
      }

      const data = await dashboardService.getInstitutionHealthScore(institutionId);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRecentActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const institutionId = req.user?.institutionId;
      if (!institutionId) {
        throw new AppError(400, 'Institution not found');
      }

      const limit = parseInt(req.query.limit as string) || 20;
      const data = await dashboardService.getRecentActivity(institutionId, limit);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
