import { Router } from 'express';
import { notificationController, announcementController } from './notifications.controller';
import { validate } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import {
  createNotificationSchema,
  updateNotificationSchema,
  createAnnouncementSchema,
  updateAnnouncementSchema,
} from './notifications.validation';

const router = Router();

router.use(authenticate);

// Notifications — read: all authenticated; write: management only
router.post(
  '/',
  authorize('CHIEF_HEAD', 'PRINCIPAL'),
  validate(createNotificationSchema),
  notificationController.createNotification
);
router.get('/', notificationController.getNotifications);
router.get('/my', notificationController.getUserNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.get('/channels', notificationController.getChannels);
router.get('/stats', notificationController.getNotificationStats);
router.put('/channels', authorize('CHIEF_HEAD'), notificationController.updateChannels);
router.put(
  '/:id',
  authorize('CHIEF_HEAD', 'PRINCIPAL'),
  validate(updateNotificationSchema),
  notificationController.updateNotification
);
router.patch('/:id/read', notificationController.markAsRead);
router.patch('/read-all', notificationController.markAllAsRead);
router.delete('/:id', authorize('CHIEF_HEAD', 'PRINCIPAL'), notificationController.deleteNotification);

export default router;

// Announcements
export const announcementRouter = Router();

announcementRouter.use(authenticate);

announcementRouter.post(
  '/',
  authorize('CHIEF_HEAD', 'PRINCIPAL'),
  validate(createAnnouncementSchema),
  announcementController.createAnnouncement
);
announcementRouter.get('/', announcementController.getAnnouncements);
announcementRouter.get('/stats', announcementController.getAnnouncementStats);
announcementRouter.get('/:id', announcementController.getAnnouncementById);
announcementRouter.put(
  '/:id',
  authorize('CHIEF_HEAD', 'PRINCIPAL'),
  validate(updateAnnouncementSchema),
  announcementController.updateAnnouncement
);
announcementRouter.delete(
  '/:id',
  authorize('CHIEF_HEAD', 'PRINCIPAL'),
  announcementController.deleteAnnouncement
);
