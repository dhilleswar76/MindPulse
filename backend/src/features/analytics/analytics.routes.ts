import { Router } from 'express';
import { analyticsController } from './analytics.controller.js';
import { authenticateToken, requireRoles } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);
router.use(requireRoles('ADMIN', 'COUNSELOR'));

router.get('/overview', analyticsController.getOverview);
router.get('/heatmap', analyticsController.getHeatmap);
router.post('/simulate', requireRoles('ADMIN'), analyticsController.simulate);

export default router;
