import mongoose from 'mongoose';
import { Notification, INotification, NotificationType } from '../../models/Notification.js';
import { TokenPayload } from '../../types/index.js';

// In-memory fallback notifications when MongoDB is offline
const memoryNotifications: any[] = [
  {
    _id: 'notif_init_1',
    recipientRole: 'ADMIN',
    caseId: 'MP-1042',
    stage: 'COURT_TRIAL',
    type: 'STAGE_COMPLETION_REQUESTED',
    title: 'Stage completion approval required',
    message: 'Counsellor Dr. Sarah Jenkins submitted Trial stage for Case MP-1042 for admin approval.',
    submittedBy: 'Dr. Sarah Jenkins',
    status: 'Pending Approval',
    read: false,
    createdAt: new Date(Date.now() - 3600000 * 2),
    updatedAt: new Date(Date.now() - 3600000 * 2),
  },
];

export const notificationsService = {
  createNotification: async (data: {
    recipientRole: 'ADMIN' | 'COUNSELOR' | 'USER';
    recipientId?: mongoose.Types.ObjectId | string;
    caseId?: string;
    stage?: string;
    type: NotificationType;
    title: string;
    message: string;
    submittedBy?: string;
    status?: string;
    rejectionReason?: string;
    requestId?: mongoose.Types.ObjectId | string;
  }) => {
    try {
      const doc = await Notification.create({
        ...data,
        recipientId:
          data.recipientId && mongoose.Types.ObjectId.isValid(data.recipientId.toString())
            ? new mongoose.Types.ObjectId(data.recipientId.toString())
            : undefined,
        requestId:
          data.requestId && mongoose.Types.ObjectId.isValid(data.requestId.toString())
            ? new mongoose.Types.ObjectId(data.requestId.toString())
            : undefined,
      });
      return doc;
    } catch {
      // Memory fallback
      const memNotif = {
        _id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        ...data,
        read: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryNotifications.unshift(memNotif);
      return memNotif;
    }
  },

  getNotifications: async (user: TokenPayload) => {
    try {
      const query: any = {};
      if (user.role === 'ADMIN') {
        // Admin sees all ADMIN notifications
        query.recipientRole = 'ADMIN';
      } else if (user.role === 'COUNSELOR') {
        // Counselor sees COUNSELOR notifications
        query.$or = [
          { recipientRole: 'COUNSELOR' },
          { recipientId: mongoose.Types.ObjectId.isValid(user.userId) ? new mongoose.Types.ObjectId(user.userId) : undefined },
        ].filter(Boolean);
      } else {
        query.recipientRole = 'USER';
        if (mongoose.Types.ObjectId.isValid(user.userId)) {
          query.recipientId = new mongoose.Types.ObjectId(user.userId);
        }
      }

      const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50);
      if (notifications && notifications.length > 0) {
        const unreadCount = notifications.filter((n) => !n.read).length;
        return { notifications, unreadCount };
      }
    } catch {
      // fallback to memory
    }

    let list = [...memoryNotifications];
    if (user.role === 'ADMIN') {
      list = list.filter((n) => n.recipientRole === 'ADMIN');
    } else if (user.role === 'COUNSELOR') {
      list = list.filter((n) => n.recipientRole === 'COUNSELOR');
    } else {
      list = list.filter((n) => n.recipientRole === 'USER');
    }

    const unreadCount = list.filter((n) => !n.read).length;
    return { notifications: list, unreadCount };
  },

  markAsRead: async (notificationId: string) => {
    try {
      if (mongoose.Types.ObjectId.isValid(notificationId)) {
        const updated = await Notification.findByIdAndUpdate(
          notificationId,
          { read: true, readAt: new Date() },
          { new: true }
        );
        if (updated) return updated;
      }
    } catch {
      // ignore
    }

    const item = memoryNotifications.find((n) => n._id.toString() === notificationId);
    if (item) {
      item.read = true;
      item.readAt = new Date();
      return item;
    }

    return { _id: notificationId, read: true, readAt: new Date() };
  },

  markAllAsRead: async (user: TokenPayload) => {
    try {
      const query: any = {};
      if (user.role === 'ADMIN') {
        query.recipientRole = 'ADMIN';
      } else if (user.role === 'COUNSELOR') {
        query.recipientRole = 'COUNSELOR';
      } else {
        query.recipientRole = 'USER';
      }

      await Notification.updateMany(query, { read: true, readAt: new Date() });
    } catch {
      // ignore
    }

    memoryNotifications.forEach((n) => {
      if (
        (user.role === 'ADMIN' && n.recipientRole === 'ADMIN') ||
        (user.role === 'COUNSELOR' && n.recipientRole === 'COUNSELOR') ||
        (user.role === 'USER' && n.recipientRole === 'USER')
      ) {
        n.read = true;
        n.readAt = new Date();
      }
    });

    return { success: true };
  },
};
