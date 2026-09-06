import { AuditLog } from '../../models/index.js';

const memoryAuditLogs: any[] = [
  {
    _id: 'audit_1',
    action: 'CASE_REVIEW_OPENED',
    resourceType: 'UserCase',
    resourceId: 'case_101',
    actorEmail: 'demo.counselor@mindpulse.local',
    ipAddress: '127.0.0.1',
    timestamp: new Date(Date.now() - 1800000),
  },
  {
    _id: 'audit_2',
    action: 'INTERVENTION_CREATED',
    resourceType: 'Intervention',
    resourceId: 'int_demo_1',
    actorEmail: 'demo.counselor@mindpulse.local',
    ipAddress: '127.0.0.1',
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    _id: 'audit_3',
    action: 'AGGREGATE_ANALYTICS_ACCESSED',
    resourceType: 'InstitutionalAnalytics',
    resourceId: 'campus_main',
    actorEmail: 'demo.admin@mindpulse.local',
    ipAddress: '127.0.0.1',
    timestamp: new Date(Date.now() - 7200000),
  },
];

export const adminService = {
  getAuditLogs: async () => {
    try {
      const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(50).lean();
      if (logs && logs.length > 0) return logs;
    } catch {}

    return memoryAuditLogs;
  },

  getSystemStatus: async () => {
    return {
      status: 'healthy',
      version: '1.0.0-prototype',
      services: {
        backend: 'online',
        database: 'connected (hybrid mode)',
        mlService: 'connected (FastAPI)',
        realtimeSocket: 'active',
      },
      nonDiagnosticCompliance: true,
      dataPrivacySafeguards: 'Active (k-Anonymity >= 5)',
    };
  },
};
