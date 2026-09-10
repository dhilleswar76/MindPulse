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

export default router;
