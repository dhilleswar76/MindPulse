import { Response } from 'express';
import { compensationService } from './compensation.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { AuthRequest } from '../../types/index.js';

export const compensationController = {
  getStatutorySchedules: async (_req: AuthRequest, res: Response) => {
    try {
      const schedules = compensationService.getStatutorySchedules();
      return sendSuccess(res, { schedules }, 'Statutory compensation schedules fetched successfully');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },

  calculateCompensation: async (req: AuthRequest, res: Response) => {
    try {
      const result = compensationService.calculateCompensation(req.body);
      return sendSuccess(res, result, 'Compensation calculated successfully');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },

  createClaim: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.userId || 'guest_user';
      const claim = await compensationService.createClaim(userId, req.body);
      return sendSuccess(res, { claim }, 'Victim compensation application submitted successfully to DLSA', 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },

  getUserClaims: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.userId || 'guest_user';
      const claims = await compensationService.getUserClaims(userId);
      return sendSuccess(res, { claims }, 'User compensation claims retrieved successfully');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },
};
