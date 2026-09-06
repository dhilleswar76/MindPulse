import { Router } from 'express';
import { counselorController } from './counselor.controller.js';
import { authenticateToken, requireRoles } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);
router.use(requireRoles('COUNSELOR', 'ADMIN'));

router.get('/cases', counselorController.getCases);
router.get('/cases/:id', counselorController.getCaseDetails);
router.get('/summary/:userId', counselorController.getAiSummary);

export default router;
