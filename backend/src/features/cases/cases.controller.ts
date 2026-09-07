import { Response } from 'express';
import { AuthRequest } from '../../types/index.js';
import { casesService } from './cases.service.js';

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
      const updated = await casesService.updateCaseStage(id, stage, note);
      res.json({ success: true, case: updated });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to update case stage' });
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
};
