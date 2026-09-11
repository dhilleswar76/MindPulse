import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { notificationsController } from './notifications.controller.js';

const router = Router();

router.use(authenticateToken);

router.get('/', notificationsController.getNotifications);
router.put('/mark-all-read', notificationsController.markAllAsRead);
router.put('/:id/read', notificationsController.markAsRead);
router.patch('/:id/read', notificationsController.markAsRead);

export default router;
