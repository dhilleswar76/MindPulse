import { Response } from 'express';
import { adminService } from './admin.service.js';
import { caseStageService } from '../cases/caseStage.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { AuthRequest } from '../../types/index.js';

export const adminController = {
  getKPIs: async (req: AuthRequest, res: Response) => {
    try {
      const filters = {
        dateRange: req.query.dateRange as string,
        riskLevel: req.query.riskLevel as string,
        stage: req.query.stage as string,
        victimType: req.query.victimType as string,
        status: req.query.status as string,
        district: req.query.district as string,
      };
      const kpis = await adminService.getAdminKPIs(filters);
      return sendSuccess(res, kpis);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },

  getAnalytics: async (req: AuthRequest, res: Response) => {
    try {
      const filters = {
        dateRange: req.query.dateRange as string,
        riskLevel: req.query.riskLevel as string,
        stage: req.query.stage as string,
        victimType: req.query.victimType as string,
        status: req.query.status as string,
        district: req.query.district as string,
      };
      const analytics = await adminService.getAdminAnalytics(filters);
      return sendSuccess(res, analytics);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },

  getCases: async (req: AuthRequest, res: Response) => {
    try {
      const params = {
        search: req.query.search as string,
        riskLevel: req.query.riskLevel as string,
        stage: req.query.stage as string,
        victimType: req.query.victimType as string,
        status: req.query.status as string,
        district: req.query.district as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      };
      const result = await adminService.getAdminCases(params);
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },

  getHeatmap: async (req: AuthRequest, res: Response) => {
    try {
      const filters = {
        district: req.query.district as string,
        riskLevel: req.query.riskLevel as string,
      };
      const heatmap = await adminService.getAdminHeatmap(filters);
      return sendSuccess(res, heatmap);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },

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

  // Official Case-Stage Transition Confirmation & Admin Inbox
  getStageTransitionRequests: async (req: AuthRequest, res: Response) => {
    try {
      const { status, caseId, counselorId } = req.query;
      const requests = await caseStageService.getTransitionRequests({
        status: status as string,
        caseId: caseId as string,
        counselorId: counselorId as string,
      });
      return sendSuccess(res, { requests });
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },

  getStageTransitionRequestById: async (req: AuthRequest, res: Response) => {
    try {
      const { requestId } = req.params;
      const requestItem = await caseStageService.getRequestById(requestId);
      return sendSuccess(res, { request: requestItem });
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },

  approveStageTransition: async (req: AuthRequest, res: Response) => {
    try {
      const { requestId } = req.params;
      const { reviewNotes } = req.body;

      if (!req.user) {
        return sendError(res, 'Authentication required', 401);
      }

      const result = await caseStageService.approveTransition(
        req.user,
        requestId,
        reviewNotes
      );
      return sendSuccess(res, {
        message: 'Official case stage transition approved and recorded.',
        ...result,
      });
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },

  rejectStageTransition: async (req: AuthRequest, res: Response) => {
    try {
      const { requestId } = req.params;
      const { reviewNotes } = req.body;

      if (!req.user) {
        return sendError(res, 'Authentication required', 401);
      }

      const result = await caseStageService.rejectTransition(
        req.user,
        requestId,
        reviewNotes
      );
      return sendSuccess(res, {
        message: 'Stage transition request rejected.',
        ...result,
      });
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },

  requestStageTransitionClarification: async (req: AuthRequest, res: Response) => {
    try {
      const { requestId } = req.params;
      const { reviewNotes } = req.body;

      if (!req.user) {
        return sendError(res, 'Authentication required', 401);
      }

      const result = await caseStageService.requestClarification(
        req.user,
        requestId,
        reviewNotes
      );
      return sendSuccess(res, {
        message: 'Clarification requested from counselor.',
        ...result,
      });
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },
};
