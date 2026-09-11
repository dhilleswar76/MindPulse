import { Router } from 'express';
import authRoutes from '../features/auth/auth.routes.js';
import checkinRoutes from '../features/checkins/checkins.routes.js';
import journalRoutes from '../features/journal/journal.routes.js';
import riskRoutes from '../features/risk/risk.routes.js';
import forecastingRoutes from '../features/forecasting/forecasting.routes.js';
import recommendationsRoutes from '../features/recommendations/recommendations.routes.js';
import alertsRoutes from '../features/alerts/alerts.routes.js';
import counselorRoutes from '../features/counselor/counselor.routes.js';
import interventionsRoutes from '../features/interventions/interventions.routes.js';
import analyticsRoutes from '../features/analytics/analytics.routes.js';
import usersRoutes from '../features/users/users.routes.js';
import adminRoutes from '../features/admin/admin.routes.js';

import casesRoutes from '../features/cases/cases.routes.js';
import mlRoutes from '../features/ml/ml.routes.js';
import compensationRoutes from '../features/compensation/compensation.routes.js';

const router = Router();

// Health route
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'MindPulse Backend API',
    nonDiagnostic: true,
    timestamp: new Date().toISOString(),
  });
});

// Feature routes
router.use('/auth', authRoutes);
router.use('/cases', casesRoutes);
router.use('/checkins', checkinRoutes);
router.use('/journal', journalRoutes);
router.use('/risk', riskRoutes);
router.use('/forecast', forecastingRoutes);
router.use('/recommendations', recommendationsRoutes);
router.use('/alerts', alertsRoutes);
router.use('/counselor', counselorRoutes);
router.use('/interventions', interventionsRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/users', usersRoutes);
router.use('/admin', adminRoutes);
router.use('/ml', mlRoutes);
router.use('/compensation', compensationRoutes);

export default router;
