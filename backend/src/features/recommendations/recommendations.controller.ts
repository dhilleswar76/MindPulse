import { Response } from 'express';
import { recommendationService } from './recommendations.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { AuthRequest } from '../../types/index.js';

export const recommendationController = {
  getRecommendations: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const recommendations = await recommendationService.getPersonalized(userId);
      return sendSuccess(res, { recommendations });
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },
};
