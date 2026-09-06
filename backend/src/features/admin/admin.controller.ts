import { Response } from 'express';
import { adminService } from './admin.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { AuthRequest } from '../../types/index.js';

export const adminController = {
  getAuditLogs: async (req: AuthRequest, res: Response) => {
    try {
      const logs = await adminService.getAuditLogs();
      return sendSuccess(res, { logs });
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },

  getStatus: async (req: AuthRequest, res: Response) => {
    try {
      const status = await adminService.getSystemStatus();
      return sendSuccess(res, status);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },
};
