import { Response } from 'express';
import { AuthRequest } from '../../types/index.js';
import { counsellingAllocationService } from './counsellingAllocation.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

export const counsellingAllocationController = {
  // Victim: Get own counsellor or unallocated status
  getMyCounsellor: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) return sendError(res, 'Authentication required', 401);
      const data = await counsellingAllocationService.getVictimCounsellorProfile(req.user.userId);
      return sendSuccess(res, data);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch counsellor profile', err.statusCode || 400);
    }
  },

  // Victim: Request a counsellor from Admin
  requestCounsellor: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) return sendError(res, 'Authentication required', 401);
      const { notes } = req.body;
      const result = await counsellingAllocationService.requestCounsellorAsVictim(req.user, notes);
      return sendSuccess(res, result.request, result.message, 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to submit counsellor request', err.statusCode || 400);
    }
  },

  // Counselor: View available unallocated victims
  getAvailableVictims: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) return sendError(res, 'Authentication required', 401);
      const victims = await counsellingAllocationService.getAvailableVictims(req.user);
      return sendSuccess(res, { victims });
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch available victims', err.statusCode || 400);
    }
  },

  // Counselor: View incoming admin requests and outgoing counsellor requests
  getMyCounsellingRequests: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) return sendError(res, 'Authentication required', 401);
      const data = await counsellingAllocationService.getCounselorRequests(req.user);
      return sendSuccess(res, data);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch counselling requests', err.statusCode || 400);
    }
  },

  // Counselor: Request to counsel an unallocated victim (COUNSELLOR_TO_ADMIN)
  requestToCounselVictim: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) return sendError(res, 'Authentication required', 401);
      const { victimId } = req.params;
      const { notes } = req.body;
      const result = await counsellingAllocationService.counselorRequestVictim(
        req.user,
        victimId,
        notes
      );
      return sendSuccess(res, result.request, result.message, 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to request counselling assignment', err.statusCode || 400);
    }
  },

  // Counselor: Accept an Admin allocation request (ADMIN_TO_COUNSELLOR)
  acceptVictimRequest: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) return sendError(res, 'Authentication required', 401);
      const { requestId } = req.params;
      const result = await counsellingAllocationService.counselorRespondRequest(
        req.user,
        requestId,
        'ACCEPT'
      );
      return sendSuccess(res, result.request, result.message);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to accept counselling request', err.statusCode || 400);
    }
  },

  // Counselor: Reject an Admin allocation request
  rejectVictimRequest: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) return sendError(res, 'Authentication required', 401);
      const { requestId } = req.params;
      const { rejectionReason } = req.body;
      const result = await counsellingAllocationService.counselorRespondRequest(
        req.user,
        requestId,
        'REJECT',
        rejectionReason
      );
      return sendSuccess(res, result.request, result.message);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to decline counselling request', err.statusCode || 400);
    }
  },

  // Admin: Get complete Counsellor Allocation overview
  getAdminAllocationOverview: async (req: AuthRequest, res: Response) => {
    try {
      const data = await counsellingAllocationService.getAdminAllocationOverview();
      return sendSuccess(res, data);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch allocation overview', err.statusCode || 400);
    }
  },

  // Admin: Get all available counsellors with active caseload count
  getAvailableCounsellors: async (req: AuthRequest, res: Response) => {
    try {
      const counsellors = await counsellingAllocationService.getAdminAvailableCounsellors();
      return sendSuccess(res, { counsellors });
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch available counsellors', err.statusCode || 400);
    }
  },

  // Admin: Request an available counsellor for an unallocated victim
  adminRequestCounsellor: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) return sendError(res, 'Authentication required', 401);
      const { victimId } = req.params;
      const counselorId = req.body.counselorId || req.body.counsellorId;
      const notes = req.body.notes;
      if (!counselorId) {
        return sendError(res, 'Counselor ID is required', 400);
      }
      const result = await counsellingAllocationService.adminRequestCounsellor(
        req.user,
        victimId,
        counselorId,
        notes
      );
      return sendSuccess(res, result.request, result.message, 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to send counsellor request', err.statusCode || 400);
    }
  },

  // Admin: Approve a counsellor's request to counsel a victim
  adminApproveCounselorRequest: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) return sendError(res, 'Authentication required', 401);
      const { requestId } = req.params;
      const result = await counsellingAllocationService.adminApproveCounselorRequest(
        req.user,
        requestId
      );
      return sendSuccess(res, result.request, result.message);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to approve counsellor request', err.statusCode || 400);
    }
  },

  // Admin: Reject a counsellor's request
  adminRejectCounselorRequest: async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) return sendError(res, 'Authentication required', 401);
      const { requestId } = req.params;
      const { rejectionReason } = req.body;
      const result = await counsellingAllocationService.adminRejectCounselorRequest(
        req.user,
        requestId,
        rejectionReason
      );
      return sendSuccess(res, result.request, result.message);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to reject counsellor request', err.statusCode || 400);
    }
  },
};
