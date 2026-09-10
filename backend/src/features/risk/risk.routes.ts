import { Router } from 'express';
import { riskController } from './risk.controller.js';
import { authenticateToken } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/current', riskController.getCurrentRisk);
router.get('/history', riskController.getRiskHistory);
router.get('/:caseId', riskController.getRiskByCaseId);

export default router;

