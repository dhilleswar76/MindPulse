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
      const { message } = req.body;
      if (!message) return sendError(res, 'Message is required', 400);

      const response = await userService.supportAssistantChat(req.user!.userId, message);
      return sendSuccess(res, response);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },
};
