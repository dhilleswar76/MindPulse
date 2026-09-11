import { Response } from 'express';
import { AuthRequest } from '../../types/index.js';
import { notificationsService } from './notifications.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

export const notificationsController = {
  getNotifications: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return sendError(res, 'Authentication required', 401);
      }
      const data = await notificationsService.getNotifications(req.user);
      return sendSuccess(res, data);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch notifications', 400);
    }
  },

  markAsRead: async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const updated = await notificationsService.markAsRead(id);
      return sendSuccess(res, { notification: updated });
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to mark notification as read', 400);
    }
  },

  markAllAsRead: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return sendError(res, 'Authentication required', 401);
      }
      const result = await notificationsService.markAllAsRead(req.user);
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to mark all notifications as read', 400);
    }
  },
};
