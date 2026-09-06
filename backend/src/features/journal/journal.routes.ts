import { Router } from 'express';
import { journalController } from './journal.controller.js';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { createJournalSchema } from './journal.validation.js';

const router = Router();

router.use(authenticateToken);

router.post('/', validateBody(createJournalSchema), journalController.createEntry);
router.get('/', journalController.getEntries);
router.delete('/:id', journalController.deleteEntry);

export default router;
