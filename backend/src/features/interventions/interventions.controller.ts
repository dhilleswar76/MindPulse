import { Response } from 'express';
import { interventionService } from './interventions.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { AuthRequest } from '../../types/index.js';

export const interventionController = {
  createIntervention: async (req: AuthRequest, res: Response) => {
    try {
      const counselorId = req.user!.userId;
      const intervention = await interventionService.createIntervention(counselorId, req.body);
      return sendSuccess(res, { intervention }, 'Intervention recorded', 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },

  getInterventions: async (req: AuthRequest, res: Response) => {
    try {
      const list = await interventionService.getInterventions(req.user!.userId);
      return sendSuccess(res, { interventions: list });
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },

  updateIntervention: async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const updated = await interventionService.updateIntervention(id, req.body);
      return sendSuccess(res, { intervention: updated }, 'Intervention updated');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },

  getOutcomes: async (req: AuthRequest, res: Response) => {
    try {
      const { userId } = req.params;
      const outcomes = await interventionService.getOutcomeHistory(userId);
      return sendSuccess(res, outcomes);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },

  createFollowUp: async (req: AuthRequest, res: Response) => {
    try {
      const { interventionId, userId, dueDate, notes } = req.body;
      const followUp = await interventionService.createFollowUp({
        interventionId,
        userId: userId || req.user!.userId,
        dueDate: dueDate || new Date(),
        notes,
      });
      return sendSuccess(res, { followUp }, 'Follow-up scheduled', 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },

  getFollowUps: async (req: AuthRequest, res: Response) => {
    try {
      const { userId } = req.query;
      const followUps = await interventionService.getFollowUps(userId as string);
      return sendSuccess(res, { followUps });
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },
};

