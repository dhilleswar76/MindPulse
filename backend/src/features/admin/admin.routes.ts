import { Router } from 'express';
import { adminController } from './admin.controller.js';
import { authenticateToken, requireRoles } from '../../middleware/auth.middleware.js';

const router = Router();

// Strict Admin-only Authentication & Authorization
router.use(authenticateToken);
router.use(requireRoles('ADMIN'));

router.get('/kpis', adminController.getKPIs);
router.get('/analytics', adminController.getAnalytics);
router.get('/cases', adminController.getCases);
router.get('/heatmap', adminController.getHeatmap);
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/status', adminController.getStatus);

// Stage Transition & Approval Requests Inbox & Review Endpoints
router.get('/stage-approval-requests', adminController.getStageTransitionRequests);
router.get('/stage-approval-requests/:requestId', adminController.getStageTransitionRequestById);
router.post('/stage-approval-requests/:requestId/approve', adminController.approveStageTransition);
router.post('/stage-approval-requests/:requestId/reject', adminController.rejectStageTransition);

router.get('/stage-transition-requests', adminController.getStageTransitionRequests);
router.get('/stage-transition-requests/:requestId', adminController.getStageTransitionRequestById);
router.post('/stage-transition-requests/:requestId/approve', adminController.approveStageTransition);
router.post('/stage-transition-requests/:requestId/reject', adminController.rejectStageTransition);
router.post('/stage-transition-requests/:requestId/clarification', adminController.requestStageTransitionClarification);

export default router;

