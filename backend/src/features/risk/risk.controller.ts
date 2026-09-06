import { Response } from 'express';
import { riskService } from './risk.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { AuthRequest } from '../../types/index.js';

export const riskController = {
  getCurrentRisk: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const risk = await riskService.getCurrentRisk(userId);
      return sendSuccess(res, { risk });
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },

  getRiskHistory: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const history = await riskService.getRiskHistory(userId);
      return sendSuccess(res, { history });
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },
};
