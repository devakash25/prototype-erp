import { Request, Response, NextFunction } from 'express';
import { notificationService, announcementService } from './notifications.service';
import { AppError } from '../../utils/errors';

export class NotificationController {
  async createNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const institutionId = req.user?.institutionId;
      if (!userId || !institutionId) {
        throw new AppError(401, 'Not authenticated');
      }

      const notification = await notificationService.createNotification(
        req.body,
        userId,
        institutionId
      );

      res.status(201).json({
        success: true,
        data: notification,
        message: 'Notification sent successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const institutionId = req.user?.institutionId;
      if (!institutionId) {
        throw new AppError(400, 'Institution not found');
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await notificationService.getNotifications(institutionId, page, limit);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError(401, 'Not authenticated');
      }

      const unreadOnly = req.query.unreadOnly === 'true';
      const notifications = await notificationService.getUserNotifications(userId, unreadOnly);

      res.json({
        success: true,
        data: notifications,
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError(401, 'Not authenticated');
      }

      await notificationService.markAsRead(req.params.id as string, userId);

      res.json({
        success: true,
        message: 'Notification marked as read',
      });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError(401, 'Not authenticated');
      }

      await notificationService.markAllAsRead(userId);

      res.json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError(401, 'Not authenticated');
      }

      const count = await notificationService.getUnreadCount(userId);

      res.json({
        success: true,
        data: { count },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const notification = await notificationService.updateNotification(
        req.params.id as string,
        req.body
      );

      res.json({
        success: true,
        data: notification,
        message: 'Notification updated',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteNotification(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationService.deleteNotification(req.params.id as string);

      res.json({
        success: true,
        message: 'Notification deleted',
      });
    } catch (error) {
      next(error);
    }
  }

  async getChannels(req: Request, res: Response, next: NextFunction) {
    try {
      const institutionId = req.user?.institutionId;
      if (!institutionId) throw new AppError(401, 'Not authenticated');
      const data = await notificationService.getChannels(institutionId);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  async getNotificationStats(req: Request, res: Response, next: NextFunction) {
    try {
      const institutionId = req.user?.institutionId;
      if (!institutionId) throw new AppError(401, 'Not authenticated');
      const data = await notificationService.getNotificationStats(institutionId);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  async updateChannels(req: Request, res: Response, next: NextFunction) {
    try {
      const institutionId = req.user?.institutionId;
      if (!institutionId) throw new AppError(401, 'Not authenticated');
      const data = await notificationService.updateChannels(institutionId, req.body);
      res.json({ success: true, data, message: 'Channels updated' });
    } catch (error) { next(error); }
  }
}

export class AnnouncementController {
  async createAnnouncement(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const institutionId = req.user?.institutionId;
      if (!userId || !institutionId) {
        throw new AppError(401, 'Not authenticated');
      }

      const announcement = await announcementService.createAnnouncement(
        req.body,
        userId,
        institutionId
      );

      res.status(201).json({
        success: true,
        data: announcement,
        message: 'Announcement created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getAnnouncements(req: Request, res: Response, next: NextFunction) {
    try {
      const institutionId = req.user?.institutionId;
      if (!institutionId) {
        throw new AppError(400, 'Institution not found');
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await announcementService.getAnnouncements(institutionId, page, limit);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAnnouncementById(req: Request, res: Response, next: NextFunction) {
    try {
      const announcement = await announcementService.getAnnouncementById(req.params.id as string);

      res.json({
        success: true,
        data: announcement,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAnnouncement(req: Request, res: Response, next: NextFunction) {
    try {
      const announcement = await announcementService.updateAnnouncement(
        req.params.id as string,
        req.body
      );

      res.json({
        success: true,
        data: announcement,
        message: 'Announcement updated',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAnnouncement(req: Request, res: Response, next: NextFunction) {
    try {
      await announcementService.deleteAnnouncement(req.params.id as string);

      res.json({
        success: true,
        message: 'Announcement deleted',
      });
    } catch (error) {
      next(error);
    }
  }

  async getAnnouncementStats(req: Request, res: Response, next: NextFunction) {
    try {
      const institutionId = req.user?.institutionId;
      if (!institutionId) {
        throw new AppError(400, 'Institution not found');
      }

      const stats = await announcementService.getAnnouncementStats(institutionId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
export const announcementController = new AnnouncementController();
