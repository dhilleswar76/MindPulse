import { Router } from 'express';
import { userController } from './users.controller.js';
import { authenticateToken } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/profile', userController.getProfile);
router.post('/support-chat', userController.supportChat);

export default router;
