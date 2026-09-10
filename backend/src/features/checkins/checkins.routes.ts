import { Router } from 'express';
import { checkinController } from './checkins.controller.js';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { createCheckInSchema } from './checkins.validation.js';

const router = Router();

router.use(authenticateToken);

router.post('/', validateBody(createCheckInSchema), checkinController.createCheckIn);
router.get('/', checkinController.getCheckIns);
router.get('/history', checkinController.getCheckIns);
router.get('/trend', checkinController.getBaselineAndTrend);

export default router;
