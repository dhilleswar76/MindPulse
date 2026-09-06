import { Router } from 'express';
import { riskController } from './risk.controller.js';
import { authenticateToken } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/current', riskController.getCurrentRisk);
router.get('/history', riskController.getRiskHistory);

export default router;
