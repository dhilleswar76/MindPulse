import { Router } from 'express';
import { adminController } from './admin.controller.js';
import { authenticateToken, requireRoles } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);
router.use(requireRoles('ADMIN'));

router.get('/audit-logs', adminController.getAuditLogs);
router.get('/status', adminController.getStatus);

export default router;
