import { Alert } from '../../models/index.js';

const memoryAlerts: any[] = [
  {
    _id: 'alert_demo_1',
    userId: 'user_alex_101',
    studentName: 'Case MP-1042 (Alex Rivera)',
    department: 'Protected Witness • Court / Trial Stage',
    riskLevel: 'COUNSELOR_REVIEW',
    status: 'OPEN',
    triggerReason:
      'Severe sleep reduction (3.5h avg) combined with high pre-trial hearing tension (9/10) and low sense of safety (3/10)',
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    _id: 'alert_demo_2',
    userId: 'user_jordan_102',
    studentName: 'Case MP-1001 (Jordan Chen)',
    department: 'Direct Complainant • Investigation Stage',
    riskLevel: 'WATCH',
    status: 'OPEN',
    triggerReason: 'Perceived safety score drop (-3.0) and emerging baseline variance during forensic review',
    createdAt: new Date(Date.now() - 7200000),
  },
];

export const alertService = {
  getOpenAlerts: async () => {
    try {
      const dbAlerts = await Alert.find({ status: { $in: ['OPEN', 'ACKNOWLEDGED'] } })
        .populate('userId', 'fullName email department')
        .sort({ createdAt: -1 })
        .lean();
      if (dbAlerts && dbAlerts.length > 0) return dbAlerts;
    } catch {}

    return memoryAlerts;
  },

  updateAlertStatus: async (alertId: string, status: 'ACKNOWLEDGED' | 'RESOLVED') => {
    try {
      await Alert.findByIdAndUpdate(alertId, { status });
    } catch {}

    const alert = memoryAlerts.find((a) => a._id === alertId);
    if (alert) alert.status = status;
    return true;
  },
};
