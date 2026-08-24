import { Router } from 'express';
import { notificationController, announcementController } from './notifications.controller';
import { validate } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import {
  createNotificationSchema,
  createAnnouncementSchema,
  updateAnnouncementSchema,
} from './notifications.validation';

const router = Router();

router.use(authenticate);

// Notifications
router.post(
  '/',
  authorize('CHIEF_HEAD', 'DIRECTOR', 'PRINCIPAL'),
  validate(createNotificationSchema),
  notificationController.createNotification
);
router.get('/', notificationController.getNotifications);
router.get('/my', notificationController.getUserNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/:id/read', notificationController.markAsRead);
router.patch('/read-all', notificationController.markAllAsRead);
router.delete('/:id', notificationController.deleteNotification);

export default router;

// Announcements
export const announcementRouter = Router();

announcementRouter.use(authenticate);

announcementRouter.post(
  '/',
  authorize('CHIEF_HEAD', 'DIRECTOR', 'PRINCIPAL'),
  validate(createAnnouncementSchema),
  announcementController.createAnnouncement
);
announcementRouter.get('/', announcementController.getAnnouncements);
announcementRouter.get('/stats', announcementController.getAnnouncementStats);
announcementRouter.get('/:id', announcementController.getAnnouncementById);
announcementRouter.put(
  '/:id',
  authorize('CHIEF_HEAD', 'DIRECTOR', 'PRINCIPAL'),
  validate(updateAnnouncementSchema),
  announcementController.updateAnnouncement
);
announcementRouter.delete(
  '/:id',
  authorize('CHIEF_HEAD', 'DIRECTOR', 'PRINCIPAL'),
  announcementController.deleteAnnouncement
);
