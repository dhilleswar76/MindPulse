import { Router } from 'express';
import { alertController } from './alerts.controller.js';
import { authenticateToken, requireRoles } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);
router.use(requireRoles('COUNSELOR', 'ADMIN'));

router.get('/', alertController.getAlerts);
router.patch('/:id/status', alertController.updateStatus);

export default router;
