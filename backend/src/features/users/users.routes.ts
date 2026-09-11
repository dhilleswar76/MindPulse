import { Router } from 'express';
import { userController } from './users.controller.js';
import { authenticateToken, optionalAuthenticateToken } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/profile', authenticateToken, userController.getProfile);
router.post('/support-chat', optionalAuthenticateToken, userController.supportChat);

export default router;
