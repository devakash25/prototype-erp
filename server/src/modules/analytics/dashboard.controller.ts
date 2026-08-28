import { Request, Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service';
import { AppError } from '../../utils/errors';

interface DateRange {
  from?: Date;
  to?: Date;
}

function parseDateRange(req: Request): DateRange {
  const from = req.query.from ? new Date(req.query.from as string) : undefined;
  const to = req.query.to ? new Date(req.query.to as string) : undefined;
  return { from, to };
}

export class DashboardController {
  async getExecutiveSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const institutionId = req.user?.institutionId;
      if (!institutionId) {
        throw new AppError(400, 'Institution not found');
      }

      const { from, to } = parseDateRange(req);
      const data = await dashboardService.getExecutiveSummary(institutionId, { from, to });

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

      const { from, to } = parseDateRange(req);
      const data = await dashboardService.getRevenueAnalytics(institutionId, { from, to });

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

      const { from, to } = parseDateRange(req);
      const data = await dashboardService.getAttendanceAnalytics(institutionId, { from, to });

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

      const { from, to } = parseDateRange(req);
      const data = await dashboardService.getAdmissionAnalytics(institutionId, { from, to });

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

      const { from, to } = parseDateRange(req);
      const data = await dashboardService.getAcademicAnalytics(institutionId, { from, to });

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

      const { from, to } = parseDateRange(req);
      const data = await dashboardService.getHelpdeskAnalytics(institutionId, { from, to });

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

      const { from, to } = parseDateRange(req);
      const data = await dashboardService.getWorkflowAnalytics(institutionId, { from, to });

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
      const { from, to } = parseDateRange(req);
      const data = await dashboardService.getRecentActivity(institutionId, limit, { from, to });

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
