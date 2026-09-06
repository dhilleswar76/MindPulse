import { Response } from 'express';
import { alertService } from './alerts.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { AuthRequest } from '../../types/index.js';

export const alertController = {
  getAlerts: async (req: AuthRequest, res: Response) => {
    try {
      const alerts = await alertService.getOpenAlerts();
      return sendSuccess(res, { alerts });
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },

  updateStatus: async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await alertService.updateAlertStatus(id, status);
      return sendSuccess(res, { success: true });
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },
};
