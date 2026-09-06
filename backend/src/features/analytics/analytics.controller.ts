import { Response } from 'express';
import { analyticsService } from './analytics.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { AuthRequest } from '../../types/index.js';

export const analyticsController = {
  getOverview: async (req: AuthRequest, res: Response) => {
    try {
      const overview = await analyticsService.getInstitutionalOverview();
      return sendSuccess(res, overview);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },

  getHeatmap: async (req: AuthRequest, res: Response) => {
    try {
      const heatmap = await analyticsService.getHeatmapData();
      return sendSuccess(res, heatmap);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },

  simulate: async (req: AuthRequest, res: Response) => {
    try {
      const result = await analyticsService.simulateIntervention(req.body);
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },
};
