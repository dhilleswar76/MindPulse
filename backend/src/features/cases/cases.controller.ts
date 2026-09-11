import { Response } from 'express';
import { AuthRequest } from '../../types/index.js';
import { casesService } from './cases.service.js';
import { caseStageService } from './caseStage.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

export const casesController = {
  getCases: async (req: AuthRequest, res: Response) => {
    try {
      const { stage, district, status } = req.query;
      const cases = await casesService.getCases({
        stage: stage as string,
        district: district as string,
        status: status as string,
      });
      res.json({ success: true, cases });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch cases' });
    }
  },

  getCaseById: async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const caseItem = await casesService.getCaseById(id);
      res.json({ success: true, case: caseItem });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch case details' });
    }
  },

  updateCaseStage: async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { stage, note } = req.body;

      // Only ADMIN is authorized to directly confirm/reopen a stage
      if (req.user?.role !== 'ADMIN') {
        return sendError(
          res,
          'Unauthorized: Direct case-stage modifications require District Welfare Admin confirmation. Counselors must submit a Stage Transition Request.',
          403
        );
      }

      const result = await caseStageService.reopenStage(
        req.user,
        id,
        stage,
        note || 'Direct administrative stage update'
      );
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to update case stage', 400);
    }
  },

  getCaseTimeline: async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const timeline = await casesService.getCaseJourneyTimeline(id);
      res.json({ success: true, timeline });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch case timeline' });
    }
  },

  createStageTransitionRequest: async (req: AuthRequest, res: Response) => {
    try {
      const { id: caseId } = req.params;
      const { requestedStage, reason, evidenceReference, notes } = req.body;

      if (!req.user) {
        return sendError(res, 'Authentication required', 401);
      }

      const newRequest = await caseStageService.submitTransitionRequest(req.user, caseId, {
        requestedStage,
        reason,
        evidenceReference,
        notes,
      });

      return sendSuccess(
        res,
        { request: newRequest },
        'Your stage transition request has been submitted for official review. The case stage will change only after authorized confirmation.',
        201
      );
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to submit stage transition request', 400);
    }
  },

  getStageTransitionRequests: async (req: AuthRequest, res: Response) => {
    try {
      const { id: caseId } = req.params;
      const requests = await caseStageService.getTransitionRequests({ caseId });
      return sendSuccess(res, { requests });
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch transition requests', 400);
    }
  },
};
