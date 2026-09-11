import { Router } from 'express';
import { authenticateToken, requireRoles } from '../../middleware/auth.middleware.js';
import { casesController } from './cases.controller.js';

const router = Router();

router.use(authenticateToken);

router.get('/', casesController.getCases);
router.get('/:id', casesController.getCaseById);
router.get('/:id/stages', casesController.getCaseStages);
router.put('/:id/stage', requireRoles('ADMIN'), casesController.updateCaseStage);
router.get('/:id/timeline', casesController.getCaseTimeline);

// Stage Completion by Counselor
router.post(
  '/:id/stages/:stage/complete',
  requireRoles('COUNSELOR', 'ADMIN'),
  casesController.completeStage
);

// Stage Transition Requests
router.post(
  '/:id/stage-transition-requests',
  requireRoles('COUNSELOR', 'ADMIN'),
  casesController.createStageTransitionRequest
);
router.get(
  '/:id/stage-transition-requests',
  requireRoles('COUNSELOR', 'ADMIN'),
  casesController.getStageTransitionRequests
);

export default router;
