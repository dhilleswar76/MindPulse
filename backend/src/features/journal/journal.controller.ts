import { Response } from 'express';
import { journalService } from './journal.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { AuthRequest } from '../../types/index.js';

export const journalController = {
  createEntry: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const entry = await journalService.createEntry(userId, req.body);
      return sendSuccess(res, { entry }, 'Journal entry saved', 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },

  getEntries: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const entries = await journalService.getUserEntries(userId);
      return sendSuccess(res, { entries });
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },

  deleteEntry: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      await journalService.deleteEntry(userId, req.params.id);
      return sendSuccess(res, { success: true }, 'Entry deleted');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },
};
