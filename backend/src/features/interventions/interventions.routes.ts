import { Router } from 'express';
import { interventionController } from './interventions.controller.js';
import { authenticateToken, requireRoles } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { createInterventionSchema, updateInterventionSchema } from './interventions.validation.js';

const router = Router();

router.use(authenticateToken);

router.post('/', requireRoles('COUNSELOR', 'ADMIN'), validateBody(createInterventionSchema), interventionController.createIntervention);
router.get('/', requireRoles('COUNSELOR', 'ADMIN'), interventionController.getInterventions);
router.patch('/:id', requireRoles('COUNSELOR', 'ADMIN'), validateBody(updateInterventionSchema), interventionController.updateIntervention);
router.get('/outcomes/:userId', requireRoles('COUNSELOR', 'ADMIN'), interventionController.getOutcomes);
router.post('/followup', requireRoles('COUNSELOR', 'ADMIN'), interventionController.createFollowUp);
router.get('/followups', requireRoles('COUNSELOR', 'ADMIN'), interventionController.getFollowUps);

export default router;

