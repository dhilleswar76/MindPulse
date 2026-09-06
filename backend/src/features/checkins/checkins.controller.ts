import { Response } from 'express';
import { checkinService } from './checkins.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { AuthRequest } from '../../types/index.js';

export const checkinController = {
  createCheckIn: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const result = await checkinService.createCheckIn(userId, req.body);
      return sendSuccess(res, result, 'Check-in recorded successfully', 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },

  getCheckIns: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const history = await checkinService.getUserCheckIns(userId);
      return sendSuccess(res, { history });
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },

  getBaselineAndTrend: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const data = await checkinService.getBaselineAndTrend(userId);
      return sendSuccess(res, data);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },
};
