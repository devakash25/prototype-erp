import { prisma } from '../../config/database';
import { NotFoundError } from '../../utils/errors';
import { logger } from '../../utils/logger';
import { Prisma, NotificationTarget, NotificationPriority, AnnouncementType } from '@prisma/client';

interface CreateNotificationInput {
  title: string;
  message: string;
  type?: string;
  target: NotificationTarget;
  priority?: NotificationPriority;
  isScheduled?: boolean;
  scheduledAt?: Date;
  targetUserIds?: string[];
  departmentId?: string;
}

interface CreateAnnouncementInput {
  title: string;
  content: string;
  type: AnnouncementType;
  target: NotificationTarget;
  priority?: NotificationPriority;
  isPublished?: boolean;
  expiresAt?: Date;
  attachments?: any;
}

export class NotificationService {
  async createNotification(data: CreateNotificationInput, senderId: string, institutionId: string) {
    // Get target users based on target type
    let targetUserIds: string[] = [];

    if (data.target === 'SPECIFIC_USERS' && data.targetUserIds) {
      targetUserIds = data.targetUserIds;
    } else if (data.target !== 'ALL') {
      const roleMapping: Record<string, string[]> = {
        STUDENTS: ['STUDENT'],
        EMPLOYEES: ['PRINCIPAL', 'TEACHER', 'ACCOUNTANT', 'ADMISSION_COUNSELLOR', 'LIBRARIAN', 'HOSTEL_WARDEN', 'TRANSPORT_MANAGER', 'ADMINISTRATIVE_STAFF'],
        TEACHERS: ['TEACHER'],
        PARENTS: ['PARENT'],
      };

      const roles = roleMapping[data.target] || [];
      const users = await prisma.user.findMany({
        where: {
          institutionId,
          role: { in: roles as any[] },
          isActive: true,
        },
        select: { id: true },
      });
      targetUserIds = users.map(u => u.id);
    } else {
      // ALL users
      const users = await prisma.user.findMany({
        where: { institutionId, isActive: true },
        select: { id: true },
      });
      targetUserIds = users.map(u => u.id);
    }

    const notification = await prisma.notification.create({
      data: {
        institutionId,
        senderId,
        title: data.title,
        message: data.message,
        type: (data.type as any) || 'INFO',
        target: data.target,
        priority: data.priority || 'NORMAL',
        isScheduled: data.isScheduled || false,
        scheduledAt: data.scheduledAt,
        isSent: !data.isScheduled,
        sentAt: data.isScheduled ? null : new Date(),
        recipients: {
          create: targetUserIds.map(userId => ({
            userId,
          })),
        },
      },
      include: {
        _count: { select: { recipients: true } },
      },
    });

    logger.info({ notificationId: notification.id, target: data.target, recipientCount: targetUserIds.length }, 'Notification created');
    return notification;
  }

  async getNotifications(institutionId: string, page = 1, limit = 20) {
    const [items, total, sent, pending] = await Promise.all([
      prisma.notification.findMany({
        where: { institutionId },
        include: {
          sender: {
            select: { id: true, fullName: true, avatar: true },
          },
          _count: { select: { recipients: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({ where: { institutionId } }),
      prisma.notification.count({ where: { institutionId, isSent: true } }),
      prisma.notification.count({ where: { institutionId, isScheduled: true, isSent: false } }),
    ]);

    return {
      notifications: items,
      stats: { total, sent, pending },
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateNotification(id: string, data: { title?: string; message?: string; type?: string; target?: string; scheduledAt?: Date }) {
    const notification = await prisma.notification.update({
      where: { id },
      data: {
        ...data,
        type: data.type as any,
        target: data.target as any,
      },
      include: {
        sender: {
          select: { id: true, fullName: true, avatar: true },
        },
        _count: { select: { recipients: true } },
      },
    });

    return notification;
  }

  async getUserNotifications(userId: string, unreadOnly = false) {
    const notifications = await prisma.userNotification.findMany({
      where: {
        userId,
        ...(unreadOnly && { isRead: false }),
      },
      include: {
        notification: {
          include: {
            sender: {
              select: { id: true, fullName: true, avatar: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return notifications;
  }

  async markAsRead(notificationId: string, userId: string) {
    await prisma.userNotification.updateMany({
      where: { notificationId, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    await prisma.userNotification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async getUnreadCount(userId: string) {
    const count = await prisma.userNotification.count({
      where: { userId, isRead: false },
    });
    return count;
  }

  async deleteNotification(id: string) {
    await prisma.notification.delete({ where: { id } });
    logger.info({ notificationId: id }, 'Notification deleted');
  }

  async getChannels(institutionId: string) {
    const setting = await prisma.institutionSetting.findUnique({
      where: { institutionId_key: { institutionId, key: 'notification_channels' } },
    });
    const val = setting?.value;
    return (typeof val === 'object' && val !== null ? val : { email: true, sms: false, push: true, inApp: true }) as any;
  }

  async getNotificationStats(institutionId: string) {
    const [total, sent, read] = await Promise.all([
      prisma.notification.count({ where: { institutionId } }),
      prisma.notification.count({ where: { institutionId, isSent: true } }),
      prisma.userNotification.count({ where: { notification: { institutionId }, isRead: true } }),
    ]);
    return { total, sent, read, unread: total - read };
  }

  async updateChannels(institutionId: string, channels: any) {
    await prisma.institutionSetting.upsert({
      where: { institutionId_key: { institutionId, key: 'notification_channels' } },
      update: { value: channels },
      create: { institutionId, key: 'notification_channels', value: channels },
    });
    return channels;
  }
}

export class AnnouncementService {
  async createAnnouncement(data: CreateAnnouncementInput, authorId: string, institutionId: string) {
    const announcement = await prisma.announcement.create({
      data: {
        institutionId,
        authorId,
        title: data.title,
        content: data.content,
        type: data.type,
        target: data.target,
        priority: data.priority || 'NORMAL',
        isPublished: data.isPublished ?? true,
        publishedAt: data.isPublished !== false ? new Date() : null,
        expiresAt: data.expiresAt,
        attachments: data.attachments,
      },
      include: {
        author: {
          select: { id: true, fullName: true, avatar: true },
        },
      },
    });

    logger.info({ announcementId: announcement.id, type: data.type }, 'Announcement created');
    return announcement;
  }

  async getAnnouncements(institutionId: string, page = 1, limit = 20) {
    const [items, total, published, draft] = await Promise.all([
      prisma.announcement.findMany({
        where: { institutionId },
        include: {
          author: {
            select: { id: true, fullName: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.announcement.count({ where: { institutionId } }),
      prisma.announcement.count({ where: { institutionId, isPublished: true } }),
      prisma.announcement.count({ where: { institutionId, isPublished: false } }),
    ]);

    const announcements = items.map(a => ({
      ...a,
      status: a.isPublished ? 'PUBLISHED' : (a.expiresAt && a.expiresAt < new Date() ? 'ARCHIVED' : 'DRAFT'),
    }));

    return {
      announcements,
      stats: { total, published, draft },
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAnnouncementById(id: string) {
    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, fullName: true, avatar: true },
        },
      },
    });

    if (!announcement) {
      throw new NotFoundError('Announcement');
    }

    return announcement;
  }

  async updateAnnouncement(id: string, data: Partial<CreateAnnouncementInput>) {
    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        ...data,
        ...(data.isPublished && { publishedAt: new Date() }),
      },
      include: {
        author: {
          select: { id: true, fullName: true, avatar: true },
        },
      },
    });

    return announcement;
  }

  async deleteAnnouncement(id: string) {
    await prisma.announcement.delete({ where: { id } });
    logger.info({ announcementId: id }, 'Announcement deleted');
  }

  async getAnnouncementStats(institutionId: string) {
    const [total, published, byType] = await Promise.all([
      prisma.announcement.count({ where: { institutionId } }),
      prisma.announcement.count({ where: { institutionId, isPublished: true } }),
      prisma.announcement.groupBy({
        by: ['type'],
        where: { institutionId },
        _count: { type: true },
      }),
    ]);

    return {
      total,
      published,
      unpublished: total - published,
      byType: byType.reduce((acc, item) => {
        acc[item.type] = item._count.type;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}

export const notificationService = new NotificationService();
export const announcementService = new AnnouncementService();
