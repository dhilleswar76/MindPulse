import { Router } from 'express';
import { compensationController } from './compensation.controller.js';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { createCompensationClaimSchema, calculateCompensationSchema } from './compensation.validation.js';

const router = Router();

// Public / Protected schedules & calculation
router.get('/schedules', compensationController.getStatutorySchedules);
router.post('/calculate', validateBody(calculateCompensationSchema), compensationController.calculateCompensation);

// Protected claims submission & retrieval
router.use(authenticateToken);
router.get('/claims', compensationController.getUserClaims);
router.post('/claims', validateBody(createCompensationClaimSchema), compensationController.createClaim);

export default router;
