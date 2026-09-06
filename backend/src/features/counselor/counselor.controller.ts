import { Response } from 'express';
import { counselorService } from './counselor.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { AuthRequest } from '../../types/index.js';

export const counselorController = {
  getCases: async (req: AuthRequest, res: Response) => {
    try {
      const cases = await counselorService.getCases();
      return sendSuccess(res, { cases });
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },

  getCaseDetails: async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const caseItem = await counselorService.getCaseById(id);
      return sendSuccess(res, { case: caseItem });
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },

  getAiSummary: async (req: AuthRequest, res: Response) => {
    try {
      const { userId } = req.params;
      const summary = await counselorService.generateAiSummary(userId);
      return sendSuccess(res, summary);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },
};
