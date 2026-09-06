import { Alert } from '../../models/index.js';

const memoryAlerts: any[] = [
  {
    _id: 'alert_demo_1',
    userId: 'demo_user_1',
    studentName: 'Alex Rivera',
    department: 'Computer Science',
    riskLevel: 'COUNSELOR_REVIEW',
    status: 'OPEN',
    triggerReason: 'Severe sleep reduction (3.5h avg) combined with 3 consecutive days of stress score >= 8',
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    _id: 'alert_demo_2',
    userId: 'demo_user_2',
    studentName: 'Jordan Chen',
    department: 'Biomedical Engineering',
    riskLevel: 'WATCH',
    status: 'OPEN',
    triggerReason: 'Sudden mood decline deviation (-3.2 from personal baseline)',
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
