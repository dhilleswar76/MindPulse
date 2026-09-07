import { Case, User, CheckIn, RiskScore, Intervention, FollowUp } from '../../models/index.js';
import { CaseStage, CaseStatus, VictimType } from '../../types/index.js';

export const mockSyntheticCases = [
  {
    id: 'case_1042',
    caseId: 'MP-1042',
    victimId: 'user_alex_101',
    victimName: 'Alex Rivera (Pseudonymous)',
    victimType: 'WITNESS' as VictimType,
    caseStage: 'COURT_TRIAL' as CaseStage,
    caseStatus: 'ACTIVE' as CaseStatus,
    district: 'Central District',
    state: 'National Capital Region',
    assignedCounselorName: 'Dr. Sarah Jenkins',
    priorityScore: 0.82,
    recentRiskLevel: 'ELEVATED' as const,
    incidentYear: 2025,
    lastCheckInAt: new Date(Date.now() - 3600000 * 24 * 2), // 2 days ago
    notes: 'Witness in ongoing trial hearings. Recent check-ins indicate elevated stress and acute sleep disruption.',
    recentTrend: 'INCREASING',
    aiSummary:
      'The person recent check-ins indicate increased stress (8/10) and reduced sleep (4.5h) during the active Court/Trial stage compared with their personal baseline. Possible contributing signals: Court hearing proximity, sleep deficit, and safety-related language.',
    stagesHistory: [
      { stage: 'CASE_REGISTRATION', date: '2025-11-10', status: 'COMPLETED', note: 'Case registered at District Office' },
      { stage: 'INVESTIGATION', date: '2025-12-05', status: 'COMPLETED', note: 'Witness statements recorded' },
      { stage: 'COURT_TRIAL', date: '2026-02-15', status: 'ACTIVE', note: 'Active cross-examination phase' },
      { stage: 'COMPENSATION', date: 'Pending', status: 'UPCOMING', note: 'Victim compensation scheme application in review' },
      { stage: 'REHABILITATION', date: 'Pending', status: 'UPCOMING', note: 'Social and vocational support coordination' },
      { stage: 'PROTECTION_SUPPORT', date: 'Active', status: 'ACTIVE', note: 'Periodic security check-ins and hotline referral' },
    ],
    topSignals: [
      { feature: 'Reduced Sleep', impact: 0.32, description: '4.5h nightly average (delta: -2.5h from personal baseline)' },
      { feature: 'Court Stage Stress', impact: 0.28, description: 'Case-related stress score 8.5/10 during active trial week' },
      { feature: 'Safety Concern Signal', impact: 0.22, description: 'Reported sense of safety dropped from 8.0 to 4.5' },
    ],
  },
  {
    id: 'case_1001',
    caseId: 'MP-1001',
    victimId: 'user_jordan_102',
    victimName: 'Jordan Chen (Pseudonymous)',
    victimType: 'VICTIM' as VictimType,
    caseStage: 'INVESTIGATION' as CaseStage,
    caseStatus: 'UNDER_REVIEW' as CaseStatus,
    district: 'North District',
    state: 'National Capital Region',
    assignedCounselorName: 'Dr. Sarah Jenkins',
    priorityScore: 0.68,
    recentRiskLevel: 'WATCH' as const,
    incidentYear: 2026,
    lastCheckInAt: new Date(Date.now() - 3600000 * 18),
    notes: 'Primary complainant in investigation phase. Moderate distress signal detected with emerging baseline variance.',
    recentTrend: 'STABLE',
    aiSummary:
      'Subjective stress reported at 6.5/10 with mild sleep fluctuations. Regular participation in check-ins observed.',
    stagesHistory: [
      { stage: 'CASE_REGISTRATION', date: '2026-01-12', status: 'COMPLETED', note: 'Formal complaint filed' },
      { stage: 'INVESTIGATION', date: '2026-01-20', status: 'ACTIVE', note: 'Forensic documentation in progress' },
      { stage: 'COURT_TRIAL', date: 'Pending', status: 'UPCOMING', note: 'Chargesheet submission awaited' },
      { stage: 'COMPENSATION', date: 'Pending', status: 'UPCOMING', note: 'Interim relief processed' },
      { stage: 'REHABILITATION', date: 'Pending', status: 'UPCOMING', note: 'Counseling support assigned' },
      { stage: 'PROTECTION_SUPPORT', date: 'Pending', status: 'UPCOMING', note: 'Local support officer assigned' },
    ],
    topSignals: [
      { feature: 'Investigation Stress', impact: 0.24, description: 'Reported stress elevation during interview dates' },
      { feature: 'Energy Fluctuation', impact: 0.18, description: 'Energy dropped 1.8 points below personal baseline' },
    ],
  },
  {
    id: 'case_1003',
    caseId: 'MP-1003',
    victimId: 'user_taylor_103',
    victimName: 'Taylor Morgan (Pseudonymous)',
    victimType: 'FAMILY_MEMBER' as VictimType,
    caseStage: 'REHABILITATION' as CaseStage,
    caseStatus: 'SUPPORT_IN_PROGRESS' as CaseStatus,
    district: 'South District',
    state: 'National Capital Region',
    assignedCounselorName: 'Dr. Sarah Jenkins',
    priorityScore: 0.38,
    recentRiskLevel: 'STABLE' as const,
    incidentYear: 2024,
    lastCheckInAt: new Date(Date.now() - 86400000 * 3),
    notes: 'Family member of affected victim. Completed counseling milestones with stable longitudinal trajectory.',
    recentTrend: 'DECREASING',
    aiSummary:
      'Longitudinal trend shows steady improvement in wellbeing metrics following rehabilitation support and community assistance.',
    stagesHistory: [
      { stage: 'CASE_REGISTRATION', date: '2024-05-10', status: 'COMPLETED', note: 'Registration completed' },
      { stage: 'INVESTIGATION', date: '2024-07-15', status: 'COMPLETED', note: 'Investigation concluded' },
      { stage: 'COURT_TRIAL', date: '2025-03-20', status: 'COMPLETED', note: 'Judgment rendered' },
      { stage: 'COMPENSATION', date: '2025-08-10', status: 'COMPLETED', note: 'Compensation disbursed' },
      { stage: 'REHABILITATION', date: '2025-10-01', status: 'ACTIVE', note: 'Vocational training and counseling' },
      { stage: 'PROTECTION_SUPPORT', date: '2025-10-01', status: 'ACTIVE', note: 'Community support group check-ins' },
    ],
    topSignals: [
      { feature: 'Stable Sleep', impact: -0.15, description: 'Sleep restored to 7.2h nightly baseline' },
      { feature: 'Decreased Stress', impact: -0.22, description: 'Stress reduced from 8/10 to 4/10' },
    ],
  },
];

export const casesService = {
  getCases: async (filters?: { stage?: string; district?: string; status?: string }) => {
    try {
      const query: any = {};
      if (filters?.stage) query.caseStage = filters.stage;
      if (filters?.district) query.district = filters.district;
      if (filters?.status) query.caseStatus = filters.status;

      const dbCases = await Case.find(query).populate('victimId', 'fullName email victimType caseStage district');
      if (dbCases && dbCases.length > 0) {
        return dbCases;
      }
    } catch {
      // fallback to mock cases
    }

    let result = [...mockSyntheticCases];
    if (filters?.stage) {
      result = result.filter((c) => c.caseStage === filters.stage);
    }
    if (filters?.district) {
      result = result.filter((c) => c.district === filters.district);
    }
    return result;
  },

  getCaseById: async (caseId: string) => {
    try {
      const dbCase = await Case.findOne({ $or: [{ caseId }, { _id: caseId }] }).populate('victimId');
      if (dbCase) return dbCase;
    } catch {
      // fallback
    }

    const c = mockSyntheticCases.find(
      (item) => item.caseId === caseId || item.id === caseId || item.victimId === caseId
    );
    return c || mockSyntheticCases[0];
  },

  updateCaseStage: async (caseId: string, stage: CaseStage, note?: string) => {
    try {
      const updated = await Case.findOneAndUpdate(
        { $or: [{ caseId }, { _id: caseId }] },
        { caseStage: stage, notes: note, updatedAt: new Date() },
        { new: true }
      );
      if (updated) return updated;
    } catch {
      // fallback
    }

    const c = mockSyntheticCases.find((item) => item.caseId === caseId || item.id === caseId);
    if (c) {
      c.caseStage = stage;
      if (note) c.notes = note;
    }
    return c || { caseId, caseStage: stage, updated: true };
  },

  getCaseJourneyTimeline: async (caseId: string) => {
    const c = await casesService.getCaseById(caseId);
    return {
      caseId: (c as any).caseId || caseId,
      currentStage: (c as any).caseStage || 'INVESTIGATION',
      stages: [
        {
          key: 'CASE_REGISTRATION',
          label: 'Case Registration',
          description: 'Formal reporting and initial case intake under SC/ST Prevention of Atrocities Act',
          order: 1,
        },
        {
          key: 'INVESTIGATION',
          label: 'Investigation',
          description: 'Gathering forensic evidence, witness depositions, and safety assessment',
          order: 2,
        },
        {
          key: 'COURT_TRIAL',
          label: 'Court / Trial',
          description: 'Special Court hearings, testimony coordination, and legal aid support',
          order: 3,
        },
        {
          key: 'COMPENSATION',
          label: 'Compensation & Relief',
          description: 'Statutory relief disbursement and interim welfare entitlements',
          order: 4,
        },
        {
          key: 'REHABILITATION',
          label: 'Rehabilitation',
          description: 'Vocational support, social reintegration, and trauma counseling',
          order: 5,
        },
        {
          key: 'PROTECTION_SUPPORT',
          label: 'Protection & Support',
          description: 'Witness protection scheme, safe housing, and ongoing wellbeing monitoring',
          order: 6,
        },
      ],
      stagesHistory: (c as any).stagesHistory || [],
    };
  },
};
