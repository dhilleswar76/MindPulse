import { Router } from 'express';
import { authenticateToken, requireRoles } from '../../middleware/auth.middleware.js';
import { counsellingAllocationController } from './counsellingAllocation.controller.js';

// Victim Router: /api/victims
export const victimCounsellingRouter = Router();
victimCounsellingRouter.use(authenticateToken);
victimCounsellingRouter.get('/me/counsellor', counsellingAllocationController.getMyCounsellor);
victimCounsellingRouter.post('/me/counsellor-request', counsellingAllocationController.requestCounsellor);

// Counselor Router: /api/counsellors
export const counsellorAllocationRouter = Router();
counsellorAllocationRouter.use(authenticateToken);
counsellorAllocationRouter.use(requireRoles('COUNSELOR', 'ADMIN'));
counsellorAllocationRouter.get('/available-victims', counsellingAllocationController.getAvailableVictims);
counsellorAllocationRouter.get('/my-counselling-requests', counsellingAllocationController.getMyCounsellingRequests);
counsellorAllocationRouter.post('/victims/:victimId/request', counsellingAllocationController.requestToCounselVictim);
counsellorAllocationRouter.post('/victim-requests/:requestId/accept', counsellingAllocationController.acceptVictimRequest);
counsellorAllocationRouter.post('/victim-requests/:requestId/reject', counsellingAllocationController.rejectVictimRequest);

// Admin Router extension: /api/admin
export const adminCounsellingRouter = Router();
adminCounsellingRouter.use(authenticateToken);
adminCounsellingRouter.use(requireRoles('ADMIN'));
adminCounsellingRouter.get('/counsellor-allocation', counsellingAllocationController.getAdminAllocationOverview);
adminCounsellingRouter.get('/counsellor-requests', counsellingAllocationController.getAdminAllocationOverview);
adminCounsellingRouter.get('/available-counsellors', counsellingAllocationController.getAvailableCounsellors);
adminCounsellingRouter.post('/victims/:victimId/request-counsellor', counsellingAllocationController.adminRequestCounsellor);
adminCounsellingRouter.post('/counsellor-requests/:requestId/approve', counsellingAllocationController.adminApproveCounselorRequest);
adminCounsellingRouter.post('/counsellor-requests/:requestId/reject', counsellingAllocationController.adminRejectCounselorRequest);
