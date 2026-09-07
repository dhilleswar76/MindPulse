import { Case, User, RiskScore, CheckIn, Intervention } from '../../models/index.js';

const mockCases = [
  {
    id: 'case_1042',
    caseId: 'MP-1042',
    userId: 'user_alex_101',
    victimName: 'Alex Rivera (Pseudonymous)',
    victimEmail: 'alex.r@protected.local',
    victimType: 'WITNESS',
    caseStage: 'COURT_TRIAL',
    district: 'Central District',
    state: 'National Capital Region',
    riskLevel: 'ELEVATED',
    riskScore: 0.82,
    riskTrend: 'INCREASING',
    daysInDistress: 4,
    recentCheckIn: {
      mood: 3,
      stress: 9,
      energy: 3,
      sleepHours: 4.0,
      senseOfSafety: 4,
      supportAvailability: 6,
      caseRelatedStress: 9,
      caseStage: 'COURT_TRIAL',
      timestamp: new Date(Date.now() - 3600000 * 24 * 2),
    },
    topSignals: [
      { feature: 'Reduced Sleep', impact: 0.32, description: '4.0 hours average sleep during active cross-examination' },
      { feature: 'Court Hearing Stress', impact: 0.28, description: 'Case-related stress reported 9/10 ahead of testimony' },
      { feature: 'Safety Concern Signal', impact: 0.22, description: 'Reported sense of safety delta (-3.5 from baseline)' },
    ],
    aiSummary:
      'The person recent check-ins indicate increased stress and reduced sleep compared with their personal wellbeing baseline. The recent trend has increased during the current Court / Trial stage. Possible contributing signals: reduced sleep, elevated court-related stress, and decreased safety perception.',
    suggestedPathways: [
      'Counseling Review for Acute Trial Anxiety',
      'Witness Protection Officer Check-in Referral',
      'Legal Aid Accompaniment Coordination',
    ],
    interventionsCount: 1,
  },
  {
    id: 'case_1001',
    caseId: 'MP-1001',
    userId: 'user_jordan_102',
    victimName: 'Jordan Chen (Pseudonymous)',
    victimEmail: 'jordan.c@protected.local',
    victimType: 'VICTIM',
    caseStage: 'INVESTIGATION',
    district: 'North District',
    state: 'National Capital Region',
    riskLevel: 'WATCH',
    riskScore: 0.68,
    riskTrend: 'INCREASING',
    daysInDistress: 2,
    recentCheckIn: {
      mood: 4,
      stress: 8,
      energy: 4,
      sleepHours: 5.5,
      senseOfSafety: 6,
      supportAvailability: 7,
      caseRelatedStress: 7,
      caseStage: 'INVESTIGATION',
      timestamp: new Date(Date.now() - 3600000 * 18),
    },
    topSignals: [
      { feature: 'Investigation Stress', impact: 0.26, description: 'Reported stress score 8/10 during evidence phase' },
      { feature: 'Energy Depletion', impact: 0.20, description: 'Energy dropped 2.0 points below personal baseline' },
    ],
    aiSummary:
      'Complainant exhibits moderate elevation in stress indicators with emerging sleep disruption during forensic review. Proactive check-in recommended.',
    suggestedPathways: [
      'Designated Counselor Wellness Check-in',
      'Victim Compensation Scheme Information Sharing',
    ],
    interventionsCount: 0,
  },
  {
    id: 'case_1003',
    caseId: 'MP-1003',
    userId: 'user_taylor_103',
    victimName: 'Taylor Morgan (Pseudonymous)',
    victimEmail: 'taylor.m@protected.local',
    victimType: 'FAMILY_MEMBER',
    caseStage: 'REHABILITATION',
    district: 'South District',
    state: 'National Capital Region',
    riskLevel: 'STABLE',
    riskScore: 0.38,
    riskTrend: 'DECREASING',
    daysInDistress: 0,
    recentCheckIn: {
      mood: 7,
      stress: 4,
      energy: 7,
      sleepHours: 7.0,
      senseOfSafety: 8,
      supportAvailability: 8,
      caseRelatedStress: 3,
      caseStage: 'REHABILITATION',
      timestamp: new Date(Date.now() - 86400000 * 3),
    },
    topSignals: [
      { feature: 'Stabilized Sleep', impact: -0.16, description: 'Sleep restored to personal baseline of 7h' },
      { feature: 'Support Utilization', impact: -0.20, description: 'High engagement with rehabilitation support' },
    ],
    aiSummary:
      'Longitudinal trajectory indicates steady stabilization following rehabilitation assistance and social welfare support.',
    suggestedPathways: [
      'Standard Periodic Wellbeing Check-in',
      'Community Support Group Resource Info',
    ],
    interventionsCount: 2,
  },
];

export const counselorService = {
  getCases: async () => {
    try {
      const dbCases = await Case.find().populate('victimId');
      if (dbCases && dbCases.length > 0) {
        return dbCases;
      }
    } catch {
      // fallback
    }
    return mockCases;
  },

  getCaseById: async (caseId: string) => {
    try {
      const dbCase = await Case.findOne({ $or: [{ caseId }, { _id: caseId }, { victimId: caseId }] }).populate(
        'victimId'
      );
      if (dbCase) return dbCase;
    } catch {
      // fallback
    }
    const c = mockCases.find((item) => item.id === caseId || item.caseId === caseId || item.userId === caseId);
    return c || mockCases[0];
  },

  generateAiSummary: async (userId: string) => {
    const c = mockCases.find((item) => item.userId === userId || item.caseId === userId || item.id === userId) || mockCases[0];
    return {
      userId,
      caseId: c.caseId,
      caseStage: c.caseStage,
      summary: c.aiSummary,
      possibleSignals: c.topSignals.map((s) => `${s.feature}: ${s.description}`),
      suggestedPathways: c.suggestedPathways,
      disclaimer: 'AI-assisted summary — requires human review. Non-diagnostic decision support only.',
      generatedAt: new Date(),
    };
  },
};

