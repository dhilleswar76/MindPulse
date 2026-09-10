import { Response } from 'express';
import { userService } from './users.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { AuthRequest } from '../../types/index.js';

export const userController = {
  getProfile: async (req: AuthRequest, res: Response) => {
    try {
      const user = await userService.getProfile(req.user!.userId);
      return sendSuccess(res, { user });
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },

  supportChat: async (req: AuthRequest, res: Response) => {
    try {
      const { message, history } = req.body;
      if (!message) return sendError(res, 'Message is required', 400);

      const userId = req.user?.userId || 'demo_user_1';
      const response = await userService.supportAssistantChat(userId, message, history || []);
      return sendSuccess(res, response);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },
};
