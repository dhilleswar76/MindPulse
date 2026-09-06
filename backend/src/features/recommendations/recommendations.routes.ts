import { Router } from 'express';
import { recommendationController } from './recommendations.controller.js';
import { authenticateToken } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', recommendationController.getRecommendations);

export default router;
