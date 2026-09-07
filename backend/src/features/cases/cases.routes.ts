import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { casesController } from './cases.controller.js';

const router = Router();

router.use(authenticateToken);

router.get('/', casesController.getCases);
router.get('/:id', casesController.getCaseById);
router.put('/:id/stage', casesController.updateCaseStage);
router.get('/:id/timeline', casesController.getCaseTimeline);

export default router;
