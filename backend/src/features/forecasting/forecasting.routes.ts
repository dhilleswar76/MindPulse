import { Router } from 'express';
import { forecastingController } from './forecasting.controller.js';
import { authenticateToken } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', forecastingController.getForecast);

export default router;
